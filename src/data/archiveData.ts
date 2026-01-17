export const employeeFiles: Record<
  string,
  { name: string; id: string; status: string; notes: string[] }
> = {
  HEMLOCK: {
    name: 'HEMLOCK, Oswald',
    id: '349-M-3M-HEM',
    status: '[TERMINATED]',
    notes: [
      'Veteran Toolroom Master. Served 35 years.',
      "Repeatedly flagged for 'unauthorized archival research'.",
      "Filed multiple incident reports regarding 'acoustic anomalies' in Hangar Bay 4.",
      'Final Entry: [REDACTED]. Subject retired due to health concerns. See Medical File #HEM-003.',
    ],
  },
  '9M-MRO-PILOT': {
    name: '[REDACTED]',
    id: '[REDACTED]',
    status: '[ACTIVE_MISSING]',
    notes: [
      'File content has been migrated to [REDACTED_ARCHIVE: INCIDENT_9M-MRO].',
      'No further entries permitted.',
    ],
  },
};

export const redactedArchives: Record<
  string,
  {
    title: string;
    clearance: number;
    cost?: { type: 'kardexFragments'; amount: number };
    content: string[];
  }
> = {
  'INCIDENT_9M-MRO': {
    title: 'INCIDENT REPORT: 9M-MRO',
    clearance: 2,
    cost: { type: 'kardexFragments', amount: 1 },
    content: [
      'FLIGHT DATA RECORDER -- PARTIAL RECOVERY:',
      "AUDIO LOG: ...uala Lumpur Tower, this is Malaysia Three Seven Zero... there is [STATIC] else on board... it's wearing the [REDACTED]'s face...",
      'TELEMETRY: [REDACTED]... impossible rate of climb... [REDACTED]... temperature drop in fwd cargo hold to -90°C.',
      "CARGO MANIFEST (DECRYPTED): Item #4 - 'BIOLOGICAL SPECIMEN - VOID-CLASS CONTAINMENT'.",
      "CONCLUSION: Official report to maintain 'Navigational Error' narrative. All assets related to Project [REDACTED] are now active. Hangar Bay 4 is primary receiving station.",
    ],
  },
  PROJECT_KARDEX: {
    title: 'PROJECT: KARDEX - OVERVIEW',
    clearance: 3,
    cost: { type: 'kardexFragments', amount: 3 },
    content: [
      'OBJECTIVE: Analysis and reverse-engineering of non-terrestrial, trans-dimensional artifacts.',
      "METHOD: Certain airframes (See 'Special Variant' list) are retrofitted with [REDACTED] components to act as mobile containment and study platforms.",
      "The 'KARDEX' is not just a database; it is a bio-digital index linking physical artifacts to their temporal and spatial origin points.",
      'OPERATIVE STATUS: Night Shift personnel are designated as unknowing caretakers. Their high turnover and psychological degradation are considered acceptable operational parameters.',
    ],
  },
  SUITS_PERSONNEL: {
    title: 'PERSONNEL FILE: [UNSPECIFIED]',
    clearance: 4,
    cost: { type: 'kardexFragments', amount: 5 },
    content: [
      'NAME: [NULL]',
      'ID: [NULL]',
      'STATUS: [OBSERVER]',
      'NOTES: File integrity compromised. Data loops on access. [WARNING: QUERYING THIS FILE HAS A 97% CHANCE OF TRIGGERING A LOCALIZED REALITY DEGRADATION EVENT]. Do not proceed.',
    ],
  },
};
