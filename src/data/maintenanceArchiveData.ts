export const maintenanceLogs: Record<string, { title: string; content: string[] }> = {
  'LOG-481516': {
    title: 'B777-200ER - C-Check Anomaly Report',
    content: [
      'Entry by: O. Hemlock',
      '-----------------',
      'During routine C-Check on aircraft [REDACTED], noted unusual wear on Section 41 fuselage stringers.',
      'Ultrasonic NDT revealed micro-fractures inconsistent with standard metal fatigue.',
      'The fractures appear to be propagating from a non-standard, unlisted component attached to the main data bus.',
      'Component is cold to the touch, absorbs light, and emits a low-frequency hum.',
      "Attempted to cross-reference P/N. System returned 'ACCESS DENIED'.",
      "Filed report with management. Was told to sign off the check as 'COMPLETE' and disregard findings.",
      'Something is wrong here.',
    ],
  },
  'LOG-2342': {
    title: 'A300F - Cargo Incident #2342',
    content: [
      'Entry by: [REDACTED]',
      '-----------------',
      'Main cargo door hydraulics failed during operation.',
      "ULD container marked 'GEOLOGICAL SAMPLES' was found to have shifted, causing minor internal damage.",
      'Container was observed to be vibrating and emitting a low hum.',
      'Temperature inside the container was recorded at -50°C despite ambient temp of 25°C.',
      "Report filed. Manifest has been updated to 'TEXTILES'. All previous records purged.",
    ],
  },
  'LOG-7700': {
    title: 'MD-80 - Transponder Anomaly',
    content: [
      'Entry by: Tech 451',
      '-----------------',
      'Aircraft squawked 7700 (Emergency) for 3 seconds while powered down on the ramp.',
      'No active faults found in transponder unit. System check is green.',
      'Avionics reports no other aircraft in the vicinity experienced similar issues.',
      "Logged as 'spurious emission'. Re-racked unit. If it happens again, recommend replacement.",
    ],
  },
};

export const partInfo: Record<string, { description: string; notes: string[] }> = {
  '9M-MRO': {
    description: 'B777-200ER, Last known registration.',
    notes: [
      'MAINTENANCE RECORD: [LOCKED - CLEARANCE 3 REQUIRED]',
      'FLIGHT LOG: [LOCKED - CLEARANCE 4 REQUIRED]',
      'CURRENT STATUS: [UNKNOWN]',
    ],
  },
  'BMS-5-95': {
    description: 'Standard fuselage sealant.',
    notes: [
      'Application note: Ensure surface is clean of all biological contaminants before application.',
      'Unusual property: Shows temporary bioluminescence when exposed to certain RF frequencies.',
    ],
  },
  'IDG-757-A': {
    description: 'Integrated Drive Generator',
    notes: [
      'Known issue: Prone to harmonic resonance when exposed to [REDACTED] frequencies.',
      'Service bulletin SB-757-IDG-042 recommends weekly inspections for micro-fractures.',
    ],
  },
};
