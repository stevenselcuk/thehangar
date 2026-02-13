import { ComponentHistoryEntry, RotableItem } from '../types';

const TAIL_NUMBERS = [
  'N134DA',
  'N666EV',
  'N404NF',
  'N815PA',
  'N971AA',
  'EI-ORD',
  'F-GZTA',
  'JA8119',
  '9M-MRO',
  'N293AY',
];

const INCIDENT_DESCRIPTIONS = [
  'Lightning strike damage repair.',
  'Hard landing inspection - passed.',
  'Removed due to unexplained vibration.',
  'Contaminated with unknown fluid.',
  'Found in wreckage of [REDACTED].',
  'Serial number mismatch resolved administratively.',
  'Unit emitted static when unpowered.',
];

const REPAIR_DESCRIPTIONS = [
  'Replaced seals and bearings.',
  'Cleaned contacts with isopropyl alcohol.',
  'Exorcism ritual performed (Standard).',
  'Firmware reflashed to version 6.6.6.',
  'Lubricated with Aeroshell 33.',
];

export const generateComponentHistory = (
  componentId: string,
  isUntraceable: boolean
): ComponentHistoryEntry[] => {
  const history: ComponentHistoryEntry[] = [];
  const now = Date.now();
  const yearMs = 31536000000;
  // Random age between 1 and 20 years
  const age = Math.floor(Math.random() * 20 * yearMs) + yearMs;
  const manufactureDate = now - age;

  // 1. Manufactured
  history.push({
    date: manufactureDate,
    event: 'MANUFACTURED',
    description: isUntraceable
      ? 'Origin Redacted. Lot #000-000.'
      : `Manufactured by OEM. DOM: ${new Date(manufactureDate).getFullYear()}.`,
  });

  if (isUntraceable) {
    // Untraceable items have gaps or weird entries
    history.push({
      date: manufactureDate + yearMs * 2,
      event: 'INCIDENT',
      description: 'Chain of custody lost. Catalogued in deep storage.',
    });
    return history;
  }

  // Generate 1-5 intermediate events
  const numEvents = Math.floor(Math.random() * 5) + 1;
  let lastDate = manufactureDate;

  for (let i = 0; i < numEvents; i++) {
    const nextDate = lastDate + Math.random() * (now - lastDate);
    const eventTypeRoll = Math.random();
    const donor = TAIL_NUMBERS[Math.floor(Math.random() * TAIL_NUMBERS.length)];

    if (eventTypeRoll < 0.4) {
      history.push({
        date: nextDate,
        event: 'INSTALLED',
        description: 'Installed during C-Check.',
        aircraftStart: donor,
      });
    } else if (eventTypeRoll < 0.7) {
      history.push({
        date: nextDate,
        event: 'REMOVED',
        description: 'Removed for time expiration.',
        aircraftEnd: donor,
      });
    } else if (eventTypeRoll < 0.9) {
      history.push({
        date: nextDate,
        event: 'REPAIRED',
        description: REPAIR_DESCRIPTIONS[Math.floor(Math.random() * REPAIR_DESCRIPTIONS.length)],
      });
    } else {
      history.push({
        date: nextDate,
        event: 'INCIDENT',
        description:
          INCIDENT_DESCRIPTIONS[Math.floor(Math.random() * INCIDENT_DESCRIPTIONS.length)],
        aircraftEnd: donor,
      });
    }
    lastDate = nextDate;
  }

  return history.sort((a, b) => a.date - b.date);
};

export interface SynergyEffect {
  name: string;
  description: string;
  efficiencyBonus?: number;
  sanityDrain?: number;
  suspicionIncrease?: number;
  logMessage: string;
}

export const checkComponentSynergy = (installedRotables: RotableItem[]): SynergyEffect | null => {
  if (installedRotables.length < 2) return null;

  // 1. Check for Same Donor (Harmonic Resonance)
  const donors = installedRotables
    .filter((r) => r.donorAircraft)
    .map((r) => r.donorAircraft as string);

  // Count occurrences
  const donorCounts: Record<string, number> = {};
  donors.forEach((d) => {
    donorCounts[d] = (donorCounts[d] || 0) + 1;
  });

  const matchingDonor = Object.entries(donorCounts).find(([_, count]) => count >= 2);

  if (matchingDonor) {
    const tail = matchingDonor[0];
    if (tail === '9M-MRO' || tail === 'N404NF') {
      return {
        name: 'Cursed Reunion',
        description: 'Components from a lost aircraft are reuniting.',
        sanityDrain: 5,
        efficiencyBonus: 0.5,
        logMessage: `The components from ${tail} are humming in unison. It sounds like weeping.`,
        suspicionIncrease: 10,
      };
    }

    return {
      name: 'Harmonic Resonance',
      description: 'Components from the same donor aircraft work together perfectly.',
      efficiencyBonus: 0.2,
      logMessage: `Systems synced. Components from donor ${matchingDonor[0]} are resonating effectively.`,
    };
  }

  // 2. Untraceable Conflict
  const untraceableCount = installedRotables.filter((r) => r.isUntraceable).length;
  if (untraceableCount >= 3) {
    return {
      name: 'Shadow Network',
      description: 'Too many black market parts creates a localized reality distortion.',
      sanityDrain: 2,
      suspicionIncrease: 5,
      logMessage:
        'The untraceable components are vibrating. The air around the avionics bay ripples.',
    };
  }

  return null;
};
