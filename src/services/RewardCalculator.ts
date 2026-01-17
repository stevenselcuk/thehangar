import { GameState, ResourceState } from '../types.ts';

/**
 * Reward calculation service
 * Extracted from various action handlers in gameReducer
 */

/**
 * Aircraft action base rewards (from AIRCRAFT_ACTION handler, lines 997-1002)
 */
export const AIRCRAFT_BASE_REWARDS = {
  TRANSIT_CHECK: { xp: 120, credits: 25, alclad: 5, hours: 1 },
  DAILY_CHECK: { xp: 250, credits: 60, alclad: 10, hours: 2 },
  ETOPS_CHECK: { xp: 400, credits: 100, alclad: 0, suspicion: 5, hours: 4 },
  READ_FLIGHT_LOG: { xp: 60, credits: 0, alclad: 0, hours: 0 },
  READ_CABIN_LOG: { xp: 50, credits: 0, alclad: 0, hours: 0 },
} as const;

/**
 * Training rewards (from training action handlers)
 */
export const TRAINING_REWARDS = {
  hfInitial: { xp: 500, credits: -200 },
  hfRecurrent: { xp: 300, credits: -150 },
  apWritten: { xp: 1000, credits: -500 },
  apPractical: { xp: 1500, credits: -750 },
  avionics: { xp: 2000, credits: -1000 },
  easaModule: { xp: 800, credits: 0 },
  ndtLevel1: { xp: 600, credits: -400 },
  ndtLevel2: { xp: 800, credits: -600 },
  ndtLevel3: { xp: 1000, credits: -800 },
} as const;

/**
 * NDT finding rewards (from CREATE_NON_ROUTINE_REPORT handler, lines 420-436)
 */
export const NDT_FINDING_REWARDS = {
  minor: { credits: 50, xp: 100 },
  major: { credits: 150, xp: 300 },
  suspicious: { credits: 0, xp: 500, suspicion: 10 },
} as const;

/**
 * Calculate rewards for aircraft actions
 */
export const calculateAircraftRewards = (
  actionType: string,
  _state: GameState
): Partial<ResourceState> => {
  const baseReward = AIRCRAFT_BASE_REWARDS[actionType as keyof typeof AIRCRAFT_BASE_REWARDS];

  if (!baseReward) {
    return {};
  }

  const rewards: Partial<ResourceState> = {
    experience: baseReward.xp,
    credits: baseReward.credits,
    alclad: baseReward.alclad,
  };

  // Add technical logbook hours if applicable
  if (baseReward.hours > 0) {
    rewards.technicalLogbookHours = baseReward.hours;
  }

  // Add suspicion if applicable (ETOPS checks)
  if ('suspicion' in baseReward && baseReward.suspicion) {
    rewards.suspicion = baseReward.suspicion;
  }

  return rewards;
};

/**
 * Apply rewards to resource state (mutates draft in Immer context)
 */
export const applyRewards = (resources: ResourceState, rewards: Partial<ResourceState>): void => {
  Object.entries(rewards).forEach(([key, value]) => {
    const resourceKey = key as keyof ResourceState;
    if (typeof value === 'number') {
      resources[resourceKey] = (resources[resourceKey] as number) + value;
    }
  });
};

/**
 * Calculate XP gain with skill modifiers
 */
export const calculateXpGain = (baseXp: number, _state: GameState, deltaTime?: number): number => {
  let xp = baseXp;

  // Apply quick learner skill bonus (+10%)
  if (_state.proficiency.unlocked.includes('quickLearner')) {
    xp *= 1.1;
  }

  // Apply time-based scaling if provided (for passive XP in tick)
  if (deltaTime) {
    xp = (deltaTime / 12000) * (_state.proficiency.unlocked.includes('quickLearner') ? 1.1 : 1.0);
  }

  return xp;
};

/**
 * Calculate credits gain for job completion
 * Jobs reward XP/2 as credits (from COMPLETE_JOB handler, line 1368)
 */
export const calculateJobCredits = (jobXp: number): number => {
  return jobXp / 2;
};

/**
 * Calculate NDT finding rewards based on severity
 */
export const calculateNdtFindingRewards = (
  severity: 'minor' | 'major' | 'suspicious'
): { credits: number; xp: number; suspicion?: number } => {
  return { ...NDT_FINDING_REWARDS[severity] };
};

/**
 * Calculate focus regeneration rate per second
 * From tick processor, lines 136-140
 */
export const calculateFocusRegen = (state: GameState, deltaSeconds: number): number => {
  let regenRate = state.flags.nightCrewActive ? 0.8 : 3.0;

  // Fear penalty: -50% regen
  if (state.flags.isAfraid) {
    regenRate *= 0.5;
  }

  // Efficiency boost: +20% regen
  if (state.hfStats.efficiencyBoost > 0) {
    regenRate *= 1.2;
  }

  return regenRate * deltaSeconds;
};

/**
 * Calculate passive income from night crew (per second)
 * From tick processor, lines 142-150
 */
export const calculateNightCrewIncome = (
  state: GameState,
  deltaSeconds: number
): { alclad: number; rivets: number; suspicion: number } => {
  let alcladGain = 4.0 * deltaSeconds;
  let rivetGain = 9.0 * deltaSeconds;
  let suspicionGain = 0.18 * deltaSeconds;

  // Apply night shift supervisor bonus
  if (state.proficiency.unlocked.includes('nightShiftSupervisor')) {
    alcladGain *= 1.1;
    rivetGain *= 1.1;
    suspicionGain *= 0.85;
  }

  return {
    alclad: alcladGain,
    rivets: rivetGain,
    suspicion: suspicionGain,
  };
};

/**
 * Calculate passive income from transit check delegation (per second)
 * From tick processor, lines 152-156
 */
export const calculateTransitCheckIncome = (
  deltaSeconds: number
): { credits: number; xp: number; suspicion: number } => {
  return {
    credits: 1.5 * deltaSeconds,
    xp: 5 * deltaSeconds,
    suspicion: 0.05 * deltaSeconds,
  };
};

/**
 * Calculate passive income from auto-SRF (per second)
 * From tick processor, lines 158-164
 */
export const calculateAutoSrfIncome = (deltaSeconds: number): { credits: number; xp: number } => {
  return {
    credits: 0.8 * deltaSeconds,
    xp: 2 * deltaSeconds,
  };
};

/**
 * Calculate base passive income (per tick)
 * From tick processor, lines 166-170
 */
export const calculateBasePassiveIncome = (
  state: GameState,
  deltaMs: number
): { credits: number; xp: number } => {
  const deltaSeconds = deltaMs / 1000;

  return {
    credits: deltaSeconds * 7,
    xp: calculateXpGain(deltaSeconds * 12, state),
  };
};
