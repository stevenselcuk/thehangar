import { ResourceState } from '../types.ts';

/**
 * The single source of truth for the death condition. Sanity, suspicion and
 * health are each separately capable of ending the shift; a technician is
 * dead the moment any one of them crosses its threshold.
 *
 * Consumed by useGameEngine, App, and (in spirit, via the near-death
 * `isDying` variant) useGameSelectors. Keep those three call sites in
 * agreement by routing them all through this predicate.
 */
export const isDead = (resources: ResourceState): boolean =>
  resources.sanity <= 0 || resources.suspicion >= 100 || resources.health <= 0;
