import { EnvironmentalHazard } from '../types.ts';

export const hazardsData: EnvironmentalHazard[] = [
  {
    id: 'THUNDERSTORM',
    type: 'weather',
    name: 'Severe Thunderstorm',
    description:
      'Lightning flashes outside. The hangar groans under the wind and rain. All tarmac operations are suspended, and the noise is affecting your focus.',
    effects: {
      tarmacActionsDisabled: true,
      focusCostModifier: 1.1, // 10% increase
      sanityDrain: 0.05, // per second
      randomEvent: { type: 'accident', id: 'POWER_SURGE', chance: 0.005 },
    },
    duration: 300000, // 5 minutes
  },
  {
    id: 'POWER_SURGE_HAZARD',
    type: 'system_failure',
    name: 'Power Fluctuations',
    description:
      'A major power surge has left the hangar on emergency lighting. Systems are unstable, and the darkness feels... heavy.',
    effects: {
      focusCostModifier: 1.25, // 25% increase
      sanityDrain: 0.1,
      randomEvent: { type: 'eldritch_manifestation', id: 'MEZZANINE_OBSERVATION', chance: 0.01 },
    },
    duration: 120000,
  },
  {
    id: 'TOXIC_FUMES',
    name: 'Toxic Fumes',
    description: 'Ventilation failure. Chemical vapors are accumulating.',
    type: 'containment',
    effects: {
      sanityDrain: 2,
      healthDrain: 1.5,
      focusCostModifier: 2,
      randomEvent: { type: 'bureaucratic_horror', id: 'OSHA_VIOLATION', chance: 0.1 },
    },
    duration: 60000,
  },
];
