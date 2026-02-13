import { produce } from 'immer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hazardsData } from '../../data/hazards';
import { createInitialState } from '../../state/initialState';
import { GameState, TabType } from '../../types';
import { processTick } from '../tickLogic';

describe('Hazard Logic', () => {
  let baseState: GameState;
  const triggerEvent = vi.fn();
  const activeTab = TabType.HANGAR;

  beforeEach(() => {
    const startState = createInitialState();
    baseState = {
      ...startState,
      activeHazards: [],
      // Ensure resources are sufficient for drain tests
      resources: {
        ...startState.resources,
        sanity: 100,
        health: 100,
        focus: 100,
      },
    };
    vi.clearAllMocks();
  });

  it('should process active hazards: reduce duration', () => {
    const hazard = { ...hazardsData[0], duration: 10000, startTime: Date.now() }; // 10s duration
    const stateWithHazard = produce(baseState, (draft) => {
      draft.activeHazards.push(hazard);
    });

    const delta = 1000; // 1s
    const nextState = produce(stateWithHazard, (draft) => {
      processTick(draft, delta, triggerEvent, activeTab);
    });

    expect(nextState.activeHazards.length).toBe(1);
    expect(nextState.activeHazards[0].duration).toBe(9000);
  });

  it('should remove expired hazards', () => {
    const hazard = { ...hazardsData[0], duration: 500, startTime: Date.now() }; // 0.5s duration
    const stateWithHazard = produce(baseState, (draft) => {
      draft.activeHazards.push(hazard);
    });

    const delta = 1000; // 1s
    const nextState = produce(stateWithHazard, (draft) => {
      processTick(draft, delta, triggerEvent, activeTab);
    });

    expect(nextState.activeHazards.length).toBe(0);
    expect(nextState.logs.length).toBeGreaterThan(baseState.logs.length);
    // Logging logic verification depends on how logs are added (usually to draft.logs)
  });

  it('should apply sanity drain', () => {
    const hazard = {
      id: 'TEST_HAZARD',
      name: 'Test Hazard',
      description: 'Testing',
      type: 'weather',
      duration: 10000,
      effects: {
        sanityDrain: 10, // 10 per second
      },
    };

    const stateWithHazard = produce(baseState, (draft) => {
      // @ts-expect-error - Mocking a hazard
      draft.activeHazards.push(hazard);
    });

    const delta = 1000; // 1s
    const nextState = produce(stateWithHazard, (draft) => {
      processTick(draft, delta, triggerEvent, activeTab);
    });

    // Expected: 100 - (10 * 1s) = 90
    expect(nextState.resources.sanity).toBeCloseTo(90);
  });

  it('should apply health drain', () => {
    const hazard = {
      id: 'TOXIC_TEST',
      name: 'Toxic Test',
      description: 'Testing Health Drain',
      type: 'containment',
      duration: 10000,
      effects: {
        healthDrain: 5, // 5 per second
      },
    };

    const stateWithHazard = produce(baseState, (draft) => {
      // @ts-expect-error - Mocking a hazard
      draft.activeHazards.push(hazard);
    });

    const delta = 2000; // 2s
    const nextState = produce(stateWithHazard, (draft) => {
      processTick(draft, delta, triggerEvent, activeTab);
    });

    // Expected: 100 - (5 * 2s) = 90
    expect(nextState.resources.health).toBeCloseTo(90);
  });
});
