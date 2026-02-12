/**
 * Centralized test fixtures for common game states
 *
 * Best practice: Use these for common scenarios shared across multiple tests.
 * For test-specific variations, import these and modify using spread operators.
 *
 * Example:
 *   import { initialGameState } from '../__tests__/fixtures/gameStates';
 *   const myState = { ...initialGameState, resources: { ...initialGameState.resources, credits: 1000 } };
 */

import type { AircraftScenario, GameEvent, GameState, JobCard } from '@/types';
import { AircraftType, SuitType } from '@/types';

/**
 * Fresh game state - player just started
 */
export const initialGameState: GameState = {
  resources: {
    alclad: 0,
    titanium: 0,
    fiberglass: 0,
    rivets: 0,
    hiloks: 0,
    collars: 0,
    grommets: 0,
    steelWire: 0,
    skydrol: 0,
    mek: 0,
    grease: 0,
    sealant: 0,
    sanity: 100,
    suspicion: 0,
    focus: 100,
    experience: 0,
    level: 1,
    credits: 0,
    kardexFragments: 0,
    crystallineResonators: 0,
    bioFilament: 0,
    technicalLogbookHours: 0,
    syndicateReputation: 0,
    unionReputation: 0,
    canned_tuna: 0,
    hardwareBolts: 0,
    threadlocker: 0,
    cableTools: 0,
    fdrData: 0,
    fqpu: 0,
    pressureTransducer: 0,
    aimsData: 0,
    ram: 0,
    smokeDetector: 0,
    doorSeal: 0,
    balanceWeights: 0,
    autopilotComputer: 0,
    rudderFeelComputer: 0,
    emergencyBatteryPack: 0,
    adfReceiver: 0,
  },
  inventory: {
    flashlight: false,
    pencil: true,
    ruler: false,
    inspectionMirror: false,
    notebook: true,
    leatherman: false,
    radio: false,
    technicianToolbox: false,
    torxScrewdriver: false,
    snapOnWrenchSet: false,
    hammer: false,
    atlasCopcoDrill: false,
    rivetGun: false,
    allenKeys: false,
    torquemeter: false,
    malabar: false,
    greaseGun: false,
    airDataTestBox: false,
    hfecDevice: false,
    rototestDevice: false,
    orbitalSander: false,
    irLamp: false,
    sonicCleaner: false,
    hasAPLicense: false,
    apWrittenPassed: false,
    apPracticalPassed: false,
    hasAvionicsCert: false,
    isToolboxWithPlayer: false,
    pcAssembled: false,
    pcGpuUpgrade: false,
    pcHddUpgrade: false,
    foundRetiredIDCard: false,
    ford150: false,
    tireKit: false,
    mixedTouchUpPaint: 0,
    mainboard: false,
    graphicCard: false,
    cdRom: false,
    floppyDrive: false,
    metallicSphere: false,
    earmuffs: false,
    hasTruckLockbox: false,
    hasHfInitial: false,
    hasHfRecurrent: false,
    hasFts: false,
    hasHdi: false,
    hasNdtLevel1: false,
    hasNdtLevel2: false,
    hasNdtLevel3: false,
    ndtCerts: [],
    hasEasaB1_1: false,
    hasEasaB2: false,
    hasEasaC: false,
    typeRating737: 0,
    typeRatingA330: 0,
    wrench: false,
    canned_tuna: false,
  },
  personalInventory: {},
  rotables: [],
  anomalies: [],
  toolConditions: {},
  flags: {
    foundNote: false,
    lightsFlickered: false,
    officeUnlocked: false,
    hangarUnlocked: false,
    tarmacUnlocked: false,
    foundManifest: false,
    revealedTruth: false,
    kardexActive: false,
    suitsVisiting: false,
    underSurveillance: false,
    nightCrewActive: false,
    isHallucinating: false,
    isAfraid: false,
    toolroomMasterPissed: false,
    nightCrewUnlocked: false,
    transitCheckDelegationActive: false,
    activeComponentFailure: null,
    suspicionEvent30Triggered: false,
    suspicionEvent60Triggered: false,
    suspicionEvent90Triggered: false,
    autoSrfActive: false,
    venomSurgeActive: false,
    fuelContaminationRisk: false,
    migraineActive: false,
    onPerformanceImprovementPlan: false,
    janitorPresent: false,
    ndtFinding: null,
    sls3Unlocked: false,
    storyFlags: {},
    janitorArcStage: 0,
    toolroomMasterArcStage: 0,
    endingAlienConspiracyProgress: 0,
    endingGovtConspiracyProgress: 0,
    endingTriggered: null,
    foundPhoto: false,
  },
  logs: [],
  mail: [],
  journal: [],
  notificationQueue: [],
  procurement: { orders: [], catalogueUnlockLevel: 0 },
  toolroom: { status: 'OPEN', unavailableTools: [], nextStatusChange: 0 },
  bulletinBoard: {
    activeIndices: {
      teamRosters: [],
      companyNews: [],
      deployments: [],
      suitsIntel: [],
      conspiracyTheories: [],
    },
    mechanicOfTheMonthIndex: 0,
    lastUpdate: 0,
  },
  pet: {
    name: 'F.O.D.',
    trust: 0,
    hunger: 0,
    location: 'HANGAR',
    cooldowns: { pet: 0, feed: 0, play: 0 },
    flags: { hasMet: false, isSleeping: false, isStaringAtNothing: false, foundGift: null },
  },
  lastUpdate: Date.now(),
  eventTimestamps: {},
  activeJob: null,
  activeEvent: null,
  activeHazards: [],
  activeAircraft: null,
  activeScenario: null,
  vendingPrices: {
    coffee: 2,
    energyDrink: 3,
    sandwich: 5,
    pizza: 8,
  },
  proficiency: {
    skillPoints: 0,
    unlocked: [],
    unlockedBonuses: [],
    easaModulesPassed: [],
  },
  archiveTerminal: {
    output: [],
    lastCommand: '',
    securityAlertTimer: 0,
  },
  maintenanceTerminal: {
    output: [],
    lastCommand: '',
  },
  stats: {
    jobsCompleted: 0,
    srfsFiled: 0,
    ndtScansPerformed: 0,
    anomaliesAnalyzed: 0,
    rotablesRepaired: 0,
    rotablesScavenged: 0,
    eventsResolved: 0,
    accessViolations: 0,
  },
  calibrationMinigame: {
    active: false,
    toolId: null,
    toolLabel: null,
  },
  hfStats: {
    fatigue: 0,
    noiseExposure: 0,
    socialStress: 0,
    trainingProgress: 0,
    compliancePressureTimer: 0,
    efficiencyBoost: 0,
    temperature: 20,
    lightingLevel: 100,
    fearTimer: 0,
    venomSurgeTimer: 0,
    toolroomMasterCooldown: 0,
    migraineTimer: 0,
    performanceReviewCooldown: 0,
    janitorCooldown: 0,
    scheduleCompressionTimer: 0,
    sanityShieldTimer: 0,
    foundLoopholeTimer: 0,
    clearanceLevel: 0,
    hfRecurrentDueDate: 0,
  },
  time: {
    totalPlayTime: 0,
    sessionTime: 0,
    shiftTime: 0,
    shiftCycle: 1,
    lastTick: Date.now(),
  },
  aog: {
    active: false,
    stationId: null,
    scenarioId: null,
    startTime: 0,
    completedActions: [],
    currentProgress: 0,
    progressRequired: 0,
    actionInProgress: null,
  },
  playerName: '[REDACTED]',
  employeeId: '000-0-00',
};

/**
 * Mid-game state - player has some resources and basic tools
 */
export const midGameState: GameState = {
  ...initialGameState,
  resources: {
    ...initialGameState.resources,
    alclad: 50,
    rivets: 100,
    titanium: 20,
    sanity: 75,
    focus: 80,
    experience: 500,
    level: 3,
    credits: 250,
    technicalLogbookHours: 120,
  },
  inventory: {
    ...initialGameState.inventory,
    flashlight: true,
    leatherman: true,
    torxScrewdriver: true,
    snapOnWrenchSet: true,
    hammer: true,
    isToolboxWithPlayer: true,
  },
  flags: {
    ...initialGameState.flags,
    officeUnlocked: true,
    hangarUnlocked: true,
  },
  stats: {
    jobsCompleted: 5,
    srfsFiled: 2,
    ndtScansPerformed: 0,
    anomaliesAnalyzed: 0,
    rotablesRepaired: 1,
    rotablesScavenged: 0,
    eventsResolved: 3,
    accessViolations: 0,
  },
};

/**
 * Advanced game state - player has AP license, many tools, high stats
 */
export const advancedGameState: GameState = {
  ...initialGameState,
  resources: {
    ...initialGameState.resources,
    alclad: 200,
    rivets: 500,
    titanium: 100,
    hiloks: 200,
    skydrol: 50,
    sanity: 60,
    suspicion: 40,
    focus: 70,
    experience: 5000,
    level: 10,
    credits: 2500,
    kardexFragments: 3,
    technicalLogbookHours: 1500,
  },
  inventory: {
    ...initialGameState.inventory,
    flashlight: true,
    leatherman: true,
    torxScrewdriver: true,
    snapOnWrenchSet: true,
    hammer: true,
    atlasCopcoDrill: true,
    rivetGun: true,
    allenKeys: true,
    torquemeter: true,
    hasAPLicense: true,
    apWrittenPassed: true,
    apPracticalPassed: true,
    isToolboxWithPlayer: true,
    ford150: true,
    hasHfInitial: true,
    hasHfRecurrent: true,
  },
  flags: {
    ...initialGameState.flags,
    officeUnlocked: true,
    hangarUnlocked: true,
    tarmacUnlocked: true,
    nightCrewUnlocked: true,
    kardexActive: true,
    underSurveillance: true,
  },
  proficiency: {
    skillPoints: 5,
    unlocked: ['basic_structures', 'rivet_proficiency', 'sheet_metal'],
    unlockedBonuses: [],
    easaModulesPassed: [1, 2, 3],
  },
  stats: {
    jobsCompleted: 50,
    srfsFiled: 15,
    ndtScansPerformed: 10,
    anomaliesAnalyzed: 3,
    rotablesRepaired: 20,
    rotablesScavenged: 5,
    eventsResolved: 25,
    accessViolations: 5,
  },
};

/**
 * Crisis state - low sanity, high suspicion, active threats
 */
export const crisisGameState: GameState = {
  ...midGameState,
  resources: {
    ...midGameState.resources,
    sanity: 20,
    suspicion: 85,
    focus: 30,
  },
  flags: {
    ...midGameState.flags,
    isHallucinating: true,
    isAfraid: true,
    suitsVisiting: true,
    underSurveillance: true,
  },
  hfStats: {
    ...initialGameState.hfStats,
    fatigue: 80,
    socialStress: 70,
    fearTimer: 300,
  },
};

/**
 * Test job card - simple structure repair
 */
export const testJobCard: JobCard = {
  id: 'test-job-001',
  title: 'Rivet Panel Repair',
  description: 'Replace damaged rivets on fuselage panel Station 123',
  requirements: {
    alclad: 10,
    rivets: 20,
    tools: ['rivetGun', 'leatherman'],
  },
  rewardXP: 50,
  timeLeft: 300,
  totalTime: 300,
};

/**
 * Test event - FAA audit
 */
export const testAuditEvent: GameEvent = {
  id: 'test-audit-001',
  title: 'FAA Spot Inspection',
  description: 'An FAA inspector has arrived for a random spot check.',
  type: 'audit',
  suitType: SuitType.FAA,
  timeLeft: 180,
  totalTime: 180,
  choices: [
    {
      id: 'cooperate',
      label: 'Cooperate fully',
      effects: { suspicion: -10, focus: -20 },
      log: 'You cooperated with the FAA inspector. They found no issues.',
    },
    {
      id: 'stall',
      label: 'Stall for time',
      cost: { resource: 'focus', amount: 30 },
      effects: { suspicion: 5 },
      log: 'You managed to stall the inspector while cleaning up.',
    },
  ],
  failureOutcome: {
    log: 'The inspector left dissatisfied. Suspicion increased.',
    effects: { suspicion: 25 },
  },
};

/**
 * Test aircraft scenario
 */
export const testAircraftScenario: AircraftScenario = {
  id: 'test-scenario-001',
  description: 'You notice hydraulic fluid leaking from the landing gear bay.',
  choices: [
    {
      text: 'Report it immediately',
      outcome: {
        log: 'You filed an SRF. The issue will be addressed by the next shift.',
        effects: { experience: 10 },
      },
    },
    {
      text: 'Try to fix it quickly',
      outcome: {
        log: 'You attempted a quick fix. It may or may not hold.',
        effects: { focus: -20, experience: 5 },
      },
    },
  ],
};

/**
 * State with active job
 */
export const stateWithActiveJob: GameState = {
  ...midGameState,
  activeJob: testJobCard,
};

/**
 * State with active event
 */
export const stateWithActiveEvent: GameState = {
  ...midGameState,
  activeEvent: testAuditEvent,
};

/**
 * State with active aircraft scenario
 */
export const stateWithActiveScenario: GameState = {
  ...midGameState,
  activeAircraft: {
    id: AircraftType.B737_400,
    task: 'TRANSIT_CHECK',
  },
  activeScenario: testAircraftScenario,
};

/**
 * Death state - sanity or focus at 0
 */
export const deathState: GameState = {
  ...crisisGameState,
  resources: {
    ...crisisGameState.resources,
    sanity: 0,
  },
};

/**
 * Hallucination state - isHallucinating flag active, low sanity
 */
export const hallucinationState: GameState = {
  ...midGameState,
  resources: {
    ...midGameState.resources,
    sanity: 15,
  },
  flags: {
    ...midGameState.flags,
    isHallucinating: true,
  },
};

/**
 * Performance Improvement Plan (PIP) active state
 */
export const pipActiveState: GameState = {
  ...midGameState,
  resources: {
    ...midGameState.resources,
    suspicion: 65,
  },
  flags: {
    ...midGameState.flags,
    onPerformanceImprovementPlan: true,
    underSurveillance: true,
  },
};

/**
 * Multiple rotables inventory state
 */
export const multipleRotablesState: GameState = {
  ...advancedGameState,
  rotables: [
    {
      id: 'rotable-001',
      label: 'Hydraulic Pump A320-series',
      pn: 'HYD-A320-001',
      sn: 'SN12345',
      condition: 85,
      isInstalled: false,
      isUntraceable: false,
    },
    {
      id: 'rotable-002',
      label: 'Avionics Module (737-400)',
      pn: 'AVI-737-042',
      sn: 'SN67890',
      condition: 60,
      isInstalled: false,
      isUntraceable: false,
    },
    {
      id: 'rotable-003',
      label: 'Corroded Wing Rib (Untraceable)',
      pn: 'UNKNOWN',
      sn: 'UNKNOWN',
      condition: 25,
      isInstalled: false,
      isUntraceable: true,
    },
    {
      id: 'rotable-004',
      label: 'Landing Gear Actuator',
      pn: 'LG-ACT-777',
      sn: 'SN11223',
      condition: 95,
      isInstalled: false,
      isUntraceable: false,
    },
  ],
};

/**
 * SLS-3 unlocked state - deep lore access
 */
export const sls3UnlockedState: GameState = {
  ...advancedGameState,
  resources: {
    ...advancedGameState.resources,
    kardexFragments: 10,
    crystallineResonators: 5,
    bioFilament: 3,
  },
  flags: {
    ...advancedGameState.flags,
    sls3Unlocked: true,
    revealedTruth: true,
    foundManifest: true,
  },
  inventory: {
    ...advancedGameState.inventory,
    metallicSphere: true,
  },
};

/**
 * High suspicion state - near game over threshold
 */
export const highSuspicionState: GameState = {
  ...midGameState,
  resources: {
    ...midGameState.resources,
    suspicion: 95,
  },
  flags: {
    ...midGameState.flags,
    underSurveillance: true,
    suitsVisiting: true,
    onPerformanceImprovementPlan: true,
    suspicionEvent30Triggered: true,
    suspicionEvent60Triggered: true,
    suspicionEvent90Triggered: true,
  },
};

/**
 * Fear state - isAfraid flag active with fearTimer
 */
export const fearState: GameState = {
  ...midGameState,
  resources: {
    ...midGameState.resources,
    sanity: 35,
  },
  flags: {
    ...midGameState.flags,
    isAfraid: true,
  },
  hfStats: {
    ...midGameState.hfStats,
    fearTimer: 450,
  },
};

/**
 * Efficiency boost state - temporary cost reduction active
 */
export const efficiencyBoostState: GameState = {
  ...midGameState,
  hfStats: {
    ...midGameState.hfStats,
    efficiencyBoost: 300,
  },
};

/**
 * Night crew active state - delegation system unlocked and active
 */
export const nightCrewActiveState: GameState = {
  ...advancedGameState,
  flags: {
    ...advancedGameState.flags,
    nightCrewUnlocked: true,
    nightCrewActive: true,
    transitCheckDelegationActive: true,
  },
  resources: {
    ...advancedGameState.resources,
    credits: 5000,
  },
};

/**
 * PC assembled state - digital features unlocked
 */
export const pcAssembledState: GameState = {
  ...midGameState,
  inventory: {
    ...midGameState.inventory,
    pcAssembled: true,
    mainboard: true,
    graphicCard: true,
    cdRom: true,
    floppyDrive: true,
  },
  flags: {
    ...midGameState.flags,
    officeUnlocked: true,
  },
  mail: [
    {
      id: 'mail-001',
      from: 'IT Department',
      subject: 'Welcome to the Digital Age',
      body: 'Your PC is now operational. Check your inbox regularly.',
      read: false,
    },
  ],
};

/**
 * Venom Surge active state - energy drink buff with detection risk
 */
export const venomSurgeActiveState: GameState = {
  ...midGameState,
  flags: {
    ...midGameState.flags,
    venomSurgeActive: true,
  },
  hfStats: {
    ...midGameState.hfStats,
    venomSurgeTimer: 600,
  },
};

/**
 * Found loophole state - temporary free actions
 */
export const foundLoopholeState: GameState = {
  ...midGameState,
  hfStats: {
    ...midGameState.hfStats,
    foundLoopholeTimer: 180,
  },
};

/**
 * Toolroom master angry state - higher repair costs
 */
export const masterAngryState: GameState = {
  ...midGameState,
  flags: {
    ...midGameState.flags,
    toolroomMasterPissed: true,
  },
};

/**
 * Full certifications state - all licenses and ratings unlocked
 */
export const fullCertificationsState: GameState = {
  ...advancedGameState,
  inventory: {
    ...advancedGameState.inventory,
    hasAPLicense: true,
    apWrittenPassed: true,
    apPracticalPassed: true,
    hasAvionicsCert: true,
    hasHfInitial: true,
    hasHfRecurrent: true,
    hasFts: true,
    hasHdi: true,
    hasNdtLevel1: true,
    hasNdtLevel2: true,
    hasNdtLevel3: true,
    ndtCerts: ['eddy', 'hfec', 'tap', 'borescope', 'dye'],
    hasEasaB1_1: true,
    hasEasaB2: true,
    hasEasaC: true,
    typeRating737: 100,
    typeRatingA330: 100,
  },
  proficiency: {
    skillPoints: 0,
    unlocked: [
      'basic_structures',
      'rivet_proficiency',
      'sheet_metal',
      'composite_repair',
      'hydraulics_specialist',
      'avionics_troubleshooting',
      'electrical_systems',
      'powerplant_knowledge',
    ],
    unlockedBonuses: ['rivetDiscipline', 'steadyNerves', 'efficientWorker'],
    easaModulesPassed: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
};

/**
 * Janitor present state - special NPC interaction available
 */
export const janitorPresentState: GameState = {
  ...midGameState,
  flags: {
    ...midGameState.flags,
    janitorPresent: true,
  },
  hfStats: {
    ...midGameState.hfStats,
    janitorCooldown: 900,
  },
};

/**
 * Active anomalies state - multiple anomalies detected
 */
export const activeAnomaliesState: GameState = {
  ...advancedGameState,
  anomalies: [
    {
      id: 'anomaly-001',
      name: 'Electromagnetic Anomaly',
      description: 'Unusual electromagnetic readings near Station 456',
      templateId: 'em_anomaly',
    },
    {
      id: 'anomaly-002',
      name: 'Corrosion Anomaly',
      description: 'Corrosion pattern defies known metallurgy',
      templateId: 'corrosion_anomaly',
    },
  ],
  resources: {
    ...advancedGameState.resources,
    kardexFragments: 5,
  },
};

/**
 * Schedule compression state - high time pressure
 */
export const scheduleCompressionState: GameState = {
  ...midGameState,
  hfStats: {
    ...midGameState.hfStats,
    scheduleCompressionTimer: 600,
  },
  activeJob: {
    ...testJobCard,
    timeLeft: 60,
  },
};

/**
 * Sanity shield active state - temporary protection from sanity drain
 */
export const sanityShieldState: GameState = {
  ...midGameState,
  hfStats: {
    ...midGameState.hfStats,
    sanityShieldTimer: 300,
  },
};
