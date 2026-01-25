import { Inventory, TabType } from '../../types';
import { checkLocationRequirements } from '../locationRequirements';

describe('checkLocationRequirements', () => {
  const mockInventory: Inventory = {
    flashlight: false,
    radio: false,
    earmuffs: false,
    // ... complete minimal mock if needed, but TS might complain if incomplete.
    // Casting for brevity since we only care about keys tested.
  } as unknown as Inventory;

  test('Backshops requires flashlight (soft)', () => {
    const result = checkLocationRequirements(TabType.BACKSHOPS, {
      ...mockInventory,
      flashlight: false,
    });
    expect(result.satisfied).toBe(true); // Since it's a soft requirement, technically satisfied? No, logic says satisfied only if required items are met. Soft don't block?
    // Let's re-read logic: satisfied = missingRequired.length === 0.
    // Backshops has soft reqs. So satisfied should be true.
    expect(result.missingRequired).toHaveLength(0);
    expect(result.missingSoft).toHaveLength(1);
    expect(result.missingSoft[0].key).toBe('flashlight');
  });

  test('Backshops satisfying flashlight', () => {
    const result = checkLocationRequirements(TabType.BACKSHOPS, {
      ...mockInventory,
      flashlight: true,
    });
    expect(result.satisfied).toBe(true);
    expect(result.missingSoft).toHaveLength(0);
  });

  test('Apron requires Earmuffs and Radio (soft)', () => {
    const result = checkLocationRequirements(TabType.APRON_LINE, mockInventory);
    expect(result.missingSoft).toHaveLength(2);
    expect(result.missingSoft.map((i) => i.key)).toContain('earmuffs');
    expect(result.missingSoft.map((i) => i.key)).toContain('radio');
  });

  test('Apron satisfying Earmuffs', () => {
    const result = checkLocationRequirements(TabType.APRON_LINE, {
      ...mockInventory,
      earmuffs: true,
    });
    expect(result.missingSoft).toHaveLength(1);
    expect(result.missingSoft[0].key).toBe('radio');
  });
});
