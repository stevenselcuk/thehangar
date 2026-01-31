import React from 'react';

export interface ResourceState {
  alclad: number;
  titanium: number;
  fiberglass: number;
  rivets: number;
  hiloks: number;
  collars: number;
  grommets: number;
  steelWire: number;
  skydrol: number;
  mek: number;
  grease: number;
  sealant: number;
  sanity: number;
  suspicion: number;
  focus: number;
  experience: number;
  level: number;
  credits: number;
  kardexFragments: number;
  crystallineResonators: number;
  bioFilament: number;
  technicalLogbookHours: number;
  syndicateReputation: number;
  unionReputation: number;
}

export enum SuitType {
  FAA = 'FAA_INSPECTOR',
  EASA = 'EASA_AUDITOR',
  CORPORATE = 'INTERNAL_SECURITY',
  NONE = 'NONE',
  VOID = 'THE_SUITS',
}

export interface RotableItem {
  id: string;
  label: string;
  pn: string;
  sn: string;
  condition: number;
  isInstalled: boolean;
  isUntraceable: boolean;
  isRedTagged?: boolean;
}

export interface Anomaly {
  id: string;
  name: string;
  description: string;
  templateId: string;
}

export interface EventChoice {
  id: string;
  label: string;
  cost?: { resource: keyof ResourceState | 'sanity' | 'focus'; amount: number };
  effects?: Partial<Record<keyof ResourceState, number>>;
  nextEventId?: string;
  storyFlag?: { key: string; value: boolean };
  log?: string;
}

export interface EventOutcome {
  log: string;
  effects?: Partial<Record<keyof ResourceState, number>>;
  nextEventId?: string;
  storyFlag?: { key: string; value: boolean };
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type:
    | 'accident'
    | 'incident'
    | 'audit'
    | 'bureaucratic_horror'
    | 'eldritch_manifestation'
    | 'canteen_incident'
    | 'component_failure'
    | 'story_event';
  suitType?: SuitType | string;
  timeLeft: number;
  totalTime: number;

  choices?: EventChoice[]; // For multi-choice events
  requiredAction?: string; // For single-action, time-sensitive tasks
  successOutcome?: EventOutcome; // If a requiredAction is completed in time
  failureOutcome: EventOutcome; // What happens on timeout.
}

export interface EnvironmentalHazard {
  id: string;
  name: string;
  description: string;
  type: 'weather' | 'system_failure' | 'containment';
  effects: {
    tarmacActionsDisabled?: boolean;
    focusCostModifier?: number;
    sanityDrain?: number;
    randomEvent?: { type: string; id: string; chance: number };
  };
  duration: number;
}

export interface Inventory {
  flashlight: boolean;
  pencil: boolean;
  ruler: boolean;
  inspectionMirror: boolean;
  notebook: boolean;
  leatherman: boolean;
  radio: boolean;
  technicianToolbox: boolean;
  torxScrewdriver: boolean;
  snapOnWrenchSet: boolean;
  hammer: boolean;
  atlasCopcoDrill: boolean;
  rivetGun: boolean;
  allenKeys: boolean;
  torquemeter: boolean;
  malabar: boolean;
  greaseGun: boolean; // Added missing tool
  airDataTestBox: boolean;
  hfecDevice: boolean;
  rototestDevice: boolean;
  orbitalSander: boolean;
  irLamp: boolean;
  sonicCleaner: boolean;
  hasAPLicense: boolean;
  apWrittenPassed: boolean;
  apPracticalPassed: boolean;
  hasAvionicsCert: boolean;
  isToolboxWithPlayer: boolean;
  pcAssembled: boolean;
  pcGpuUpgrade: boolean;
  pcHddUpgrade: boolean;
  foundRetiredIDCard: boolean;
  ford150: boolean;
  tireKit: boolean;
  mixedTouchUpPaint: number; // 0-100% volume
  mainboard: boolean;
  graphicCard: boolean;
  cdRom: boolean;
  floppyDrive: boolean;
  metallicSphere: boolean;
  earmuffs: boolean;
  hasTruckLockbox: boolean;
  hasHfInitial: boolean;
  hasHfRecurrent: boolean;
  hasFts: boolean;
  hasHdi: boolean;
  hasNdtLevel1: boolean;
  hasNdtLevel2: boolean;
  hasNdtLevel3: boolean;
  ndtCerts: ('eddy' | 'hfec' | 'tap' | 'borescope' | 'dye')[];
  hasEasaB1_1: boolean;
  hasEasaB2: boolean;
  hasEasaC: boolean;
  typeRating737: number;
  typeRatingA330: number;
}

export interface GameFlags {
  foundNote: boolean;
  lightsFlickered: boolean;
  officeUnlocked: boolean;
  hangarUnlocked: boolean;
  tarmacUnlocked: boolean;
  foundManifest: boolean;
  revealedTruth: boolean;
  kardexActive: boolean;
  suitsVisiting: boolean;
  underSurveillance: boolean;
  nightCrewActive: boolean;
  isHallucinating: boolean;
  isAfraid: boolean;
  toolroomMasterPissed: boolean;
  nightCrewUnlocked: boolean;
  transitCheckDelegationActive: boolean;
  activeComponentFailure: string | null;
  suspicionEvent30Triggered: boolean;
  suspicionEvent60Triggered: boolean;
  suspicionEvent90Triggered: boolean;
  autoSrfActive: boolean;
  venomSurgeActive: boolean;
  fuelContaminationRisk: boolean;
  migraineActive: boolean;
  onPerformanceImprovementPlan: boolean;
  janitorPresent: boolean;
  ndtFinding: {
    type: 'HFEC' | 'Borescope' | 'Visual' | 'Ultrasonic';
    description: string;
    severity: 'minor' | 'major' | 'suspicious';
  } | null;
  sls3Unlocked: boolean;
  storyFlags: Record<string, boolean>;
  // Character Arcs
  janitorArcStage: number;
  toolroomMasterArcStage: number;
  // Endings
  endingAlienConspiracyProgress: number;
  endingGovtConspiracyProgress: number;
  endingTriggered: 'ALIEN' | 'GOVT' | 'CRAZY' | 'TRY_AGAIN' | null;
  foundPhoto: boolean;
}

export interface JobCard {
  id: string;
  title: string;
  description: string;
  requirements: {
    alclad?: number;
    rivets?: number;
    titanium?: number;
    tools?: (keyof Inventory)[];
    // FIX: Add missing resource types to job requirements to support retrofit jobs from anomalies.
    crystallineResonators?: number;
    bioFilament?: number;
    skydrol?: number;
  };
  rewardXP: number;
  timeLeft: number;
  totalTime: number;
  isRetrofit?: boolean;
  bonusId?: string;
}

export interface LogMessage {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'error' | 'story' | 'vibration' | 'levelup' | 'flavor';
  timestamp: number;
}

export type NotificationVariant =
  | 'default'
  | 'info'
  | 'warning'
  | 'danger'
  | 'hazard'
  | 'success'
  | 'levelup'
  | 'system';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface Notification {
  id: string;
  title: string;
  message?: React.ReactNode;
  variant?: NotificationVariant;
  duration?: number; // 0 for persistent
  actions?: NotificationAction[];
  isExiting?: boolean;
}

export interface NotificationRequest {
  id: string;
  title: string;
  message: string;
  variant: NotificationVariant;
  duration?: number;
  actions?: { label: string; onClick: () => void }[];
}

export interface MailMessage {
  id: string;
  from: string;
  subject: string;
  body: string;
  read: boolean;
  effects?: {
    suspicion?: number;
    sanity?: number;
    focus?: number;
  };
}

export interface ProficiencyState {
  skillPoints: number;
  unlocked: string[]; // Array of skill IDs
  unlockedBonuses: string[];
  easaModulesPassed: number[];
}

export enum AircraftType {
  MD_80 = 'MD_80',
  B737_400 = 'B737_400',
  B737_700 = 'B737_700',
  A330 = 'A330',
  B777_200ER = 'B777_200ER',
  A300_CARGO = 'A300_CARGO',
}

export interface AircraftData {
  id: AircraftType;
  name: string;
  description: string;
  isSuspicious?: boolean;
  flightLogEntries: string[];
  cabinLogEntries: string[];
  eventPool: { id: string; type: GameEvent['type'] }[];
}

export interface ActiveAircraft {
  id: AircraftType;
  task: 'TRANSIT_CHECK' | 'DAILY_CHECK' | 'ETOPS_CHECK';
}

export interface ArchiveTerminalState {
  output: string[];
  lastCommand: string;
  securityAlertTimer: number;
}

export interface MaintenanceTerminalState {
  output: string[];
  lastCommand: string;
}

export interface AircraftScenarioOutcome {
  log: string;
  effects?: Partial<Record<keyof ResourceState, number>>;
  event?: { type: string; id: string };
}

export interface AircraftScenarioChoice {
  text: string;
  outcome: AircraftScenarioOutcome;
}

export interface AircraftScenario {
  id: string;
  description: string;
  choices: AircraftScenarioChoice[];
}

export interface GameStats {
  jobsCompleted: number;
  srfsFiled: number;
  ndtScansPerformed: number;
  anomaliesAnalyzed: number;
  rotablesRepaired: number;
  rotablesScavenged: number;
  eventsResolved: number;
}

export interface TimeState {
  totalPlayTime: number; // in ms
  sessionTime: number; // in ms
  shiftTime: number; // in ms
  shiftCycle: number; // integer count
  lastTick: number; // timestamp
}

export interface GameState {
  time: TimeState;
  resources: ResourceState;
  inventory: Inventory;
  personalInventory: Record<string, number>;
  rotables: RotableItem[];
  anomalies: Anomaly[];
  toolConditions: Record<string, number>;
  flags: GameFlags;
  logs: LogMessage[];
  mail: MailMessage[];
  lastUpdate: number;
  eventTimestamps: Record<string, number>;
  activeJob: JobCard | null;
  activeEvent: GameEvent | null;
  activeHazards: EnvironmentalHazard[];
  activeAircraft: ActiveAircraft | null;
  activeScenario: AircraftScenario | null;
  vendingPrices: Record<string, number>;
  proficiency: ProficiencyState;
  archiveTerminal: ArchiveTerminalState;
  maintenanceTerminal: MaintenanceTerminalState;
  stats: GameStats;
  calibrationMinigame: {
    active: boolean;
    toolId: string | null;
    toolLabel: string | null;
  };
  hfStats: {
    fatigue: number; // Percentage
    noiseExposure: number;
    socialStress: number;
    trainingProgress: number;
    compliancePressureTimer: number;
    efficiencyBoost: number;
    temperature: number;
    lightingLevel: number;
    fearTimer: number;
    venomSurgeTimer: number;
    toolroomMasterCooldown: number;
    migraineTimer: number;
    performanceReviewCooldown: number;
    janitorCooldown: number;
    scheduleCompressionTimer: number;
    sanityShieldTimer: number;
    foundLoopholeTimer: number;
    clearanceLevel: number;
    hfRecurrentDueDate: number;
  };
  aog: {
    active: boolean;
    stationId: string | null;
    scenarioId: string | null;
    startTime: number;
    completedActions: string[];
    currentProgress: number;
    progressRequired: number;
    actionInProgress: {
      actionId: string;
      startTime: number;
      duration: number;
    } | null;
  };
  notificationQueue: NotificationRequest[];
  procurement: ProcurementState;
  toolroom: {
    status: ToolroomStatusType;
    unavailableTools: string[]; // List of tool IDs currently not available
    nextStatusChange: number;
  };
  bulletinBoard: BulletinBoardState;
}

export interface BulletinBoardState {
  activeIndices: {
    teamRosters: number[];
    companyNews: number[];
    deployments: number[];
    suitsIntel: number[];
    conspiracyTheories: number[];
  };
  mechanicOfTheMonthIndex: number;
  lastUpdate: number;
}

export type ToolroomStatusType = 'OPEN' | 'CLOSED' | 'AUDIT' | 'LUNCH';

export interface ProcurementOrder {
  id: string;
  itemId: string;
  itemLabel: string;
  orderTimestamp: number;
  deliveryEta: number;
  status: 'ORDERED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  cost: number;
}

export interface ProcurementState {
  orders: ProcurementOrder[];
  catalogueUnlockLevel: number; // 0 = Basic, 1 = Advanced, 2 = Black Market
}

export enum TabType {
  STRUCTURE_SHOP = 'STRUCTURE_SHOP',
  OFFICE = 'OFFICE',
  HANGAR = 'HANGAR',
  APRON_LINE = 'APRON',
  TOOLROOM = 'TOOLROOM',
  CANTEEN = 'CANTEEN',
  TERMINAL = 'TERMINAL',
  HR_FLOOR = 'HR_FLOOR',
  BACKSHOPS = 'BACKSHOPS',
  TRAINING = 'TRAINING_DEPT',
  AOG_DEPLOYMENT = 'AOG_DEPLOYMENT',
}

export interface ExportMetadata {
  version: string; // Export format version, e.g., "1.0.0"
  exportedAt: number; // Unix timestamp
  gameVersion?: string; // Game version from package.json
}

export interface ExportData {
  metadata: ExportMetadata;
  state: GameState;
}
