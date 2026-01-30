import { describe, expect, it } from 'vitest';

import {
  calculateFiberglassYield,
  calculateTitaniumYield,
  generateSerialNumber,
  getRandomMasterDialogue,
  getRandomMasterLore,
  inventoryReducer,
  InventorySliceState,
  isRedTaggedRotable,
  isUntraceableRotable,
} from '@/state/slices/inventorySlice.ts';
import { RotableItem } from '@/types.ts';
import { createMinimalGameState, mockMathRandom } from '@/utils/testHelpers.ts';

// ===== TEST FIXTURES =====

const createInventoryState = (
  overrides: Partial<InventorySliceState> = {}
): InventorySliceState => {
  const baseState = createMinimalGameState();
  return {
    inventory: baseState.inventory,
    personalInventory: {},
    rotables: baseState.rotables,
    toolConditions: baseState.toolConditions,
    flags: {
      toolroomMasterPissed: false,
      activeComponentFailure: null,
    },
    resources: {
      alclad: 100,
      titanium: 50,
      fiberglass: 50,
      rivets: 100,
      mek: 5,
      credits: 1000,
      suspicion: 0,
      sanity: 100,
      experience: 0,
      focus: 100,
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
      nextStatusChange: 0,
    },
    ...overrides,
  };
};

const createTestRotable = (overrides: Partial<RotableItem> = {}): RotableItem => ({
  id: 'test-rotable-1',
  label: 'Test Component',
  pn: 'TEST-001',
  sn: 'SN-TEST123',
  condition: 100,
  isInstalled: false,
  isUntraceable: false,
  isRedTagged: false,
  ...overrides,
});

// ===== HELPER FUNCTION TESTS =====

describe('inventorySlice - Helper Functions', () => {
  describe('generateSerialNumber', () => {
    it('should generate serial number with SN- prefix', () => {
      const sn = generateSerialNumber();
      expect(sn).toMatch(/^SN-[A-Z0-9]{8}$/);
    });

    it('should generate unique serial numbers', () => {
      const sn1 = generateSerialNumber();
      const sn2 = generateSerialNumber();
      expect(sn1).not.toBe(sn2);
    });
  });

  describe('isUntraceableRotable', () => {
    it('should return true for 5% probability', () => {
      const restore = mockMathRandom('untraceable-true');
      Math.random = () => 0.04; // Below 0.05 threshold
      expect(isUntraceableRotable()).toBe(true);
      restore();
    });

    it('should return false for 95% probability', () => {
      const restore = mockMathRandom('untraceable-false');
      Math.random = () => 0.06; // Above 0.05 threshold
      expect(isUntraceableRotable()).toBe(false);
      restore();
    });
  });

  describe('isRedTaggedRotable', () => {
    it('should return true for 8% probability', () => {
      const restore = mockMathRandom('red-tag-true');
      Math.random = () => 0.07; // Below 0.08 threshold
      expect(isRedTaggedRotable()).toBe(true);
      restore();
    });

    it('should return false for 92% probability', () => {
      const restore = mockMathRandom('red-tag-false');
      Math.random = () => 0.09; // Above 0.08 threshold
      expect(isRedTaggedRotable()).toBe(false);
      restore();
    });
  });

  describe('calculateTitaniumYield', () => {
    it('should return value between 10 and 24', () => {
      const yield1 = calculateTitaniumYield();
      expect(yield1).toBeGreaterThanOrEqual(10);
      expect(yield1).toBeLessThan(25);
    });
  });

  describe('calculateFiberglassYield', () => {
    it('should return value between 5 and 14', () => {
      const yield1 = calculateFiberglassYield();
      expect(yield1).toBeGreaterThanOrEqual(5);
      expect(yield1).toBeLessThan(15);
    });
  });

  describe('getRandomMasterLore', () => {
    it('should return a non-empty lore string', () => {
      const lore = getRandomMasterLore();
      expect(lore).toBeTruthy();
      expect(typeof lore).toBe('string');
    });
  });

  describe('getRandomMasterDialogue', () => {
    it('should return a non-empty dialogue string', () => {
      const dialogue = getRandomMasterDialogue();
      expect(dialogue).toBeTruthy();
      expect(typeof dialogue).toBe('string');
    });
  });
});

// ===== REDUCER TESTS =====

describe('inventorySlice - Reducer', () => {
  describe('HARVEST_ROTABLE', () => {
    it('should remove rotable and add materials', () => {
      const rotable = createTestRotable();
      const state = createInventoryState({ rotables: [rotable] });

      const result = inventoryReducer(state, {
        type: 'HARVEST_ROTABLE',
        payload: { rotableId: rotable.id },
      });

      expect(result.rotables).toHaveLength(0);
      expect(result.resources.titanium).toBeGreaterThan(state.resources.titanium);
      expect(result.resources.fiberglass).toBeGreaterThan(state.resources.fiberglass);
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].text).toContain('disassemble');
    });

    it('should not remove other rotables', () => {
      const rotable1 = createTestRotable({ id: 'rot-1' });
      const rotable2 = createTestRotable({ id: 'rot-2' });
      const state = createInventoryState({ rotables: [rotable1, rotable2] });

      const result = inventoryReducer(state, {
        type: 'HARVEST_ROTABLE',
        payload: { rotableId: rotable1.id },
      });

      expect(result.rotables).toHaveLength(1);
      expect(result.rotables[0].id).toBe('rot-2');
    });

    it('should not mutate original state', () => {
      const rotable = createTestRotable();
      const state = createInventoryState({ rotables: [rotable] });
      const originalRotablesLength = state.rotables.length;

      inventoryReducer(state, {
        type: 'HARVEST_ROTABLE',
        payload: { rotableId: rotable.id },
      });

      expect(state.rotables).toHaveLength(originalRotablesLength);
    });
  });

  describe('DISPOSE_ROTABLE', () => {
    it('should remove rotable, deduct credits, and reduce suspicion', () => {
      const rotable = createTestRotable();
      const state = createInventoryState({
        rotables: [rotable],
        resources: { ...createInventoryState().resources, credits: 600, suspicion: 50 },
      });

      const result = inventoryReducer(state, {
        type: 'DISPOSE_ROTABLE',
        payload: { rotableId: rotable.id },
      });

      expect(result.rotables).toHaveLength(0);
      expect(result.resources.credits).toBe(100); // 600 - 500
      expect(result.resources.suspicion).toBe(25); // 50 - 25
      expect(result.logs[0].text).toContain('Master');
    });

    it('should fail if insufficient credits', () => {
      const rotable = createTestRotable();
      const state = createInventoryState({
        rotables: [rotable],
        resources: { ...createInventoryState().resources, credits: 400 },
      });

      const result = inventoryReducer(state, {
        type: 'DISPOSE_ROTABLE',
        payload: { rotableId: rotable.id },
      });

      expect(result.rotables).toHaveLength(1); // Rotable still there
      expect(result.resources.credits).toBe(400); // No change
      expect(result.logs[0].text).toContain('cheap');
    });

    it('should clamp suspicion to 0 minimum', () => {
      const rotable = createTestRotable();
      const state = createInventoryState({
        rotables: [rotable],
        resources: { ...createInventoryState().resources, credits: 600, suspicion: 10 },
      });

      const result = inventoryReducer(state, {
        type: 'DISPOSE_ROTABLE',
        payload: { rotableId: rotable.id },
      });

      expect(result.resources.suspicion).toBe(0); // Max(0, 10 - 25)
    });
  });

  describe('REPAIR_ROTABLE', () => {
    it('should repair rotable and deduct resources', () => {
      const rotable = createTestRotable({ condition: 30 });
      const state = createInventoryState({
        rotables: [rotable],
        resources: { ...createInventoryState().resources, alclad: 100, credits: 100 },
      });

      const result = inventoryReducer(state, {
        type: 'REPAIR_ROTABLE',
        payload: { rotableId: rotable.id },
      });

      const repairedRotable = result.rotables.find((r) => r.id === rotable.id);
      expect(repairedRotable?.condition).toBe(100);
      expect(result.resources.alclad).toBe(50); // 100 - 50
      expect(result.resources.credits).toBe(75); // 100 - 25
      expect(result.stats.rotablesRepaired).toBe(1);
      expect(result.logs[0].text).toContain('REPAIRED');
    });

    it('should clear component failure event if rotable matches', () => {
      const rotable = createTestRotable({ condition: 30 });
      const state = createInventoryState({
        rotables: [rotable],
        flags: { ...createInventoryState().flags, activeComponentFailure: rotable.id },
        activeEvent: { type: 'component_failure' } as unknown as null,
        resources: { ...createInventoryState().resources, alclad: 100, credits: 100 },
      });

      const result = inventoryReducer(state, {
        type: 'REPAIR_ROTABLE',
        payload: { rotableId: rotable.id },
      });

      expect(result.flags.activeComponentFailure).toBeNull();
      expect(result.activeEvent).toBeNull();
      expect(result.logs).toHaveLength(2); // Repair + Drag eliminated
    });

    it('should fail if insufficient alclad', () => {
      const rotable = createTestRotable({ condition: 30 });
      const state = createInventoryState({
        rotables: [rotable],
        resources: { ...createInventoryState().resources, alclad: 40, credits: 100 },
      });

      const result = inventoryReducer(state, {
        type: 'REPAIR_ROTABLE',
        payload: { rotableId: rotable.id },
      });

      const unrepaired = result.rotables.find((r) => r.id === rotable.id);
      expect(unrepaired?.condition).toBe(30); // No change
      expect(result.logs[0].text).toContain('FAILED');
    });

    it('should fail if insufficient credits', () => {
      const rotable = createTestRotable({ condition: 30 });
      const state = createInventoryState({
        rotables: [rotable],
        resources: { ...createInventoryState().resources, alclad: 100, credits: 20 },
      });

      const result = inventoryReducer(state, {
        type: 'REPAIR_ROTABLE',
        payload: { rotableId: rotable.id },
      });

      const unrepaired = result.rotables.find((r) => r.id === rotable.id);
      expect(unrepaired?.condition).toBe(30); // No change
      expect(result.logs[0].text).toContain('FAILED');
    });
  });

  describe('GET_TOOLROOM_ITEM', () => {
    it('should add tool to inventory and set condition to 100', () => {
      const state = createInventoryState();

      const result = inventoryReducer(state, {
        type: 'GET_TOOLROOM_ITEM',
        payload: { key: 'torquemeter', label: 'Torque Meter', pn: 'TRQ-500' },
      });

      expect(result.inventory.torquemeter).toBe(true);
      expect(result.toolConditions['torquemeter']).toBe(100);
      expect(result.logs[0].text).toContain('CHECK-OUT');
    });
  });

  describe('DISPENSE_CONSUMABLE', () => {
    it('should dispense consumable and deduct credits', () => {
      const state = createInventoryState({
        resources: { ...createInventoryState().resources, credits: 100, rivets: 50 },
      });

      const result = inventoryReducer(state, {
        type: 'DISPENSE_CONSUMABLE',
        payload: { id: 'rivets', label: 'Rivets', unit: 'pack', cost: 20 },
      });

      expect(result.resources.credits).toBe(80); // 100 - 20
      expect(result.resources.rivets).toBe(51); // 50 + 1
      expect(result.logs[0].text).toContain('DISPENSED');
    });

    it('should fail if insufficient credits', () => {
      const state = createInventoryState({
        resources: { ...createInventoryState().resources, credits: 10, rivets: 50 },
      });

      const result = inventoryReducer(state, {
        type: 'DISPENSE_CONSUMABLE',
        payload: { id: 'rivets', label: 'Rivets', unit: 'pack', cost: 20 },
      });

      expect(result.resources.credits).toBe(10); // No change
      expect(result.resources.rivets).toBe(50); // No change
      expect(result.logs[0].text).toContain('CREDIT LIMIT');
    });
  });

  describe('REGISTER_ROTABLE', () => {
    it('should register normal rotable with serial number', () => {
      const restore = mockMathRandom('normal-rotable');
      Math.random = (() => {
        let count = 0;
        return () => {
          count++;
          if (count === 1) return 0.5; // ID generation
          if (count === 2) return 0.1; // isUntraceable check (false)
          if (count === 3) return 0.2; // isRedTagged check (false)
          return 0.5;
        };
      })();

      const state = createInventoryState();

      const result = inventoryReducer(state, {
        type: 'REGISTER_ROTABLE',
        payload: { label: 'New Component', pn: 'NEW-001' },
      });

      restore();

      expect(result.rotables).toHaveLength(1);
      const rotable = result.rotables[0];
      expect(rotable.label).toBe('New Component');
      expect(rotable.pn).toBe('NEW-001');
      expect(rotable.sn).toMatch(/^SN-/);
      expect(rotable.condition).toBe(100);
      expect(rotable.isUntraceable).toBe(false);
      expect(rotable.isRedTagged).toBe(false);
      expect(result.logs[0].text).toContain('REGISTERED');
    });

    it('should register untraceable rotable and increase suspicion when RNG triggers', () => {
      // Force untraceable by mocking Math.random to return value below 0.05
      const originalRandom = Math.random;
      let callCount = 0;
      Math.random = () => {
        callCount++;
        // First call: isUntraceableRotable() check - return true (below 0.05)
        if (callCount === 1) return 0.03;
        // Second call: isRedTaggedRotable() check - return false (above 0.08)
        if (callCount === 2) return 0.1;
        // Remaining calls: ID generation
        return 0.5;
      };

      const state = createInventoryState({
        resources: { ...createInventoryState().resources, suspicion: 10 },
      });

      const result = inventoryReducer(state, {
        type: 'REGISTER_ROTABLE',
        payload: { label: 'Shady Component', pn: 'SHADY-001' },
      });

      Math.random = originalRandom;

      expect(result.rotables).toHaveLength(1);
      const rotable = result.rotables[0];
      // Verify untraceable behavior
      expect(rotable.sn).toBe('UNTRACEABLE');
      expect(rotable.isUntraceable).toBe(true);
      expect(result.resources.suspicion).toBe(25); // 10 + 15
      expect(result.logs[0].text).toContain('rotable');
    });

    it('should register red-tagged rotable with 0 condition when RNG triggers', () => {
      // Force red-tagged by mocking Math.random to specific values
      const originalRandom = Math.random;
      let callCount = 0;
      Math.random = () => {
        callCount++;
        // isUntraceable check: return false (above 0.05)
        if (callCount === 1) return 0.1;
        // isRedTagged check: return true (below 0.08)
        if (callCount === 2) return 0.05;
        // Default for ID generation
        return 0.5;
      };

      const state = createInventoryState();

      const result = inventoryReducer(state, {
        type: 'REGISTER_ROTABLE',
        payload: { label: 'Broken Component', pn: 'BROKEN-001' },
      });

      Math.random = originalRandom;

      expect(result.rotables).toHaveLength(1);
      const rotable = result.rotables[0];
      expect(rotable.condition).toBe(0);
      expect(rotable.isRedTagged).toBe(true);
      expect(result.logs[0].text).toContain('RED TAG');
    });
  });

  describe('MIX_PAINT', () => {
    it('should mix paint, consume MEK, and increase noise exposure', () => {
      const state = createInventoryState({
        resources: { ...createInventoryState().resources, mek: 3 },
        inventory: { ...createInventoryState().inventory, mixedTouchUpPaint: 0 },
      });

      const result = inventoryReducer(state, {
        type: 'MIX_PAINT',
        payload: {},
      });

      expect(result.resources.mek).toBe(2); // 3 - 1
      expect(result.inventory.mixedTouchUpPaint).toBe(100);
      expect(result.hfStats.noiseExposure).toBe(5);
      expect(result.logs[0].text).toContain('Alodine');
    });

    it('should fail if no MEK available', () => {
      const state = createInventoryState({
        resources: { ...createInventoryState().resources, mek: 0 },
      });

      const result = inventoryReducer(state, {
        type: 'MIX_PAINT',
        payload: {},
      });

      expect(result.resources.mek).toBe(0);
      expect(result.logs[0].text).toContain('DEPLETED');
    });
  });

  describe('SONIC_CLEAN', () => {
    it('should clean with sonic cleaner and gain experience', () => {
      const state = createInventoryState({
        inventory: { ...createInventoryState().inventory, sonicCleaner: true },
      });

      const result = inventoryReducer(state, {
        type: 'SONIC_CLEAN',
        payload: {},
      });

      expect(result.hfStats.socialStress).toBe(10);
      expect(result.resources.experience).toBe(50);
      expect(result.logs[0].text).toContain('sonic');
    });

    it('should do nothing if no sonic cleaner', () => {
      const state = createInventoryState({
        inventory: { ...createInventoryState().inventory, sonicCleaner: false },
      });

      const result = inventoryReducer(state, {
        type: 'SONIC_CLEAN',
        payload: {},
      });

      expect(result.hfStats.socialStress).toBe(0);
      expect(result.logs).toHaveLength(0);
    });
  });

  describe('REPAIR_TOOL', () => {
    it('should repair tool condition to 100', () => {
      const state = createInventoryState({
        toolConditions: { torquemeter: 50 },
        resources: { ...createInventoryState().resources, alclad: 100 },
      });

      const result = inventoryReducer(state, {
        type: 'REPAIR_TOOL',
        payload: { id: 'torquemeter', label: 'Torque Meter' },
      });

      expect(result.toolConditions['torquemeter']).toBe(100);
      expect(result.resources.alclad).toBe(70); // 100 - 30
      expect(result.logs[0].text).toContain('Serviced');
    });

    it('should not repair if insufficient alclad', () => {
      const state = createInventoryState({
        toolConditions: { torquemeter: 50 },
        resources: { ...createInventoryState().resources, alclad: 20 },
      });

      const result = inventoryReducer(state, {
        type: 'REPAIR_TOOL',
        payload: { id: 'torquemeter', label: 'Torque Meter' },
      });

      expect(result.toolConditions['torquemeter']).toBe(50); // No change
      expect(result.logs).toHaveLength(0);
    });
  });

  describe('START_CALIBRATION_MINIGAME', () => {
    it('should start calibration minigame and deduct credits', () => {
      const state = createInventoryState({
        resources: { ...createInventoryState().resources, credits: 100 },
      });

      const result = inventoryReducer(state, {
        type: 'START_CALIBRATION_MINIGAME',
        payload: { key: 'torquemeter', label: 'Torque Meter' },
      });

      expect(result.calibrationMinigame.active).toBe(true);
      expect(result.calibrationMinigame.toolId).toBe('torquemeter');
      expect(result.calibrationMinigame.toolLabel).toBe('Torque Meter');
      expect(result.resources.credits).toBe(60); // 100 - 40
    });

    it('should not start if insufficient credits', () => {
      const state = createInventoryState({
        resources: { ...createInventoryState().resources, credits: 30 },
      });

      const result = inventoryReducer(state, {
        type: 'START_CALIBRATION_MINIGAME',
        payload: { key: 'torquemeter', label: 'Torque Meter' },
      });

      expect(result.calibrationMinigame.active).toBe(false);
      expect(result.resources.credits).toBe(30);
    });
  });

  describe('FINISH_CALIBRATION_MINIGAME', () => {
    it('should handle perfect calibration', () => {
      const state = createInventoryState({
        calibrationMinigame: { active: true, toolId: 'torquemeter', toolLabel: 'Torque Meter' },
        toolConditions: { torquemeter: 80 },
      });

      const result = inventoryReducer(state, {
        type: 'FINISH_CALIBRATION_MINIGAME',
        payload: { toolId: 'torquemeter', result: 'perfect' },
      });

      expect(result.calibrationMinigame.active).toBe(false);
      expect(result.toolConditions['torquemeter']).toBe(100);
      expect(result.hfStats.efficiencyBoost).toBe(30000);
      expect(result.logs[0].text).toContain('Perfect');
    });

    it('should handle good calibration', () => {
      const state = createInventoryState({
        calibrationMinigame: { active: true, toolId: 'torquemeter', toolLabel: 'Torque Meter' },
        toolConditions: { torquemeter: 80 },
      });

      const result = inventoryReducer(state, {
        type: 'FINISH_CALIBRATION_MINIGAME',
        payload: { toolId: 'torquemeter', result: 'good' },
      });

      expect(result.calibrationMinigame.active).toBe(false);
      expect(result.toolConditions['torquemeter']).toBe(100);
      expect(result.hfStats.efficiencyBoost).toBe(0);
      expect(result.logs[0].text).toContain('successful');
    });

    it('should handle failed calibration and anger Master', () => {
      const state = createInventoryState({
        calibrationMinigame: { active: true, toolId: 'torquemeter', toolLabel: 'Torque Meter' },
        toolConditions: { torquemeter: 80 },
      });

      const result = inventoryReducer(state, {
        type: 'FINISH_CALIBRATION_MINIGAME',
        payload: { toolId: 'torquemeter', result: 'fail' },
      });

      expect(result.calibrationMinigame.active).toBe(false);
      expect(result.toolConditions['torquemeter']).toBe(55); // 80 - 25
      expect(result.flags.toolroomMasterPissed).toBe(true);
      expect(result.hfStats.toolroomMasterCooldown).toBe(300000);
      expect(result.logs[0].text).toContain('failed');
    });

    it('should clamp tool condition to 0 minimum on failure', () => {
      const state = createInventoryState({
        calibrationMinigame: { active: true, toolId: 'torquemeter', toolLabel: 'Torque Meter' },
        toolConditions: { torquemeter: 20 },
      });

      const result = inventoryReducer(state, {
        type: 'FINISH_CALIBRATION_MINIGAME',
        payload: { toolId: 'torquemeter', result: 'fail' },
      });

      expect(result.toolConditions['torquemeter']).toBe(0); // Max(0, 20 - 25)
    });
  });

  describe('ASK_MASTER_LORE', () => {
    it('should provide lore when Master is not pissed', () => {
      const state = createInventoryState({
        flags: { ...createInventoryState().flags, toolroomMasterPissed: false },
      });

      const result = inventoryReducer(state, {
        type: 'ASK_MASTER_LORE',
        payload: {},
      });

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].text).toBeTruthy();
    });

    it('should refuse to talk when Master is pissed', () => {
      const state = createInventoryState({
        flags: { ...createInventoryState().flags, toolroomMasterPissed: true },
      });

      const result = inventoryReducer(state, {
        type: 'ASK_MASTER_LORE',
        payload: {},
      });

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].text).toContain('glares');
    });
  });

  describe('TOOLROOM_MASTER_TALK', () => {
    it('should provide dialogue and restore sanity', () => {
      const state = createInventoryState({
        resources: { ...createInventoryState().resources, sanity: 80 },
      });

      const result = inventoryReducer(state, {
        type: 'TOOLROOM_MASTER_TALK',
        payload: {},
      });

      expect(result.resources.sanity).toBe(82); // 80 + 2
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].text).toBeTruthy();
    });

    it('should clamp sanity to 100 maximum', () => {
      const state = createInventoryState({
        resources: { ...createInventoryState().resources, sanity: 99 },
      });

      const result = inventoryReducer(state, {
        type: 'TOOLROOM_MASTER_TALK',
        payload: {},
      });

      expect(result.resources.sanity).toBe(100); // Min(100, 99 + 2)
    });
  });
});
