import { produce } from 'immer';
import { GameState, LogMessage, PetState } from '../../types';

export type PetAction =
  | { type: 'PET_CAT' }
  | { type: 'FEED_CAT'; payload: { itemId: string } }
  | { type: 'PLAY_WITH_CAT'; payload: { itemId: string } }
  | { type: 'CHECK_PET_STATUS' }
  | { type: 'PET_RANDOM_MOVE' };

interface PetSliceState {
  pet: PetState;
  inventory: GameState['inventory'];
  resources: GameState['resources'];
  logs: LogMessage[];
  activeEvent: GameState['activeEvent'];
}

const LOCATIONS: PetState['location'][] = ['HANGAR', 'OFFICE', 'CANTEEN', 'TOOLROOM'];

// Helper to log
const addLog = (
  draft: PetSliceState,
  text: string,
  type: 'info' | 'story' | 'warning' = 'info'
) => {
  draft.logs.unshift({
    id: Date.now().toString(),
    text,
    type,
    timestamp: Date.now(),
  });
  if (draft.logs.length > 50) draft.logs.pop();
};

export const petReducer = produce((draft: PetSliceState, action: PetAction) => {
  switch (action.type) {
    case 'PET_CAT': {
      const now = Date.now();
      if (now < draft.pet.cooldowns.pet) {
        addLog(draft, `${draft.pet.name} is not in the mood right now.`, 'warning');
        return;
      }

      // Interaction
      if (draft.pet.trust < 10) {
        addLog(draft, `${draft.pet.name} backs away hissing. He doesn't trust you yet.`, 'story');
        draft.pet.trust = Math.min(100, draft.pet.trust + 1);
      } else {
        // Successful pet
        const roll = Math.random();
        if (roll < 0.7) {
          // Good interaction
          addLog(draft, `You pet ${draft.pet.name}. His fur is coarse but warm.`, 'story');
          draft.resources.sanity = Math.min(100, draft.resources.sanity + 5);
          draft.pet.trust = Math.min(100, draft.pet.trust + 2);
        } else if (roll < 0.9) {
          // Weird interaction
          addLog(
            draft,
            `You pet ${draft.pet.name}. He vibrates at a frequency that makes your teeth itch.`,
            'story'
          );
          draft.resources.sanity = Math.max(0, draft.resources.sanity - 2);
          draft.resources.suspicion = Math.max(0, draft.resources.suspicion - 1);
        } else {
          // Bad? interaction
          addLog(draft, `${draft.pet.name} nips at your hand.`, 'story');
        }
      }

      draft.pet.cooldowns.pet = now + 1000 * 60 * 5; // 5 min cooldown
      break;
    }

    case 'FEED_CAT': {
      const { itemId } = action.payload;
      const now = Date.now();

      if (now < draft.pet.cooldowns.feed) {
        addLog(draft, `${draft.pet.name} is not hungry.`, 'warning');
        return;
      }

      if (itemId === 'canned_tuna') {
        addLog(draft, `${draft.pet.name} devours the tuna instantly.`, 'story');
        draft.pet.hunger = Math.max(0, draft.pet.hunger - 40);
        draft.pet.trust = Math.min(100, draft.pet.trust + 10);
        draft.resources.sanity = Math.min(100, draft.resources.sanity + 5);

        // Consume item
        if (draft.resources.canned_tuna > 0) {
          draft.resources.canned_tuna -= 1;
        }
      } else if (itemId === 'vending_sardines' || itemId === 'tuna') {
        draft.pet.hunger = Math.max(0, draft.pet.hunger - 30);
        draft.pet.trust = Math.min(100, draft.pet.trust + 5);
      } else {
        addLog(draft, `${draft.pet.name} sniffs it and looks offended.`, 'story');
        draft.pet.trust = Math.max(0, draft.pet.trust - 1);
      }

      draft.pet.cooldowns.feed = now + 1000 * 60 * 60; // 1 hour cooldown
      break;
    }

    case 'PET_RANDOM_MOVE': {
      const roll = Math.random();
      // Increase hunger slightly
      draft.pet.hunger = Math.min(100, draft.pet.hunger + 0.5);

      if (roll < 0.2) {
        // 20% chance to move if this action is called (caller controls frequency)
        const newLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
        if (newLoc !== draft.pet.location) {
          draft.pet.location = newLoc;
        }
      }
      break;
    }
  }
});
