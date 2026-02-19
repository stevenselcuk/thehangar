import { GAME_CONSTANTS, NOTIFICATION_DURATIONS } from '../data/constants.ts';
import { eventsData } from '../data/events.ts';
import { SYSTEM_LOGS } from '../data/flavor.ts';
import { hazardsData } from '../data/hazards.ts';
import { getMilestoneForLevel } from '../data/levelMilestones.ts';
import {
  FatigueLevel,
  LOCATION_PROPERTIES,
  NoiseLevel,
  TemperatureLevel,
} from '../data/locationProperties.ts';
import { mailData } from '../data/mail.ts';
import { addLogToDraft } from '../services/logService.ts';
import { createJob } from '../state/initialState.ts';
import {
  EnvironmentalHazard,
  GameState,
  Inventory,
  LogMessage,
  MailMessage,
  NotificationRequest,
  TabType,
} from '../types.ts';
import { getLevelUpLog, getXpForNextLevel } from './levels.ts';
import { checkLocationRequirements } from './locationRequirements.ts';

// Helper to add notification
const addNotification = (
  draft: GameState,
  notif: Omit<NotificationRequest, 'id'> & { id?: string }
) => {
  const id = notif.id || `notif_${Date.now()}_${Math.random()}`;
  // Prevent duplicate IDs in queue
  if (draft.notificationQueue.some((n) => n.id === id)) return;

  draft.notificationQueue.push({
    ...notif,
    id,
  });
};

export const processTick = (
  draft: GameState,
  delta: number,
  triggerEvent: (type: string, id?: string) => void,
  activeTab: TabType
): void => {
  const now = Date.now();

  // --- Location-Based Property Updates ---
  const locationProps = LOCATION_PROPERTIES[activeTab] || LOCATION_PROPERTIES[TabType.HANGAR];

  // --- Dynamic Difficulty Scaling ---
  const level = draft.resources.level;
  const difficultyMultiplier = Math.min(
    GAME_CONSTANTS.DIFFICULTY_SCALING.MAX_MULTIPLIER,
    1 + level * GAME_CONSTANTS.DIFFICULTY_SCALING.LEVEL_MULTIPLIER
  );

  // --- Generic Event Dispatcher ---
  const triggerRandomEvent = (category: string) => {
    const pool = eventsData[category];
    if (pool && pool.length > 0) {
      const randomEvent = pool[Math.floor(Math.random() * pool.length)];
      triggerEvent(category, randomEvent.id);
    }
  };

  // 1. Noise Logic
  const noiseMap: Record<NoiseLevel, number> = {
    [NoiseLevel.LOW]: 10,
    [NoiseLevel.MEDIUM]: 40,
    [NoiseLevel.HIGH]: 70,
    [NoiseLevel.EXTREME_HIGH]: 90,
  };
  draft.hfStats.noiseExposure = noiseMap[locationProps.noise];

  // Noise Effects
  if (locationProps.noise === NoiseLevel.LOW) {
    draft.resources.suspicion = Math.min(
      GAME_CONSTANTS.MAX_SUSPICION,
      draft.resources.suspicion + 0.5 * (delta / 1000)
    );
  } else if (
    locationProps.noise === NoiseLevel.HIGH ||
    locationProps.noise === NoiseLevel.EXTREME_HIGH
  ) {
    const stressMultiplier = locationProps.noise === NoiseLevel.EXTREME_HIGH ? 1.5 : 0.8;
    draft.hfStats.socialStress = Math.min(
      100,
      draft.hfStats.socialStress + stressMultiplier * (delta / 1000)
    );

    const focusDrain =
      (locationProps.noise === NoiseLevel.EXTREME_HIGH ? 5.0 : 3.5) * difficultyMultiplier;
    draft.resources.focus = Math.max(0, draft.resources.focus - focusDrain * (delta / 1000));
  }

  // 2. Event Stress Logic
  if (draft.activeEvent) {
    draft.hfStats.socialStress = Math.min(100, draft.hfStats.socialStress + 2.0 * (delta / 1000));
  }

  // 3. Fatigue Logic
  const fatigueRateMap: Record<FatigueLevel, number> = {
    [FatigueLevel.LOW]: 0.1,
    [FatigueLevel.MEDIUM]: 0.5,
    [FatigueLevel.HIGH]: 1.2,
    [FatigueLevel.EXTREME_HIGH]: 2.0,
  };
  const fatigueRate = fatigueRateMap[locationProps.fatigue];
  draft.hfStats.fatigue = Math.min(100, draft.hfStats.fatigue + fatigueRate * (delta / 1000));

  // 4. Temperature Logic
  const tempMap: Record<TemperatureLevel, number> = {
    [TemperatureLevel.EXTREME_LOW]: -10,
    [TemperatureLevel.LOW]: 10,
    [TemperatureLevel.COMFORT]: 22,
    [TemperatureLevel.MEDIUM]: 28,
    [TemperatureLevel.HIGH]: 35,
  };
  const targetTemp = tempMap[locationProps.temperature];
  const tempDiff = targetTemp - draft.hfStats.temperature;
  const tempChangeRate = 0.5 * (delta / 1000);

  if (Math.abs(tempDiff) < tempChangeRate) {
    draft.hfStats.temperature = targetTemp;
  } else {
    draft.hfStats.temperature += Math.sign(tempDiff) * tempChangeRate;
  }

  // Helper function - uses centralized log service
  const addLog = (text: string, type: LogMessage['type'] = 'info') => {
    addLogToDraft(draft.logs, text, type, now);
  };

  // --- XP & Level Up Logic (Moved from gameReducer inline) ---
  const xpForNextLevel = getXpForNextLevel(draft.resources.level);
  if (draft.resources.experience >= xpForNextLevel) {
    draft.resources.level += 1;
    draft.resources.experience -= xpForNextLevel;
    draft.proficiency.skillPoints += 1;
    addLog(getLevelUpLog(draft.resources.level), 'levelup');

    // Check for Milestone Unlocks
    const milestone = getMilestoneForLevel(draft.resources.level);
    if (milestone) {
      // 1. Grant Flags
      if (milestone.unlocks.flags) {
        milestone.unlocks.flags.forEach((flagKey) => {
          // Type-safe assignment
          const key = flagKey as keyof GameState['flags'];
          if (typeof draft.flags[key] === 'boolean') {
            (draft.flags as unknown as Record<string, boolean | number | string | null | object>)[
              key
            ] = true;
            addLog(`Unlocked: ${flagKey}`, 'levelup');
          }
        });
      }

      // 2. Trigger Narrative Event
      if (milestone.narrativeEvent) {
        // We trigger it immediately. The event system should handle queuing or overriding.
        // triggerEvent('story_event', milestone.narrativeEvent);
        // HACK: We need to pass this out or rely on the effect.
        // `triggerEvent` is a callback passed from Reducer -> tickProcessor.
        triggerEvent('story_event', milestone.narrativeEvent);
      }
    }

    // NEW: Add Notification Logic (Refactored from App.tsx)
    addNotification(draft, {
      id: `levelup-${draft.resources.level}`,
      title: 'LEVEL UP',
      message: `Reached Level ${draft.resources.level}: ${milestone?.name || 'Unknown'}`,
      variant: 'levelup',
      duration: NOTIFICATION_DURATIONS.DEFAULT,
    });
  }

  // --- Location Warning Logic (Refactored from App.tsx) ---
  // Run this check periodically (e.g., every 1 second) to avoid spamming logic every tick
  // Using a random chance is efficient enough for "periodic" checks without storing a timer
  if (Math.random() < 0.05) {
    // ~Every 20 frames (1.3s at 15FPS)
    // Check cooldown (60 seconds)
    const lastWarning = draft.eventTimestamps.locationWarning || 0;
    if (now - lastWarning > 60000) {
      const checkResult = checkLocationRequirements(activeTab, draft.inventory);
      const isBlocking = !checkResult.satisfied;
      const hasIssues = isBlocking || checkResult.missingSoft.length > 0;

      if (hasIssues) {
        const missingItems = [
          ...checkResult.missingRequired.map((r) => r.label),
          ...checkResult.missingSoft.map((r) => r.label),
        ].join(', ');

        addNotification(draft, {
          id: 'location-warning', // Constant ID to prevent stacking, just refresh duration
          title: isBlocking ? 'HAZARD: UNSAFE CONDITIONS' : 'CAUTION: ADVISORY',
          message: `Missing: ${missingItems}`,
          variant: isBlocking ? 'hazard' : 'warning',
          duration: NOTIFICATION_DURATIONS.WARNING,
        });

        // Set cooldown
        draft.eventTimestamps.locationWarning = now;
      }
    }
  }

  if (activeTab === TabType.BACKSHOPS) {
    draft.resources.suspicion = Math.min(
      GAME_CONSTANTS.MAX_SUSPICION,
      draft.resources.suspicion + 0.02 * (delta / 1000)
    );
    if (Math.random() < GAME_CONSTANTS.EVENT_PROBABILITIES.THE_HUM * (delta / 1000)) {
      triggerRandomEvent('eldritch_manifestation');
    }
    if (
      Math.random() < GAME_CONSTANTS.EVENT_PROBABILITIES.BACKSHOP_AUDIT * (delta / 1000) &&
      draft.resources.suspicion > 40
    ) {
      triggerRandomEvent('audit');
    }
    if (Math.random() < GAME_CONSTANTS.EVENT_PROBABILITIES.CONTAINMENT_BREACH * (delta / 1000)) {
      triggerEvent('incident', 'CONTAINMENT_BREACH_ALERT');
    }
  }

  // Update rotables condition
  draft.rotables.forEach((r) => {
    r.condition = Math.max(0, r.condition - (0.005 * delta) / 1000);
  });

  const precisionTools = ['torquemeter', 'airDataTestBox', 'hfecDevice', 'rototestDevice'];
  precisionTools.forEach((t) => {
    if (draft.inventory[t as keyof Inventory] && draft.toolConditions[t] > 0) {
      draft.toolConditions[t] = Math.max(0, draft.toolConditions[t] - 0.05 * (delta / 1000));
    }
  });

  if (!draft.activeEvent) {
    // Suspicion Threshold Events (Keep specific triggers)
    if (draft.resources.suspicion > 30 && !draft.flags.suspicionEvent30Triggered) {
      triggerEvent('incident', 'SUS_MEMO');
      draft.flags.suspicionEvent30Triggered = true;
    } else if (draft.resources.suspicion > 60 && !draft.flags.suspicionEvent60Triggered) {
      triggerEvent('audit', 'AUDIT_INTERNAL');
      draft.flags.suspicionEvent60Triggered = true;
    } else if (draft.resources.suspicion > 90 && !draft.flags.suspicionEvent90Triggered) {
      triggerEvent('audit', 'AUDIT_SUITS');
      draft.flags.suspicionEvent90Triggered = true;
    }

    // Random Events based on Suspicion
    if (
      draft.resources.suspicion > 70 &&
      Math.random() < GAME_CONSTANTS.EVENT_PROBABILITIES.SUSPICION_AUDIT * (delta / 1000)
    ) {
      triggerRandomEvent('audit');
    }
    if (
      draft.resources.suspicion > 40 &&
      Math.random() < GAME_CONSTANTS.EVENT_PROBABILITIES.RANDOM_DRUG_TEST * (delta / 1000)
    ) {
      triggerEvent('audit', 'RANDOM_DRUG_TEST');
    }

    // General Random Events
    if (Math.random() < GAME_CONSTANTS.EVENT_PROBABILITIES.OVERDUE_NDT * (delta / 1000)) {
      triggerEvent('incident', 'OVERDUE_NDT_INSPECTION');
    }

    // General Weirdness (Generic Dispatcher for previously unreachable events)
    if (Math.random() < GAME_CONSTANTS.EVENT_PROBABILITIES.THE_HUM * 0.5 * (delta / 1000)) {
      triggerRandomEvent('eldritch_manifestation');
    }

    if (!draft.flags.activeComponentFailure) {
      for (const rotable of draft.rotables) {
        if (
          rotable.condition < 25 &&
          Math.random() < GAME_CONSTANTS.EVENT_PROBABILITIES.COMPONENT_FAILURE * (delta / 1000)
        ) {
          triggerEvent('component_failure', rotable.id);
          break;
        }
      }
    }
  }

  if (draft.flags.activeComponentFailure) {
    draft.resources.credits = Math.max(0, draft.resources.credits - 1.5 * (delta / 1000));
  }

  if (draft.flags.fuelContaminationRisk && Math.random() < 0.0002 * (delta / 1000)) {
    triggerEvent('accident', 'CATASTROPHIC_FAILURE');
    draft.flags.fuelContaminationRisk = false;
  }

  // --- Hazard Logic ---
  // 1. Triggering (Small chance if no hazards active)
  if (draft.activeHazards.length === 0 && Math.random() < 0.00005 * (delta / 1000)) {
    // ~Every 4000s (approx once per hour)
    // hazardsData is EnvironmentalHazard[], eventsData might be different.
    // We prioritize hazardsData for now as it matches the type.
    const availableHazards = hazardsData;
    if (availableHazards && availableHazards.length > 0) {
      const hazardTemplate = availableHazards[Math.floor(Math.random() * availableHazards.length)];
      const newHazard: EnvironmentalHazard = {
        ...hazardTemplate,
        id: `${hazardTemplate.id}_${now}`,
      };
      draft.activeHazards.push(newHazard);
      addLog(`WARNING: ${newHazard.name} detected. ${newHazard.description}`, 'warning');

      // Notification
      addNotification(draft, {
        id: `hazard-${now}`,
        title: 'ENVIRONMENTAL HAZARD',
        message: newHazard.name,
        variant: 'hazard',
        duration: 10000,
      });
    }
  }

  // 2. Processing Active Hazards
  if (draft.activeHazards.length > 0) {
    // Iterate backwards to allow removal
    for (let i = draft.activeHazards.length - 1; i >= 0; i--) {
      const hazard = draft.activeHazards[i];
      hazard.duration -= delta;

      // Effects
      if (hazard.effects.sanityDrain) {
        draft.resources.sanity = Math.max(
          0,
          draft.resources.sanity - hazard.effects.sanityDrain * (delta / 1000)
        );
      }

      // Health Drain (Toxic Fumes, etc)
      if (hazard.effects.healthDrain) {
        draft.resources.health = Math.max(
          0,
          draft.resources.health - hazard.effects.healthDrain * (delta / 1000)
        );
      }

      // Random Events inside Hazards
      if (
        hazard.effects.randomEvent &&
        Math.random() < hazard.effects.randomEvent.chance * (delta / 1000)
      ) {
        triggerEvent(hazard.effects.randomEvent.type, hazard.effects.randomEvent.id);
      }

      // Expiration
      if (hazard.duration <= 0) {
        addLog(`Condition Cleared: ${hazard.name}`, 'info');
        draft.activeHazards.splice(i, 1);
      }
    }
  }

  // Timers
  if (draft.hfStats.fearTimer > 0) {
    draft.hfStats.fearTimer -= delta;
    if (draft.hfStats.fearTimer <= 0) {
      draft.hfStats.fearTimer = 0;
      draft.flags.isAfraid = false;
      addLog(SYSTEM_LOGS.FEAR_RECEDE, 'info');
    }
  }

  if (draft.hfStats.scheduleCompressionTimer > 0) {
    draft.hfStats.scheduleCompressionTimer -= delta;
  }
  if (draft.hfStats.sanityShieldTimer > 0) {
    draft.hfStats.sanityShieldTimer -= delta;
  }
  if (draft.hfStats.foundLoopholeTimer > 0) {
    draft.hfStats.foundLoopholeTimer -= delta;
  }

  if (draft.hfStats.toolroomMasterCooldown > 0) {
    draft.hfStats.toolroomMasterCooldown -= delta;
    if (draft.hfStats.toolroomMasterCooldown <= 0) {
      draft.hfStats.toolroomMasterCooldown = 0;
      draft.flags.toolroomMasterPissed = false;
      addLog(SYSTEM_LOGS.MASTER_CALM, 'info');
    }
  }

  if (draft.hfStats.efficiencyBoost > 0) {
    draft.hfStats.efficiencyBoost -= delta;
    if (draft.hfStats.efficiencyBoost <= 0) {
      draft.hfStats.efficiencyBoost = 0;
      addLog('The efficiency boost from your precise calibration has worn off.', 'info');
    }
  }

  if (draft.hfStats.venomSurgeTimer > 0) {
    draft.hfStats.venomSurgeTimer -= delta;
    if (draft.hfStats.venomSurgeTimer <= 0) {
      draft.hfStats.venomSurgeTimer = 0;
      draft.flags.venomSurgeActive = false;
      addLog('The chemical enhancement from the Venom Surge has faded.', 'info');
    }
  }

  // Active Effects
  if (draft.flags.isHallucinating) {
    draft.resources.focus = Math.max(
      0,
      draft.resources.focus - GAME_CONSTANTS.FOCUS_DRAIN_HALLUCINATION * (delta / 1000)
    );
  }

  let sanityDrain = 0;
  if (draft.flags.isAfraid) sanityDrain += GAME_CONSTANTS.SANITY_DRAIN_FEAR_MULTIPLIER;
  if (draft.proficiency.unlocked.includes('steadyNerves')) sanityDrain *= 0.9;

  // Apply difficulty scaling
  sanityDrain *= difficultyMultiplier;

  if (draft.hfStats.sanityShieldTimer > 0) sanityDrain = 0;
  draft.resources.sanity = Math.max(0, draft.resources.sanity - sanityDrain * (delta / 1000));

  // Janitor Logic
  if (draft.hfStats.janitorCooldown > 0) {
    draft.hfStats.janitorCooldown -= delta;
  } else if (!draft.flags.janitorPresent && Math.random() < 0.0002 * (delta / 1000)) {
    draft.flags.janitorPresent = true;
    addLog(SYSTEM_LOGS.JANITOR_APPEARS, 'story');
    draft.hfStats.janitorCooldown = GAME_CONSTANTS.JANITOR_COOLDOWN;
  }

  // Focus Regen
  let focusRegen =
    (draft.flags.nightCrewActive
      ? GAME_CONSTANTS.FOCUS_REGEN_NIGHT_CREW
      : GAME_CONSTANTS.FOCUS_REGEN_BASE) *
    (delta / 1000);
  if (draft.flags.isAfraid) focusRegen *= 0.5;
  if (draft.hfStats.efficiencyBoost > 0) focusRegen *= 1.2;
  draft.resources.focus = Math.min(100, draft.resources.focus + focusRegen);

  // Night Crew
  if (draft.flags.nightCrewActive) {
    let alcladGain = 4.0;
    let rivetGain = 9.0;
    let suspicionGain = 0.18;
    if (draft.proficiency.unlocked.includes('nightShiftSupervisor')) {
      alcladGain *= 1.1;
      rivetGain *= 1.1;
      suspicionGain *= 0.85;
    }
    draft.resources.alclad += alcladGain * (delta / 1000);
    draft.resources.rivets += rivetGain * (delta / 1000);
    draft.resources.suspicion = Math.min(
      GAME_CONSTANTS.MAX_SUSPICION,
      draft.resources.suspicion + suspicionGain * (delta / 1000)
    );
  }

  // Delegation
  if (draft.flags.transitCheckDelegationActive) {
    draft.resources.credits += 1.5 * (delta / 1000);
    draft.resources.experience += 5 * (delta / 1000);
    draft.resources.suspicion = Math.min(
      GAME_CONSTANTS.MAX_SUSPICION,
      draft.resources.suspicion + 0.05 * (delta / 1000)
    );
  }

  // Auto SRF
  if (draft.flags.autoSrfActive) {
    draft.resources.credits += 0.8 * (delta / 1000);
    draft.resources.experience += 2 * (delta / 1000);
    if (Math.random() < 0.0001 * (delta / 1000)) {
      addLog(
        'AUTOMATION ALERT: SRF form filed with a data discrepancy. An internal review has been triggered.',
        'warning'
      );
      triggerEvent('audit', 'AUDIT_INTERNAL');
    }
  }

  // Active Event Logic
  if (draft.activeEvent && draft.activeEvent.type !== 'component_failure') {
    // Story events do not expire
    if (draft.activeEvent.type !== 'story_event') {
      draft.activeEvent.timeLeft -= delta;
      if (draft.activeEvent.timeLeft <= 0) {
        if (draft.activeEvent.id === 'FUEL_CONTAM') {
          draft.flags.fuelContaminationRisk = true;
          addLog("You flushed the contaminated sample. Let's hope nobody finds out.", 'warning');
        }

        const sanityLossMap: Partial<Record<string, number>> = {
          accident: 40,
          eldritch_manifestation: 45,
          canteen_incident: 25,
        };
        // Custom generic fallback
        let loss = 5;
        if (draft.activeEvent.suitType === 'THE_SUITS') loss = 35;
        else if (sanityLossMap[draft.activeEvent.type])
          loss = sanityLossMap[draft.activeEvent.type]!;

        draft.resources.sanity -= loss;
        draft.resources.suspicion += draft.activeEvent.type === 'audit' ? 30 : 5;
        addLog(`SITUATION FAILED: ${draft.activeEvent.title}`, 'error');
        addLog(
          `DEBUG: Event ${draft.activeEvent.id} cleared. Type: ${draft.activeEvent.type}, TimeLeft: ${draft.activeEvent.timeLeft}`,
          'error'
        );
        draft.activeEvent = null;
      }
    }
  }

  // Job Logic
  if (draft.activeJob) {
    let timeDeduction = delta;
    if (draft.hfStats.scheduleCompressionTimer > 0) {
      timeDeduction *= 1.25; // Timer goes 25% faster
    }
    draft.activeJob.timeLeft -= timeDeduction;
    if (draft.activeJob.timeLeft <= 0) {
      addLog(`JOB EXPIRED: ${draft.activeJob.title}`, 'warning');
      draft.activeJob = createJob(); // Auto-replace expired job? logic said "if <= 0" below in original, effectively replacing it.
    }
  }
  // Ensure we always have a job (Logic copied from reducer)
  if (!draft.activeJob) {
    draft.activeJob = createJob();
  }

  // Mail
  const mailCooldown = GAME_CONSTANTS.MAIL_COOLDOWN;
  if (
    draft.inventory.pcAssembled &&
    (!draft.eventTimestamps.lastMail || now - draft.eventTimestamps.lastMail > mailCooldown)
  ) {
    if (Math.random() < 0.05 * (delta / 1000)) {
      const unreadMailCount = draft.mail.filter((m) => !m.read).length;
      // Optimization: Use Set for O(1) lookups instead of O(N) nested loop
      const existingSubjects = new Set(draft.mail.map((m) => m.subject));
      const availableMail = mailData.filter((m) => !existingSubjects.has(m.subject));
      if (unreadMailCount < 5 && availableMail.length > 0) {
        const newMailTemplate = availableMail[Math.floor(Math.random() * availableMail.length)];
        const newMail: MailMessage = { ...newMailTemplate, id: `mail_${now}`, read: false };
        draft.mail.push(newMail);
        draft.eventTimestamps.lastMail = now;
      }
    }
  }

  // Vending Price Fluctuation
  if (Math.random() < 0.005 * (delta / 1000)) {
    Object.keys(draft.vendingPrices).forEach((key) => {
      if (draft.vendingPrices[key] > 0) {
        // Don't change free items
        // Fluiguate by +/- 1-3 credits, recursive bounds check?
        // Just randomize slightly
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        draft.vendingPrices[key] = Math.max(5, draft.vendingPrices[key] + change);
      }
    });
    addLogFromLogic('Market fluctuation detected in vending network.', 'info');
  }

  draft.lastUpdate = now;
};

// Helper for internal logs
function addLogFromLogic(_text: string, _type: LogMessage['type']) {
  // We can't easily access the localized `addLog` closure here without passing it or binding it.
  // But we have `draft.logs` and `Date.now()`.
  // We can duplicate the helper or just ignore logging for price changes.
  // Let's ignore logging for now to keep it simple, or re-instantiate:
  // addLogToDraft(draft.logs, text, type, Date.now());
}
