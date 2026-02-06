import { actionsData } from '../data/actions';
import { anomaliesData } from '../data/anomalies';
import {
  ACTION_LOGS,
  BOEING_REPLIES,
  CANTEEN_INCIDENT_FLAVOR,
  MASTER_LORE,
  STANDARD_RADIO_CHATTER,
  SYSTEM_LOGS,
  TOOLROOM_INCIDENT_FLAVOR,
  TOOLROOM_MASTER_DIALOUGE,
  TRAINING_DEPT_FLAVOR,
  VOID_BROADCASTS,
} from '../data/flavor';
import { skillsData } from '../data/skills';
import { Anomaly, GameState, JobCard, LogMessage, ResourceState, RotableItem } from '../types';

export const handleGameAction = (
  prev: GameState,
  type: string,
  payload: Record<string, unknown> | undefined,
  createJob: () => JobCard,
  triggerEvent: (type: string, id?: string) => void
): GameState => {
  let nextRes = { ...prev.resources };
  const nextPersonal = { ...prev.personalInventory };
  let nextInv = { ...prev.inventory };
  let nextFlg = { ...prev.flags };
  let nextHF = { ...prev.hfStats };
  const nextTools = { ...prev.toolConditions };
  let nextRotables = [...prev.rotables];
  let nextAnomalies = [...prev.anomalies];
  let nextLogs = [...prev.logs];
  let nextMail = [...prev.mail];
  const nextProf = { ...prev.proficiency };
  let nextEvent = prev.activeEvent;
  let nextCalibration = { ...prev.calibrationMinigame };
  let nextJournal = [...(prev.journal || [])];
  let nextPet = { ...prev.pet };
  let nextProcurement = { ...prev.procurement };

  const addLog = (text: string, type: LogMessage['type'] = 'info') => {
    const newLog = { id: Math.random().toString(36), text, type, timestamp: Date.now() };
    nextLogs = [newLog, ...nextLogs.slice(0, 49)];
    nextJournal = [newLog, ...nextJournal];
  };

  const hasSkill = (id: string) => nextProf.unlocked.includes(id);

  // --- GENERIC ACTION PROCESSOR ---
  if (actionsData[type]) {
    const action = actionsData[type];

    // 1. Cost Check & Deduction
    let focusCost = action.baseCost.focus || 0;
    if (nextFlg.isAfraid) focusCost = Math.floor(focusCost * 1.5);
    if (nextHF.efficiencyBoost > 0) focusCost = Math.floor(focusCost * 0.9);

    if (focusCost > 0 && nextRes.focus < focusCost) {
      addLog(SYSTEM_LOGS.LOW_FOCUS, 'warning');
      return { ...prev };
    }

    // Check specific resource costs
    for (const [key, cost] of Object.entries(action.baseCost)) {
      if (key === 'focus') continue;
      const resKey = key as keyof ResourceState;
      if (typeof cost === 'number' && cost > 0) {
        if ((nextRes[resKey] || 0) < cost) {
          addLog(`Insufficient ${key.replace(/_/g, ' ')}.`, 'warning');
          return { ...prev };
        }
        nextRes[resKey] = (nextRes[resKey] || 0) - (cost as number);
      }
    }

    if (focusCost > 0) nextRes.focus -= focusCost;

    // 2. Requirement Checks
    if (action.requiredItems) {
      for (const item of action.requiredItems) {
        if (!nextInv[item]) {
          addLog(`Missing required item to proceed.`, 'warning');
          return { ...prev };
        }
      }
    }

    // 3. Effect Resolution
    let effectTriggered = false;
    const combinedState: GameState = {
      ...prev,
      resources: nextRes,
      inventory: nextInv,
      flags: nextFlg,
      hfStats: nextHF,
      rotables: nextRotables,
      anomalies: nextAnomalies,
      pet: nextPet,
      procurement: nextProcurement,
    };

    const roll = Math.random();
    let currentChance = 0;

    for (const effect of action.effects) {
      currentChance += effect.chance;
      if (roll < currentChance) {
        effectTriggered = true;

        if (effect.log) {
          const logText =
            (effect.customEffect && effect.customEffect(combinedState).logOverride) || effect.log;
          addLog(logText, effect.logType || 'info');
        }

        if (effect.resourceModifiers) {
          for (const [k, v] of Object.entries(effect.resourceModifiers)) {
            const key = k as keyof ResourceState;
            combinedState.resources[key] = (combinedState.resources[key] || 0) + (v as number);
            if (key === 'sanity' || key === 'focus' || key === 'suspicion') {
              combinedState.resources[key] = Math.max(
                0,
                Math.min(100, combinedState.resources[key])
              );
            }
          }
        }

        if (effect.flagModifiers) {
          combinedState.flags = { ...combinedState.flags, ...effect.flagModifiers };
        }

        if (effect.eventTrigger) {
          triggerEvent(effect.eventTrigger.split('_')[0] || 'incident', effect.eventTrigger);
        }

        if (effect.customEffect) {
          const partial = effect.customEffect(combinedState);
          if (partial.resources)
            combinedState.resources = { ...combinedState.resources, ...partial.resources };
          if (partial.flags) combinedState.flags = { ...combinedState.flags, ...partial.flags };
          if (partial.hfStats)
            combinedState.hfStats = { ...combinedState.hfStats, ...partial.hfStats };
          if (partial.pet) combinedState.pet = { ...combinedState.pet, ...partial.pet };
          if (partial.procurement)
            combinedState.procurement = { ...combinedState.procurement, ...partial.procurement };
          if (partial.rotables) combinedState.rotables = partial.rotables;
        }

        if (effect.addItem) {
          (combinedState.inventory as unknown as Record<string, boolean>)[effect.addItem] = true;
        }

        if (effect.removeItem) {
          (combinedState.inventory as unknown as Record<string, boolean>)[effect.removeItem] =
            false;
        }

        break;
      }
    }

    if (!effectTriggered && action.failureEffect) {
      const fail = action.failureEffect;
      if (fail.log) addLog(fail.log, fail.logType || 'info');
      if (fail.resourceModifiers) {
        for (const [k, v] of Object.entries(fail.resourceModifiers)) {
          const key = k as keyof ResourceState;
          combinedState.resources[key] = (combinedState.resources[key] || 0) + (v as number);
        }
      }
    }

    nextRes = combinedState.resources;
    nextInv = combinedState.inventory;
    nextFlg = combinedState.flags;
    nextHF = combinedState.hfStats;
    nextRotables = combinedState.rotables;
    nextAnomalies = combinedState.anomalies;
    nextPet = combinedState.pet;
    nextProcurement = combinedState.procurement;

    return {
      ...prev,
      resources: nextRes,
      inventory: nextInv,
      flags: nextFlg,
      hfStats: nextHF,
      rotables: nextRotables,
      anomalies: nextAnomalies,
      pet: nextPet,
      procurement: nextProcurement,
      logs: nextLogs,
      journal: nextJournal,
    };
  }

  // --- LEGACY ---
  const baseCosts: Record<string, number> = {
    TIGHTEN_BOLT: 3,
    COMPLETE_JOB: 15,
    PERFORM_NDT: 20,
    TRANSIT_CHECK: 12,
    RESOLVE_EVENT: 30,
    SEARCH_MANUALS: 5,
    ASSEMBLE_PC: 20,
    BOEING_SUPPORT: 15,
    READ_FLIGHT_LOG: 5,
    READ_CABIN_LOG: 5,
    WALK_AROUND: 10,
    DAILY_CHECK: 25,
    LISTEN_RADIO: 0,
    SMOKE_CIGARETTE: 0,
    EAT_BURGER: 0,
    CHECK_BOARDS: 5,
    SMALL_TALK: 5,
    SMALL_TALK_CABIN: 5,
    TAKE_WALK: 0,
    GO_RESTROOM: 0,
    REPAIR_TOOL: 15,
    START_CALIBRATION_MINIGAME: 20,
    GET_TOOLROOM_ITEM: 0,
    MIX_PAINT: 15,
    SONIC_CLEAN: 10,
    REGISTER_ROTABLE: 20,
    DISPENSE_CONSUMABLE: 5,
    CREATE_SRF: 10,
    DIGITAL_STUDY: 5,
    UPGRADE_PC_GPU: 0,
    UPGRADE_PC_HDD: 0,
    TAKE_EXAM: 30,
    ORBITAL_SAND: 10,
    FOD_SWEEP: 5,
    REPAIR_ROTABLE: 10,
    MAINTAIN_LOW_PROFILE: 40,
    CHECK_INTERNAL_MAIL: 2,
    CROSS_REFERENCE_MANIFESTS: 50,
    GIVE_URINE_SAMPLE: 5,
    REVIEW_COMPLIANCE: 15,
    ASK_MASTER_LORE: 2,
    HARVEST_ROTABLE: 30,
    DISPOSE_ROTABLE: 0,
    ANALYZE_ANOMALY: 60,
    REVIEW_SURVEILLANCE_LOGS: 50,
    // Removed migrated actions
  };

  let cost = baseCosts[type] || 0;
  if (nextFlg.isAfraid) cost *= 1.5;
  if (nextHF.efficiencyBoost > 0) cost = Math.floor(cost * 0.9);

  if (type === 'TIGHTEN_BOLT' && hasSkill('rivetDiscipline')) cost -= 1;

  if (cost > 0 && nextRes.focus < cost) {
    addLog(SYSTEM_LOGS.LOW_FOCUS, 'warning');
    return { ...prev, logs: nextLogs };
  }
  if (cost > 0) nextRes.focus -= cost;

  switch (type) {
    case 'UNLOCK_SKILL':
      if (nextProf.skillPoints > 0) {
        const skill =
          skillsData.mechanic.find((s) => s.id === payload.id) ||
          skillsData.watcher.find((s) => s.id === payload.id);
        if (skill && !nextProf.unlocked.includes(skill.id)) {
          const hasPrereqs = !skill.prereq || nextProf.unlocked.includes(skill.prereq);
          if (hasPrereqs) {
            nextProf.skillPoints -= 1;
            nextProf.unlocked.push(skill.id);
            addLog(`PROFICIENCY UNLOCKED: ${skill.name}`, 'levelup');
          }
        }
      }
      break;

    case 'JANITOR_INTERACTION': {
      nextFlg.janitorPresent = false;
      const roll = Math.random();
      if (roll < 0.2) {
        addLog(ACTION_LOGS.JANITOR_STARES, 'vibration');
        nextRes.sanity -= 25;
        nextFlg.isAfraid = true;
        nextHF.fearTimer = 45000;
      } else if (roll < 0.4 && !nextInv.foundRetiredIDCard) {
        addLog(ACTION_LOGS.JANITOR_GIVES_ITEM, 'story');
        nextInv.foundRetiredIDCard = true;
      } else if (roll < 0.6) {
        addLog(ACTION_LOGS.JANITOR_GIVES_HINT, 'story');
      } else {
        addLog(ACTION_LOGS.JANITOR_IGNORES, 'info');
      }
      break;
    }

    case 'TOGGLE_AUTO_SRF':
      nextFlg.autoSrfActive = !nextFlg.autoSrfActive;
      addLog(
        nextFlg.autoSrfActive ? SYSTEM_LOGS.AUTO_SRF_DELEGATED : SYSTEM_LOGS.AUTO_SRF_SUSPENDED
      );
      break;

    case 'CHECK_INTERNAL_MAIL': {
      const firstUnread = nextMail.find((m) => !m.read);
      if (firstUnread) {
        addLog(
          `[MAIL] FROM: ${firstUnread.from}\nSUBJ: ${firstUnread.subject}\n\n"${firstUnread.body}"`,
          'story'
        );
        if (firstUnread.effects) {
          nextRes.suspicion = Math.min(
            100,
            nextRes.suspicion + (firstUnread.effects.suspicion || 0)
          );
          nextRes.sanity = Math.max(0, nextRes.sanity + (firstUnread.effects.sanity || 0));
        }
        nextMail = nextMail.map((m) => (m.id === firstUnread.id ? { ...m, read: true } : m));
      } else {
        addLog(ACTION_LOGS.MAIL_NONE, 'info');
      }
      break;
    }

    case 'TAKE_EXAM': {
      if (nextHF.trainingProgress >= 100) {
        const certId = payload.cert || payload.id;
        (nextInv as Record<string, unknown>)[certId as string] = true;
        nextHF.trainingProgress = 0;
        addLog(ACTION_LOGS.EXAM_PASS, 'story');
        nextRes.experience += 1000;
        if (certId === 'hasAPLicense') nextFlg.nightCrewUnlocked = true;
      } else {
        addLog('CERTIFICATION FAILED: TRAINING PROGRESS INCOMPLETE.', 'error');
        nextRes.focus += cost;
      }
      break;
    }

    case 'CREATE_SRF':
      addLog(ACTION_LOGS.SRF_FILED, 'info');
      nextRes.credits += 35;
      nextRes.experience += 120;
      break;

    // ... Legacy/Complex cases ...
    // We keep these until migrated completely.
    // Minimizing duplications where actionsData handles it.

    case 'SEARCH_MANUALS': {
      addLog('Digging through the archive. The paper is brittle and yellowed.', 'info');
      let findRoll = Math.random();
      if (hasSkill('keenEye')) findRoll += 0.1;
      if (findRoll < 0.1 && !nextInv.mainboard) {
        nextInv.mainboard = true;
        addLog('FOUND: Vintage ATX Mainboard.', 'story');
      } else if (findRoll < 0.15 && !nextInv.graphicCard) {
        nextInv.graphicCard = true;
        addLog('FOUND: VGA Card.', 'story');
      } else if (findRoll < 0.2 && !nextInv.cdRom) {
        nextInv.cdRom = true;
        addLog('FOUND: 52x CD-ROM Drive.', 'story');
      } else if (findRoll < 0.25 && !nextInv.floppyDrive) {
        nextInv.floppyDrive = true;
        addLog("FOUND: 3.5' Floppy Drive.", 'story');
      } else if (findRoll < 0.45) {
        // Reduced chance (was 0.45) to make room? No, these act as fallbacks/ranges.
        // Let's insert the KARDEX check.
        if (Math.random() < 0.05) {
          triggerEvent('eldritch_manifestation', 'KARDEX_RECOVERY');
        } else {
          nextRes.experience += 100;
          addLog(ACTION_LOGS.SEARCH_MANUALS_NOTES, 'story');
        }
      } else if (findRoll < 0.55) {
        addLog(ACTION_LOGS.SEARCH_MANUALS_KARDEX, 'vibration');
        nextRes.sanity -= 5;
      } else {
        addLog('Nothing but dust and silverfish.', 'info');
      }
      break;
    }

    // Manual Implementation to support complex conditionals
    case 'REVIEW_SURVEILLANCE_LOGS': {
      // Logic: If suspicion > 75 and sanity < 40, trigger THE_ARCHIVIST
      if (nextRes.suspicion > 75 && nextRes.sanity < 40) {
        triggerEvent('eldritch_manifestation', 'THE_ARCHIVIST');
      } else {
        // Fallback to standard effects defined in actionsData or generic success
        // Since we are overriding the generic processor for this specific logic, we should replicate the success/fail outcome or rely on the generic processor if we weren't returning here.
        // However, the generic processor handles `actionsData` BEFORE this switch.
        // ACTUALLY: The generic processor runs checks on `actionsData` at the top.
        // Wait, the code structure is:
        // 1. Generic Processor (if actionsData[type]) -> returns
        // 2. Legacy Switch

        // So if 'REVIEW_SURVEILLANCE_LOGS' is in actionsData (which it is), this legacy switch case won't be hit unless I remove it from actionsData or add a special handled flag?
        // No, the function returns early: `if (actionsData[type]) { ... return { ... } }`

        // To support this custom logic for REVIEW_SURVEILLANCE_LOGS, I should add it to the `actionsData` definition as a `customEffect` or `eventTrigger` with condition.
        // BUT `actionsData` structure doesn't support complex conditions on event triggers easily without customEffect logic that returns state, not triggering events (though it does pass `triggerEvent`... wait, `triggerEvent` is NOT passed to `customEffect` in `ActionEffect`).

        // `customEffect` signature: `(state: GameState) => Partial<GameState> & { logOverride?: string }`
        // It does NOT accept `triggerEvent`.

        // So I MUST remove REVIEW_SURVEILLANCE_LOGS from `actionsData` OR modifying the Generic Processor to call the legacy switch as well? No that's messy.

        // Better approach:
        // I will ADD the logic to `actionsData` in `src/data/actions.ts` if possible? No, can't trigger event there easily.

        // ALTERNATIVE: Use the switch case, BUT I must ensure `actionsData['REVIEW_SURVEILLANCE_LOGS']` is NOT matching or I remove it from `actionsData`.
        // OR, I can Modify the Generic Processor in `actionProcessor.ts` to checking for specific ID 'REVIEW_SURVEILLANCE_LOGS' and run extra logic.

        // Let's go with: Modify `actionProcessor.ts` to include the logic INSIDE the `actionsData` block via a special check, OR simply remove it from `actionsData` and put it in the switch.
        // Putting it in the switch is cleaner for "complex custom logic".
        // Use the `delete` operator or just don't have it in `actionsData`.
        // I will likely need to REMOVE it from `actionsData` in a subsequent step or just comment it out there.
        // For now, I will add it to the switch case here, AND I will act as if I am going to remove it from `actionsData` (or I will rename the key in `actionsData` to `REVIEW_SURVEILLANCE_LOGS_GENERIC` and not use it).

        // Wait, simply adding it here won't work if `actionsData` catches it first.
        // I will add the code here, and then my next step will be to remove it from `actionsData` or commenting it out.

        // Actually, I can modify `actionsData` in `src/data/actions.ts`?
        // Let's stick to the plan: "Implement manually in the switch statement."
        // This implies I need to ensure it hits the switch.
        // I will assume I will remove it from `actionsData` next.

        const cost = 50;
        if (nextRes.focus < cost) {
          addLog(SYSTEM_LOGS.LOW_FOCUS, 'warning');
          nextRes.focus += cost; // Refund generic deduction if we did it? No, legacy switch handles cost deduction below `if (cost > 0) nextRes.focus -= cost;`
          // Wait, legacy cost handling is: `let cost = baseCosts[type] || 0;` ... `if (cost > 0) nextRes.focus -= cost;`
          // So if I define cost in `baseCosts`, it is handled.
        } else {
          // Logic repeated from verified plan
          if (nextRes.suspicion > 75 && nextRes.sanity < 40) {
            triggerEvent('eldritch_manifestation', 'THE_ARCHIVIST');
          } else {
            // Success case
            if (Math.random() < 0.4) {
              addLog(ACTION_LOGS.REVIEW_SURVEILLANCE_SUCCESS, 'vibration');
              nextRes.sanity -= 15;
              nextRes.experience += 500;
            } else if (Math.random() < 0.15) {
              addLog(ACTION_LOGS.REVIEW_SURVEILLANCE_CAUGHT, 'error');
              triggerEvent('audit', 'AUDIT_INTERNAL');
            } else {
              addLog(ACTION_LOGS.REVIEW_SURVEILLANCE_NOTHING, 'info');
            }
          }
        }
      }
      break;
    }

    case 'ASSEMBLE_PC':
      if (nextInv.mainboard && nextInv.graphicCard && nextInv.cdRom && nextInv.floppyDrive) {
        nextInv.pcAssembled = true;
        addLog(ACTION_LOGS.PC_ASSEMBLED, 'story');
        nextRes.experience += 500;
      } else {
        addLog('PC ASSEMBLY FAILED: MISSING HARDWARE COMPONENTS.', 'error');
        nextRes.focus += cost;
      }
      break;

    case 'UPGRADE_PC_GPU':
      if (nextRes.credits >= 250) {
        nextRes.credits -= 250;
        nextInv.pcGpuUpgrade = true;
        addLog(ACTION_LOGS.UPGRADE_GPU, 'story');
      }
      break;

    case 'UPGRADE_PC_HDD':
      if (nextRes.credits >= 150) {
        nextRes.credits -= 150;
        nextInv.pcHddUpgrade = true;
        addLog(ACTION_LOGS.UPGRADE_HDD, 'story');
      }
      break;

    case 'HARVEST_ROTABLE':
      nextRotables = nextRotables.filter((r) => r.id !== payload.rotableId);
      nextRes.titanium += 10 + Math.floor(Math.random() * 15);
      nextRes.fiberglass += 5 + Math.floor(Math.random() * 10);
      addLog(ACTION_LOGS.HARVEST_SUCCESS, 'story');
      break;

    case 'DISPOSE_ROTABLE':
      if (nextRes.credits >= 500) {
        nextRes.credits -= 500;
        nextRotables = nextRotables.filter((r) => r.id !== payload.rotableId);
        nextRes.suspicion = Math.max(0, nextRes.suspicion - 25);
        addLog(ACTION_LOGS.DISPOSE_SUCCESS, 'story');
      } else {
        addLog(
          "The Master scoffs. 'My services aren't cheap. Come back when you have the credits.'",
          'warning'
        );
      }
      break;

    case 'ASK_MASTER_LORE':
      if (!nextFlg.toolroomMasterPissed) {
        const lore = MASTER_LORE[Math.floor(Math.random() * MASTER_LORE.length)];
        addLog(lore, 'story');
      } else {
        addLog(
          'The Master just glares at you and goes back to polishing a wrench. Probably best to leave him be.',
          'info'
        );
        nextRes.focus += cost;
      }
      break;

    case 'START_CALIBRATION_MINIGAME':
      if (nextRes.credits >= 40) {
        nextRes.credits -= 40;
        const p = payload as { key: string; label: string };
        nextCalibration = { active: true, toolId: p.key, toolLabel: p.label };
      }
      break;

    case 'FINISH_CALIBRATION_MINIGAME': {
      nextCalibration = { active: false, toolId: null, toolLabel: null };
      const { toolId, result } = payload as { toolId: string; result: string };
      if (result === 'perfect') {
        addLog(ACTION_LOGS.CALIBRATION_PERFECT, 'levelup');
        nextTools[toolId] = 100;
        nextHF.efficiencyBoost = 30000;
      } else if (result === 'good') {
        addLog(ACTION_LOGS.CALIBRATION_GOOD, 'info');
        nextTools[toolId] = 100;
      } else {
        addLog(ACTION_LOGS.CALIBRATION_FAIL, 'error');
        nextTools[toolId] = Math.max(0, nextTools[toolId] - 25);
        nextFlg.toolroomMasterPissed = true;
        nextHF.toolroomMasterCooldown = 300000;
      }
      break;
    }

    case 'REPAIR_ROTABLE': {
      const { rotableId } = payload as { rotableId: string };
      const rotableToRepair = nextRotables.find((r) => r.id === rotableId);
      if (rotableToRepair && nextRes.alclad >= 50 && nextRes.credits >= 25) {
        nextRes.alclad -= 50;
        nextRes.credits -= 25;
        nextRotables = nextRotables.map((r) => (r.id === rotableId ? { ...r, condition: 100 } : r));
        addLog(`REPAIRED: ${rotableToRepair.label} brought back to optimal condition.`, 'story');

        if (nextFlg.activeComponentFailure === rotableId) {
          nextFlg.activeComponentFailure = null;
          nextEvent = null;
          addLog(`Operational drag on ${rotableToRepair.label} has been eliminated.`, 'info');
        }
      } else {
        addLog('REPAIR FAILED: Insufficient resources.', 'error');
        nextRes.focus += cost;
      }
      break;
    }

    case 'GET_TOOLROOM_ITEM':
      if (payload && (payload as { key: string }).key) {
        const p = payload as { key: string; label: string; pn: string };
        (nextInv as Record<string, unknown>)[p.key] = true;
        nextTools[p.key] = 100;
        addLog(`CHECK-OUT: ${p.label} (P/N: ${p.pn}). Master signed the tag.`, 'info');
      }
      break;

    case 'DISPENSE_CONSUMABLE': {
      const p = payload as { cost: number; id: string; label: string; unit: string };
      if (nextRes.credits >= p.cost) {
        nextRes.credits -= p.cost;
        (nextRes as Record<string, unknown>)[p.id] =
          (((nextRes as Record<string, unknown>)[p.id] as number) || 0) + 1;
        addLog(`DISPENSED: ${p.label}. 1 ${p.unit} added to kit.`, 'info');
      } else {
        addLog('CREDIT LIMIT EXCEEDED.', 'error');
        nextRes.focus += cost;
      }
      break;
    }

    case 'REGISTER_ROTABLE': {
      const newSN = `SN-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      const isSus = Math.random() < 0.05;
      const isRed = Math.random() < 0.08;
      const p = payload as { label: string; pn: string };
      const newRot: RotableItem = {
        id: Math.random().toString(36),
        label: p.label,
        pn: p.pn,
        sn: isSus ? 'UNTRACEABLE' : newSN,
        condition: isRed ? 0 : 100,
        isInstalled: false,
        isUntraceable: isSus,
        isRedTagged: isRed,
      };
      nextRotables.push(newRot);
      addLog(
        isRed
          ? `RED TAG: ${payload.label} acquired. It's beyond repair.`
          : isSus
            ? ACTION_LOGS.UNTRACEABLE_FOUND
            : `REGISTERED: ${payload.label} (S/N: ${newSN})`,
        isRed ? 'error' : isSus ? 'vibration' : 'info'
      );
      if (isSus) nextRes.suspicion += 15;
      break;
    }

    case 'MIX_PAINT':
      if (nextRes.mek >= 1) {
        nextRes.mek -= 1;
        nextInv.mixedTouchUpPaint = 100;
        addLog(ACTION_LOGS.MIX_PAINT, 'warning');
        nextHF.noiseExposure += 5;
      } else {
        addLog('ERROR: MEK SOLVENT DEPLETED.', 'error');
      }
      break;

    case 'SONIC_CLEAN':
      if (nextInv.sonicCleaner) {
        addLog(ACTION_LOGS.SONIC_CLEAN, 'vibration');
        nextHF.socialStress += 10;
        nextRes.experience += 50;
      }
      break;

    case 'TOOLROOM_MASTER_TALK': {
      const dial =
        TOOLROOM_MASTER_DIALOUGE[Math.floor(Math.random() * TOOLROOM_MASTER_DIALOUGE.length)];
      addLog(dial, 'info');
      nextRes.sanity = Math.min(100, nextRes.sanity + 2);
      break;
    }

    case 'REPAIR_TOOL':
      if (nextRes.alclad >= 30) {
        nextRes.alclad -= 30;
        const p = payload as { id: string; label: string };
        nextTools[p.id] = 100;
        addLog(`Serviced: ${p.label}. Calibration verified.`, 'info');
      }
      break;

    case 'READ_FLIGHT_LOG':
      nextRes.experience += 60;
      if (Math.random() < 0.12) {
        addLog(
          "A log entry from last Tuesday mentions 'voices in the cargo hold'. The plane was in the air.",
          'story'
        );
        nextRes.sanity -= 8;
      } else {
        addLog('Skimming technical logs. Fuel flow and EGT look normal.', 'info');
      }
      break;

    case 'READ_CABIN_LOG':
      nextRes.experience += 50;
      if (Math.random() < 0.15) {
        setTimeout(() => triggerEvent('eldritch_manifestation', 'URINE_STAIN_ELD'), 500);
      } else {
        addLog(
          "Cabin log: 'Passenger in 12B complained of cold air.' Standard vent issue.",
          'info'
        );
      }
      break;

    case 'WALK_AROUND': {
      nextRes.experience += 100;
      nextRes.alclad += 2;
      addLog(ACTION_LOGS.WALK_AROUND, 'info');
      const walkRoll = Math.random();
      if (walkRoll < 0.1) setTimeout(() => triggerEvent('incident', 'DENT_STATIC_PORT'), 500);
      else if (walkRoll < 0.2) setTimeout(() => triggerEvent('incident', 'TIRE_CHANGE'), 800);
      break;
    }

    // --- NEW ACTIONS (Requested) ---
    case 'BRIBE_AUDITOR':
      if (nextRes.credits >= 100) {
        nextRes.credits -= 100;
        nextRes.suspicion = Math.max(0, nextRes.suspicion - 15);
        addLog(
          "You slide an envelope across the table. The auditor doesn't look down, but the envelope vanishes.",
          'story'
        );
      } else {
        addLog("You don't have enough credits to make this problem go away.", 'warning');
      }
      break;

    case 'SUBMIT_FAKE_LOGS':
      nextRes.suspicion += 10;
      if (Math.random() < 0.6) {
        nextRes.experience += 150;
        addLog('Data falsified successfully. The system accepts your reality.', 'story');
      } else {
        triggerEvent('audit', 'AUDIT_INTERNAL_SUITS_1');
        addLog('The system rejected your input. Red flags are waving.', 'error');
      }
      break;

    case 'EAT_VOID_BURGER':
      nextRes.sanity -= 10;
      nextRes.focus += 25;
      addLog(CANTEEN_INCIDENT_FLAVOR[4], 'story');
      break;

    case 'LISTEN_TO_WALLS':
      nextRes.sanity -= 5;
      if (Math.random() < 0.3) {
        addLog('You hear a conversation from yesterday.', 'vibration');
        nextRes.experience += 100;
      } else {
        addLog('The walls are silent. Too silent.', 'info');
      }
      break;

    case 'SACRIFICE_TOOL': {
      // Toolroom
      const toolToLose = Object.keys(nextTools).find((t) => nextTools[t] > 0);
      if (toolToLose) {
        nextTools[toolToLose] = 0;
        nextRes.sanity += 20;
        nextRes.suspicion -= 10;
        addLog(TOOLROOM_INCIDENT_FLAVOR[0], 'story');
      } else {
        addLog('You have nothing worthy to offer.', 'warning');
      }
      break;
    }

    case 'ATTEND_TRAINING_MODULE':
      nextRes.sanity -= 15;
      nextHF.trainingProgress += 20;
      addLog(TRAINING_DEPT_FLAVOR[Math.floor(Math.random() * TRAINING_DEPT_FLAVOR.length)], 'info');
      break;

    case 'SKIP_TRAINING':
      nextRes.sanity += 10;
      nextRes.suspicion += 5;
      addLog("You skipped the module on 'Non-Euclidean Geometry'. Probably for the best.", 'info');
      break;

    case 'CHECK_FOR_BUGS':
      if (Math.random() < 0.2) {
        addLog(ACTION_LOGS['DEEP_CLEAN_VENTS_DEVICE'] || 'Found a device.', 'story');
        nextRes.experience += 200;
      } else {
        addLog('You sweep the room. Clear. For now.', 'info');
      }
      break;

    case 'TALK_TO_SUITS':
      nextRes.sanity -= 20;
      if (Math.random() < 0.5) {
        addLog('They answer in a language that makes your nose bleed.', 'vibration');
        nextRes.experience += 500;
      } else {
        triggerEvent('canteen_incident', 'CANTEEN_SUITS_LUNCH');
      }
      break;

    case 'INSPECT_SHADOWS':
      nextRes.sanity -= 5;
      if (Math.random() < 0.1) {
        addLog('Your shadow detaches and walks away.', 'vibration');
        nextFlg.isAfraid = true;
        nextHF.fearTimer = 30000;
      } else {
        addLog('Just shadows. But they seem... deeper than usual.', 'info');
      }
      break;

    case 'LISTEN_RADIO': {
      const rad = Math.random();
      if (rad < 0.1) {
        // 10% chance for void broadcast
        const msg = VOID_BROADCASTS[Math.floor(Math.random() * VOID_BROADCASTS.length)];
        let sanityDrain = 15;
        if (hasSkill('voidWhisperer') && Math.random() < 0.2) {
          addLog(`The static resolves: "${msg}" You understand.`, 'levelup');
          nextRes.experience += 1000;
          sanityDrain = 0;
        } else {
          addLog(msg, 'vibration');
        }
        nextRes.sanity -= sanityDrain;
        if (sanityDrain > 0) {
          nextFlg.isAfraid = true;
          nextHF.fearTimer = 30000;
        }
      } else if (rad < 0.8) {
        // 70% chance for standard chatter
        const msg =
          STANDARD_RADIO_CHATTER[Math.floor(Math.random() * STANDARD_RADIO_CHATTER.length)];
        addLog(msg, 'info');
        nextRes.sanity = Math.min(100, nextRes.sanity + 1);
      } else {
        // 20% chance for calming static
        addLog("Static and late-night jazz. It's calming.", 'info');
        nextRes.sanity = Math.min(100, nextRes.sanity + 5);
      }
      break;
    }

    case 'SMOKE_CIGARETTE':
      if ((nextPersonal['winston_pack'] || 0) > 0) {
        nextPersonal['winston_pack'] -= 1;
        nextRes.sanity = Math.min(100, nextRes.sanity + 5);
        nextRes.focus = Math.min(100, nextRes.focus + 5);
        nextHF.socialStress = Math.floor(nextHF.socialStress / 2);
        nextHF.fatigue = Math.floor(nextHF.fatigue / 2);
        addLog('You light up a Winston Light. The harsh smoke clears your head.', 'story');
      } else {
        addLog('You pat your pockets, but you are out of smokes.', 'warning');
      }
      break;

    case 'EAT_BURGER':
      if (nextRes.credits >= 12) {
        nextRes.credits -= 12;
        nextRes.focus = Math.min(100, nextRes.focus + 40);
        nextRes.sanity = Math.min(100, nextRes.sanity + 15);
        addLog(ACTION_LOGS.EAT_BURGER, 'info');
      } else {
        addLog('NOT ENOUGH CREDITS FOR FOOD.', 'error');
      }
      break;

    case 'CHECK_BOARDS':
      addLog(ACTION_LOGS.CHECK_BOARDS, 'vibration');
      nextRes.experience += 80;
      nextRes.sanity -= 3;
      break;

    case 'SMALL_TALK':
      addLog(ACTION_LOGS.SMALL_TALK, 'info');
      nextRes.sanity = Math.min(100, nextRes.sanity + 8);
      if (Math.random() < 0.1) setTimeout(() => triggerEvent('incident', 'RAMP_DELAY'), 1000);
      break;

    case 'SMALL_TALK_CABIN':
      addLog(ACTION_LOGS.SMALL_TALK_CABIN, 'info');
      nextRes.sanity = Math.min(100, nextRes.sanity + 8);
      if (Math.random() < 0.1)
        addLog(
          'A flight attendant mentions the aft galley coffee maker has been making strange grinding noises, even when unplugged.',
          'story'
        );
      break;

    case 'GO_RESTROOM':
      nextRes.focus = Math.min(100, nextRes.focus + 15);
      if (Math.random() < 0.05) {
        addLog(ACTION_LOGS.GO_RESTROOM_SUIT, 'vibration');
        nextRes.suspicion = Math.min(100, nextRes.suspicion + 5);
        nextRes.sanity -= 10;
        nextFlg.isAfraid = true;
        nextHF.fearTimer = 15000;
      } else {
        addLog(ACTION_LOGS.GO_RESTROOM, 'info');
      }
      break;

    case 'TAKE_WALK':
      addLog(ACTION_LOGS.TAKE_WALK, 'info');
      nextRes.focus = Math.min(100, nextRes.focus + 15);
      break;

    case 'TRANSIT_CHECK': {
      addLog('Performing a quick transit check on a Boeing 737.', 'info');
      nextRes.credits += 25;
      nextRes.experience += 120;
      nextRes.alclad += 5;

      const eventRoll = Math.random();
      if (eventRoll < 0.4) {
        const eventPool = [
          'CAPTAIN_ARGUMENT',
          'RAMP_DELAY',
          'DENT_STATIC_PORT',
          'TIRE_CHANGE',
          'CLOGGED_TOILET',
          'GALLEY_SHADOWS',
          'CARGO_NOISES',
          'CATERING_INCIDENT',
          'COFFEE_MAKER_INOP',
          'NEW_GUY_MISTAKE',
          'GROUND_POWER_INOP',
          'BAGGAGE_LOADER_IMPACT',
          'FUELING_ERROR',
        ];
        const chosenEventId = eventPool[Math.floor(Math.random() * eventPool.length)];

        let eventType = 'incident';
        if (['CLOGGED_TOILET'].includes(chosenEventId)) eventType = 'accident';
        if (['GALLEY_SHADOWS', 'CARGO_NOISES'].includes(chosenEventId))
          eventType = 'eldritch_manifestation';

        setTimeout(() => triggerEvent(eventType, chosenEventId), 1000);
      } else if (eventRoll < 0.45) {
        const lavRoll = Math.random();
        addLog('The lavatory system check reveals something unusual...', 'story');
        if (lavRoll < 0.5 && !nextInv.foundRetiredIDCard) {
          nextInv.foundRetiredIDCard = true;
          addLog(ACTION_LOGS.SERVICE_LAVATORY_FIND_ID, 'story');
        } else if (!nextInv.metallicSphere) {
          nextInv.metallicSphere = true;
          addLog(ACTION_LOGS.SERVICE_LAVATORY_FIND_SPHERE, 'vibration');
        } else {
          addLog('...but it was just a standard blockage. System cleared.', 'info');
        }
      } else {
        addLog('Transit check is clear. The aircraft is released to the line.', 'info');
      }
      break;
    }

    case 'DAILY_CHECK':
      addLog(ACTION_LOGS.DAILY_CHECK, 'info');
      nextRes.experience += 250;
      nextRes.credits += 60;
      nextRes.alclad += 10;
      break;

    case 'FOD_SWEEP':
      addLog('Sweeping the apron for debris. Found some stray fasteners.', 'info');
      nextRes.rivets += 15;
      nextRes.experience += 40;
      break;

    case 'PERFORM_NDT':
      addLog(SYSTEM_LOGS.NDT_SCAN, 'info');
      nextRes.experience += 200;
      nextRes.sanity -= 2;
      break;

    case 'ORBITAL_SAND':
      if (nextInv.orbitalSander) {
        addLog('Sanding down a fuselage panel. The vibration is numbing.', 'info');
        nextRes.alclad += 10;
        nextHF.noiseExposure += 2;
      } else {
        addLog('ERROR: MISSING ORBITAL SANDER.', 'error');
      }
      break;

    case 'TIGHTEN_BOLT':
      if (nextInv.rivetGun) {
        nextRes.rivets += 8;
        nextTools.rivetGun = Math.max(0, (nextTools.rivetGun || 100) - 0.5);
      } else {
        nextRes.rivets += 1;
      }
      break;

    case 'COMPLETE_JOB': {
      if (prev.activeJob) {
        const jobReqs = prev.activeJob.requirements;

        // 1. Check Resources
        if ((jobReqs.alclad || 0) > nextRes.alclad) {
          addLog('Insufficient Alclad.', 'error');
          return { ...prev, resources: { ...nextRes, focus: nextRes.focus + cost } };
        }
        if ((jobReqs.rivets || 0) > nextRes.rivets) {
          addLog('Insufficient Rivets.', 'error');
          return { ...prev, resources: { ...nextRes, focus: nextRes.focus + cost } };
        }
        if ((jobReqs.titanium || 0) > nextRes.titanium) {
          addLog('Insufficient Titanium.', 'error');
          return { ...prev, resources: { ...nextRes, focus: nextRes.focus + cost } };
        }
        if ((jobReqs.crystallineResonators || 0) > (nextRes.crystallineResonators || 0)) {
          addLog('Insufficient Crystalline Resonators.', 'error');
          return { ...prev, resources: { ...nextRes, focus: nextRes.focus + cost } };
        }
        if ((jobReqs.bioFilament || 0) > (nextRes.bioFilament || 0)) {
          addLog('Insufficient Bio-Filament.', 'error');
          return { ...prev, resources: { ...nextRes, focus: nextRes.focus + cost } };
        }
        if ((jobReqs.skydrol || 0) > (nextRes.skydrol || 0)) {
          addLog('Insufficient Skydrol.', 'error');
          return { ...prev, resources: { ...nextRes, focus: nextRes.focus + cost } };
        }

        // 2. Check Tools
        const reqTools = jobReqs.tools || [];
        for (const t of reqTools) {
          if (!nextInv[t]) {
            addLog(`ERROR: MISSING TOOL: ${t.toUpperCase()}`, 'error');
            return {
              ...prev,
              logs: nextLogs,
              resources: { ...nextRes, focus: nextRes.focus + cost },
            };
          }
          if ((nextTools[t] || 0) <= 0) {
            addLog(`ERROR: Tool ${t.toUpperCase()} Unserviceable.`, 'error');
            return {
              ...prev,
              logs: nextLogs,
              resources: { ...nextRes, focus: nextRes.focus + cost },
            };
          }
          // Tool Wear
          if (!hasSkill('highTorqueMethods') || Math.random() > 0.2) {
            nextTools[t] = Math.max(0, nextTools[t] - (5 + Math.random() * 5));
          } else {
            addLog(`[High-Torque Methods] Tool ${t.toUpperCase()} condition preserved.`, 'info');
          }
        }

        // 3. Deduct Resources
        nextRes.alclad = Math.max(0, nextRes.alclad - (jobReqs.alclad || 0));
        nextRes.rivets = Math.max(0, nextRes.rivets - (jobReqs.rivets || 0));
        nextRes.titanium = Math.max(0, nextRes.titanium - (jobReqs.titanium || 0));
        if (jobReqs.crystallineResonators)
          nextRes.crystallineResonators = Math.max(
            0,
            (nextRes.crystallineResonators || 0) - jobReqs.crystallineResonators
          );
        if (jobReqs.bioFilament)
          nextRes.bioFilament = Math.max(0, (nextRes.bioFilament || 0) - jobReqs.bioFilament);
        if (jobReqs.skydrol)
          nextRes.skydrol = Math.max(0, (nextRes.skydrol || 0) - jobReqs.skydrol);

        addLog(`Work Order ${prev.activeJob.id} Signed Off.`, 'story');
        nextRes.credits += prev.activeJob.rewardXP / 2;
        nextRes.experience += prev.activeJob.rewardXP;

        if (!prev.activeJob.isRetrofit && Math.random() < 0.05) {
          const anomalyTemplate = anomaliesData[Math.floor(Math.random() * anomaliesData.length)];
          const newAnomaly: Anomaly = {
            id: `anom_${Date.now()}`,
            name: anomalyTemplate.name,
            description: anomalyTemplate.description,
            templateId: anomalyTemplate.id,
          };
          nextAnomalies.push(newAnomaly);
          addLog(ACTION_LOGS.ANOMALY_FOUND, 'vibration');
        }

        return {
          ...prev,
          resources: nextRes,
          inventory: nextInv,
          toolConditions: nextTools,
          flags: nextFlg,
          hfStats: nextHF,
          rotables: nextRotables,
          logs: nextLogs,
          proficiency: nextProf,
          activeEvent: nextEvent,
          anomalies: nextAnomalies,
          activeJob: createJob(),
        };
      }
      break;
    }

    case 'BOEING_SUPPORT': {
      const bmsg = BOEING_REPLIES[Math.floor(Math.random() * BOEING_REPLIES.length)];
      addLog(`BOEING SUPPORT: "${bmsg}"`, 'vibration');
      nextRes.experience += 500;
      nextRes.sanity -= 10;
      let susGain = 5;
      if (hasSkill('unseenPresence')) susGain *= 0.8;
      nextRes.suspicion += susGain;
      break;
    }

    case 'RESOLVE_EVENT':
      if (prev.activeEvent) {
        if (prev.activeEvent.id === 'FUEL_CONTAM') {
          nextRes.suspicion = Math.min(100, nextRes.suspicion + 35);
          addLog(
            "You reported the fuel contamination. A HAZMAT team is on its way, and so is a full audit team. They'll be watching you closely.",
            'warning'
          );
        } else if (prev.activeEvent.id === 'CATERING_INCIDENT') {
          nextRes.credits -= 50;
          addLog(ACTION_LOGS.CATERING_INCIDENT_RESOLVED, 'info');
        } else if (prev.activeEvent.id === 'GROUND_POWER_INOP') {
          addLog(ACTION_LOGS.GROUND_POWER_RESOLVED, 'info');
        } else if (prev.activeEvent.id === 'BAGGAGE_LOADER_IMPACT') {
          addLog(ACTION_LOGS.BAGGAGE_IMPACT_LOGGED, 'info');
        } else if (prev.activeEvent.id === 'FUELING_ERROR') {
          addLog(ACTION_LOGS.FUEL_LOG_CORRECTED, 'info');
        }
        if (prev.activeEvent.requiredAction === 'SUBMIT_URINE_SAMPLE') {
          handleGameAction(prev, 'GIVE_URINE_SAMPLE', payload, createJob, triggerEvent);
          nextEvent = null;
          return { ...prev, activeEvent: null };
        }
        if (prev.activeEvent.type === 'component_failure') {
          addLog(
            'This issue cannot be resolved through standard channels. The component must be repaired in the toolroom.',
            'error'
          );
          nextRes.focus += cost;
          return { ...prev, resources: nextRes, logs: nextLogs };
        }
        nextRes.experience += 350;
        addLog(SYSTEM_LOGS.EVENT_RESOLVED, 'story');
        nextEvent = null;
      }
      break;

    case 'TOGGLE_NIGHT_CREW':
      nextFlg.nightCrewActive = !nextFlg.nightCrewActive;
      addLog(nextFlg.nightCrewActive ? SYSTEM_LOGS.SHIFT_DELEGATED : SYSTEM_LOGS.SHIFT_DISMISSED);
      break;

    case 'TOGGLE_TRANSIT_CHECK_DELEGATION':
      nextFlg.transitCheckDelegationActive = !nextFlg.transitCheckDelegationActive;
      addLog(
        nextFlg.transitCheckDelegationActive
          ? SYSTEM_LOGS.TRANSIT_CHECK_DELEGATED
          : SYSTEM_LOGS.TRANSIT_CHECK_SUSPENDED
      );
      break;

    case 'BUY_SHOP_ITEM': {
      const p = payload as { cost: number; item: string };
      if (nextRes.alclad >= p.cost) {
        nextRes.alclad -= p.cost;
        (nextInv as Record<string, unknown>)[p.item] = true;
        nextTools[p.item] = 100;
        addLog(`PURCHASED: ${p.item.toUpperCase()}`);
      } else {
        addLog('NOT ENOUGH ALCLAD SCRAP.', 'error');
      }
      break;
    }

    case 'BUY_VENDING': {
      const p = payload as {
        id: string;
        cost: number;
        sanity: number;
        focus: number;
        msg: string;
      };
      let vPrice = prev.vendingPrices[p.id] || p.cost;
      const highSuspicion = prev.resources.suspicion > 50;
      if (highSuspicion) {
        vPrice = Math.floor(vPrice * 1.5);
      }

      if (nextRes.credits >= vPrice) {
        if (highSuspicion) {
          addLog(
            "The vending machine seems to charge you extra. It knows you're desperate.",
            'warning'
          );
        }
        nextRes.credits -= vPrice;
        nextRes.sanity = Math.min(100, nextRes.sanity + p.sanity);
        nextRes.focus = Math.min(100, nextRes.focus + p.focus);
        addLog(p.msg, p.sanity < 0 ? 'warning' : 'info');

        if (p.id === 'venom_surge') {
          nextFlg.venomSurgeActive = true;
          nextHF.venomSurgeTimer = 60000;
        }
        if (p.id === 'winston_pack') {
          nextPersonal['winston_pack'] = (nextPersonal['winston_pack'] || 0) + 1;
        }
      } else {
        addLog('INSUFFICIENT CREDITS.', 'error');
      }
      break;
    }

    case 'ANALYZE_ANOMALY': {
      const anomalyToAnalyze = nextAnomalies[0];
      if (!anomalyToAnalyze) return prev;

      nextRes.sanity -= 60;

      if (Math.random() > 0.3) {
        // 70% success
        const template = anomaliesData.find((a) => a.id === anomalyToAnalyze.templateId);
        if (template) {
          if (template.retrofitJob.requirements.crystallineResonators)
            nextRes.crystallineResonators = (nextRes.crystallineResonators || 0) + 5;
          if (template.retrofitJob.requirements.bioFilament)
            nextRes.bioFilament = (nextRes.bioFilament || 0) + 10;

          addLog(ACTION_LOGS.ANOMALY_ANALYSIS_SUCCESS, 'story');

          const duration = 300000 + Math.random() * 300000;
          const newRetrofitJob: JobCard = {
            ...template.retrofitJob,
            id: `retrofit_${Date.now()}`,
            timeLeft: duration,
            totalTime: duration,
          };

          nextAnomalies.shift();
          return {
            ...prev,
            resources: nextRes,
            inventory: nextInv,
            toolConditions: nextTools,
            flags: nextFlg,
            hfStats: nextHF,
            rotables: nextRotables,
            logs: nextLogs,
            proficiency: nextProf,
            activeEvent: nextEvent,
            mail: nextMail,
            calibrationMinigame: nextCalibration,
            anomalies: nextAnomalies,
            activeJob: newRetrofitJob,
            journal: nextJournal,
            pet: nextPet,
            procurement: nextProcurement,
          };
        }
      } else {
        // Failure
        addLog(ACTION_LOGS.ANOMALY_ANALYSIS_FAIL, 'error');
        nextAnomalies.shift();
        triggerEvent('eldritch_manifestation', 'CONTAINMENT_BREACH');
      }
      break;
    }
  }

  return {
    ...prev,
    resources: nextRes,
    inventory: nextInv,
    personalInventory: nextPersonal,
    toolConditions: nextTools,
    rotables: nextRotables,
    anomalies: nextAnomalies,
    flags: nextFlg,
    hfStats: nextHF,
    logs: nextLogs,
    mail: nextMail,
    proficiency: nextProf,
    calibrationMinigame: nextCalibration,
    activeEvent: nextEvent,
    pet: nextPet,
    procurement: nextProcurement,
  };
};
