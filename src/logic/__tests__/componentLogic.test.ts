import { describe, expect, it } from 'vitest';
import { RotableItem } from '../../types';
import { checkComponentSynergy, generateComponentHistory } from '../componentLogic';

describe('componentLogic', () => {
  describe('generateComponentHistory', () => {
    it('should generate history for a standard component', () => {
      const history = generateComponentHistory('test-id', false);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].event).toBe('MANUFACTURED');
      // Ensure specific fields
      expect(history[0]).toHaveProperty('date');
      expect(history[0]).toHaveProperty('description');
    });

    it('should generate history for an untraceable component', () => {
      const history = generateComponentHistory('sus-id', true);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].description).toContain('Redacted');
      // Check for gap/incident
      const hasGap = history.some((h) => h.description.includes('Chain of custody lost'));
      expect(hasGap).toBe(true);
    });
  });

  describe('checkComponentSynergy', () => {
    it('should return null for single component', () => {
      const components: RotableItem[] = [
        {
          id: '1',
          label: 'C1',
          pn: 'P1',
          sn: 'S1',
          condition: 100,
          isInstalled: true,
          isUntraceable: false,
          history: [],
          manufactureDate: 0,
          donorAircraft: 'N123',
        },
      ];
      expect(checkComponentSynergy(components)).toBeNull();
    });

    it('should detect Harmonic Resonance (matching donor)', () => {
      const components: RotableItem[] = [
        {
          id: '1',
          label: 'C1',
          pn: 'P1',
          sn: 'S1',
          condition: 100,
          isInstalled: true,
          isUntraceable: false,
          history: [],
          manufactureDate: 0,
          donorAircraft: 'N123',
        },
        {
          id: '2',
          label: 'C2',
          pn: 'P2',
          sn: 'S2',
          condition: 100,
          isInstalled: true,
          isUntraceable: false,
          history: [],
          manufactureDate: 0,
          donorAircraft: 'N123',
        },
      ];
      const effect = checkComponentSynergy(components);
      expect(effect).not.toBeNull();
      expect(effect?.name).toBe('Harmonic Resonance');
    });

    it('should detect Shadow Network (too many untraceables)', () => {
      const components: RotableItem[] = [
        {
          id: '1',
          label: 'C1',
          pn: 'P1',
          sn: 'S1',
          condition: 100,
          isInstalled: true,
          isUntraceable: true,
          history: [],
          manufactureDate: 0,
        },
        {
          id: '2',
          label: 'C2',
          pn: 'P2',
          sn: 'S2',
          condition: 100,
          isInstalled: true,
          isUntraceable: true,
          history: [],
          manufactureDate: 0,
        },
        {
          id: '3',
          label: 'C3',
          pn: 'P3',
          sn: 'S3',
          condition: 100,
          isInstalled: true,
          isUntraceable: true,
          history: [],
          manufactureDate: 0,
        },
      ];
      const effect = checkComponentSynergy(components);
      expect(effect).not.toBeNull();
      expect(effect?.name).toBe('Shadow Network');
    });
  });
});
