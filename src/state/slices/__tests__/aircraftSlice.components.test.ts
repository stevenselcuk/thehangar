import { describe, expect, it, vi } from 'vitest';
import { AircraftType, GameState, RotableItem } from '../../../types';
import { AircraftAction, aircraftReducer, AircraftSliceState } from '../aircraftSlice';

// Mock initial state helper
const createMockState = (overrides: Partial<AircraftSliceState> = {}): AircraftSliceState => ({
  activeAircraft: {
    id: 'test-aircraft',
    type: 'B737' as AircraftType,
    tailNumber: 'N12345',
    logbook: [],
    workPackage: [],
    installedRotables: [],
    deferredItems: [],
    openFaults: [],
  },
  resources: {
    credits: 1000,
    experience: 0,
    sanity: 100,
    focus: 100,
    suspicion: 0,
    fdrData: 0,
    aimsData: 0,
    flightComputerMemory: 0,
    kardexFragments: 0,
    // ... add other required resources with 0
  } as unknown as GameState['resources'],
  inventory: {} as unknown as GameState['inventory'],
  personalInventory: {},
  flags: {},
  hfStats: {},
  logs: [],
  activeScenario: null,
  activeChemicalProcess: null,
  rotables: [],
  ...overrides,
});

describe('aircraftSlice - Components & Systems', () => {
  it('should handle RESEARCH_COMPONENT_HISTORY', () => {
    const mockRotable: RotableItem = {
      id: 'rot-1',
      label: 'Test Part',
      pn: '123',
      sn: 'SN123',
      condition: 100,
      isInstalled: false,
      isUntraceable: false,
      history: [],
      manufactureDate: Date.now(),
    };

    const initialState = createMockState({
      rotables: [mockRotable],
    });

    const action: AircraftAction = {
      type: 'RESEARCH_COMPONENT_HISTORY',
      payload: { rotableId: 'rot-1' },
    };

    const nextState = aircraftReducer(initialState, action);

    // Should deduce focus
    expect(nextState.resources.focus).toBe(95);
    // Should add a log (we can't easily check logs string content without mocking addLog,
    // but we can check if log count increased or specific log logic if we cared)
  });

  it('should handle RESEARCH_COMPONENT_HISTORY for untraceable item', () => {
    const mockRotable: RotableItem = {
      id: 'rot-sus',
      label: 'Sus Part',
      pn: '666',
      sn: 'UNTRACEABLE',
      condition: 100,
      isInstalled: false,
      isUntraceable: true,
      history: [],
      manufactureDate: Date.now(),
    };

    const initialState = createMockState({
      rotables: [mockRotable],
    });

    const action: AircraftAction = {
      type: 'RESEARCH_COMPONENT_HISTORY',
      payload: { rotableId: 'rot-sus' },
    };

    const nextState = aircraftReducer(initialState, action);

    // Should increase suspicion
    expect(nextState.resources.suspicion).toBe(5);
  });

  it('should handle FABRICATE_PAPERWORK', () => {
    const mockRotable: RotableItem = {
      id: 'rot-sus',
      label: 'Sus Part',
      pn: '666',
      sn: 'UNTRACEABLE',
      condition: 100,
      isInstalled: false,
      isUntraceable: true,
      history: [],
      manufactureDate: Date.now(),
    };

    const initialState = createMockState({
      rotables: [mockRotable],
      resources: { ...createMockState().resources, experience: 2500 }, // Enough XP
    });

    const action: AircraftAction = {
      type: 'FABRICATE_PAPERWORK',
      payload: { rotableId: 'rot-sus' },
    };

    const nextState = aircraftReducer(initialState, action);

    const updatedRotable = nextState.rotables!.find((r) => r.id === 'rot-sus');
    expect(updatedRotable?.isUntraceable).toBe(false);
    expect(updatedRotable?.sn).not.toBe('UNTRACEABLE');
    expect(updatedRotable?.history.find((h) => h.event === 'FALSIFIED')).toBeDefined();
    expect(nextState.resources.suspicion).toBe(10);
  });

  it('should handle DOWNLOAD_DATA', () => {
    const initialState = createMockState();
    // We mock Math.random to ensure success
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.1);

    const action: AircraftAction = {
      type: 'DOWNLOAD_DATA',
      payload: { type: 'FDR' },
    };

    const nextState = aircraftReducer(initialState, action);

    // Should have gained a data item (randomly chosen)
    const totalData =
      nextState.resources.fdrData +
      nextState.resources.aimsData +
      nextState.resources.flightComputerMemory;
    expect(totalData).toBe(1);

    randomSpy.mockRestore();
  });

  it('should handle ANALYZE_DATA', () => {
    const initialState = createMockState({
      resources: { ...createMockState().resources, fdrData: 1 },
    });

    const action: AircraftAction = {
      type: 'ANALYZE_DATA',
      payload: {},
    };

    const nextState = aircraftReducer(initialState, action);

    expect(nextState.resources.fdrData).toBe(0);
    expect(nextState.resources.experience).toBe(150);
  });
});
