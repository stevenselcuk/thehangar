import { describe, expect, it } from 'vitest';
import {
  ResourcesSliceState,
  addCredits,
  addExperience,
  deductFocus,
  drainSanity,
  increaseSuspicion,
  resourcesReducer,
} from '../resourcesSlice';
import { GameState } from '../../../types';

describe('resourcesSlice', () => {
  const initialResources = {
    credits: 100,
    sanity: 100,
    focus: 100,
    suspicion: 0,
    experience: 0,
    technicalLogbookHours: 0,
    alclad: 0,
    rivets: 0,
    fiberglass: 0,
    titanium: 0,
    syndicateReputation: 0,
    unionReputation: 0,
  };

  const initialState: ResourcesSliceState = {
    resources: { ...initialResources },
    logs: [],
  };

  describe('RESOURCES_ADD', () => {
    it('should add resources', () => {
      const action = {
        type: 'RESOURCES_ADD',
        payload: { credits: 50, experience: 100 },
      } as const;

      const newState = resourcesReducer(initialState, action);

      expect(newState.resources.credits).toBe(150);
      expect(newState.resources.experience).toBe(100);
    });
  });

  describe('RESOURCES_DEDUCT', () => {
    it('should deduct resources and clamp at 0', () => {
      const action = {
        type: 'RESOURCES_DEDUCT',
        payload: { credits: 50, sanity: 200 },
      } as const;

      const newState = resourcesReducer(initialState, action);

      expect(newState.resources.credits).toBe(50);
      expect(newState.resources.sanity).toBe(0); // Clamped at 0
    });
  });

  describe('RESOURCES_SET', () => {
    it('should set resources directly', () => {
      const action = {
        type: 'RESOURCES_SET',
        payload: { focus: 50, suspicion: 80 },
      } as const;

      const newState = resourcesReducer(initialState, action);

      expect(newState.resources.focus).toBe(50);
      expect(newState.resources.suspicion).toBe(80);
    });
  });

  describe('RESOURCES_CLAMP_ALL', () => {
    it('should clamp all percentage based resources', () => {
      const state = {
        ...initialState,
        resources: {
          ...initialResources,
          sanity: 150,
          focus: -10,
          suspicion: 200,
          syndicateReputation: 120,
          unionReputation: -50,
        },
      };

      const action = { type: 'RESOURCES_CLAMP_ALL' } as const;
      const newState = resourcesReducer(state, action);

      expect(newState.resources.sanity).toBe(100);
      expect(newState.resources.focus).toBe(0);
      expect(newState.resources.suspicion).toBe(100);
      expect(newState.resources.syndicateReputation).toBe(100);
      expect(newState.resources.unionReputation).toBe(0);
    });
  });

  describe('RESOURCES_TICK', () => {
    const basePayload = {
      delta: 1000, // 1 second
      flags: {
        isAfraid: false,
        isHallucinating: false,
        nightCrewActive: false,
        transitCheckDelegationActive: false,
        autoSrfActive: false,
        activeComponentFailure: null,
      } as GameState['flags'],
      hfStats: {
        sanityShieldTimer: 0,
      } as GameState['hfStats'],
      proficiency: { unlocked: [] } as GameState['proficiency'],
    };

    it('should drain sanity when afraid', () => {
      const action = {
        type: 'RESOURCES_TICK',
        payload: {
          ...basePayload,
          flags: { ...basePayload.flags, isAfraid: true },
        },
      } as const;

      const newState = resourcesReducer(initialState, action);
      // drain = 0.5 per second
      expect(newState.resources.sanity).toBe(99.5);
    });

    it('should reduce sanity drain with steadyNerves', () => {
      const action = {
        type: 'RESOURCES_TICK',
        payload: {
          ...basePayload,
          flags: { ...basePayload.flags, isAfraid: true },
          proficiency: { unlocked: ['steadyNerves'] },
        },
      } as const;

      const newState = resourcesReducer(initialState, action);
      // drain = 0.5 * 0.9 = 0.45
      expect(newState.resources.sanity).toBe(99.55);
    });

    it('should prevent sanity drain when shield is active', () => {
      const action = {
        type: 'RESOURCES_TICK',
        payload: {
          ...basePayload,
          flags: { ...basePayload.flags, isAfraid: true },
          hfStats: { sanityShieldTimer: 1000 },
        },
      } as const;

      const newState = resourcesReducer(initialState, action);
      expect(newState.resources.sanity).toBe(100);
    });

    it('should drain focus when hallucinating', () => {
        const action = {
          type: 'RESOURCES_TICK',
          payload: {
            ...basePayload,
            flags: { ...basePayload.flags, isHallucinating: true },
          },
        } as const;

        const newState = resourcesReducer(initialState, action);
        // drain = 5.0 per second
        // also regen applies!
        // focusRegen is calculated by calculateFocusRegen.
        // Base regen? Need to check calculateFocusRegen logic or mock it.
        // Assuming base regen is small or 0 if full?
        // But focus starts at 100.
        // Logic: focus = min(100, focus + regen)
        // But first: focus = max(0, focus - drain)
        // So 100 - 5 = 95. Then + regen.
        // If regen > 0, result > 95.

        expect(newState.resources.focus).toBeLessThan(100);
    });

    it('should generate income when night crew active', () => {
        const action = {
          type: 'RESOURCES_TICK',
          payload: {
            ...basePayload,
            flags: { ...basePayload.flags, nightCrewActive: true },
          },
        } as const;

        const newState = resourcesReducer(initialState, action);
        // Night crew gives alclad, rivets, suspicion
        expect(newState.resources.alclad).toBeGreaterThan(0);
        expect(newState.resources.rivets).toBeGreaterThan(0);
        expect(newState.resources.suspicion).toBeGreaterThan(0);
    });

    it('should generate income when transit check delegation active', () => {
        const action = {
          type: 'RESOURCES_TICK',
          payload: {
            ...basePayload,
            flags: { ...basePayload.flags, transitCheckDelegationActive: true },
          },
        } as const;

        const newState = resourcesReducer(initialState, action);
        expect(newState.resources.credits).toBeGreaterThan(100);
        expect(newState.resources.experience).toBeGreaterThan(0);
        expect(newState.resources.suspicion).toBeGreaterThan(0);
    });

    it('should generate income when auto SRF active', () => {
        const action = {
          type: 'RESOURCES_TICK',
          payload: {
            ...basePayload,
            flags: { ...basePayload.flags, autoSrfActive: true },
          },
        } as const;

        const newState = resourcesReducer(initialState, action);
        expect(newState.resources.credits).toBeGreaterThan(100);
        expect(newState.resources.experience).toBeGreaterThan(0);
    });

    it('should drain credits on active component failure', () => {
        const action = {
          type: 'RESOURCES_TICK',
          payload: {
            ...basePayload,
            flags: { ...basePayload.flags, activeComponentFailure: 'some-failure' },
          },
        } as const;

        const newState = resourcesReducer(initialState, action);
        // drain 1.5 per second. 100 - 1.5 = 98.5
        // But autoSrf or other income might apply? No, checking default flags.
        expect(newState.resources.credits).toBe(98.5);
    });
  });

  describe('LOG_FLAVOR', () => {
    it('should add log and cap size', () => {
        const stateWithLogs = {
            ...initialState,
            logs: Array(50).fill({ id: 'old', text: 'old', timestamp: 0 }),
        };

        const action = {
            type: 'LOG_FLAVOR',
            payload: { text: 'New Log', type: 'info' as const },
        } as const;

        const newState = resourcesReducer(stateWithLogs, action);

        expect(newState.logs).toHaveLength(50);
        expect(newState.logs[0].text).toBe('New Log');
        expect(newState.logs[0].type).toBe('info');
    });
  });

  describe('Helpers', () => {
    it('addCredits should add credits', () => {
        const newState = addCredits(initialState, 50);
        expect(newState.resources.credits).toBe(150);
    });
    it('addExperience should add experience', () => {
        const newState = addExperience(initialState, 50);
        expect(newState.resources.experience).toBe(50);
    });
    it('deductFocus should deduct focus', () => {
        const newState = deductFocus(initialState, 30);
        expect(newState.resources.focus).toBe(70);
    });
    it('drainSanity should drain sanity', () => {
        const newState = drainSanity(initialState, 30);
        expect(newState.resources.sanity).toBe(70);
    });
    it('increaseSuspicion should increase suspicion', () => {
        const newState = increaseSuspicion(initialState, 30);
        expect(newState.resources.suspicion).toBe(30);
    });
  });
});
