import { SYSTEM_LOGS } from '../data/flavor.ts';
import { jobsData } from '../data/jobs.ts';
import { vendingData } from '../data/vending.ts';
import { GameState, JobCard } from '../types.ts';

export const generateVendingPrices = (): Record<string, number> => {
  const prices: Record<string, number> = {};
  vendingData.forEach((item) => {
    if (item.cost === 0) {
      prices[item.id] = 0;
    } else {
      prices[item.id] = Math.floor(Math.random() * 26) + 5;
    }
  });
  return prices;
};

export const createJob = (): JobCard => {
  const template = jobsData[Math.floor(Math.random() * jobsData.length)];
  const duration = 120000 + Math.random() * 240000;
  return {
    ...template,
    id: Math.random().toString(36).substr(2, 6),
    timeLeft: duration,
    totalTime: duration,
  } as JobCard;
};

export const createInitialState = (): GameState => ({
  time: {
    totalPlayTime: 0,
    sessionTime: 0,
    shiftTime: 0,
    shiftCycle: 1,
    lastTick: Date.now(),
  },
  resources: {
    alclad: 50,
    titanium: 0,
    fiberglass: 0,
    rivets: 50,
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
    credits: 100,
    kardexFragments: 0,
    crystallineResonators: 0,
    bioFilament: 0,
    technicalLogbookHours: 0,
  },
  inventory: {
    flashlight: true,
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
    isToolboxWithPlayer: true,
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
  },
  personalInventory: {},
  rotables: [],
  anomalies: [],
  toolConditions: {
    leatherman: 100,
    torxScrewdriver: 100,
    snapOnWrenchSet: 100,
    hammer: 100,
    atlasCopcoDrill: 100,
    rivetGun: 100,
    torquemeter: 100,
    airDataTestBox: 100,
    hfecDevice: 100,
    rototestDevice: 100,
  },

  notificationQueue: [],
  flags: {
    foundNote: false,
    lightsFlickered: false,
    officeUnlocked: false,
    hangarUnlocked: true,
    tarmacUnlocked: true,
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
  },

  hfStats: {
    fatigue: 0,
    noiseExposure: 0,
    socialStress: 0,
    trainingProgress: 0,
    compliancePressureTimer: 0,
    efficiencyBoost: 0,
    temperature: 20,
    lightingLevel: 1.0,
    fearTimer: 0,
    venomSurgeTimer: 0,
    toolroomMasterCooldown: 0,
    migraineTimer: 0,
    performanceReviewCooldown: 0,
    janitorCooldown: 0,
    scheduleCompressionTimer: 0,
    sanityShieldTimer: 0,
    foundLoopholeTimer: 0,
    clearanceLevel: 1,
    hfRecurrentDueDate: 0,
  },
  proficiency: {
    skillPoints: 0,
    unlocked: [],
    unlockedBonuses: [],
    easaModulesPassed: [],
  },
  stats: {
    jobsCompleted: 0,
    srfsFiled: 0,
    ndtScansPerformed: 0,
    anomaliesAnalyzed: 0,
    rotablesRepaired: 0,
    rotablesScavenged: 0,
    eventsResolved: 0,
  },
  archiveTerminal: {
    output: [
      '============================================================================',
      '      [REDACTED] AEROSPACE - PERSONNEL ARCHIVAL SYSTEM (RAS-TERM v3.1)',
      '============================================================================',
      '',
      '                            /\\',
      '                           //\\\\',
      '                          //--\\\\',
      '                         //----\\\\',
      '                        //------\\\\',
      '                       //--------\\\\',
      '                      //----------\\\\',
      '',
      '      SYSTEM SECURE. UNAUTHORIZED ACCESS WILL BE LOGGED AND PROSECUTED.',
      '',
      "      Type 'help' for a list of available commands.",
      '============================================================================',
      '',
    ],
    lastCommand: '',
    securityAlertTimer: 0,
  },
  maintenanceTerminal: {
    output: [
      '============================================================================',
      '      ZEBRA MC9300 - MAINTENANCE LOG & ARCHIVE (MLA v1.2)',
      '============================================================================',
      '',
      '                      .---------------------.',
      '                      | [ ] [ ] [ ] [ ] [ ] |',
      '                      | .-----------------. |',
      '                      | |                 | |',
      '                      | |  MLA v1.2       | |',
      '                      | |  SYSTEM READY   | |',
      '                      | |                 | |',
      "                      | '-----------------' |",
      '                      | [F1] [F2] [F3] [F4] |',
      '                      | [ 1] [ 2] [ 3] [ S] |',
      '                      | [ 4] [ 5] [ 6] [ E] |',
      '                      | [ 7] [ 8] [ 9] [ N] |',
      '                      | [ .] [ 0] [<-] [ D] |',
      "                      '---------------------'",
      '',
      '      Logged in as: Tech 770-M-9M-MRO',
      '      STATUS: Connected to Hangar Bay 4 Local Network.',
      '',
      "      Type 'help' for a list of available commands.",
      '============================================================================',
      '',
    ],
    lastCommand: '',
  },
  activeJob: createJob(),
  activeEvent: null,
  activeHazards: [],
  activeAircraft: null,
  activeScenario: null,
  vendingPrices: generateVendingPrices(),
  calibrationMinigame: { active: false, toolId: null, toolLabel: null },
  logs: [{ id: '1', text: SYSTEM_LOGS.BOOT, type: 'info', timestamp: Date.now() }],
  mail: [],
  lastUpdate: Date.now(),
  eventTimestamps: {},
  aog: {
    active: false,
    stationId: null,
    scenarioId: null,
    startTime: 0,
    completedActions: [],
    currentProgress: 0,
    progressRequired: 100,
    actionInProgress: null,
  },
});

export const loadState = (saveKey: string): GameState => {
  const saved = localStorage.getItem(saveKey);
  const defaults = createInitialState();
  if (saved) {
    try {
      const parsed = JSON.parse(saved);

      if (typeof parsed !== 'object' || parsed === null || !parsed.resources || !parsed.inventory) {
        console.warn('Saved data is corrupted or in an old format. Loading default state.');
        return defaults;
      }

      const loadedFlags = { ...defaults.flags, ...(parsed.flags || {}) };
      loadedFlags.migraineActive = false;
      loadedFlags.isHallucinating = false;
      loadedFlags.isAfraid = false;
      loadedFlags.onPerformanceImprovementPlan = parsed.flags.onPerformanceImprovementPlan || false;
      loadedFlags.janitorPresent = false;
      loadedFlags.ndtFinding = null;
      loadedFlags.storyFlags = parsed.flags.storyFlags || {};

      return {
        ...defaults,
        ...parsed,
        activeEvent: null,
        activeHazards: [],
        activeScenario: null, // Scenarios don't persist through reloads
        activeAircraft: parsed.activeAircraft || null, // Handle loading active aircraft
        anomalies: [],
        calibrationMinigame: defaults.calibrationMinigame,
        resources: { ...defaults.resources, ...parsed.resources },
        inventory: { ...defaults.inventory, ...parsed.inventory },
        flags: { ...defaults.flags, ...parsed.flags, ...loadedFlags }, // Ensure defaults (new fields) are present
        notificationQueue: [], // Always start with empty queue
        hfStats: {
          ...defaults.hfStats,
          ...parsed.hfStats,
          fearTimer: 0,
          migraineTimer: 0,
          compliancePressureTimer: 0,
          performanceReviewCooldown: 0,
          janitorCooldown: 0,
          sanityShieldTimer: 0,
          foundLoopholeTimer: 0,
          clearanceLevel: parsed.hfStats?.clearanceLevel || 1,
          hfRecurrentDueDate: parsed.hfStats?.hfRecurrentDueDate || 0,
        },
        proficiency: {
          ...defaults.proficiency,
          ...(parsed.proficiency || {}),
          easaModulesPassed: parsed.proficiency?.easaModulesPassed || [],
        },
        stats: { ...defaults.stats, ...(parsed.stats || {}) },
        archiveTerminal: parsed.archiveTerminal || defaults.archiveTerminal,
        maintenanceTerminal: parsed.maintenanceTerminal || defaults.maintenanceTerminal,
        mail: parsed.mail || [],
        rotables: parsed.rotables || [],
        logs: parsed.logs && parsed.logs.length > 0 ? parsed.logs : defaults.logs,
        lastUpdate: Date.now(),
        aog: parsed.aog || defaults.aog,
      };
    } catch (e) {
      console.error('Failed to parse saved state:', e);
      return defaults;
    }
  }
  return defaults;
};
