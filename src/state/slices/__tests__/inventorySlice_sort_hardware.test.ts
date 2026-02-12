import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMinimalGameState } from '../../../utils/testHelpers';
import { inventoryReducer, InventorySliceState } from '../inventorySlice';

describe('inventoryReducer - SORT_HARDWARE', () => {
  let initialState: InventorySliceState;

  beforeEach(() => {
    initialState = {
      inventory: createMinimalGameState().inventory,
      personalInventory: {},
      rotables: [],
      toolConditions: {},
      flags: {
        toolroomMasterPissed: false,
        activeComponentFailure: null,
      },
      resources: {
        alclad: 0,
        titanium: 0,
        fiberglass: 0,
        rivets: 0,
        mek: 0,
        credits: 100,
        suspicion: 0,
        sanity: 50, // Mid sanity
        experience: 0,
        focus: 100, // Full focus
      },
      hfStats: {
        noiseExposure: 0,
        socialStress: 0,
        efficiencyBoost: 0,
        toolroomMasterCooldown: 0,
      },
      calibrationMinigame: {
        active: false,
        toolId: null,
        toolLabel: null,
      },
      activeEvent: null,
      stats: {
        rotablesRepaired: 0,
      },
      logs: [],
      toolroom: {
        status: 'OPEN',
        unavailableTools: [],
        nextStatusChange: Date.now() + 10000,
      },
    };

    vi.spyOn(Date, 'now').mockReturnValue(1234567890);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fail if focus is too low', () => {
    initialState.resources.focus = 10; // Less than 20
    const nextState = inventoryReducer(initialState, { type: 'SORT_HARDWARE' });

    expect(nextState.resources.focus).toBe(10); // Unchanged
    expect(nextState.logs[0].text).toContain('Focus too low');
    expect(nextState.logs[0].type).toBe('warning');
  });

  it('should deduct focus on success', () => {
    const nextState = inventoryReducer(initialState, { type: 'SORT_HARDWARE' });
    expect(nextState.resources.focus).toBe(80); // 100 - 20
  });

  it('should grant XP and Credits on Outcome 1 (Warm Bolt)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1); // Outcome 1 (< 0.2)
    const nextState = inventoryReducer(initialState, { type: 'SORT_HARDWARE' });

    expect(nextState.resources.experience).toBe(100);
    expect(nextState.resources.credits).toBe(110); // 100 + 10
    expect(nextState.logs[0].text).toContain('warm to the touch');
  });

  it('should grant XP, Credits and reduce Sanity on Outcome 2 (Human Tooth)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.3); // Outcome 2 (< 0.4)
    const nextState = inventoryReducer(initialState, { type: 'SORT_HARDWARE' });

    expect(nextState.resources.experience).toBe(120);
    expect(nextState.resources.credits).toBe(110); // 100 + 10
    expect(nextState.resources.sanity).toBe(45); // 50 - 5
    expect(nextState.logs[0].text).toContain('human tooth');
  });

  it('should grant more XP and Credits on Outcome 3 (Master Nods)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // Outcome 3 (< 0.6)
    const nextState = inventoryReducer(initialState, { type: 'SORT_HARDWARE' });

    expect(nextState.resources.experience).toBe(110);
    expect(nextState.resources.credits).toBe(115); // 100 + 15
    expect(nextState.logs[0].text).toContain('Master nods');
  });

  it('should reduce sanity on Outcome 4 (Counting Rivets)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.7); // Outcome 4 (< 0.8)
    const nextState = inventoryReducer(initialState, { type: 'SORT_HARDWARE' });

    expect(nextState.resources.experience).toBe(100);
    expect(nextState.resources.credits).toBe(110);
    expect(nextState.resources.sanity).toBe(48); // 50 - 2
    expect(nextState.logs[0].text).toContain('count the rivets');
  });

  it('should reduce significant sanity on Outcome 5 (Old Scratch)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9); // Outcome 5 (>= 0.8)
    const nextState = inventoryReducer(initialState, { type: 'SORT_HARDWARE' });

    expect(nextState.resources.experience).toBe(150);
    expect(nextState.resources.credits).toBe(110);
    expect(nextState.resources.sanity).toBe(40); // 50 - 10
    expect(nextState.logs[0].text).toContain('old scratch');
  });
});
