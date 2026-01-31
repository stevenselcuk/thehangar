import { describe, expect, it } from 'vitest';
import { GameState } from '../../../types';
import { PetAction, petReducer } from '../petSlice';

// Mock initial state for the slice
const createMockState = () => ({
  pet: {
    name: 'F.O.D.',
    trust: 10,
    hunger: 50,
    location: 'HANGAR' as const,
    cooldowns: { pet: 0, feed: 0, play: 0 },
    flags: {
      hasMet: true,
      isSleeping: false,
      isStaringAtNothing: false,
      foundGift: null,
    },
  },
  inventory: {} as unknown as GameState['inventory'],
  resources: {
    sanity: 50,
    suspicion: 0,
    canned_tuna: 1, // Start with tuna
  } as unknown as GameState['resources'],
  logs: [],
  activeEvent: null,
});

describe('petSlice', () => {
  it('should handle PET_CAT action (success)', () => {
    const initialState = createMockState();
    // Force trust > 10 to ensure interaction isn't a hiss
    initialState.pet.trust = 20;

    // Mock Math.random to ensure "good" interaction ( < 0.7)
    const originalRandom = Math.random;
    Math.random = () => 0.5;

    const action: PetAction = { type: 'PET_CAT' };
    const nextState = petReducer(initialState, action);

    expect(nextState.pet.trust).toBeGreaterThan(20);
    expect(nextState.resources.sanity).toBeGreaterThan(50);
    expect(nextState.pet.cooldowns.pet).toBeGreaterThan(0);
    expect(nextState.logs.length).toBeGreaterThan(0);

    Math.random = originalRandom;
  });

  it('should handle PET_CAT action (cooldown)', () => {
    const initialState = createMockState();
    initialState.pet.cooldowns.pet = Date.now() + 10000; // Future

    const action: PetAction = { type: 'PET_CAT' };
    const nextState = petReducer(initialState, action);

    // Should not change state if on cooldown (except log maybe? Slice adds warning log)
    expect(nextState.pet.trust).toBe(10);
    expect(nextState.logs[0].type).toBe('warning');
  });

  it('should handle FEED_CAT (canned_tuna)', () => {
    const initialState = createMockState();
    const action: PetAction = { type: 'FEED_CAT', payload: { itemId: 'canned_tuna' } };

    // Note: The slice updates hunger/trust, but inventory removal is expected to be handled by caller/composer if slice doesn't have inventory access?
    // Wait, the slice receives `inventory` in its state interface but usually composer handles cross-slice inventory deduction...
    // BUT looking at `petSlice.ts`, it modifies `resources.canned_tuna`?
    // Wait, let's check `petSlice.ts`.
    // It CHECKS `itemId` but in my implementation I only updated hunger/trust.
    // I did NOT decrease `resources.canned_tuna` in `petSlice`!
    // The previous implementation plan assumed composer or slice would do it.
    // In `shopSlice`, `BUY_ITEM` reduces credits.
    // `petSlice` SHOULD reduce the item count if it consumes it.

    // Let's check `petSlice` implementation I wrote:
    // It updates hunger/trust. It does NOT reduce `canned_tuna`.
    // I need to Fix `petSlice.ts` to consume the item OR `reducerComposer` to handle it.
    // `petSlice` has access to `resources` (where `canned_tuna` is).
    // So `petSlice` SHOULD reduce it.

    const nextState = petReducer(initialState, action);

    expect(nextState.pet.hunger).toBeLessThan(50);
    expect(nextState.pet.trust).toBeGreaterThan(10);
    expect(nextState.resources.canned_tuna).toBe(0); // Should consume 1
    // If logic is missing, this expectation will fail, guiding me to fix the slice.
    // I'll add the expectation that it SHOULD consume tuna, knowing it might fail first.
    // Actually, I should check the slice code.
    // I will write the test to expect consumption.
  });

  it('should handle PET_RANDOM_MOVE', () => {
    const initialState = createMockState();
    const originalRandom = Math.random;
    Math.random = () => 0.1; // Force move (< 0.2) and location pick

    const action: PetAction = { type: 'PET_RANDOM_MOVE' };
    const nextState = petReducer(initialState, action);

    // It might move or stay, but hunger should increase
    expect(nextState.pet.hunger).toBeGreaterThan(50);

    Math.random = originalRandom;
  });
});
