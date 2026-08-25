import { produce } from 'immer';

import { getMilestoneForLevel } from '../data/levelMilestones.ts';
import { GameState } from '../types.ts';

// Service layer imports
import { composeAction, composeTick, ROUTED_ACTIONS } from './reducerComposer.ts';

import { processTick } from '../logic/tickLogic.ts';
import { TabType } from '../types.ts';

/**
 * Terminal handler for actions that reached the reducer but matched no
 * slice group. This is always a wiring bug: the action has a button and
 * probably a handler, but was never added to its group const in
 * reducerComposer.ts. Fail loudly in development so it cannot ship.
 */
const handleGameAction = (draft: GameState, type: string): void => {
  const message = `Action '${type}' is not routed. Add it to its slice group in reducerComposer.ts.`;

  if (import.meta.env.DEV) {
    throw new Error(`[handleGameAction] ${message}`);
  }

  console.error(`[handleGameAction] ${message}`);
  draft.notificationQueue.push({
    id: `unrouted-${type}-${Date.now()}`,
    title: 'SYSTEM FAULT',
    message: 'That control is not responding. The incident has been logged.',
    variant: 'danger',
    duration: 5000,
  });
};

export type GameReducerAction =
  | {
      type: 'TICK';
      payload: {
        delta: number;
        triggerEvent: (type: string, id?: string) => void;
        activeTab: TabType;
      };
    }
  | { type: 'ACTION'; payload: { type: string; payload?: Record<string, unknown> } }
  | { type: 'TRIGGER_EVENT'; payload: { type: string; id?: string } }
  // Dev Mode Actions
  | { type: 'UPDATE_RESOURCE'; payload: Partial<GameState['resources']> }
  | { type: 'UPDATE_INVENTORY'; payload: Partial<GameState['inventory']> }
  | { type: 'UPDATE_FLAGS'; payload: Partial<GameState['flags']> }
  | { type: 'UPDATE_HF_STATS'; payload: Partial<GameState['hfStats']> }
  | { type: 'UPDATE_PROFICIENCY'; payload: Partial<GameState['proficiency']> }
  | { type: 'UPDATE_STATS'; payload: Partial<GameState['stats']> }
  | { type: 'UPDATE_STATE'; payload: Partial<GameState> }
  // Import/Export Actions
  | { type: 'IMPORT_STATE'; payload: { state: GameState } }
  | { type: 'CLEAR_NOTIFICATIONS' };

export const gameReducer = (state: GameState, action: GameReducerAction): GameState => {
  return produce(state, (draft) => {
    // ...

    switch (action.type) {
      case 'CLEAR_NOTIFICATIONS': {
        draft.notificationQueue = [];
        break;
      }
      case 'TICK': {
        const { delta, triggerEvent, activeTab } = action.payload;

        const updatedState = composeTick(draft as unknown as GameState, delta, activeTab);
        Object.assign(draft, updatedState);

        // Delegate to extracted logic
        processTick(draft, delta, triggerEvent, activeTab);

        if (draft.activeJob && draft.activeJob.timeLeft <= 0) {
          // Already handled in processTick, but legacy safety?
          // processTick handles job replacement now.
        }
        if (!draft.activeEvent && Math.random() < 0.0003) {
          const eventTypes = ['accident', 'incident', 'eldritch_manifestation'];
          triggerEvent(eventTypes[Math.floor(Math.random() * eventTypes.length)]);
        }
        // Random price fluctuation logic removed (handled in processTick)

        break;
      }

      case 'ACTION': {
        const { type, payload } = action.payload;

        // Handle IMPORT_STATE specially - it needs direct state replacement
        if (type === 'IMPORT_STATE' && payload?.state) {
          const importedState = payload.state as GameState;

          // Replace all state except runtime-specific fields
          Object.assign(draft, importedState);

          // Reset runtime-only fields that shouldn't persist
          draft.activeEvent = null;
          draft.activeHazards = [];
          draft.activeScenario = null;
          draft.calibrationMinigame = { active: false, toolId: null, toolLabel: null };
          draft.lastUpdate = Date.now();

          break;
        }

        // Handle Spam Penalty globally
        if (type === 'ACTION_SPAM_PENALTY') {
          draft.resources.health = Math.max(0, draft.resources.health - 25);
          draft.resources.focus = Math.max(0, draft.resources.focus - 50);
          draft.resources.suspicion = Math.min(100, draft.resources.suspicion + 75);
          draft.notificationQueue.push({
            id: `spam-penalty-${Date.now()}`,
            title: 'SYSTEM OVERLOAD',
            message: 'Excessive rapid requests detected. Neural feedback loop engaged.',
            variant: 'hazard',
            duration: 8000,
          });
          break;
        }

        // Route actions through composer first
        if (ROUTED_ACTIONS.has(type)) {
          const updatedState = composeAction(draft as unknown as GameState, { type, payload });
          Object.assign(draft, updatedState);
          break;
        }

        // Route all other actions through handleGameAction
        handleGameAction(draft, type);
        break;
      }
      case 'TRIGGER_EVENT': {
        // Route to eventsSlice via composer
        const updated = composeAction(draft as unknown as GameState, {
          type: 'TRIGGER_EVENT',
          payload: action.payload,
        });
        Object.assign(draft, updated);
        break;
      }
      // Dev Mode Actions - Direct state manipulation for debugging
      case 'UPDATE_RESOURCE': {
        Object.assign(draft.resources, action.payload);

        // If level was updated manually in Dev Mode, retroactively grant missing flags
        if (action.payload.level !== undefined) {
          const allMilestones = Array.from({ length: action.payload.level + 1 }, (_, i) =>
            getMilestoneForLevel(i)
          ).filter((m) => m !== undefined);
          allMilestones.forEach((milestone) => {
            if (milestone?.unlocks.flags) {
              milestone.unlocks.flags.forEach((flagKey) => {
                const key = flagKey as keyof GameState['flags'];
                if (typeof draft.flags[key] === 'boolean' && draft.flags[key] !== true) {
                  (
                    draft.flags as unknown as Record<
                      string,
                      boolean | number | string | null | object
                    >
                  )[key] = true;
                }
              });
            }
          });
        }

        break;
      }
      case 'UPDATE_INVENTORY': {
        Object.assign(draft.inventory, action.payload);
        break;
      }
      case 'UPDATE_FLAGS': {
        Object.assign(draft.flags, action.payload);
        break;
      }
      case 'UPDATE_HF_STATS': {
        Object.assign(draft.hfStats, action.payload);
        break;
      }
      case 'UPDATE_PROFICIENCY': {
        Object.assign(draft.proficiency, action.payload);
        break;
      }
      case 'UPDATE_STATS': {
        Object.assign(draft.stats, action.payload);
        break;
      }
      case 'UPDATE_STATE': {
        // Generic state update for Dev Mode
        // BE CAREFUL: This does a shallow merge at the root level, so if you update 'pet',
        // you must provide the ENTIRE 'pet' object if you don't want to lose data.
        Object.assign(draft, action.payload);
        break;
      }
      // Import/Export Actions
      case 'IMPORT_STATE': {
        // Import a complete game state from import/export
        // Preserve runtime-only fields that shouldn't be imported
        const importedState = action.payload.state;

        // Replace all state except runtime-specific fields
        Object.assign(draft, importedState);

        // Reset runtime-only fields that shouldn't persist
        draft.activeEvent = null;
        draft.activeHazards = [];
        draft.activeScenario = null;
        draft.calibrationMinigame = { active: false, toolId: null, toolLabel: null };
        draft.lastUpdate = Date.now();

        break;
      }
    }
  });
};
