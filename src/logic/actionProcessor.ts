import { anomaliesData } from '../data/anomalies';
import {
  ACTION_LOGS,
  BOEING_REPLIES,
  CANTEEN_INCIDENT_FLAVOR,
  MAGAZINE_FLAVOR_TEXTS,
  MASTER_LORE,
  REGULAR_TALK_LOGS,
  STANDARD_RADIO_CHATTER,
  SYSTEM_LOGS,
  TOOLROOM_INCIDENT_FLAVOR,
  TOOLROOM_MASTER_DIALOUGE,
  TRAINING_DEPT_FLAVOR,
  VOID_BROADCASTS,
} from '../data/flavor';
import { itemsData } from '../data/items';
import { skillsData } from '../data/skills';
import { Anomaly, GameState, JobCard, LogMessage, RotableItem } from '../types';

export const handleGameAction = (
  prev: GameState,
  type: string,
  payload: Record<string, unknown> | undefined,
  createJob: () => JobCard,
  triggerEvent: (type: string, id?: string) => void
): GameState => {
  const nextRes = { ...prev.resources };
  const nextPersonal = { ...prev.personalInventory };
  const nextInv = { ...prev.inventory };
  const nextFlg = { ...prev.flags };
  const nextHF = { ...prev.hfStats };
  const nextTools = { ...prev.toolConditions };
  let nextRotables = [...prev.rotables];
  const nextAnomalies = [...prev.anomalies];
  let nextLogs = [...prev.logs];
  let nextMail = [...prev.mail];
  const nextProf = { ...prev.proficiency };
  let nextEvent = prev.activeEvent;
  let nextCalibration = { ...prev.calibrationMinigame };

  const addLog = (text: string, type: LogMessage['type'] = 'info') => {
    nextLogs = [
      { id: Math.random().toString(36), text, type, timestamp: Date.now() },
      ...nextLogs.slice(0, 49),
    ];
  };

  const hasSkill = (id: string) => nextProf.unlocked.includes(id);

  const baseCosts: Record<string, number> = {
    TIGHTEN_BOLT: 3,
    COMPLETE_JOB: 15,
    PERFORM_NDT: 20,
    TRANSIT_CHECK: 12,
    RESOLVE_EVENT: 30,
    STUDY_MODULE: 8,
    READ_MAGAZINE: 0,
    NAP_TABLE: 0,
    SEARCH_MANUALS: 5,
    ASSEMBLE_PC: 20,
    BOEING_SUPPORT: 15,
    READ_FLIGHT_LOG: 5,
    READ_CABIN_LOG: 5,
    WALK_AROUND: 10,
    DAILY_CHECK: 25,
    LISTEN_RADIO: 0,
    SLEEP_CAR: 0,
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
    OBSERVE_SEDAN: 10,
    CHECK_INTERNAL_MAIL: 2,
    CROSS_REFERENCE_MANIFESTS: 50,
    GIVE_URINE_SAMPLE: 5,
    REVIEW_COMPLIANCE: 15,
    ASK_MASTER_LORE: 2,
    HARVEST_ROTABLE: 30,
    DISPOSE_ROTABLE: 0,
    OBSERVE_CORROSION_CORNER: 10,
    SCAVENGE_CORROSION_CORNER: 40,
    ANALYZE_ANOMALY: 60,
    DEEP_CLEAN_VENTS: 15,
    REVIEW_SURVEILLANCE_LOGS: 50,
    LISTEN_FUSELAGE: 0,
    CHECK_REDACTED_LOGS: 30,
    TALK_TO_REGULAR: 10,
    RUMMAGE_LOST_FOUND: 5,
    CHECK_DELAYED_GATE: 0,
    INSPECT_VENDING_MACHINE: 10,
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
    case 'INSPECT_VENDING_MACHINE': {
      const roll = Math.random();
      if (roll < 0.2) {
        addLog(ACTION_LOGS.INSPECT_VENDING_MACHINE_COIN, 'story');
        // This is a placeholder for a new item type if you want to add one
        nextRes.experience += 100;
      } else if (roll < 0.5) {
        addLog(ACTION_LOGS.INSPECT_VENDING_MACHINE_NOTE, 'vibration');
        nextRes.sanity -= 5;
        nextRes.experience += 150;
      } else {
        addLog(ACTION_LOGS.INSPECT_VENDING_MACHINE_NOTHING, 'info');
      }
      break;
    }
    case 'CHECK_DELAYED_GATE': {
      if (nextRes.sanity < 25) {
        addLog("You can't bring yourself to go near that gate right now.", 'warning');
        return prev;
      }
      nextRes.sanity -= 25;
      const roll = Math.random();
      if (roll < 0.2) {
        addLog(ACTION_LOGS.CHECK_DELAYED_GATE_COLD, 'vibration');
        nextFlg.isAfraid = true;
        nextHF.fearTimer = 30000;
      } else if (roll < 0.5) {
        addLog(ACTION_LOGS.CHECK_DELAYED_GATE_SOUND, 'story');
        nextRes.experience += 200;
      } else {
        addLog(ACTION_LOGS.CHECK_DELAYED_GATE_NORMAL, 'info');
      }
      break;
    }
    case 'RUMMAGE_LOST_FOUND': {
      const roll = Math.random();
      if (roll < 0.2) {
        addLog(ACTION_LOGS.RUMMAGE_LOST_FOUND_CREDITS, 'info');
        nextRes.credits += Math.floor(Math.random() * 20) + 5;
      } else if (roll < 0.5) {
        addLog(ACTION_LOGS.RUMMAGE_LOST_FOUND_SANITY, 'story');
        nextRes.sanity = Math.min(100, nextRes.sanity + 10);
      } else {
        addLog(ACTION_LOGS.RUMMAGE_LOST_FOUND_WEIRD, 'vibration');
        nextRes.sanity -= 5;
      }
      break;
    }
    case 'TALK_TO_REGULAR': {
      const roll = Math.random();
      if (roll < 0.3) {
        // Clue
        const clue =
          REGULAR_TALK_LOGS.CLUES[Math.floor(Math.random() * REGULAR_TALK_LOGS.CLUES.length)];
        addLog(clue, 'story');
        nextRes.experience += 250;
        nextRes.sanity -= 5;
      } else if (roll < 0.6) {
        // Warning
        const warning =
          REGULAR_TALK_LOGS.WARNINGS[Math.floor(Math.random() * REGULAR_TALK_LOGS.WARNINGS.length)];
        addLog(warning, 'vibration');
        nextRes.sanity -= 10;
      } else {
        // Ramble
        const ramble =
          REGULAR_TALK_LOGS.RAMBLES[Math.floor(Math.random() * REGULAR_TALK_LOGS.RAMBLES.length)];
        addLog(ramble, 'info');
        nextRes.focus = Math.max(0, nextRes.focus - 10); // Extra focus cost for being bored
      }
      break;
    }
    case 'CHECK_REDACTED_LOGS': {
      nextRes.suspicion = Math.min(100, nextRes.suspicion + 5);
      const roll = Math.random();
      if (roll < 0.1) {
        addLog(ACTION_LOGS.CHECK_REDACTED_SUITS, 'vibration');
        nextRes.suspicion = Math.min(100, nextRes.suspicion + 15);
        nextFlg.isAfraid = true;
        nextHF.fearTimer = 45000;
      } else if (roll < 0.4) {
        addLog(ACTION_LOGS.CHECK_REDACTED_SUCCESS, 'story');
        nextRes.experience += 400;
        nextRes.sanity -= 5;
      } else {
        addLog(ACTION_LOGS.CHECK_REDACTED_FAIL, 'warning');
      }
      break;
    }
    case 'LISTEN_FUSELAGE': {
      if (nextRes.sanity < 20) {
        addLog("You're too on edge to listen closely to anything.", 'warning');
        return prev;
      }
      nextRes.sanity -= 20;
      const roll = Math.random();
      if (roll < 0.15) {
        addLog(ACTION_LOGS.LISTEN_FUSELAGE_HEARTBEAT, 'vibration');
        nextFlg.isAfraid = true;
        nextHF.fearTimer = 60000;
      } else if (roll < 0.45) {
        addLog(ACTION_LOGS.LISTEN_FUSELAGE_WHISPERS, 'story');
        nextRes.experience += 300;
      } else {
        addLog(ACTION_LOGS.LISTEN_FUSELAGE_NORMAL, 'info');
      }
      break;
    }
    case 'REVIEW_SURVEILLANCE_LOGS': {
      nextRes.suspicion = Math.min(100, nextRes.suspicion + 15);
      const roll = Math.random();
      if (roll < 0.15) {
        addLog(ACTION_LOGS.REVIEW_SURVEILLANCE_CAUGHT, 'error');
        triggerEvent('audit', 'AUDIT_INTERNAL');
      } else if (roll < 0.4) {
        addLog(ACTION_LOGS.REVIEW_SURVEILLANCE_SUCCESS, 'vibration');
        nextRes.sanity -= 15;
        nextRes.experience += 500;
      } else {
        addLog(ACTION_LOGS.REVIEW_SURVEILLANCE_NOTHING, 'info');
      }
      break;
    }
    case 'DEEP_CLEAN_VENTS': {
      const roll = Math.random();
      if (roll < 0.1) {
        addLog(ACTION_LOGS.DEEP_CLEAN_VENTS_DEVICE, 'story');
        nextRes.suspicion = Math.min(100, nextRes.suspicion + 10);
        nextRes.experience += 300;
      } else if (roll < 0.3) {
        addLog(ACTION_LOGS.DEEP_CLEAN_VENTS_STATIC, 'vibration');
        nextRes.sanity -= 5;
      } else {
        addLog(ACTION_LOGS.DEEP_CLEAN_VENTS_NORMAL, 'info');
        nextRes.experience += 50;
      }
      break;
    }
    case 'SCAVENGE_CORROSION_CORNER': {
      nextRes.suspicion = Math.min(100, nextRes.suspicion + 10);
      const template = itemsData.rotables[Math.floor(Math.random() * itemsData.rotables.length)];
      const newPart: RotableItem = {
        id: Math.random().toString(36),
        label: template.label,
        pn: 'UNKNOWN',
        sn: 'UNTRACEABLE',
        condition: Math.random() * 50,
        isInstalled: false,
        isUntraceable: true,
        isRedTagged: Math.random() < 0.3,
      };
      nextRotables.push(newPart);
      addLog(ACTION_LOGS.SCAVENGE_SUCCESS, 'story');
      break;
    }

    case 'OBSERVE_CORROSION_CORNER': {
      const obsRoll = Math.random();
      if (obsRoll < 0.2) {
        addLog(ACTION_LOGS.OBSERVE_GHOST, 'vibration');
        nextRes.sanity -= 25;
        nextFlg.isAfraid = true;
        nextHF.fearTimer = 40000;
      } else if (obsRoll < 0.5) {
        addLog(ACTION_LOGS.OBSERVE_SUITS, 'story');
        nextRes.suspicion = Math.min(100, nextRes.suspicion + 5);
      } else {
        addLog(ACTION_LOGS.OBSERVE_WEATHER, 'info');
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
            nextRes.crystallineResonators += 5;
          if (template.retrofitJob.requirements.bioFilament) nextRes.bioFilament += 10;

          addLog(ACTION_LOGS.ANOMALY_ANALYSIS_SUCCESS, 'story');

          const duration = 300000 + Math.random() * 300000;
          const newRetrofitJob: JobCard = {
            ...template.retrofitJob,
            id: `retrofit_${Date.now()}`,
            timeLeft: duration,
            totalTime: duration,
          };

          nextAnomalies.shift(); // remove analyzed anomaly
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

    case 'OBSERVE_SEDAN': {
      nextRes.suspicion = Math.min(100, nextRes.suspicion + 5);
      nextRes.experience += 150;
      const sedanRoll = Math.random();
      if (sedanRoll < 0.1) {
        addLog(
          'The license plate on the sedan shifts, the characters rearranging into impossible geometry before snapping back. You feel sick.',
          'vibration'
        );
        nextRes.sanity -= 15;
        nextFlg.isAfraid = true;
        nextHF.fearTimer = 20000;
      } else if (sedanRoll < 0.3) {
        addLog(
          'A rear door on the sedan opens a few inches, then clicks shut. No one gets in or out. The air smells like ozone.',
          'story'
        );
        nextRes.sanity -= 8;
      } else {
        addLog(
          "The sedan is empty. You can't see the driver's seat through the windshield, just... darkness.",
          'info'
        );
        nextRes.sanity -= 2;
      }
      break;
    }
    case 'UNLOCK_SKILL':
      if (nextProf.skillPoints > 0) {
        const skill = [...skillsData.mechanic, ...skillsData.watcher].find(
          (s) => s.id === payload.id
        );
        if (skill && !nextProf.unlocked.includes(skill.id)) {
          // Check prereqs
          const hasPrereqs = !skill.prereq || nextProf.unlocked.includes(skill.prereq);
          if (hasPrereqs) {
            nextProf.skillPoints -= 1;
            nextProf.unlocked.push(skill.id);
            addLog(`PROFICIENCY UNLOCKED: ${skill.name}`, 'levelup');
          }
        }
      }
      break;

    // --- Canteen ---
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

    case 'NAP_TABLE':
      addLog(ACTION_LOGS.NAP_TABLE, 'info');
      nextRes.focus = Math.min(100, nextRes.focus + 40);
      nextRes.sanity = Math.min(100, nextRes.sanity + 25);
      nextRes.suspicion = Math.min(100, nextRes.suspicion + 15);
      if (hasSkill('dreamJournal') && Math.random() < 0.25) {
        addLog(
          'You dream of a flight path that ends in a city of black glass under a dead star.',
          'vibration'
        );
        nextRes.experience += 500;
      }
      break;

    case 'READ_MAGAZINE': {
      const magText =
        MAGAZINE_FLAVOR_TEXTS[Math.floor(Math.random() * MAGAZINE_FLAVOR_TEXTS.length)];
      addLog(magText, 'info');
      nextRes.focus = Math.min(100, nextRes.focus + 15);
      nextRes.sanity = Math.max(0, nextRes.sanity - 10);
      break;
    }

    // --- HR Floor ---
    case 'REVIEW_COMPLIANCE':
      addLog(ACTION_LOGS.REVIEW_COMPLIANCE, 'info');
      nextRes.suspicion = Math.max(0, nextRes.suspicion - 2);
      nextRes.sanity = Math.max(0, nextRes.sanity - 5);
      break;

    case 'GIVE_URINE_SAMPLE':
      nextRes.sanity = Math.max(0, nextRes.sanity - 2);
      if (nextFlg.venomSurgeActive) {
        addLog(ACTION_LOGS.URINE_SAMPLE_FAIL, 'error');
        nextRes.suspicion = Math.min(100, nextRes.suspicion + 30);
        nextFlg.isAfraid = true;
        nextHF.fearTimer = 45000;
      } else {
        addLog(ACTION_LOGS.URINE_SAMPLE_PASS, 'info');
        nextRes.suspicion = Math.max(0, nextRes.suspicion - 5);
      }
      break;

    // --- Office & Training ---
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

    case 'CROSS_REFERENCE_MANIFESTS':
      nextRes.suspicion = Math.min(100, nextRes.suspicion + 20);
      nextRes.kardexFragments += 1;
      nextRes.experience += 1000;
      addLog(ACTION_LOGS.MANIFEST_CROSS_REF_SUCCESS, 'vibration');
      break;

    case 'MAINTAIN_LOW_PROFILE': {
      let suspicionReduction = 10;
      if (hasSkill('unseenPresence')) {
        suspicionReduction = 15;
      }
      nextRes.suspicion = Math.max(0, nextRes.suspicion - suspicionReduction);
      addLog(
        'You spend an hour meticulously aligning your records and covering your tracks. The less attention, the better.',
        'info'
      );
      if (hasSkill('unseenPresence')) {
        addLog('[Unseen Presence] Your efforts are particularly effective.', 'levelup');
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

    case 'STUDY_MODULE':
      addLog(
        'Paging through heavy binders. The diagrams of wing spars look like skeletons.',
        'info'
      );
      nextHF.trainingProgress = Math.min(100, nextHF.trainingProgress + 15);
      nextRes.sanity -= 5;
      break;

    case 'DIGITAL_STUDY': {
      addLog(ACTION_LOGS.DIGITAL_AMM, 'info');
      let studyGain = 20;
      if (nextInv.pcHddUpgrade) studyGain += 5;
      nextHF.trainingProgress = Math.min(100, nextHF.trainingProgress + studyGain);
      nextRes.sanity -= 2;
      break;
    }

    case 'CREATE_SRF':
      addLog(ACTION_LOGS.SRF_FILED, 'info');
      nextRes.credits += 35;
      nextRes.experience += 120;
      break;

    case 'SEARCH_MANUALS': {
      addLog('Digging through the archive. The paper is brittle and yellowed.', 'info');
      let findRoll = Math.random();
      if (hasSkill('keenEye')) findRoll += 0.1;
      // Logic for finding PC parts
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
        nextRes.experience += 100;
        addLog(ACTION_LOGS.SEARCH_MANUALS_NOTES, 'story');
      } else if (findRoll < 0.55) {
        addLog(ACTION_LOGS.SEARCH_MANUALS_KARDEX, 'vibration');
        nextRes.sanity -= 5;
      } else {
        addLog('Nothing but dust and silverfish.', 'info');
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

    // --- Toolroom ---
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
        nextRes.focus += cost; // refund focus
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
        nextHF.efficiencyBoost = 30000; // 30 seconds
      } else if (result === 'good') {
        addLog(ACTION_LOGS.CALIBRATION_GOOD, 'info');
        nextTools[toolId] = 100;
      } else {
        addLog(ACTION_LOGS.CALIBRATION_FAIL, 'error');
        nextTools[toolId] = Math.max(0, nextTools[toolId] - 25);
        nextFlg.toolroomMasterPissed = true;
        nextHF.toolroomMasterCooldown = 300000; // 5 minutes
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
        nextRes.focus += cost; // Refund focus
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

    // --- Line Maint & Apron ---
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
        // 40% chance of an event
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
        // 5% chance of rare lavatory find
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

    // --- Hangar ---
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
        const req = prev.activeJob.requirements.tools || [];
        for (const t of req) {
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
          if (!hasSkill('highTorqueMethods') || Math.random() > 0.2) {
            nextTools[t] = Math.max(0, nextTools[t] - (5 + Math.random() * 5));
          } else {
            addLog(`[High-Torque Methods] Tool ${t.toUpperCase()} condition preserved.`, 'info');
          }
        }
        addLog(`Work Order ${prev.activeJob.id} Signed Off.`, 'story');
        nextRes.credits += prev.activeJob.rewardXP / 2;
        nextRes.experience += prev.activeJob.rewardXP;

        if (!prev.activeJob.isRetrofit && Math.random() < 0.05) {
          // 5% chance to find anomaly
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

    // --- Misc ---
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
          nextEvent = null; // Clear event after sample given
          return { ...prev, activeEvent: null }; // Return early
        }
        if (prev.activeEvent.type === 'component_failure') {
          addLog(
            'This issue cannot be resolved through standard channels. The component must be repaired in the toolroom.',
            'error'
          );
          nextRes.focus += cost; // Refund focus
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
          nextHF.venomSurgeTimer = 60000; // 1 minute
        }
        if (p.id === 'winston_pack') {
          nextPersonal['winston_pack'] = (nextPersonal['winston_pack'] || 0) + 1;
        }
      } else {
        addLog('INSUFFICIENT CREDITS.', 'error');
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
  };
};
