import { describe, expect, it } from 'vitest';
import { eventsData } from '../../src/data/events';
import { Item, itemsData } from '../../src/data/items';
import { EventChoice, GameEvent } from '../../src/types';

describe('Game Data Integrity', () => {
  describe('Items Data', () => {
    it('should have unique IDs across all categories', () => {
      const allIds = new Set<string>();
      const categories = Object.keys(itemsData);

      categories.forEach((category) => {
        itemsData[category].forEach((item: Item) => {
          expect(allIds.has(item.id)).toBe(false);
          allIds.add(item.id);
        });
      });
    });

    it('should have valid description structure (sanity system)', () => {
      Object.values(itemsData)
        .flat()
        .forEach((item: Item) => {
          expect(item.description).toHaveProperty('normal');
          expect(item.description).toHaveProperty('unsettled');
          expect(item.description).toHaveProperty('madness');

          expect(typeof item.description.normal).toBe('string');
          expect(typeof item.description.unsettled).toBe('string');
          expect(typeof item.description.madness).toBe('string');

          expect(item.description.normal.length).toBeGreaterThan(0);
          expect(item.description.unsettled.length).toBeGreaterThan(0);
          expect(item.description.madness.length).toBeGreaterThan(0);
        });
    });

    it('should have valid categories', () => {
      const validCategories = ['tool', 'line', 'carried', 'consumable', 'rotable', undefined];

      Object.values(itemsData)
        .flat()
        .forEach((item: Item) => {
          // rotable items might verify differently if they are in 'rotables' array but not explicitly marked with category content-wise,
          // but based on types, if category is present it must be valid.
          if (item.category) {
            expect(validCategories).toContain(item.category);
          }
        });
    });
  });

  describe('Events Data', () => {
    it('should have valid event structures for all categories', () => {
      const categories = Object.keys(eventsData);
      expect(categories).toContain('audit');
      expect(categories).toContain('accident');
      expect(categories).toContain('incident');
      expect(categories).toContain('bureaucratic_horror');
      expect(categories).toContain('eldritch_manifestation');
      expect(categories).toContain('canteen_incident');

      Object.entries(eventsData).forEach(([_, events]) => {
        events.forEach((event: Partial<GameEvent>) => {
          // Type assertion handled by check
          expect(event).toHaveProperty('id');
          expect(event).toHaveProperty('title');
          expect(event).toHaveProperty('description');
          expect(event).toHaveProperty('totalTime');
        });
      });
    });

    it('should have valid suit types where applicable', () => {
      const validSuits = [
        'FAA_INSPECTOR',
        'INTERNAL_SECURITY',
        'THE_SUITS',
        'EASA_AUDITOR',
        'NONE',
      ];

      const auditEvents = eventsData['audit'] || [];
      auditEvents.forEach((event: Partial<GameEvent>) => {
        if (event.suitType) {
          expect(validSuits).toContain(event.suitType);
        }
      });
    });

    it('should have valid choice costs (Sanity/Focus/Credits)', () => {
      const allEvents = Object.values(eventsData).flat();

      allEvents.forEach((event: GameEvent) => {
        if (event.choices) {
          event.choices.forEach((choice: EventChoice) => {
            if (choice.cost) {
              expect(['sanity', 'focus', 'credits', 'experience', 'suspicion']).toContain(
                choice.cost.resource
              );
              expect(choice.cost.amount).toBeGreaterThan(0);
            }
          });
        }
      });
    });

    it('should have valid effects and story flags', () => {
      const allEvents = Object.values(eventsData).flat();

      allEvents.forEach((event: GameEvent) => {
        // Check success/failure outcomes
        if (event.failureOutcome) {
          expect(event.failureOutcome.log).toBeDefined();
        }
        if (event.successOutcome) {
          expect(event.successOutcome.log).toBeDefined();
        }

        // Check choices for story flags
        if (event.choices) {
          event.choices.forEach((choice) => {
            if (choice.storyFlag) {
              expect(choice.storyFlag).toHaveProperty('key');
              expect(choice.storyFlag).toHaveProperty('value');
              expect(typeof choice.storyFlag.key).toBe('string');
            }
          });
        }
      });
    });
  });
});
