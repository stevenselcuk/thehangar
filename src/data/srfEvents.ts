import { GameEvent } from '../types';

type EventTemplates = Omit<GameEvent, 'timeLeft'>;

export const srfEvents: EventTemplates[] = [
  {
    id: 'SRF_CHAIN_1',
    type: 'incident',
    title: 'THE GLITCH',
    description:
      'An SRF you just filed re-opens itself, but the aircraft registration has changed to a flight that crashed in 1985. The text is blinking.',
    totalTime: 30000,
    choices: [
      {
        id: 'investigate',
        label: 'Investigate Discrepancy',
        cost: { resource: 'sanity', amount: 5 },
        log: 'You delve into the archives. The old flight logs are redacted, but you find a reference code.',
        effects: { experience: 100 },
        nextEventId: 'incident:SRF_CHAIN_2',
      },
      {
        id: 'delete',
        label: 'Delete the Form',
        log: 'You firmly press DELETE. The screen goes blank for a second, then returns to normal.',
        effects: { sanity: 5 },
      },
    ],
    failureOutcome: {
      log: 'The form auto-closes and deletes itself. You feel like you missed something important.',
      effects: { focus: -5 },
    },
  },
  {
    id: 'SRF_CHAIN_2',
    type: 'incident',
    title: 'THE CALL',
    description:
      'The internal phone rings. A synthesized voice quotes the exact text of your SRF, backwards.',
    totalTime: 30000,
    choices: [
      {
        id: 'listen',
        label: 'Keep Listening',
        cost: { resource: 'sanity', amount: 10 },
        log: 'The voice ends with a string of numbers that sound like coordinates for a parts bin.',
        effects: { experience: 150 },
        nextEventId: 'incident:SRF_CHAIN_3',
      },
      {
        id: 'hangup',
        label: 'Hang Up',
        log: 'You slam the receiver down. Some things are better left unknown.',
        effects: { focus: 5 },
      },
    ],
    failureOutcome: {
      log: 'The line goes dead with a horrible screech of static that gives you a migraine.',
      effects: { sanity: -10 },
    },
  },
  {
    id: 'SRF_CHAIN_3',
    type: 'incident',
    title: 'THE MISSING PART',
    description:
      "You check the bin mentioned on the phone. Inside is a replacement component. It's cold, heavy, and has no seams or serial numbers.",
    totalTime: 30000,
    choices: [
      {
        id: 'install',
        label: 'Install the Part',
        cost: { resource: 'focus', amount: 20 },
        log: 'It fits perfectly. The aircraft hums with a new, strange resonance.',
        effects: { experience: 200, suspicion: 5 },
        nextEventId: 'incident:SRF_CHAIN_4',
      },
      {
        id: 'quarantine',
        label: 'Quarantine the Part',
        log: 'You lock it in a hazard box. When you check later, the box is empty.',
        effects: { sanity: -5 },
      },
    ],
    failureOutcome: {
      log: 'While you were deciding, a coworker picked it up and walked away with a blank stare.',
      effects: { suspicion: 10 },
    },
  },
  {
    id: 'SRF_CHAIN_4',
    type: 'audit',
    suitType: 'THE_SUITS',
    title: 'THE INSPECTION',
    description:
      "A Suit arrives to document the installation of that specific component. He doesn't introduce himself. He just points a device at the part.",
    totalTime: 40000,
    choices: [
      {
        id: 'lie',
        label: 'Lie About the Source',
        cost: { resource: 'sanity', amount: 15 },
        log: 'You claim you found it in standard stock. He writes something down and leaves without a word.',
        effects: { suspicion: 15, experience: 250 },
        nextEventId: 'incident:SRF_CHAIN_5',
      },
      {
        id: 'truth',
        label: 'Tell the Truth',
        log: "You tell him about the phone call. He looks at you for a long time. 'Correction noted,' he says, and removes the part.",
        effects: { suspicion: -10, sanity: -20 },
      },
    ],
    failureOutcome: {
      log: 'You refused to answer. He tagged you and the aircraft. Your file is updated.',
      effects: { suspicion: 30, sanity: -10 },
    },
  },
  {
    id: 'SRF_CHAIN_5',
    type: 'incident',
    title: 'THE STATIC',
    description:
      'Your terminal is locked on a screen of thick, grey static. But there are shapes moving within it. Data trying to form.',
    totalTime: 35000,
    choices: [
      {
        id: 'decrypt',
        label: 'Analyze the Pattern',
        cost: { resource: 'focus', amount: 25 },
        log: "You adjust the contrast and isolate the static. It's not static. It's thousands of archived SRF forms, overlaid.",
        effects: { experience: 300, sanity: -10 },
        nextEventId: 'incident:SRF_CHAIN_6',
      },
      {
        id: 'reboot',
        label: 'Reboot Terminal',
        log: 'You unplug the machine. When it boots back up, it greets you as a different user.',
        effects: { focus: 10, sanity: -5 },
      },
    ],
    failureOutcome: {
      log: 'The static grew louder until the monitor shattered inward.',
      effects: { credits: -50, sanity: -15 },
    },
  },
  {
    id: 'SRF_CHAIN_6',
    type: 'incident',
    title: 'THE FOLLOW-UP',
    description:
      "An SRF pings your inbox regarding the same strange part. It's from another mechanic. You cross-reference the employee ID. The mechanic passed away ten years ago.",
    totalTime: 35000,
    choices: [
      {
        id: 'locker',
        label: 'Search Their Old Locker',
        cost: { resource: 'sanity', amount: 20 },
        log: 'Locker 44. You pry it open. Inside, it smells strongly of ozone and dried flowers.',
        effects: { experience: 400 },
        nextEventId: 'incident:SRF_CHAIN_7',
      },
      {
        id: 'ignore',
        label: 'Ignore the Email',
        log: 'You mark it as spam. The unread count forever stays at 1.',
        effects: { suspicion: -5 },
      },
    ],
    failureOutcome: {
      log: 'The email opened itself and deleted half your inbox before you could stop it.',
      effects: { focus: -20 },
    },
  },
  {
    id: 'SRF_CHAIN_7',
    type: 'incident',
    title: 'THE LOCKER',
    description:
      'Inside the decrepit locker, you find a massive, handwritten ledger. It contains details of every SRF ever filed in the hangar. The dates extend into the future.',
    totalTime: 40000,
    choices: [
      {
        id: 'read',
        label: 'Read the Last Page',
        cost: { resource: 'sanity', amount: 25 },
        log: 'The last entry is your own name. The ink is still wet.',
        effects: { experience: 500, suspicion: 10 },
        nextEventId: 'incident:SRF_CHAIN_8',
      },
      {
        id: 'burn',
        label: 'Burn the Ledger',
        log: 'You toss a match in. The pages scream as they curl and blacken.',
        effects: { sanity: 10, suspicion: -10 },
      },
    ],
    failureOutcome: {
      log: 'The locker door slammed shut on your hand, locking itself with a rusted mechanism.',
      effects: { sanity: -10, focus: -10 },
    },
  },
  {
    id: 'SRF_CHAIN_8',
    type: 'audit',
    suitType: 'INTERNAL_SECURITY',
    title: 'THE AUDITOR',
    description:
      'A safety auditor who casts no shadow approaches you. He holds out his hand, palm up. He wants the ledger.',
    totalTime: 45000,
    choices: [
      {
        id: 'show_srf',
        label: 'Show Your Own SRF Instead',
        cost: { resource: 'focus', amount: 30 },
        log: "You present your most recent SRF. He reads it, nods slowly, and says, 'The cycle continues.'",
        effects: { experience: 600, sanity: -10 },
        nextEventId: 'incident:SRF_CHAIN_9',
      },
      {
        id: 'give_ledger',
        label: 'Hand Over the Ledger',
        log: "He takes the ledger. 'A mistake,' he whispers, and you wake up back at your desk with a headache.",
        effects: { suspicion: 20 },
      },
    ],
    failureOutcome: {
      log: 'You hesitated. He pointed a finger at you, and you lost your voice for the rest of the shift.',
      effects: { sanity: -30, suspicion: 15 },
    },
  },
  {
    id: 'SRF_CHAIN_9',
    type: 'incident',
    title: 'THE RESONANCE',
    description:
      'The entire hangar begins to vibrate. The hum matches the serial number on your SRF. The walls seem to breathe in and out.',
    totalTime: 30000,
    choices: [
      {
        id: 'tune',
        label: 'Tune the Frequency',
        cost: { resource: 'focus', amount: 40 },
        log: 'You access the hangar control panel and synchronize the harmonics. The vibration stabilizes into a pure, clean tone.',
        effects: { experience: 800, sanity: 20 },
        nextEventId: 'incident:SRF_CHAIN_10',
      },
      {
        id: 'run',
        label: 'Run Outside',
        log: 'You sprint onto the tarmac. The hangar behind you looks distorted, like a mirage.',
        effects: { sanity: -20 },
      },
    ],
    failureOutcome: {
      log: 'The resonance shattered the glass in the supervisor office. You are covered in cuts.',
      effects: { sanity: -25, focus: -25 },
    },
  },
  {
    id: 'SRF_CHAIN_10',
    type: 'story_event',
    title: 'THE REVELATION',
    description:
      "The true purpose is clear. Corporate isn't logging repairs. The SRFs are offerings. The paperwork feeds the entity beneath the hangar to keep it dormant. You are a priest of the void disguised as a mechanic.",
    totalTime: 0,
    choices: [
      {
        id: 'accept',
        label: 'Accept Your Role',
        log: 'You feel a cold peace. The void acknowledges you. Your focus and sanity boundaries are permanently expanded.',
        effects: { experience: 2500, credits: 1000, focus: 100, sanity: 100 },
      },
      {
        id: 'whistleblower',
        label: 'Blow the Whistle',
        log: 'You copy the records and refuse the void. You are going to expose Boeing. You leave the hangar immediately.',
        effects: { suspicion: 50 },
        nextEventId: 'story_event:SRF_CHAIN_11',
      },
    ],
    failureOutcome: {
      log: 'It is too late to fail. You are part of the machine now.',
      effects: {},
    },
  },
  {
    id: 'SRF_CHAIN_11',
    type: 'story_event',
    title: 'THE SET-UP',
    description:
      "You decide to expose the conspiracy. The next morning, corporate lawyers and Federal Marshall clones arrive at your house. You're presented with a bogus EASA Form 1 with your forged signature, tying you to a catastrophic airframe failure. You're being framed.",
    totalTime: 0,
    choices: [
      {
        id: 'lawyer',
        label: 'Hire a Lawyer',
        log: 'They immediately freeze your bank accounts. You are ruined financially before the trial even starts.',
        effects: { credits: -5000, sanity: -50, suspicion: 100 },
      },
      {
        id: 'flee',
        label: 'Flee to the Parking Lot',
        log: 'You kick over the table and make a break for the back exit. You need to get to your truck.',
        effects: { focus: 20 },
        nextEventId: 'story_event:SRF_CHAIN_12',
      },
    ],
    failureOutcome: {
      log: 'You stayed silent and were arrested. You become a scapegoat.',
      effects: { suspicion: 100, sanity: -50, credits: -2000 },
    },
  },
  {
    id: 'SRF_CHAIN_12',
    type: 'story_event',
    title: 'THE HIT',
    description:
      "It's raining. Neo-noir neon flickers off the wet asphalt. You make a break for your truck, but a man in a trench coat steps out from behind a concrete pillar. He raises a silenced pistol. 'Boeing sends their regards.'",
    totalTime: 0,
    choices: [
      {
        id: 'accept_fate',
        label: 'Accept Your Fate',
        log: 'A flash of light. A suppressed crack. You collapse onto the wet asphalt. Your SRF records are never found.',
        effects: { sanity: -100, focus: -100, experience: -5000 },
      },
      {
        id: 'dive',
        label: 'Dive Behind Car',
        cost: { resource: 'focus', amount: 50 },
        log: 'You dive as the bullet grazes your shoulder! You scramble into your truck and tear out of the lot. You survived, but you can never come back.',
        effects: { suspicion: 100, sanity: -80, experience: 3000 },
      },
    ],
    failureOutcome: {
      log: 'You froze in the headlights. The last thing you saw was the muzzle flash.',
      effects: { sanity: -100, focus: -100 },
    },
  },
];
