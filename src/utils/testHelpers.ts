import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import seedrandom from 'seedrandom';
import { vi } from 'vitest';
import type { GameState } from '../types.ts';

/**
 * Seeded random number generator for deterministic tests
 * Usage: const rng = createSeededRandom('test-seed-123');
 *        const value = rng(); // Returns deterministic random between 0-1
 */
export function createSeededRandom(seed: string) {
  return seedrandom(seed);
}

/**
 * Mock Math.random with a seeded random generator
 * Usage in tests:
 *   const restore = mockMathRandom('my-seed');
 *   // ... test code using Math.random()
 *   restore(); // Restore original Math.random
 */
export function mockMathRandom(seed: string): () => void {
  const originalRandom = Math.random;
  const rng = createSeededRandom(seed);
  Math.random = rng;

  return () => {
    Math.random = originalRandom;
  };
}

/**
 * Mock timers and advance time
 */
export function advanceTime(ms: number) {
  vi.advanceTimersByTime(ms);
}

/**
 * Custom render function with common test setup
 */
type CustomRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  // Add any custom options here in the future
  [key: string]: unknown;
};

export function renderWithProviders(ui: ReactElement, options?: CustomRenderOptions) {
  return render(ui, { ...options });
}

/**
 * Helper to create a mock dispatch function
 */
export function createMockDispatch() {
  return vi.fn();
}

/**
 * Wait for async state updates
 */
export async function waitForStateUpdate() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Helper to verify state immutability
 */
export function verifyImmutability<T>(original: T, updated: T): boolean {
  return original !== updated;
}

/**
 * Deep clone helper for creating test state variations
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Create a minimal valid GameState for testing
 * Use this as a base and override specific properties
 */
export function createMinimalGameState(overrides: Partial<GameState> = {}): GameState {
  const base: GameState = {
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
    journal: [],
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
    time: {
      totalPlayTime: 0,
      sessionTime: 0,
      shiftTime: 0,
      shiftCycle: 1,
      lastTick: Date.now(),
    },
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
    procurement: { orders: [], catalogueUnlockLevel: 0 },
    toolroom: { status: 'OPEN', unavailableTools: [], nextStatusChange: 0 },
    pet: {
      name: 'F.O.D.',
      trust: 0,
      hunger: 0,
      location: 'HANGAR',
      cooldowns: { pet: 0, feed: 0, play: 0 },
      flags: { hasMet: false, isSleeping: false, isStaringAtNothing: false, foundGift: null },
    },
    playerName: '[REDACTED]',
    employeeId: '000-0-00',
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
      janitorArcStage: 0,
      toolroomMasterArcStage: 0,
      endingAlienConspiracyProgress: 0,
      endingGovtConspiracyProgress: 0,
      endingTriggered: null,
      foundPhoto: false,
      storyFlags: {},
    },
    notificationQueue: [],
    logs: [],
    mail: [],
    lastUpdate: Date.now(),
    eventTimestamps: {},
    activeJob: null,
    activeEvent: null,
    activeHazards: [],
    activeAircraft: null,
    activeScenario: null,
    vendingPrices: {},
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
  };

  return deepClone({ ...base, ...overrides });
}

// Re-export commonly used testing utilities
export { fireEvent, screen, waitFor, within } from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';
