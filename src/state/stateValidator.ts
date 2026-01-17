import { GameState } from '../types';

/**
 * Validates if an object is a valid GameState
 */
export const isValidGameState = (state: unknown): state is GameState => {
  if (!state || typeof state !== 'object') return false;

  const s = state as Partial<GameState>;

  // Check required top-level properties
  if (!s.resources || !s.inventory || !s.flags) return false;

  // Validate resources
  if (typeof s.resources.focus !== 'number') return false;
  if (typeof s.resources.sanity !== 'number') return false;
  if (typeof s.resources.suspicion !== 'number') return false;
  if (typeof s.resources.credits !== 'number') return false;
  if (typeof s.resources.level !== 'number') return false;

  // Validate arrays
  if (!Array.isArray(s.logs)) return false;
  if (!Array.isArray(s.rotables)) return false;

  return true;
};

/**
 * Sanitizes and validates game state, clamping values to valid ranges
 */
export const sanitizeGameState = (state: unknown): GameState | null => {
  if (!isValidGameState(state)) return null;

  // Clamp values to valid ranges
  state.resources.focus = Math.max(0, Math.min(100, state.resources.focus));
  state.resources.sanity = Math.max(0, Math.min(100, state.resources.sanity));
  state.resources.suspicion = Math.max(0, Math.min(100, state.resources.suspicion));
  state.resources.level = Math.max(1, state.resources.level);
  state.resources.experience = Math.max(0, state.resources.experience);
  state.resources.credits = Math.max(0, state.resources.credits);

  // Clamp material resources
  state.resources.alclad = Math.max(0, state.resources.alclad);
  state.resources.rivets = Math.max(0, state.resources.rivets);
  state.resources.titanium = Math.max(0, state.resources.titanium);

  return state;
};
