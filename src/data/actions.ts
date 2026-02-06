import { GameFlags, GameState, Inventory, ResourceState, RotableItem } from '../types';
import { ACTION_LOGS, REGULAR_TALK_LOGS } from './flavor';
import { itemsData } from './items';

export interface ActionEffect {
  chance: number; // 0.0 to 1.0
  log: string;
  logType?: 'info' | 'warning' | 'error' | 'story' | 'vibration' | 'levelup' | 'flavor';
  resourceModifiers?: Partial<ResourceState>;
  flagModifiers?: Partial<GameFlags>;
  eventTrigger?: string; // Event ID to trigger
  addItem?: string; // Inventory key to add
  removeItem?: string; // Inventory key to remove
  customEffect?: (state: GameState) => Partial<GameState> & { logOverride?: string }; // Escape hatch for complex logic
}

export interface ActionDefinition {
  id: string;
  label?: string; // User-facing label if needed
  baseCost: Partial<ResourceState>;
  requiredSkills?: string[];
  requiredItems?: (keyof Inventory)[]; // Array of keys
  requiredFlags?: (keyof GameFlags)[];
  effects: ActionEffect[];
  failureEffect?: ActionEffect; // Fallback if no chance checks pass, or explicit failure
}

export const actionsData: Record<string, ActionDefinition> = {
  INSPECT_VENDING_MACHINE: {
    id: 'INSPECT_VENDING_MACHINE',
    baseCost: { focus: 10 },
    effects: [
      {
        chance: 0.2,
        log: ACTION_LOGS.INSPECT_VENDING_MACHINE_COIN,
        logType: 'story',
        resourceModifiers: { experience: 100 },
      },
      {
        chance: 0.5,
        log: ACTION_LOGS.INSPECT_VENDING_MACHINE_NOTE,
        logType: 'vibration',
        resourceModifiers: { sanity: -5, experience: 150 },
      },
    ],
    failureEffect: {
      chance: 1.0,
      log: ACTION_LOGS.INSPECT_VENDING_MACHINE_NOTHING,
      logType: 'info',
    },
  },
  CHECK_DELAYED_GATE: {
    id: 'CHECK_DELAYED_GATE',
    baseCost: { focus: 0, sanity: 25 },
    effects: [
      {
        chance: 0.2,
        log: ACTION_LOGS.CHECK_DELAYED_GATE_COLD,
        logType: 'vibration',
        flagModifiers: { isAfraid: true },
        customEffect: (state) => ({ hfStats: { ...state.hfStats, fearTimer: 30000 } }),
      },
      {
        chance: 0.5,
        log: ACTION_LOGS.CHECK_DELAYED_GATE_SOUND,
        logType: 'story',
        resourceModifiers: { experience: 200 },
      },
    ],
    failureEffect: {
      chance: 1.0,
      log: ACTION_LOGS.CHECK_DELAYED_GATE_NORMAL,
      logType: 'info',
    },
  },
  RUMMAGE_LOST_FOUND: {
    id: 'RUMMAGE_LOST_FOUND',
    baseCost: { focus: 5 },
    effects: [
      {
        chance: 0.2,
        log: ACTION_LOGS.RUMMAGE_LOST_FOUND_CREDITS,
        logType: 'info',
        customEffect: (state) => ({
          resources: {
            ...state.resources,
            credits: state.resources.credits + Math.floor(Math.random() * 20) + 5,
          },
        }),
      },
      {
        chance: 0.5,
        log: ACTION_LOGS.RUMMAGE_LOST_FOUND_SANITY,
        logType: 'story',
        resourceModifiers: { sanity: 10 },
      },
    ],
    failureEffect: {
      chance: 1.0,
      log: ACTION_LOGS.RUMMAGE_LOST_FOUND_WEIRD,
      logType: 'vibration',
      resourceModifiers: { sanity: -5 },
    },
  },
  LISTEN_FUSELAGE: {
    id: 'LISTEN_FUSELAGE',
    baseCost: { sanity: 20 },
    effects: [
      {
        chance: 0.15,
        log: ACTION_LOGS.LISTEN_FUSELAGE_HEARTBEAT,
        logType: 'vibration',
        flagModifiers: { isAfraid: true },
        customEffect: (state) => ({ hfStats: { ...state.hfStats, fearTimer: 60000 } }),
      },
      {
        chance: 0.45,
        log: ACTION_LOGS.LISTEN_FUSELAGE_WHISPERS,
        logType: 'story',
        resourceModifiers: { experience: 300 },
      },
    ],
    failureEffect: {
      chance: 1.0,
      log: ACTION_LOGS.LISTEN_FUSELAGE_NORMAL,
      logType: 'info',
    },
  },
  TALK_TO_REGULAR: {
    id: 'TALK_TO_REGULAR',
    baseCost: { focus: 10 },
    effects: [
      {
        chance: 0.3,
        log: 'CLUE_PLACEHOLDER', // Handled dynamically in processor usually, but we can make it generic here or keep dynamic logic there.
        // To make it truly data driven we might need an array of random strings here or a callback.
        // For now let's use a custom effect to pick the string to simulate the original behavior
        customEffect: (state) => {
          const clue =
            REGULAR_TALK_LOGS.CLUES[Math.floor(Math.random() * REGULAR_TALK_LOGS.CLUES.length)];
          return {
            logOverride: clue,
            resources: {
              ...state.resources,
              experience: state.resources.experience + 250,
              sanity: state.resources.sanity - 5,
            },
          };
        },
        logType: 'story',
      },
      {
        chance: 0.6,
        customEffect: (state) => {
          const warning =
            REGULAR_TALK_LOGS.WARNINGS[
              Math.floor(Math.random() * REGULAR_TALK_LOGS.WARNINGS.length)
            ];
          return {
            logOverride: warning,
            resources: { ...state.resources, sanity: state.resources.sanity - 10 },
          };
        },
        log: 'WARNING_PLACEHOLDER',
        logType: 'vibration',
      },
    ],
    failureEffect: {
      chance: 1.0,
      customEffect: (state) => {
        const ramble =
          REGULAR_TALK_LOGS.RAMBLES[Math.floor(Math.random() * REGULAR_TALK_LOGS.RAMBLES.length)];
        return {
          logOverride: ramble,
          resources: { ...state.resources, focus: Math.max(0, state.resources.focus - 10) },
        };
      },
      log: 'RAMBLE_PLACEHOLDER',
      logType: 'info',
    },
  },
  CHECK_REDACTED_LOGS: {
    id: 'CHECK_REDACTED_LOGS',
    baseCost: { focus: 30 },
    effects: [
      {
        chance: 0.1,
        log: ACTION_LOGS.CHECK_REDACTED_SUITS,
        logType: 'vibration',
        resourceModifiers: { suspicion: 15 },
        flagModifiers: { isAfraid: true },
        customEffect: (state) => ({ hfStats: { ...state.hfStats, fearTimer: 45000 } }),
      },
      {
        chance: 0.4,
        log: ACTION_LOGS.CHECK_REDACTED_SUCCESS,
        logType: 'story',
        resourceModifiers: { experience: 400, sanity: -5 },
      },
    ],
    failureEffect: {
      chance: 1.0,
      log: ACTION_LOGS.CHECK_REDACTED_FAIL,
      logType: 'warning',
    },
  },
  // REVIEW_SURVEILLANCE_LOGS moved to actionProcessor.ts for complex logic

  DEEP_CLEAN_VENTS: {
    id: 'DEEP_CLEAN_VENTS',
    baseCost: { focus: 15 },
    effects: [
      {
        chance: 0.1,
        log: ACTION_LOGS.DEEP_CLEAN_VENTS_DEVICE,
        logType: 'story',
        resourceModifiers: { suspicion: 10, experience: 300, bioFilament: 1 }, // Added bioFilament drop
      },
      {
        chance: 0.3,
        log: ACTION_LOGS.DEEP_CLEAN_VENTS_STATIC,
        logType: 'vibration',
        resourceModifiers: { sanity: -5, bioFilament: 1 }, // Added bioFilament drop
      },
    ],
    failureEffect: {
      chance: 1.0,
      log: ACTION_LOGS.DEEP_CLEAN_VENTS_NORMAL,
      logType: 'info',
      resourceModifiers: { experience: 50 },
    },
  },
  SCAVENGE_CORROSION_CORNER: {
    id: 'SCAVENGE_CORROSION_CORNER',
    baseCost: { focus: 40 },
    effects: [
      {
        chance: 1.0, // Always succeeds in base logic, so 1.0
        log: ACTION_LOGS.SCAVENGE_SUCCESS,
        logType: 'story',
        resourceModifiers: { suspicion: 10, crystallineResonators: 1 }, // Added crystallineResonators drop
        customEffect: (state) => {
          const template =
            itemsData.rotables[Math.floor(Math.random() * itemsData.rotables.length)];
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
          return { rotables: [...state.rotables, newPart] };
        },
      },
    ],
  },
  OBSERVE_CORROSION_CORNER: {
    id: 'OBSERVE_CORROSION_CORNER',
    baseCost: { focus: 10 },
    effects: [
      {
        chance: 0.2,
        log: ACTION_LOGS.OBSERVE_GHOST,
        logType: 'vibration',
        resourceModifiers: { sanity: -25 },
        flagModifiers: { isAfraid: true },
        customEffect: (state) => ({ hfStats: { ...state.hfStats, fearTimer: 40000 } }),
      },
      {
        chance: 0.5,
        log: ACTION_LOGS.OBSERVE_SUITS,
        logType: 'story',
        resourceModifiers: { suspicion: 5 },
      },
    ],
    failureEffect: {
      chance: 1.0,
      log: ACTION_LOGS.OBSERVE_WEATHER,
      logType: 'info',
    },
  },
  OBSERVE_SEDAN: {
    id: 'OBSERVE_SEDAN',
    baseCost: { focus: 10 },
    effects: [
      {
        chance: 0.1,
        log: 'The license plate on the sedan shifts, the characters rearranging into impossible geometry before snapping back. You feel sick.',
        logType: 'vibration',
        resourceModifiers: { sanity: -15, experience: 150, suspicion: 5 },
        flagModifiers: { isAfraid: true },
        customEffect: (state) => ({ hfStats: { ...state.hfStats, fearTimer: 20000 } }),
      },
      {
        chance: 0.3,
        log: 'A rear door on the sedan opens a few inches, then clicks shut. No one gets in or out. The air smells like ozone.',
        logType: 'story',
        resourceModifiers: { sanity: -8, experience: 150, suspicion: 5 },
      },
    ],
    failureEffect: {
      chance: 1.0,
      log: "The sedan is empty. You can't see the driver's seat through the windshield, just... darkness.",
      logType: 'info',
      resourceModifiers: { sanity: -2, experience: 150, suspicion: 5 },
    },
  },
  EAT_VOID_BURGER: {
    id: 'EAT_VOID_BURGER',
    label: 'Eat "Void" Burger',
    baseCost: { credits: 15 },
    effects: [
      {
        chance: 1.0,
        log: ACTION_LOGS.EAT_VOID_BURGER_TASTE,
        logType: 'story',
        resourceModifiers: { focus: 10, sanity: -5 },
      },
    ],
  },
  LISTEN_TO_WALLS: {
    id: 'LISTEN_TO_WALLS',
    label: 'Listen to Hangar Walls',
    baseCost: { focus: 10 },
    effects: [
      {
        chance: 0.3,
        log: ACTION_LOGS.LISTEN_TO_WALLS_WHISPER,
        logType: 'vibration',
        resourceModifiers: { sanity: -10, experience: 200 },
        flagModifiers: { isAfraid: true },
      },
      {
        chance: 0.7,
        log: ACTION_LOGS.LISTEN_TO_WALLS_NOTHING,
        logType: 'info',
      },
    ],
  },
  SACRIFICE_TOOL: {
    id: 'SACRIFICE_TOOL',
    label: 'Sacrifice Tool to Void',
    baseCost: { focus: 20 },
    requiredItems: ['wrench'], // Assuming wrench exists or some tool
    effects: [
      {
        chance: 0.5,
        log: ACTION_LOGS.SACRIFICE_TOOL_ACCEPTED,
        logType: 'story',
        resourceModifiers: { sanity: 20, experience: 300 },
        removeItem: 'wrench',
      },
      {
        chance: 0.5,
        log: ACTION_LOGS.SACRIFICE_TOOL_REJECTED,
        logType: 'warning',
        resourceModifiers: { sanity: -10 },
      },
    ],
  },
  BRIBE_AUDITOR: {
    id: 'BRIBE_AUDITOR',
    label: 'Bribe Internal Auditor',
    baseCost: { credits: 100 },
    effects: [
      {
        chance: 0.6,
        log: ACTION_LOGS.BRIBE_AUDITOR_SUCCESS,
        logType: 'story',
        resourceModifiers: { suspicion: -20 },
      },
      {
        chance: 0.4,
        log: ACTION_LOGS.BRIBE_AUDITOR_FAIL,
        logType: 'error',
        resourceModifiers: { suspicion: 10, credits: -100 },
      },
    ],
  },
  SUBMIT_FAKE_LOGS: {
    id: 'SUBMIT_FAKE_LOGS',
    label: 'Submit Falsified Logs',
    baseCost: { focus: 30, sanity: 10 },
    effects: [
      {
        chance: 0.5,
        log: ACTION_LOGS.SUBMIT_FAKE_LOGS_SUCCESS,
        logType: 'story',
        resourceModifiers: { suspicion: -15, experience: 150 },
      },
      {
        chance: 0.5,
        log: ACTION_LOGS.SUBMIT_FAKE_LOGS_FAIL,
        logType: 'error',
        resourceModifiers: { suspicion: 20, sanity: -5 },
      },
    ],
  },
  TALK_TO_SUITS: {
    id: 'TALK_TO_SUITS',
    label: 'Talk to "Suits"',
    baseCost: { focus: 20 },
    effects: [
      {
        chance: 0.2,
        log: ACTION_LOGS.TALK_TO_SUITS_LISTEN,
        logType: 'vibration',
        resourceModifiers: { sanity: -15, experience: 300 },
        flagModifiers: { suitsVisiting: true },
      },
      {
        chance: 0.8,
        log: ACTION_LOGS.TALK_TO_SUITS_IGNORE,
        logType: 'info',
        resourceModifiers: { suspicion: 10 },
      },
    ],
  },
  INSPECT_SHADOWS: {
    id: 'INSPECT_SHADOWS',
    label: 'Inspect Shadows',
    baseCost: { focus: 10 },
    effects: [
      {
        chance: 0.3,
        log: ACTION_LOGS.INSPECT_SHADOWS_MOVEMENT,
        logType: 'vibration',
        resourceModifiers: { sanity: -10 },
        flagModifiers: { isAfraid: true },
        customEffect: (state) => ({ hfStats: { ...state.hfStats, fearTimer: 30000 } }),
      },
      {
        chance: 0.7,
        log: ACTION_LOGS.INSPECT_SHADOWS_NOTHING,
        logType: 'info',
      },
    ],
  },
  CHECK_FOR_BUGS: {
    id: 'CHECK_FOR_BUGS',
    label: 'Sweep for Bugs',
    baseCost: { focus: 25 },
    effects: [
      {
        chance: 0.4,
        log: ACTION_LOGS.CHECK_FOR_BUGS_FOUND,
        logType: 'story',
        resourceModifiers: { suspicion: 5, experience: 200 },
      },
      {
        chance: 0.6,
        log: ACTION_LOGS.CHECK_FOR_BUGS_CLEAN,
        logType: 'info',
      },
    ],
  },
  // New Feature: Pet Actions
  FEED_CAT: {
    id: 'FEED_CAT',
    label: 'Feed F.O.D.',
    baseCost: { focus: 5 }, // Tuna handled via requiredItems/effects
    requiredItems: ['canned_tuna'],
    effects: [
      {
        chance: 1.0,
        log: 'You open the tuna. F.O.D. emerges from the shadows, eats ravenously, and purrs like a diesel engine.',
        logType: 'story',
        resourceModifiers: { sanity: 15 },
        removeItem: 'canned_tuna',
        customEffect: (state) => ({
          pet: {
            ...state.pet,
            hunger: Math.max(0, state.pet.hunger - 30),
            trust: Math.min(100, state.pet.trust + 5),
          },
        }),
      },
    ],
  },
  PLAY_WITH_CAT: {
    id: 'PLAY_WITH_CAT',
    label: 'Play with F.O.D.',
    baseCost: { focus: 10 },
    requiredItems: ['laser_pointer'],
    effects: [
      {
        chance: 1.0,
        log: 'The red dot dances. F.O.D. hunts it with lethal precision.',
        logType: 'info',
        resourceModifiers: { sanity: 10 },
        customEffect: (state) => ({
          pet: { ...state.pet, trust: Math.min(100, state.pet.trust + 5) },
        }),
      },
    ],
  },
  PET_CAT: {
    id: 'PET_CAT',
    label: 'Pet F.O.D.',
    baseCost: { focus: 2 },
    effects: [
      {
        chance: 0.8,
        log: 'He leans into your hand and purrs.',
        logType: 'story',
        resourceModifiers: { sanity: 5 },
        customEffect: (state) => ({
          pet: { ...state.pet, trust: Math.min(100, state.pet.trust + 2) },
        }),
      },
      {
        chance: 1.0,
        log: 'He bites you softly. Love bite?',
        logType: 'info',
        customEffect: (state) => ({
          pet: { ...state.pet, trust: Math.min(100, state.pet.trust + 1) },
        }),
      },
    ],
  },
  // New Feature: Black Market
  CHECK_BLACK_MARKET: {
    id: 'CHECK_BLACK_MARKET',
    label: 'Access Black Market Channel',
    baseCost: { focus: 50 },
    requiredItems: ['metallicSphere'],
    effects: [
      {
        chance: 1.0,
        log: 'The sphere resonates with the terminal. A hidden menu appears.',
        logType: 'story',
        customEffect: (state) => ({
          procurement: { ...state.procurement, catalogueUnlockLevel: 2 },
        }),
      },
    ],
  },
  // Endings
  TRIGGER_ALIEN_ENDING: {
    id: 'TRIGGER_ALIEN_ENDING',
    label: 'Ascend',
    baseCost: { focus: 100 },
    requiredItems: ['metallicSphere'],
    effects: [
      {
        chance: 1.0,
        log: 'The sphere opens. It is not empty.',
        logType: 'story',
        flagModifiers: { endingTriggered: 'ALIEN' },
      },
    ],
  },
  TRIGGER_GOVT_ENDING: {
    id: 'TRIGGER_GOVT_ENDING',
    label: 'Accept Offer',
    baseCost: { focus: 0 },
    effects: [
      {
        chance: 1.0,
        log: 'You shake the hand of the man in the suit. His skin is cold.',
        logType: 'story',
        flagModifiers: { endingTriggered: 'GOVT' },
      },
    ],
  },
  // AMM / Digital Horror Actions
  DECRYPT_AMM: {
    id: 'DECRYPT_AMM',
    label: 'Decrypt Encrypted Partition',
    baseCost: { focus: 40 },
    requiredItems: ['pcAssembled'], // Assuming having a PC is required
    effects: [
      {
        chance: 0.1,
        log: 'DECRYPTION FAILED: The drive let out a scream. Your monitor is now bleeding pixels.',
        logType: 'error',
        resourceModifiers: { sanity: -15, experience: 50 },
      },
      {
        chance: 0.3,
        log: "SUCCESS: You unlocked a file titled 'The Truth About Flight 370'. It's just a video of you sleeping.",
        logType: 'vibration',
        resourceModifiers: { sanity: -20, experience: 800 },
      },
      {
        chance: 0.6,
        log: 'You manage to decrypt a small cache of forgotten maintenance protocols.',
        logType: 'story',
        resourceModifiers: { experience: 400, focus: -10 },
      },
    ],
    failureEffect: {
      chance: 1.0,
      log: 'The encryption algorithm is too advanced. It seems to be rewriting itself as you watch.',
      logType: 'info',
      resourceModifiers: { focus: -10 },
    },
  },
  PRINT_FORBIDDEN_PAGE: {
    id: 'PRINT_FORBIDDEN_PAGE',
    label: 'Print "Redacted" Page',
    baseCost: { focus: 15 },
    effects: [
      {
        chance: 0.2,
        log: "The printer jams. When you pull the paper out, it's covered in a substance that looks like oil but smells like blood.",
        logType: 'vibration',
        resourceModifiers: { sanity: -10, suspicion: 5 },
      },
      {
        chance: 0.8,
        log: "You print the page. It's a list of names. Yours is at the bottom, crossed out.",
        logType: 'story',
        resourceModifiers: { suspicion: 15, experience: 200, sanity: -5 },
      },
    ],
    failureEffect: {
      chance: 1.0,
      log: "The printer refuses to print. 'PC LOAD LETTER' flashes on the screen, followed by 'DO NOT PURSUE'.",
      logType: 'info',
    },
  },
  UPLOAD_CLEAN_PROTOCOL: {
    id: 'UPLOAD_CLEAN_PROTOCOL',
    label: 'Upload Clean Protocol',
    baseCost: { focus: 30, sanity: 10 },
    effects: [
      {
        chance: 0.4,
        log: 'Upload Complete. The system seems to stabilize... for now.',
        logType: 'info',
        resourceModifiers: { suspicion: -10, experience: 200 },
      },
      {
        chance: 0.6,
        log: "Upload Rejected. The server responds: 'PURITY IS A LIE'.",
        logType: 'warning',
        resourceModifiers: { sanity: -10, suspicion: 5 },
      },
    ],
    failureEffect: {
      chance: 1.0,
      log: 'Connection timed out. The network cable feels warm.',
      logType: 'info',
    },
  },
  CROSS_REFERENCE_KARDEX: {
    id: 'CROSS_REFERENCE_KARDEX',
    label: 'Cross-Ref with KARDEX',
    baseCost: { focus: 25 },
    effects: [
      {
        chance: 0.2,
        log: 'MATCH FOUND: The digital record links to a physical card stained with... something dry and brown.',
        logType: 'story',
        resourceModifiers: { experience: 350, sanity: -5 },
      },
      {
        chance: 0.8,
        log: 'No match found. The digital record exists, but the physical card has been burned.',
        logType: 'info',
        resourceModifiers: { experience: 100 },
      },
    ],
    failureEffect: {
      chance: 1.0,
      log: 'The KARDEX drawer is stuck. You hear rustling inside.',
      logType: 'info',
    },
  },
  CONSULT_LEGACY_ARCHIVES: {
    id: 'CONSULT_LEGACY_ARCHIVES',
    label: 'Consult Legacy Archives',
    baseCost: { focus: 50 },
    effects: [
      {
        chance: 0.15,
        log: "You access the 1970s database. The screen turns green. You see a chat log between two technicians discussing 'the thing in the fuel tank'.",
        logType: 'vibration',
        resourceModifiers: { sanity: -15, experience: 600 },
      },
      {
        chance: 0.5,
        log: "You find an old technical bulletin regarding 'spontaneous rivet failure'. Useful.",
        logType: 'story',
        resourceModifiers: { experience: 400 },
      },
    ],
    failureEffect: {
      chance: 1.0,
      log: "The legacy system crashes. A DOS prompt appears: 'YOU ARE NOT AUTHORIZED TO LOOK BACK'.",
      logType: 'warning',
      resourceModifiers: { suspicion: 5 },
    },
  },
  TRIGGER_CRAZY_ENDING: {
    id: 'TRIGGER_CRAZY_ENDING',
    label: 'Give In',
    baseCost: { focus: 0 },
    effects: [
      {
        chance: 1.0,
        log: 'You stop fighting the noise. It welcomes you.',
        logType: 'story',
        flagModifiers: { endingTriggered: 'CRAZY' },
      },
    ],
  },
  // Access Violation Actions
  CLEAR_CACHE: {
    id: 'CLEAR_CACHE',
    label: 'Purge Terminal Cache',
    baseCost: { focus: 40 },
    effects: [
      {
        chance: 1.0,
        log: 'You wipe the event logs. The "Access Denied" counters reset to zero.',
        logType: 'info',
        customEffect: (state) => ({
          stats: {
            ...state.stats,
            accessViolations: 0,
          },
        }),
      },
    ],
  },
  APPEAL_VIOLATION: {
    id: 'APPEAL_VIOLATION',
    label: 'Appeal Security Violation',
    baseCost: { focus: 20, sanity: 10 },
    effects: [
      {
        chance: 0.3,
        log: 'Appeal Review: APPROVED. The flag on your file has been removed as a "glitch".',
        logType: 'info',
        resourceModifiers: { suspicion: -10 },
      },
      {
        chance: 0.7,
        log: 'Appeal Review: DENIED. "Frivolous appeals will be noted."',
        logType: 'warning',
        resourceModifiers: { suspicion: 5 },
      },
    ],
  },
  BRIBE_SYSADMIN: {
    id: 'BRIBE_SYSADMIN',
    label: 'Bribe SysAdmin',
    baseCost: { credits: 200 },
    effects: [
      {
        chance: 0.8,
        log: 'Money changes hands. Your violation count disappears.',
        logType: 'story',
        resourceModifiers: { suspicion: -5 },
        customEffect: (state) => ({
          stats: { ...state.stats, accessViolations: 0 },
        }),
      },
      {
        chance: 0.2,
        log: 'He takes the money but reports you anyway.',
        logType: 'error',
        resourceModifiers: { credits: -200, suspicion: 20 },
      },
    ],
  },
  FORCE_OVERRIDE: {
    id: 'FORCE_OVERRIDE',
    label: 'Force System Override',
    baseCost: { focus: 50, sanity: 20 },
    effects: [
      {
        chance: 0.1,
        log: 'OVERRIDE SUCCESSFUL. You bypassed the lock momentarily... but at what cost?',
        logType: 'story',
        resourceModifiers: { experience: 1000, suspicion: 50 },
        flagModifiers: { underSurveillance: true },
      },
      {
        chance: 0.9,
        log: 'OVERRIDE FAILED. The system screams at you.',
        logType: 'error',
        resourceModifiers: { sanity: -10, suspicion: 10 },
      },
    ],
  },
  ACCEPT_REEDUCATION: {
    id: 'ACCEPT_REEDUCATION',
    label: 'Request Re-Education',
    baseCost: {},
    effects: [
      {
        chance: 1.0,
        log: 'You sit in the chair. The screen flashes lights. You feel better. You feel compliant.',
        logType: 'story',
        resourceModifiers: { sanity: 100, suspicion: -50, experience: -500 },
        customEffect: (state) => ({
          stats: { ...state.stats, accessViolations: 0 },
        }),
      },
    ],
  },
};
