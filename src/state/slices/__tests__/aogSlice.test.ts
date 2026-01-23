import { describe, expect, it } from 'vitest';
import { aogReducer } from '../aogSlice';

const mockState = {
  aog: {
    active: false,
    stationId: null,
    scenarioId: null,
    startTime: 0,
    completedActions: [],
    currentProgress: 0,
    progressRequired: 100,
    actionInProgress: null,
  },
  resources: {
    alclad: 100,
    titanium: 0,
    fiberglass: 0,
    rivets: 100,
    hiloks: 0,
    collars: 0,
    grommets: 0,
    steelWire: 0,
    skydrol: 0,
    mek: 0,
    grease: 0,
    sealant: 0,
    sanity: 100,
    suspicion: 0,
    focus: 100,
    experience: 0,
    level: 1,
    credits: 1000,
    kardexFragments: 0,
    crystallineResonators: 0,
    bioFilament: 0,
    technicalLogbookHours: 0,
  },
  logs: [],
};

describe('aogReducer', () => {
  it('should handle ACCEPT_AOG_DEPLOYMENT', () => {
    const initialState = JSON.parse(JSON.stringify(mockState));
    const action = { type: 'ACCEPT_AOG_DEPLOYMENT', payload: {} };

    const nextState = aogReducer(initialState, action);

    expect(nextState.aog.active).toBe(true);
    expect(nextState.aog.stationId).not.toBeNull();
    expect(nextState.aog.scenarioId).not.toBeNull();
    expect(nextState.aog.currentProgress).toBe(0);
    expect(nextState.aog.progressRequired).toBeGreaterThan(0);
    expect(nextState.logs.length).toBeGreaterThan(0);
  });

  it('should handle START_AOG_ACTION', () => {
    const initialState = JSON.parse(JSON.stringify(mockState));
    initialState.aog.active = true;
    initialState.aog.scenarioId = 'runway_excursion'; // Ensure a known scenario
    // Ensure enough resources
    initialState.resources.focus = 100;

    const action = { type: 'START_AOG_ACTION', payload: { actionId: 'dig_out_gear' } };
    const nextState = aogReducer(initialState, action);

    expect(nextState.aog.actionInProgress).not.toBeNull();
    expect(nextState.aog.actionInProgress.actionId).toBe('dig_out_gear');
    expect(nextState.resources.focus).toBeLessThan(100);
  });

  it('should handle RESOLVE_AOG_ACTION', () => {
    const initialState = JSON.parse(JSON.stringify(mockState));
    initialState.aog.active = true;
    initialState.aog.scenarioId = 'runway_excursion';
    initialState.aog.actionInProgress = {
      actionId: 'dig_out_gear',
      startTime: Date.now() - 20000,
      duration: 15000,
    };

    const action = { type: 'RESOLVE_AOG_ACTION', payload: { actionId: 'dig_out_gear' } };
    const nextState = aogReducer(initialState, action);

    expect(nextState.aog.actionInProgress).toBeNull();
    expect(nextState.aog.completedActions).toContain('dig_out_gear');
    expect(nextState.aog.currentProgress).toBeGreaterThan(0);
  });

  it('should prevent COMPLETE_AOG_DEPLOYMENT if incomplete', () => {
    const initialState = JSON.parse(JSON.stringify(mockState));
    initialState.aog.active = true;
    initialState.aog.stationId = 'LHR';
    initialState.aog.scenarioId = 'runway_excursion';
    initialState.aog.currentProgress = 0;
    initialState.aog.progressRequired = 100;

    const action = { type: 'COMPLETE_AOG_DEPLOYMENT', payload: {} };
    const nextState = aogReducer(initialState, action);

    expect(nextState.aog.active).toBe(true); // Should NOT have completed
    expect(
      nextState.logs.some((l: { text: string }) => l.text.includes('Mission incompelete'))
    ).toBe(true);
  });

  it('should allow COMPLETE_AOG_DEPLOYMENT if complete', () => {
    const initialState = JSON.parse(JSON.stringify(mockState));
    initialState.aog.active = true;
    initialState.aog.stationId = 'LHR';
    initialState.aog.scenarioId = 'runway_excursion';
    initialState.aog.currentProgress = 100;
    initialState.aog.progressRequired = 100;
    initialState.aog.startTime = Date.now() - 5000;

    const action = { type: 'COMPLETE_AOG_DEPLOYMENT', payload: {} };
    const nextState = aogReducer(initialState, action);

    expect(nextState.aog.active).toBe(false);
    expect(nextState.aog.stationId).toBeNull();
  });
});
