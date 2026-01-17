import { GameState, ResourceState } from '../types.ts';

/**
 * Resource validation utilities
 * Replaces inline checks scattered throughout gameReducer
 */

/**
 * Check if player has enough focus to perform an action
 */
export const hasEnoughFocus = (focus: number, required: number): boolean => {
  return focus >= required;
};

/**
 * Check if player has enough of a specific resource
 */
export const hasEnoughResource = (
  resources: ResourceState,
  resourceKey: keyof ResourceState,
  required: number
): boolean => {
  return resources[resourceKey] >= required;
};

/**
 * Check if player has enough of multiple resources
 */
export const hasEnoughResources = (
  resources: ResourceState,
  requirements: Partial<Record<keyof ResourceState, number>>
): boolean => {
  return Object.entries(requirements).every(([key, value]) => {
    const resourceKey = key as keyof ResourceState;
    return resources[resourceKey] >= (value || 0);
  });
};

/**
 * Validate if an action can be performed based on focus cost
 * Returns true if valid, false if insufficient focus
 */
export const canAffordAction = (state: GameState, focusCost: number): boolean => {
  return hasEnoughFocus(state.resources.focus, focusCost);
};

/**
 * Check if player meets credit requirements
 */
export const hasEnoughCredits = (credits: number, required: number): boolean => {
  return credits >= required;
};

/**
 * Deduct focus from resources (mutates draft in Immer context)
 */
export const deductFocus = (resources: ResourceState, amount: number): void => {
  resources.focus = Math.max(0, resources.focus - amount);
};

/**
 * Deduct credits from resources (mutates draft in Immer context)
 */
export const deductCredits = (resources: ResourceState, amount: number): void => {
  resources.credits = Math.max(0, resources.credits - amount);
};

/**
 * Clamp resource values to valid ranges (mutates draft in Immer context)
 */
export const clampResource = (
  resources: ResourceState,
  key: keyof ResourceState,
  min: number,
  max: number
): void => {
  const currentValue = resources[key];
  resources[key] = Math.max(min, Math.min(max, currentValue));
};

/**
 * Clamp sanity between 0-100 (mutates draft)
 */
export const clampSanity = (resources: ResourceState): void => {
  clampResource(resources, 'sanity', 0, 100);
};

/**
 * Clamp focus between 0-100 (mutates draft)
 */
export const clampFocus = (resources: ResourceState): void => {
  clampResource(resources, 'focus', 0, 100);
};

/**
 * Clamp suspicion between 0-100 (mutates draft)
 */
export const clampSuspicion = (resources: ResourceState): void => {
  clampResource(resources, 'suspicion', 0, 100);
};
