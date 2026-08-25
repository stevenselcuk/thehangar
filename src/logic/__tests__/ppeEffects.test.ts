import { beforeEach, describe, expect, it, vi } from 'vitest';
import { processTick } from '../tickLogic.ts';
import { TabType, type GameState } from '../../types.ts';
import { createMinimalGameState } from '../../utils/testHelpers.ts';
import { hangarReducer } from '../../state/slices/hangarSlice.ts';
import { aogReducer } from '../../state/slices/aogSlice.ts';

describe('PPE effects', () => {
  let state: GameState;
  const triggerEvent = vi.fn();

  beforeEach(() => {
    triggerEvent.mockClear();
    state = createMinimalGameState();
  });

  it('earmuffs reduce noise exposure on the apron', () => {
    state.inventory.earmuffs = false;
    processTick(state, 1000, triggerEvent, TabType.APRON_LINE);
    const without = state.hfStats.noiseExposure;

    const muffed = createMinimalGameState();
    muffed.inventory.earmuffs = true;
    processTick(muffed, 1000, triggerEvent, TabType.APRON_LINE);

    expect(muffed.hfStats.noiseExposure).toBeLessThan(without);
  });

  it('earmuffs reduce the focus drain from noise', () => {
    state.inventory.earmuffs = false;
    state.resources.focus = 100;
    processTick(state, 1000, triggerEvent, TabType.APRON_LINE);

    const muffed = createMinimalGameState();
    muffed.inventory.earmuffs = true;
    muffed.resources.focus = 100;
    processTick(muffed, 1000, triggerEvent, TabType.APRON_LINE);

    expect(muffed.resources.focus).toBeGreaterThan(state.resources.focus);
  });

  it('working the backshops without a flashlight costs sanity', () => {
    state.inventory.flashlight = false;
    state.resources.sanity = 100;
    processTick(state, 1000, triggerEvent, TabType.BACKSHOPS);

    expect(state.resources.sanity).toBeLessThan(100);
  });

  it('a flashlight spares the sanity cost in the backshops', () => {
    state.inventory.flashlight = true;
    state.resources.sanity = 100;
    processTick(state, 1000, triggerEvent, TabType.BACKSHOPS);

    expect(state.resources.sanity).toBe(100);
  });

  it('marshalling without a radio yields less', () => {
    const withRadio = createMinimalGameState();
    withRadio.inventory.radio = true;
    const a = hangarReducer(withRadio, { type: 'MARSHALLING', payload: {} });

    const without = createMinimalGameState();
    without.inventory.radio = false;
    const b = hangarReducer(without, { type: 'MARSHALLING', payload: {} });

    expect(b.resources.experience).toBeLessThan(a.resources.experience);
    expect(b.resources.credits).toBeLessThan(a.resources.credits);
  });

  it('the technician toolbox increases AOG action progress', () => {
    const withToolboxState = createMinimalGameState();
    withToolboxState.aog.scenarioId = 'runway_excursion';
    withToolboxState.aog.actionInProgress = {
      actionId: 'dig_out_gear',
      startTime: Date.now(),
      duration: 15000,
    };
    withToolboxState.inventory.technicianToolbox = true;
    const withToolbox = aogReducer(withToolboxState, {
      type: 'RESOLVE_AOG_ACTION',
      payload: { actionId: 'dig_out_gear' },
    });

    const withoutToolboxState = createMinimalGameState();
    withoutToolboxState.aog.scenarioId = 'runway_excursion';
    withoutToolboxState.aog.actionInProgress = {
      actionId: 'dig_out_gear',
      startTime: Date.now(),
      duration: 15000,
    };
    withoutToolboxState.inventory.technicianToolbox = false;
    const withoutToolbox = aogReducer(withoutToolboxState, {
      type: 'RESOLVE_AOG_ACTION',
      payload: { actionId: 'dig_out_gear' },
    });

    // dig_out_gear grants 60 progress; without the toolbox it is scaled by 0.6.
    expect(withToolbox.aog.currentProgress).toBe(60);
    expect(withoutToolbox.aog.currentProgress).toBe(36);
    expect(withoutToolbox.aog.currentProgress).toBeLessThan(withToolbox.aog.currentProgress);
  });
});
