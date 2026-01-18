import { describe, expect, it } from 'vitest';
import { aogReducer } from '../aogSlice';

const mockState = {
  aog: {
    active: false,
    stationId: null,
    scenarioId: null,
    startTime: 0,
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
    expect(nextState.logs.length).toBeGreaterThan(0);
  });

  it('should not allow deployment if already active', () => {
    const initialState = JSON.parse(JSON.stringify(mockState));
    initialState.aog.active = true;
    const action = { type: 'ACCEPT_AOG_DEPLOYMENT', payload: {} };

    const nextState = aogReducer(initialState, action);

    // Should handle gracefully (log warning) but not change active state (which was already true)
    // Actually our reducer logic just logs a warning and returns, so state should remain same except logs
    expect(nextState.aog.active).toBe(true);
    expect(nextState.logs.length).toBeGreaterThan(0);
    expect(nextState.logs[0].type).toBe('warning');
  });

  it('should handle COMPLETE_AOG_DEPLOYMENT', () => {
    const initialState = JSON.parse(JSON.stringify(mockState));
    initialState.aog.active = true;
    initialState.aog.stationId = 'LHR';
    initialState.aog.scenarioId = 'runway_excursion';
    const action = { type: 'COMPLETE_AOG_DEPLOYMENT', payload: {} };

    const nextState = aogReducer(initialState, action);

    expect(nextState.aog.active).toBe(false);
    expect(nextState.aog.stationId).toBeNull();
    expect(nextState.aog.scenarioId).toBeNull();
    expect(nextState.resources.credits).toBe(mockState.resources.credits + 500); // Check reward
    expect(nextState.logs.length).toBeGreaterThan(0);
  });
});
