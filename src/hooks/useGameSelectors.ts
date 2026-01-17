import { useMemo } from 'react';
import { getXpForNextLevel } from '../logic/levels.ts';
import { GameState } from '../types.ts';

/**
 * Memoized selectors for derived game state
 * Prevents unnecessary recalculations on every render
 */
export const useResourceSelectors = (state: GameState) => {
  // Focus percentage (already 0-100, but keep for consistency)
  const focusPercentage = useMemo(() => state.resources.focus, [state.resources.focus]);

  // Sanity color coding
  const sanityColor = useMemo(() => {
    if (state.resources.sanity > 70) return 'text-emerald-400';
    if (state.resources.sanity > 30) return 'text-amber-400';
    return 'text-red-500';
  }, [state.resources.sanity]);

  // Suspicion color and state
  const suspicionState = useMemo(
    () => ({
      isHigh: state.resources.suspicion > 70,
      isCritical: state.resources.suspicion > 90,
      color: state.resources.suspicion > 70 ? 'text-red-500' : 'text-red-700',
    }),
    [state.resources.suspicion]
  );

  // XP Progress
  const xpProgress = useMemo(() => {
    const nextLevel = getXpForNextLevel(state.resources.level);
    return {
      current: state.resources.experience,
      needed: nextLevel,
      percentage: (state.resources.experience / nextLevel) * 100,
      canLevelUp: state.resources.experience >= nextLevel,
    };
  }, [state.resources.experience, state.resources.level]);

  // Focus state
  const focusState = useMemo(
    () => ({
      isLow: state.resources.focus < 20,
      isCritical: state.resources.focus < 10,
      percentage: state.resources.focus,
    }),
    [state.resources.focus]
  );

  // Combined vitals check (for critical alerts)
  const vitalsStatus = useMemo(
    () => ({
      isDying: state.resources.sanity <= 10 || state.resources.suspicion >= 95,
      isCompromised:
        state.resources.sanity < 30 || state.resources.suspicion > 70 || state.resources.focus < 20,
      isStable:
        state.resources.sanity > 50 && state.resources.suspicion < 50 && state.resources.focus > 40,
    }),
    [state.resources.sanity, state.resources.suspicion, state.resources.focus]
  );

  // Material availability for common actions
  const materialAvailability = useMemo(
    () => ({
      canTightenBolt: state.inventory.rivetGun || state.resources.rivets > 0,
      canRepairRotable: state.resources.alclad >= 50 && state.resources.credits >= 25,
      canCompleteBasicJob: state.resources.alclad >= 20 && state.resources.rivets >= 30,
      hasRareResources:
        state.resources.kardexFragments > 0 ||
        state.resources.crystallineResonators > 0 ||
        state.resources.bioFilament > 0,
    }),
    [
      state.inventory.rivetGun,
      state.resources.rivets,
      state.resources.alclad,
      state.resources.credits,
      state.resources.kardexFragments,
      state.resources.crystallineResonators,
      state.resources.bioFilament,
    ]
  );

  // Environmental hazards status
  const hazardStatus = useMemo(
    () => ({
      hasActiveHazards: state.activeHazards.length > 0,
      hazardCount: state.activeHazards.length,
      isUnderSurveillance: state.flags.underSurveillance || state.flags.suitsVisiting,
      isAfraid: state.flags.isAfraid,
    }),
    [
      state.activeHazards.length,
      state.flags.underSurveillance,
      state.flags.suitsVisiting,
      state.flags.isAfraid,
    ]
  );

  return {
    focusPercentage,
    sanityColor,
    suspicionState,
    xpProgress,
    focusState,
    vitalsStatus,
    materialAvailability,
    hazardStatus,
  };
};

/**
 * Selector for checking if player can perform an action
 */
export const useActionAvailability = (
  state: GameState,
  actionType: string,
  focusCost: number = 0
) => {
  return useMemo(() => {
    // Basic focus check
    if (focusCost > 0 && state.resources.focus < focusCost) {
      return { available: false, reason: 'Insufficient focus' };
    }

    // Fear modifier
    const actualCost = state.flags.isAfraid ? focusCost * 1.5 : focusCost;
    if (actualCost > state.resources.focus) {
      return { available: false, reason: 'Too afraid to focus' };
    }

    // PIP modifier
    if (state.flags.onPerformanceImprovementPlan) {
      const pipCost = Math.ceil(focusCost * 1.2);
      if (pipCost > state.resources.focus) {
        return { available: false, reason: 'Performance review pressure' };
      }
    }

    return { available: true, reason: null };
  }, [
    state.resources.focus,
    focusCost,
    state.flags.isAfraid,
    state.flags.onPerformanceImprovementPlan,
  ]);
};

/**
 * Selector for formatted resource display
 */
export const useFormattedResources = (state: GameState) => {
  return useMemo(
    () => ({
      credits: Math.floor(state.resources.credits).toString().padStart(3, '0'),
      alclad: Math.floor(state.resources.alclad).toString().padStart(3, '0'),
      rivets: Math.floor(state.resources.rivets).toString().padStart(3, '0'),
      titanium: Math.floor(state.resources.titanium).toString().padStart(3, '0'),
      logbookHours: Math.floor(state.resources.technicalLogbookHours).toString().padStart(3, '0'),
      sanity: Math.floor(state.resources.sanity),
      suspicion: Math.floor(state.resources.suspicion),
      focus: Math.floor(state.resources.focus),
      experience: Math.floor(state.resources.experience),
      level: state.resources.level,
    }),
    [
      state.resources.credits,
      state.resources.alclad,
      state.resources.rivets,
      state.resources.titanium,
      state.resources.technicalLogbookHours,
      state.resources.sanity,
      state.resources.suspicion,
      state.resources.focus,
      state.resources.experience,
      state.resources.level,
    ]
  );
};
