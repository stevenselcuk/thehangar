import { eventsData } from '../data/events';
import { SYSTEM_LOGS } from '../data/flavor';
import { mailData } from '../data/mail';
import { GameEvent, GameState, Inventory, LogMessage, MailMessage, TabType } from '../types';
import { getLevelUpLog, getXpForNextLevel } from './levels';

export const processTick = (
  prev: GameState,
  delta: number,
  onLevelUp: () => void,
  triggerEvent: (type: string, id?: string) => void,
  activeTab: TabType
): GameState => {
  const now = Date.now();
  const nextRes = { ...prev.resources };
  const nextFlags = { ...prev.flags };
  const nextHF = { ...prev.hfStats };
  const nextTools = { ...prev.toolConditions };
  const nextVending = { ...prev.vendingPrices };
  let nextLogs = [...prev.logs];
  const nextProf = { ...prev.proficiency };
  const nextMail = [...prev.mail];
  const nextEventTimestamps = { ...prev.eventTimestamps };
  let nextEvent = prev.activeEvent ? { ...prev.activeEvent } : null;

  const addLog = (text: string, type: LogMessage['type'] = 'info') => {
    nextLogs = [
      { id: Math.random().toString(36), text, type, timestamp: now },
      ...nextLogs.slice(0, 49),
    ];
  };

  // Leveling Check
  const xpForNextLevel = getXpForNextLevel(nextRes.level);
  if (nextRes.experience >= xpForNextLevel) {
    nextRes.level += 1;
    nextRes.experience -= xpForNextLevel;
    nextProf.skillPoints += 1;
    addLog(getLevelUpLog(nextRes.level), 'levelup');
    onLevelUp();
  }

  // Location-specific passive effects
  if (activeTab === TabType.BACKSHOPS) {
    nextRes.suspicion = Math.min(100, nextRes.suspicion + 0.02 * (delta / 1000));
    const randomRoll = Math.random();

    // Eldritch Camera Malfunction
    if (randomRoll < 0.0005 * (delta / 1000)) {
      triggerEvent('eldritch_manifestation', 'CAMERA_MALFUNCTION');
    }
    // Audit Chance
    else if (randomRoll < 0.0008 * (delta / 1000)) {
      triggerEvent('audit', 'AUDIT_SUITS');
    }
    // Union Activity (Backshops specific)
    else if (randomRoll < 0.0012 * (delta / 1000)) {
      triggerEvent('union');
    }
  }

  // Generic Syndicate Activity (Anywhere, rare)
  if (Math.random() < 0.0001 * (delta / 1000) && nextRes.sanity < 50) {
    triggerEvent('syndicate');
  }

  // 1. Rotable & Tool Degradation
  const nextRotables = prev.rotables.map((r) => ({
    ...r,
    condition: Math.max(0, r.condition - (0.005 * delta) / 1000),
  }));

  const precisionTools = ['torquemeter', 'airDataTestBox', 'hfecDevice', 'rototestDevice'];
  precisionTools.forEach((t) => {
    if (prev.inventory[t as keyof Inventory] && nextTools[t] > 0) {
      nextTools[t] = Math.max(0, nextTools[t] - 0.05 * (delta / 1000));
    }
  });

  // 2. Event Checks (Suspicion, Component Failure, Random)
  if (!nextEvent) {
    // Suspicion Threshold Events (one-time)
    if (nextRes.suspicion > 30 && !nextFlags.suspicionEvent30Triggered) {
      triggerEvent('incident', 'SUS_MEMO');
      nextFlags.suspicionEvent30Triggered = true;
    } else if (nextRes.suspicion > 60 && !nextFlags.suspicionEvent60Triggered) {
      triggerEvent('audit', 'AUDIT_INTERNAL');
      nextFlags.suspicionEvent60Triggered = true;
    } else if (nextRes.suspicion > 90 && !nextFlags.suspicionEvent90Triggered) {
      triggerEvent('audit', 'AUDIT_SUITS');
      nextFlags.suspicionEvent90Triggered = true;
    }

    // High Suspicion -> Increased Random Audit Chance
    if (nextRes.suspicion > 70 && Math.random() < 0.001 * (delta / 1000)) {
      triggerEvent('audit');
    }

    // Drug Test Chance
    if (nextRes.suspicion > 40 && Math.random() < 0.0001 * (delta / 1000)) {
      triggerEvent('audit', 'RANDOM_DRUG_TEST');
    }

    // Component Failure Chance
    if (!nextFlags.activeComponentFailure) {
      for (const rotable of nextRotables) {
        if (rotable.condition < 25 && Math.random() < 0.0005 * (delta / 1000)) {
          const template = eventsData.component_failure[0];
          // FIX: Changed 'template.desc' to 'template.description' and removed non-existent 'penalty' property. Added required 'failureOutcome'.
          const newFailureEvent: GameEvent = {
            id: `fail_${rotable.id}`,
            type: 'component_failure',
            title: `${template.title}: ${rotable.label.toUpperCase()}`,
            description: `The ${rotable.label} ${template.description}`,
            timeLeft: 3600000, // Long duration, must be repaired
            totalTime: 3600000,
            requiredAction: template.requiredAction,
            failureOutcome: template.failureOutcome,
          };
          nextEvent = newFailureEvent;
          nextFlags.activeComponentFailure = rotable.id;
          addLog(
            `FAILURE DETECTED: ${rotable.label.toUpperCase()} is failing. Operational costs increasing.`,
            'error'
          );
          break;
        }
      }
    }

    // 3. New KARDEX Passive Triggers

    // Method 3: Reality Breakdown
    if (nextRes.sanity < 20 && Math.random() < 0.0005 * (delta / 1000)) {
      triggerEvent('eldritch_manifestation', 'TIMELINE_CORRUPTION');
    }

    // Audit Encounters (The Suits)
    // Check every 10 ticks approx, or use random chance directly scaled by delta
    // Condition: suspicion > 30 OR random < 0.01 per second
    if (nextRes.suspicion > 30 || Math.random() < 0.01) {
      // Very low chance per tick, scaled.
      // Original plan: tick % 1000 === 0. We don't track 'tick' counter here easily without state,
      // so using random chance per second: 0.0005 per sec (approx once every 30 mins game time)
      if (Math.random() < 0.0005 * (delta / 1000)) {
        triggerEvent('audit', 'AUDIT_INTERNAL_SUITS_1');
      }
    }

    // Canteen/Vending Incidents
    if (activeTab === TabType.CANTEEN && Math.random() < 0.002 * (delta / 1000)) {
      triggerEvent('canteen_incident', 'CANTEEN_VENDING_PROPHECY');
    }

    // Toolroom Sacrifices
    // Check if any tool is broken (< 20 condition)
    const brokenTool = Object.entries(nextTools).find(([_, condition]) => condition < 20);
    if (brokenTool && Math.random() < 0.001 * (delta / 1000)) {
      triggerEvent('incident', 'INCIDENT_TOOLROOM_DEMAND');
    }

    // Training & Indoctrination
    if (nextHF.trainingProgress < 20 && Math.random() < 0.0005 * (delta / 1000)) {
      triggerEvent('incident', 'INCIDENT_TRAINING_MODULE');
    }
  }

  // 3. Mental State & Debuff Processing
  if (nextFlags.activeComponentFailure) {
    nextRes.credits = Math.max(0, nextRes.credits - 1.5 * (delta / 1000));
  }

  if (nextFlags.fuelContaminationRisk && Math.random() < 0.0002 * (delta / 1000)) {
    triggerEvent('accident', 'CATASTROPHIC_FAILURE');
    nextFlags.fuelContaminationRisk = false;
  }

  if (nextHF.fearTimer > 0) {
    nextHF.fearTimer -= delta;
    if (nextHF.fearTimer <= 0) {
      nextHF.fearTimer = 0;
      nextFlags.isAfraid = false;
      addLog(SYSTEM_LOGS.FEAR_RECEDE, 'info');
    }
  }

  if (nextHF.toolroomMasterCooldown > 0) {
    nextHF.toolroomMasterCooldown -= delta;
    if (nextHF.toolroomMasterCooldown <= 0) {
      nextHF.toolroomMasterCooldown = 0;
      nextFlags.toolroomMasterPissed = false;
      addLog(SYSTEM_LOGS.MASTER_CALM, 'info');
    }
  }

  if (nextHF.efficiencyBoost > 0) {
    nextHF.efficiencyBoost -= delta;
    if (nextHF.efficiencyBoost <= 0) {
      nextHF.efficiencyBoost = 0;
      addLog('The efficiency boost from your precise calibration has worn off.', 'info');
    }
  }

  if (nextHF.venomSurgeTimer > 0) {
    nextHF.venomSurgeTimer -= delta;
    if (nextHF.venomSurgeTimer <= 0) {
      nextHF.venomSurgeTimer = 0;
      nextFlags.venomSurgeActive = false;
      addLog('The chemical enhancement from the Venom Surge has faded.', 'info');
    }
  }

  if (nextFlags.isHallucinating) {
    nextRes.focus = Math.max(0, nextRes.focus - 5.0 * (delta / 1000));
  }

  let sanityDrain = 0;
  if (nextFlags.isAfraid) sanityDrain += 0.5;
  if (nextProf.unlocked.includes('steadyNerves')) sanityDrain *= 0.9;
  nextRes.sanity = Math.max(0, nextRes.sanity - sanityDrain * (delta / 1000));

  // Janitor logic
  if (nextHF.janitorCooldown > 0) {
    nextHF.janitorCooldown -= delta;
  } else if (!nextFlags.janitorPresent && Math.random() < 0.0002 * (delta / 1000)) {
    nextFlags.janitorPresent = true;
    addLog(SYSTEM_LOGS.JANITOR_APPEARS, 'story');
    nextHF.janitorCooldown = 10 * 60 * 1000; // 10 min cooldown after appearance
  }

  // 4. Regeneration & Automation Logic
  let focusRegen = (nextFlags.nightCrewActive ? 0.8 : 3.0) * (delta / 1000);
  if (nextFlags.isAfraid) focusRegen *= 0.5;
  if (nextHF.efficiencyBoost > 0) focusRegen *= 1.2;
  nextRes.focus = Math.min(100, nextRes.focus + focusRegen);

  if (nextFlags.nightCrewActive) {
    let alcladGain = 4.0;
    let rivetGain = 9.0;
    let suspicionGain = 0.18;
    if (nextProf.unlocked.includes('nightShiftSupervisor')) {
      alcladGain *= 1.1;
      rivetGain *= 1.1;
      suspicionGain *= 0.85;
    }
    nextRes.alclad += alcladGain * (delta / 1000);
    nextRes.rivets += rivetGain * (delta / 1000);
    nextRes.suspicion = Math.min(100, nextRes.suspicion + suspicionGain * (delta / 1000));
  }

  if (nextFlags.transitCheckDelegationActive) {
    nextRes.credits += 1.5 * (delta / 1000);
    nextRes.experience += 5 * (delta / 1000);
    nextRes.suspicion = Math.min(100, nextRes.suspicion + 0.05 * (delta / 1000));
  }

  if (nextFlags.autoSrfActive) {
    nextRes.credits += 0.8 * (delta / 1000);
    nextRes.experience += 2 * (delta / 1000);
    if (Math.random() < 0.0001 * (delta / 1000)) {
      addLog(
        'AUTOMATION ALERT: SRF form filed with a data discrepancy. An internal review has been triggered.',
        'warning'
      );
      triggerEvent('audit', 'AUDIT_INTERNAL');
    }
  }

  nextRes.credits += delta / 7000;
  let baseXpGain = delta / 12000;
  if (nextProf.unlocked.includes('quickLearner')) baseXpGain *= 1.1;
  nextRes.experience += baseXpGain;

  // 5. Events, Jobs, & Mail Progress
  if (nextEvent && nextEvent.type !== 'component_failure') {
    nextEvent.timeLeft -= delta;
    if (nextEvent.timeLeft <= 0) {
      if (nextEvent.id === 'FUEL_CONTAM') {
        nextFlags.fuelContaminationRisk = true;
        addLog("You flushed the contaminated sample. Let's hope nobody finds out.", 'warning');
      }
      nextRes.sanity -=
        nextEvent.type === 'accident'
          ? 40
          : nextEvent.suitType === 'THE_SUITS'
            ? 35
            : nextEvent.type === 'eldritch_manifestation'
              ? 45
              : nextEvent.type === 'canteen_incident'
                ? 25
                : 5;
      nextRes.suspicion += nextEvent.type === 'audit' ? 30 : 5;
      addLog(`SITUATION FAILED: ${nextEvent.title}`, 'error');
      nextEvent = null;
    }
  }

  const nextJob = prev.activeJob ? { ...prev.activeJob } : null;
  if (nextJob) {
    nextJob.timeLeft -= delta;
    if (nextJob.timeLeft <= 0) {
      addLog(`JOB EXPIRED: ${nextJob.title}`, 'warning');
    }
  }

  const mailCooldown = 3 * 60 * 1000; // 3 minutes
  if (
    prev.inventory.pcAssembled &&
    (!nextEventTimestamps.lastMail || now - nextEventTimestamps.lastMail > mailCooldown)
  ) {
    if (Math.random() < 0.05 * (delta / 1000)) {
      const unreadMailCount = nextMail.filter((m) => !m.read).length;
      const availableMail = mailData.filter(
        (m) => !nextMail.some((existing) => existing.subject === m.subject)
      );
      if (unreadMailCount < 5 && availableMail.length > 0) {
        const newMailTemplate = availableMail[Math.floor(Math.random() * availableMail.length)];
        const newMail: MailMessage = {
          ...newMailTemplate,
          id: `mail_${now}`,
          read: false,
        };
        nextMail.push(newMail);
        nextEventTimestamps.lastMail = now;
      }
    }
  }

  return {
    ...prev,
    resources: nextRes,
    toolConditions: nextTools,
    rotables: nextRotables,
    activeJob: nextJob,
    activeEvent: nextEvent,
    vendingPrices: nextVending,
    hfStats: nextHF,
    flags: nextFlags,
    logs: nextLogs,
    mail: nextMail,
    proficiency: nextProf,
    eventTimestamps: nextEventTimestamps,
    lastUpdate: now,
  };
};
