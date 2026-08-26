import { createContext, useContext } from 'react';

/**
 * The multiplier fatigue and active hazards currently put on every focus
 * cost — the same number chargeFocus feeds to resolveFocusSpend.
 *
 * ActionButton reads it so that the `[COST: n FOCUS]` label on screen is the
 * figure the player will actually be charged. Without it every label in the
 * game is understated: HANGAR is a FatigueLevel.HIGH location, so fatigue
 * saturates at 100 within ~83 seconds of play and stays there, making the
 * modifier a permanent 1.5x rather than an edge case.
 *
 * Provided once, around ActionPanel, which is the ancestor of every
 * ActionButton in the tree. Defaults to 1 so a button rendered outside the
 * provider (a test, a standalone modal) shows the base cost rather than
 * throwing.
 */
const FocusCostModifierContext = createContext(1);

export const FocusCostModifierProvider = FocusCostModifierContext.Provider;

export const useFocusCostModifier = (): number => useContext(FocusCostModifierContext);
