/* eslint-disable @typescript-eslint/no-explicit-any */
import { getMilestoneForLevel } from '@/data/levelMilestones.ts';
import { gameReducer } from '@/state/gameReducer.ts';
import { TabType } from '@/types.ts';
import seedrandom from 'seedrandom';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * Progression Simulation Test
 *
 * Verifies:
 * 1. Action Costs (FOD_SWEEP)
 * 2. Level Up Mechanics
 * 3. Flag Granting (Milestone Integrations)
 * 4. Automatic Tab Unlocking
 */

describe('Progression Simulation', () => {
  let initialState: any;

  beforeEach(() => {
    // Seed random for deterministic behavior
    Math.random = seedrandom('progression-sim');

    // Minimal initial state for gameReducer
    initialState = {
      resources: {
        level: 0,
        experience: 0,
        focus: 100,
        credits: 0,
        sanity: 100,
        suspicion: 0, // Ensure suspicion is initialized
        rivets: 0,
      },
      flags: {
        officeUnlocked: false,
        storyFlags: {},
      },
      inventory: {
        orbitalSander: true, // Required for some logic checks
      },
      stats: {
        shiftsCompleted: 0,
      },
      hfStats: {
        noiseExposure: 0,
        fatigue: 0,
        temperature: 22,
        socialStress: 0,
      },
      toolConditions: {
        rivetGun: 100,
      },
      proficiency: {
        skillPoints: 0,
        unlocked: [],
      },
      notificationQueue: [],
      logs: [],
      eventTimestamps: {},

      activeJob: null,
      activeEvent: null,
      activeHazards: [],
      activeAircraft: null,
      activeChemicalProcess: null,
      rotables: [],
      mail: [],
      vendingPrices: {},
      aog: { active: false },
      procurement: {
        orders: [],
        catalogueUnlockLevel: 1, // Fixed property name from catalogueLevel
      },
      toolroom: {
        status: 'OPEN',
        unavailableTools: [],
        nextStatusChange: Date.now() + 100000,
      },
      bulletinBoard: {
        activeIndices: {
          teamRosters: [],
          companyNews: [],
          deployments: [],
          suitsIntel: [],
          conspiracyTheories: [],
        },
        mechanicOfTheMonthIndex: 0,
        lastUpdate: Date.now(),
      },
      pet: {
        name: 'Void Cat',
        trust: 50,
        hunger: 0,
        location: 'HANGAR',
        cooldowns: { pet: 0, feed: 0, play: 0 },
        flags: { hasMet: true, isNapping: false, isStaringAtNothing: false, foundGift: null },
      },
      time: {
        totalPlayTime: 0,
        sessionTime: 0,
        shiftTime: 0,
        shiftCycle: 1,
        lastTick: Date.now(),
      },
    };
  });

  describe('FOD_SWEEP Cost', () => {
    it('should deduct Focus when performing FOD_SWEEP', () => {
      // Action: FOD_SWEEP
      const action = {
        type: 'ACTION',
        payload: { type: 'FOD_SWEEP' },
      };

      // Execute
      const nextState = gameReducer(initialState, action as any);

      // Verify
      expect(nextState.resources.focus).toBe(95); // 100 - 5
      expect(nextState.resources.rivets).toBe(15);
      expect(nextState.resources.experience).toBe(40);
    });

    it('should clamp Focus at 0', () => {
      initialState.resources.focus = 2;
      const action = {
        type: 'ACTION',
        payload: { type: 'FOD_SWEEP' },
      };

      const nextState = gameReducer(initialState, action as any);

      expect(nextState.resources.focus).toBe(0);
    });
  });

  describe('Level Up & Flag Granting', () => {
    it('should automatically grant flags upon reaching Level 3', () => {
      // Setup: Experience close to leveling up to Level 3
      // Level 0 -> 1: 500 XP
      // Level 1 -> 2: 1000 XP
      // Level 2 -> 3: 1500 XP
      // Total needed roughly 3000 XP from 0 (or just force set level 2 and high XP)

      initialState.resources.level = 2;
      initialState.resources.experience = 1490; // Need 1500 for next level (2 * 500 + 500 = 1500)

      // confirm Office is locked
      expect(initialState.flags.officeUnlocked).toBe(false);

      // Tick 1: Not enough XP yet
      // We simulate a tick with a small delta
      let state = gameReducer(initialState, {
        type: 'TICK',
        payload: { delta: 1000, activeTab: TabType.HANGAR, triggerEvent: () => {} },
      } as any);

      expect(state.resources.level).toBe(2);

      // Give enough XP to level up via direct action or update
      // Let's use UPDATE_RESOURCE to "cheat" XP up, then TICK to process level up
      // Or just give huge XP via FOD_SWEEP
      state = gameReducer(state, {
        type: 'UPDATE_RESOURCE',
        payload: { experience: 3000 }, // Should be plenty (Need ~2828)
      } as any);

      // Tick 2: Process Level Up
      state = gameReducer(state, {
        type: 'TICK',
        payload: { delta: 1000, activeTab: TabType.HANGAR, triggerEvent: () => {} },
      } as any);

      // Verify
      expect(state.resources.level).toBe(3);

      // The Critical Check: Did flags unlock?
      expect(state.flags.officeUnlocked).toBe(true);

      // Check Logs/Notifications
      const levelUpNotif = state.notificationQueue.find((n) => n.variant === 'levelup');
      expect(levelUpNotif).toBeDefined();
      expect(levelUpNotif?.title).toBe('LEVEL UP');
    });

    it('should trigger story events via triggerEvent callback', () => {
      // Setup Level 39 -> 40 (Truth Proximate)
      // Level 40 Milestone has narrativeEvent: 'TRUTH_PROXIMATE_REVELATION'

      initialState.resources.level = 39;
      initialState.resources.experience = 300000; // Force high XP (Need ~243k)

      let triggeredEventId: string | undefined;
      const mockTrigger = (type: string, id?: string) => {
        if (type === 'story_event') {
          triggeredEventId = id;
        }
      };

      // Process Tick
      gameReducer(initialState, {
        type: 'TICK',
        payload: { delta: 1000, activeTab: TabType.HANGAR, triggerEvent: mockTrigger },
      } as any);

      // Verify callback was fired with correct event ID
      const milestone40 = getMilestoneForLevel(40);
      expect(milestone40?.narrativeEvent).toBeDefined();
      expect(triggeredEventId).toBe(milestone40?.narrativeEvent);
    });
  });
});
