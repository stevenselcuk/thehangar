export const ASCII_ART = {
  HEADER: [
    '    ________________',
    '   /_______________/\\',
    '   \\ \\            / /',
    '    \\ \\    ______/_/_______',
    '     \\ \\  /\\______________/\\',
    '   ___\\ \\_\\_\\__/ /_      / /',
    '  /\\___\\ \\____/ /__\\    / /',
    '  \\ \\   \\ \\ \\ \\/ / /   / /',
    '   \\ \\   \\ \\/\\ \\/ /   / /',
    '    \\ \\   \\/_/\\/ /   / /',
    '     \\ \\      / /\\  / /',
    '      \\ \\    / /\\ \\/ /',
    '       \\ \\  / /  \\_\\/',
    '        \\ \\/ /',
    '         \\/_/',
  ],
  ALIEN: [
    '      .   .       ',
    '      |\\ /|      ',
    '     /_o_o_\\     ',
    '    ( ._. )      ',
    '     \\___/       ',
  ],
  EYE: [
    '      /` .  `\\ ',
    '     /  _ ._  \\',
    '    |  (o)(o)  |',
    '     \\   L    / ',
    '      \\ .__. /  ',
  ],
};

export const TERMINAL_FILES: Record<
  string,
  { type: 'text' | 'encrypted'; content: string[]; reqFlags?: string[] }
> = {
  'manifest_407.txt': {
    type: 'text',
    content: [
      'FLIGHT 407 CARGO MANIFEST',
      'ORIGIN: [REDACTED]',
      'DESTINATION: HANGAR 4',
      '--------------------------------',
      'ITEM 1: AVIIONICS SUITE (STANDARD)',
      'ITEM 2: CRATE 77-B (DO NOT OPEN)',
      'ITEM 3: BIO-SAMPLES (CAT 5 HAZARD)',
      '--------------------------------',
      'NOTE: Handling crew reported nausea.',
    ],
  },
  'personnel_log.db': {
    type: 'encrypted',
    content: [
      'ACCESSING PERSONNEL DATABASE...',
      'ERROR: CORRUPT SECTORS FOUND',
      '--------------------------------',
      'USER: MORLEY, T.',
      'STATUS: DECEASED (OFFICIAL) / TRANSFERRED (INTERNAL)',
      'NOTE: Subject showed signs of [REDACTED] infection.',
      '--------------------------------',
      'USER: YOU',
      'STATUS: ACTIVE',
      'NOTE: Keep under surveillance. Efficiency exceeds parameters.',
    ],
    reqFlags: ['foundRetiredIDCard'],
  },
  'project_blue_truth.txt': {
    type: 'text',
    content: [
      'PROJECT BLUE TRUTH',
      '------------------',
      'The greys are a lie. The government is a lie.',
      'They are distracting you from the [REDACTED] that lives below terminal 3.',
      'Don not trust the suits. Don not trust the voices.',
      'Trust the machine.',
    ],
    reqFlags: ['revealedTruth'],
  },
  'conspiracy.log': {
    type: 'text',
    content: [
      'CONSPIRACY LOG ENTRY #481',
      'We saw them move the "weather balloon" last night.',
      'It was bleeding.',
      'Why does a balloon bleed?',
    ],
  },
};

export const HELP_TEXT = [
  'AVAILABLE COMMANDS:',
  '  help                  - Displays this list of commands.',
  '  dir / ls              - List files in current directory',
  '  open / access <id>    - Open a file or archive (e.g., access manifest_407)',
  '  query <employee_id>   - Retrieves a personnel file. (e.g., query HEMLOCK)',
  '  cls / clear           - Clear screen',
  '  whoami                - Display user info',
  '  exit                  - Close terminal',
];
