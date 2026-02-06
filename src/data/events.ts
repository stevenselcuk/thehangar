import { GameEvent } from '../types.ts';
import {
  BOEING_INSPECTOR_FLAVOR,
  CANTEEN_INCIDENT_FLAVOR,
  FAA_INSPECTION_FLAVOR,
  INTERNAL_AUDIT_FLAVOR,
  SAFA_CHECK_FLAVOR,
  TOOLROOM_INCIDENT_FLAVOR,
  TRAINING_DEPT_FLAVOR,
} from './flavor';
import { syndicateEvents } from './syndicateEvents';
import { unionEvents } from './unionEvents';

type EventTemplates = Omit<GameEvent, 'timeLeft'>;

export const eventsData: Record<string, EventTemplates[]> = {
  audit: [
    {
      id: 'FAA_INSPECTOR',
      type: 'audit',
      // FIX: Changed 'suit' to 'suitType' to match the GameEvent interface.
      suitType: 'FAA_INSPECTOR',
      title: 'FAA Spot-Check',
      description:
        "A regulatory inspector is performing a random spot-check of tools and certs. Don't look nervous.",
      totalTime: 40000,
      choices: [
        {
          id: 'comply',
          label: 'Present Documentation',
          cost: { resource: 'focus', amount: 30 },
          effects: { experience: 350, suspicion: 5 },
          log: 'You present your A&P license and tool calibration logs. The inspector nods and moves on. A close call.',
        },
      ],
      failureOutcome: {
        log: 'FAILURE TO COMPLY: The FAA inspector has filed a non-compliance report. Your file is flagged.',
        effects: { suspicion: 25, sanity: -10 },
      },
    },
    {
      id: 'AUDIT_INTERNAL',
      type: 'audit',
      // FIX: Changed 'suit' to 'suitType' to match the GameEvent interface.
      suitType: 'INTERNAL_SECURITY',
      title: 'Internal Log Review',
      description:
        'Internal Security is reviewing shift logs for unauthorized delegation or material discrepancies.',
      totalTime: 60000,
      choices: [
        {
          id: 'cooperate',
          label: 'Cooperate',
          cost: { resource: 'focus', amount: 20 },
          log: 'You cooperate with the audit. They find minor discrepancies but let it slide with a warning.',
          effects: { experience: 100, suspicion: 10 },
        },
      ],
      failureOutcome: {
        log: 'AUDIT FAILED: The audit reveals significant discrepancies. A fine has been levied from your next paycheck.',
        effects: { credits: -250, suspicion: 20 },
      },
    },
    {
      id: 'AUDIT_SUITS',
      type: 'audit',
      // FIX: Changed 'suit' to 'suitType' to match the GameEvent interface.
      suitType: 'THE_SUITS',
      title: 'Unscheduled Oversight',
      description:
        "Tall figures in charcoal grey. They don't have badges. They just watch from the mezzanine.",
      totalTime: 30000,
      choices: [
        {
          id: 'ignore',
          label: 'Keep Your Head Down',
          cost: { resource: 'focus', amount: 10 },
          log: "You focus on your work, trying to ignore the cold presence above. After an eternity, they're gone.",
          effects: { sanity: -15 },
        },
      ],
      failureOutcome: {
        log: "You couldn't handle the pressure. You looked up. They were all looking back at you. One of them... smiled.",
        effects: { sanity: -40, suspicion: 10 },
      },
    },
    {
      id: 'BACKSHOP_AUDIT_SUITS',
      type: 'audit',
      suitType: 'THE_SUITS',
      title: 'SPECIFIC AUDIT',
      description:
        'The Suits are here. They are looking for a specific component, P/N: [REDACTED]. They are sweeping the backshops.',
      totalTime: 45000,
      choices: [
        {
          id: 'cooperate',
          label: 'Cooperate Fully',
          cost: { resource: 'focus', amount: 40 },
          log: "You show them your logs. They inspect your workbenches. They seem satisfied you don't have what they're looking for... this time.",
          effects: { suspicion: 10 },
        },
        {
          id: 'obstruct',
          label: 'Obstruct with Paperwork',
          cost: { resource: 'focus', amount: 20 },
          log: 'You bury them in irrelevant maintenance logs and safety forms. They are annoyed but leave after wasting too much time. A risky move.',
          effects: { suspicion: 25 },
        },
      ],
      failureOutcome: {
        log: "You failed to comply in time. They found an 'unaccounted for' component on your bench. Your file has been permanently flagged.",
        effects: { sanity: -20, suspicion: 40 },
      },
    },
    {
      id: 'AUDIT_INTERNAL_SUITS_1',
      type: 'audit',
      suitType: 'THE_SUITS',
      title: 'Unexpected Audit',
      description: INTERNAL_AUDIT_FLAVOR[0],
      totalTime: 45000,
      choices: [
        {
          id: 'submit',
          label: 'Submit to Classification',
          cost: { resource: 'sanity', amount: 10 },
          log: INTERNAL_AUDIT_FLAVOR[5],
          effects: { suspicion: -5 },
        },
        {
          id: 'flee',
          label: 'Attempt to Flee',
          cost: { resource: 'focus', amount: 20 },
          log: 'You successfully evade them, but you can feel them watching you from the reflections in the windows.',
          effects: { suspicion: 20, sanity: -10 },
        },
      ],
      failureOutcome: {
        log: "They caught you trying to hide a logbook. It didn't exist until they found it.",
        effects: { suspicion: 40, sanity: -20 },
      },
    },
    {
      id: 'AUDIT_SAFA_CHECK',
      type: 'audit',
      suitType: 'FAA_INSPECTOR',
      title: 'SAFA Ramp Check',
      description: SAFA_CHECK_FLAVOR[0],
      totalTime: 60000,
      choices: [
        {
          id: 'comply_eu',
          label: 'Present EASA Form 1',
          cost: { resource: 'focus', amount: 15 },
          log: SAFA_CHECK_FLAVOR[15],
          effects: { experience: 200, suspicion: -10 },
        },
        {
          id: 'distract',
          label: 'Mention "The Grey"',
          cost: { resource: 'sanity', amount: 15 },
          log: "The inspector pauses. He nods slowly. 'So you know.' He leaves without checking the tires.",
          effects: { suspicion: -10, sanity: -5 },
        },
      ],
      failureOutcome: {
        log: SAFA_CHECK_FLAVOR[9],
        effects: { credits: -500, suspicion: 10 },
      },
    },
    {
      id: 'AUDIT_FAA_CONSPIRACY',
      type: 'audit',
      suitType: 'FAA_INSPECTOR',
      title: 'Federal Inspection',
      description: FAA_INSPECTION_FLAVOR[2],
      totalTime: 50000,
      choices: [
        {
          id: 'show_logs',
          label: 'Show Falsified Logs',
          cost: { resource: 'focus', amount: 30 },
          log: "The inspector glances at the logs. 'These are too perfect,' he says. 'But acceptable.'",
          effects: { suspicion: 5 },
        },
        {
          id: 'feign',
          label: 'Feign Ignorance',
          cost: { resource: 'focus', amount: 10 },
          log: FAA_INSPECTION_FLAVOR[13],
          effects: { suspicion: 15, sanity: -5 },
        },
      ],
      failureOutcome: {
        log: FAA_INSPECTION_FLAVOR[19],
        effects: { credits: -1000, suspicion: 50 },
      },
    },
    {
      id: 'PAYPHONE_EASA_AUDIT',
      type: 'audit',
      suitType: 'EASA_AUDITOR',
      title: 'Unexpected Call: EASA',
      description:
        "You pick up the payphone. It's not a relative. It's an EASA auditor who claims to be watching you from the terminal window. He wants to discuss your last signature.",
      totalTime: 40000,
      choices: [
        {
          id: 'defend',
          label: 'Defend Your Work',
          cost: { resource: 'focus', amount: 25 },
          log: "You cite the specific regulation he's quoting. He goes silent, then hangs up. You passed.",
          effects: { experience: 400, suspicion: -5 },
        },
        {
          id: 'hang_up',
          label: 'Hang Up',
          cost: { resource: 'sanity', amount: 10 },
          log: "You slam the phone down. The phone immediately rings again. You don't answer.",
          effects: { suspicion: 15 },
        },
      ],
      failureOutcome: {
        log: "You stammered and couldn't explain yourself. 'We are noting this,' the voice says.",
        effects: { suspicion: 30, credits: -200 },
      },
    },
    {
      id: 'PAYPHONE_FAA_AUDIT',
      type: 'audit',
      suitType: 'FAA_INSPECTOR',
      title: 'Unexpected Call: FAA',
      description:
        "The phone rings. A stern voice identifies as a Federal Inspector. 'We have questions about the 737 on stand 4. Why is it bleeding?'",
      totalTime: 45000,
      choices: [
        {
          id: 'deny',
          label: 'Deny Knowledge',
          cost: { resource: 'focus', amount: 20 },
          log: "'It must be hydraulic fluid,' you lie. The voice sounds unconvinced but terminates the call.",
          effects: { suspicion: 10 },
        },
        {
          id: 'truth',
          label: 'Tell the Truth',
          cost: { resource: 'sanity', amount: 30 },
          log: "You whisper about the shadows. The voice sighs. 'Protocol 9 initiated. Do not leave the terminal.'",
          effects: { experience: 600, sanity: -20 },
        },
      ],
      failureOutcome: {
        log: "You stayed silent too long. 'Silence is admission,' the voice says. A fine has been levied.",
        effects: { credits: -500, suspicion: 20 },
      },
    },
    {
      id: 'RANDOM_DRUG_TEST',
      type: 'audit',
      suitType: 'INTERNAL_SECURITY',
      title: 'Random Drug Test',
      description:
        'Medical staff and security are blocking the exit. "Routine screening," they say. They are collecting samples.',
      totalTime: 40000,
      choices: [
        {
          id: 'comply',
          label: 'Provide Sample',
          cost: { resource: 'sanity', amount: 10 },
          log: 'You provide the sample. You feel violated, but you pass.',
          effects: { suspicion: -5, sanity: -5 },
        },
        {
          id: 'delay',
          label: 'Stall for Time',
          cost: { resource: 'focus', amount: 20 },
          log: 'You drink water. You wait. They eventually get impatient and accept a partial sample.',
          effects: { suspicion: 10 },
        },
      ],
      failureOutcome: {
        log: 'REFUSAL TO TEST: Security escorts you to a holding cell. You are released hours later with a warning.',
        effects: { suspicion: 40, sanity: -20, credits: -200 },
      },
    },
  ],
  accident: [
    {
      id: 'ELECTRICAL_ARC_FLASH',
      type: 'accident',
      title: 'ELECTRICAL ARC FLASH',
      description:
        'A short circuit in the avionics bay has caused a small fire. You need to act fast.',
      totalTime: 30000,
      requiredAction: 'Activate Fire Suppression',
      successOutcome: {
        log: 'You activated the halon suppression system. The fire is out, but the bay is a mess.',
        effects: { experience: 200, sanity: -10 },
      },
      failureOutcome: {
        log: 'The fire spread, damaging several key components before the automated systems kicked in. A major incident report has been filed.',
        effects: { sanity: -40, suspicion: 15, credits: -300 },
      },
    },
    {
      id: 'CATASTROPHIC_FAILURE',
      type: 'accident',
      title: 'CATASTROPHIC FAILURE',
      description:
        'Multiple cascading system failures reported on an aircraft you recently serviced. The fuel lines are... dissolving.',
      totalTime: 60000,
      requiredAction: 'Attempt to Contain',
      successOutcome: {
        log: "You manage to isolate the failing systems, preventing a complete write-off. It's a disaster, but it could have been worse.",
        effects: { experience: 500, suspicion: 20, sanity: -20 },
      },
      failureOutcome: {
        log: 'The failure cascaded beyond control. The airframe is a total loss. An investigation is already underway, and your name is at the top of the list.',
        effects: { suspicion: 60, sanity: -50 },
      },
    },
  ],
  incident: [
    {
      id: 'SUS_MEMO',
      type: 'incident',
      title: 'Suspicious Memo',
      description:
        "You find a memo on the floor. It details a shift rotation that doesn't exist. It mentions your name.",
      totalTime: 30000,
      choices: [
        {
          id: 'read',
          label: 'Read Carefully',
          cost: { resource: 'sanity', amount: 5 },
          log: 'The memo describes your movements yesterday perfectly. Down to the minute.',
          effects: { sanity: -10, suspicion: 5 },
        },
        {
          id: 'shred',
          label: 'Shred It',
          cost: { resource: 'focus', amount: 5 },
          log: 'You shred the memo. As the paper strips fall, they look like worms.',
          effects: { suspicion: -5 },
        },
      ],
      failureOutcome: {
        log: 'You left the memo on the desk. Someone else found it.',
        effects: { suspicion: 15 },
      },
    },
    {
      id: 'OVERDUE_NDT_INSPECTION',
      type: 'incident',
      title: 'Overdue NDT Inspection',
      description:
        'Quality Control has flagged a repair you did last week. The NDT sign-off is missing.',
      totalTime: 45000,
      choices: [
        {
          id: 'perform',
          label: 'Perform Scan Now',
          cost: { resource: 'focus', amount: 25 },
          log: 'You rush to the aircraft and perform the scan. The structure is sound.',
          effects: { experience: 200, sanity: -5 },
        },
        {
          id: 'forge',
          label: 'Forge the Sign-off',
          cost: { resource: 'sanity', amount: 15 },
          log: 'You scribble a signature. It looks enough like yours.',
          effects: { suspicion: 20 },
        },
      ],
      failureOutcome: {
        log: 'QC issues a formal reprimand for the missing inspection.',
        effects: { suspicion: 15, credits: -100 },
      },
    },
    {
      id: 'LEAD_FAVOR',
      type: 'incident',
      title: 'RUSH JOB',
      description:
        'Your lead radios you for a rush job on a newly arrived aircraft that requires a specific, calibrated tool. Completing it will reduce suspicion.',
      totalTime: 30000,
      choices: [
        {
          id: 'accept',
          label: 'Accept the Job',
          log: "You accept. The lead sounds relieved. 'Good. Get to Bay 3, now. Don't mess this up.'",
          nextEventId: 'incident:RUSH_JOB_ACTIVE',
        },
        {
          id: 'decline',
          label: 'Decline (Requires 20 Sanity)',
          cost: { resource: 'sanity', amount: 20 },
          log: "You decline, claiming you're swamped. The lead is silent for a moment. 'Fine. I'll remember this.'",
          effects: { suspicion: 5 },
        },
      ],
      failureOutcome: {
        log: "You took too long to respond. The lead radios back, annoyed. 'Never mind, I got someone else. Don't wander off.'",
        effects: { suspicion: 3 },
      },
    },
    {
      id: 'RUSH_JOB_ACTIVE',
      type: 'incident',
      title: 'TIME-SENSITIVE: VIP TURNOVER',
      description:
        'A VIP flight is on the ground and needs an immediate turnaround. You have to perform a full transit check in record time.',
      totalTime: 180000, // 3 minutes
      requiredAction: 'Perform Rapid Transit Check',
      successOutcome: {
        log: 'You completed the check with seconds to spare! The flight is away. The lead is impressed and you get a hefty bonus.',
        effects: { credits: 500, experience: 1000, suspicion: -5 },
      },
      failureOutcome: {
        log: 'You ran out of time. The flight missed its window, causing a major delay and a huge fine. Management is furious.',
        effects: { credits: -1000, suspicion: 20, sanity: -10 },
      },
    },
    {
      id: 'CABIN_LOG_DISCREPANCY',
      type: 'incident',
      title: 'Cabin Log Discrepancy',
      description:
        "While chatting with the cabin crew, they mention a recurring issue with the passenger count being off by one. It's probably just a ticketing error, but they want you to double-check the manifest against the system.",
      totalTime: 60000,
      requiredAction: 'Cross-Reference Passenger Manifest',
      successOutcome: {
        log: "You find a minor clerical error and correct it. The cabin crew is relieved. You've built some trust.",
        effects: { experience: 200, suspicion: -2 },
      },
      failureOutcome: {
        log: "You couldn't find the source of the error in time. The issue is escalated, and now there are questions about why you were looking at passenger data.",
        effects: { suspicion: 10, sanity: -5 },
      },
    },
    {
      id: 'LOST_PASSENGER_INCIDENT',
      type: 'incident',
      title: 'Passenger Disturbance',
      description:
        "The 'lost' passenger you spoke to is now causing a disturbance at Gate B12, demanding to be let onto a flight that doesn't exist. Security has been called, and they say the passenger mentioned you by description.",
      totalTime: 90000,
      choices: [
        {
          id: 'deny',
          label: 'Deny Involvement',
          cost: { resource: 'focus', amount: 10 },
          log: 'You deny ever speaking to the person. Security seems skeptical but lets you go with a warning. The passenger is escorted away, screaming about a city of black glass.',
          effects: { suspicion: 15 },
        },
        {
          id: 'intervene',
          label: 'Intervene and Calm Them',
          cost: { resource: 'sanity', amount: 20 },
          log: "You manage to calm the passenger down, convincing them they misread their ticket. Security thanks you, but the passenger whispers 'It saw me...' as they're led away. Their panic is contagious.",
          effects: { sanity: -20, suspicion: 5, experience: 300 },
        },
      ],
      failureOutcome: {
        log: "You ignored the commotion. Security eventually restrains the passenger. Your name is on the incident report for 'failure to assist'.",
        effects: { suspicion: 25, sanity: -5 },
      },
    },
    {
      id: 'CONTAINMENT_BREACH_ALERT',
      type: 'incident',
      title: 'CONTAINMENT BREACH - BAY 4C',
      description:
        'The klaxons are silent. The warning light pulses in sync with your heartbeat. The magnetic locks on Storage 4C have disengaged. Nothing has come out... yet.',
      totalTime: 25000,
      requiredAction: 'Re-engage Magnetic Locks',
      successOutcome: {
        log: 'You force the lever down. The darkness recedes, leaving oily residues on the floor. You try not to step in them.',
        effects: { experience: 500, sanity: -15 },
      },
      failureOutcome: {
        log: "You were too late. A wave of intense cold washes over you as something... leaves. The alert ends. A single log is filed: 'SYSTEM RESET'.",
        effects: { sanity: -50, suspicion: 30 },
      },
    },
    {
      id: 'INCIDENT_BOEING_REP',
      type: 'incident',
      title: 'Factory Representative',
      description: BOEING_INSPECTOR_FLAVOR[0],
      totalTime: 40000,
      choices: [
        {
          id: 'explain',
          label: 'Explain the Manual',
          cost: { resource: 'focus', amount: 20 },
          log: "You try to explain standard maintenance practices. He laughs. 'We haven't used those since the shift.'",
          effects: { suspicion: 10, sanity: -5 },
        },
        {
          id: 'risk',
          label: 'Let Him Touch It',
          cost: { resource: 'sanity', amount: 30 },
          log: BOEING_INSPECTOR_FLAVOR[15],
          effects: { experience: 500, suspicion: -5 },
        },
      ],
      failureOutcome: {
        log: "He declares the aircraft 'unclean' and tags it for incineration.",
        effects: { suspicion: 20, credits: -200 },
      },
    },
    {
      id: 'INCIDENT_TOOLROOM_DEMAND',
      type: 'incident',
      title: 'Toolroom Demand',
      description: TOOLROOM_INCIDENT_FLAVOR[3],
      totalTime: 30000,
      choices: [
        {
          id: 'give_tool',
          label: 'Offer a 10mm Socket',
          cost: { resource: 'credits', amount: 50 },
          log: "The Master accepts the offering. 'This will feed the machine for an hour.'",
          effects: { suspicion: -10 },
        },
        {
          id: 'blood',
          label: 'Offer Blood',
          cost: { resource: 'sanity', amount: 20 },
          log: TOOLROOM_INCIDENT_FLAVOR[0],
          effects: { experience: 400, sanity: -20 },
        },
      ],
      failureOutcome: {
        log: 'You have nothing to give. The Master takes your focus instead.',
        effects: { focus: -50 },
      },
    },
    {
      id: 'INCIDENT_TRAINING_MODULE',
      type: 'incident',
      title: 'Mandatory Training',
      description: TRAINING_DEPT_FLAVOR[0],
      totalTime: 60000,
      choices: [
        {
          id: 'learn',
          label: 'Watch the Video',
          cost: { resource: 'sanity', amount: 25 },
          log: 'You watch the whole thing. You now know how to calibrate a sadness sensor.',
          effects: { experience: 600, sanity: -25 },
        },
        {
          id: 'skip',
          label: 'Skip Training',
          log: "You mark it as 'Complete'. The system knows you lied.",
          effects: { suspicion: 15 },
        },
      ],
      failureOutcome: {
        log: TRAINING_DEPT_FLAVOR[14],
        effects: { sanity: -30, experience: -100 },
      },
    },
    {
      id: 'PAYPHONE_STATIC_VOICE',
      type: 'incident',
      title: 'Voice from the Static',
      description:
        "Through the static, a voice that sounds exactly like yours warns you: 'Don't go back to the hangar tonight. It's waiting.'",
      totalTime: 25000,
      choices: [
        {
          id: 'heed',
          label: 'Heed the Warning',
          cost: { resource: 'focus', amount: 30 },
          log: 'You stay in the terminal for an extra hour. You hear later that a lighting rig collapsed exactly where you would have been standing.',
          effects: { experience: 300, sanity: -5 },
        },
        {
          id: 'ignore',
          label: 'Ignore It',
          cost: { resource: 'sanity', amount: 10 },
          log: 'You go back to work. You feel a cold breath on your neck all night, but nothing happens. Maybe it was a prank.',
          effects: { sanity: -15, suspicion: 5 },
        },
      ],
      failureOutcome: {
        log: 'The voice turned into a scream that deafened you for minutes. You have a headache.',
        effects: { focus: -20 },
      },
    },
    {
      id: 'PAYPHONE_WRONG_NUMBER',
      type: 'incident',
      title: 'Wrong Number',
      description:
        "A frantic woman asks if you've seen her husband. She describes a pilot who went missing in 1974. Then her voice changes. 'He is standing behind you.'",
      totalTime: 20000,
      choices: [
        {
          id: 'turn',
          label: 'Turn Around',
          cost: { resource: 'sanity', amount: 25 },
          log: "There's no one there. But the air is freezing cold, and you smell stale tobacco smoke.",
          effects: { experience: 200, sanity: -10 },
        },
        {
          id: 'comfort',
          label: 'Stay Still',
          cost: { resource: 'focus', amount: 15 },
          log: "You don't move. You feel warm breath on your neck. You hang up. You survive.",
          effects: { sanity: -15 },
        },
      ],
      failureOutcome: {
        log: 'You dropped the phone in panic. When you picked it up, it was just a dial tone.',
        effects: { focus: -10 },
      },
    },
  ],
  bureaucratic_horror: [
    {
      id: 'PAPERWORK_ERROR_INK',
      type: 'bureaucratic_horror',
      title: 'FORM DEC-77 REJECTION',
      description:
        'You submitted the maintenance log using blue ink. The Regulation 99.1(B) specifically demands black ink. The shadows in the office corner seem pleased by your mistake.',
      totalTime: 40000,
      choices: [
        {
          id: 'redo',
          label: 'Rewrite Everything',
          cost: { resource: 'focus', amount: 40 },
          log: 'You spend hours rewriting the logs. Your hand cramps. The ink looks like it is moving on the page.',
          effects: { experience: 100, sanity: -10 },
        },
        {
          id: 'argue',
          label: 'Submit Anyway',
          cost: { resource: 'sanity', amount: 15 },
          log: 'You put it in the inbox. You hear a shredder start up, even though the office is empty.',
          effects: { suspicion: 20 },
        },
      ],
      failureOutcome: {
        log: "The form is returned to you. It is covered in red stamps: 'INVALID'. The red ink is wet.",
        effects: { suspicion: 15, sanity: -15 },
      },
    },
    {
      id: 'LOGBOOK_RECURSION',
      type: 'bureaucratic_horror',
      title: 'REGULATORY LOOP',
      description:
        'You are trying to find the reference for a part installation. Section 8 refers you to Section 12. Section 12 refers you to Section 8. You have been reading for hours.',
      totalTime: 50000,
      choices: [
        {
          id: 'break_loop',
          label: 'Burn the Page',
          cost: { resource: 'sanity', amount: 20 },
          log: 'You tear out the referencing page. The logic loop breaks. You feel a headache subside.',
          effects: { suspicion: 10, focus: 10 },
        },
        {
          id: 'continue',
          label: 'Keep Reading',
          cost: { resource: 'focus', amount: 30 },
          log: "You find a hidden footnote in microscopic text. It says: 'WE ARE TRAPPED HERE TOO'.",
          effects: { experience: 500, sanity: -20 },
        },
      ],
      failureOutcome: {
        log: 'You fell asleep reading. You dreamt of a library with no exits. You wake up tired.',
        effects: { focus: -40 },
      },
    },
  ],
  eldritch_manifestation: [
    {
      id: 'MEZZANINE_OBSERVATION',
      type: 'eldritch_manifestation',
      title: 'UNSEEN OBSERVERS',
      description:
        'You feel a cold spot in the air. On the mezzanine overlooking the bay, you see several tall, thin figures in identical charcoal grey suits. They are perfectly still. They are watching you work.',
      totalTime: 45000,
      choices: [
        {
          id: 'work',
          label: 'Keep your head down and work',
          log: 'You force yourself to focus on the task at hand, the feeling of being watched boring into your skull. After an eternity, the feeling passes.',
          effects: { sanity: -20, focus: 20 },
        },
        {
          id: 'confront',
          label: 'Look up at them',
          log: 'You look up. They are gone. Were they ever there? A migraine begins to form behind your eyes.',
          effects: { sanity: -30 },
          storyFlag: { key: 'confrontedSuits', value: true },
        },
      ],
      failureOutcome: {
        log: 'You froze, unable to look away or focus. The figures vanished, leaving you shaking and disoriented.',
        effects: { sanity: -35, focus: -50 },
      },
    },
    {
      id: 'THE_HUM',
      type: 'eldritch_manifestation',
      title: 'STRUCTURAL RESONANCE',
      description:
        'A low, gut-wrenching hum is emanating from the very structure of the backshops. It makes your teeth ache and your vision swim, making it hard to focus.',
      totalTime: 60000,
      choices: [
        {
          id: 'investigate',
          label: 'Trace the Source',
          cost: { resource: 'sanity', amount: 25 },
          log: 'You follow the hum to a concrete wall that seems to vibrate with the noise. You press your ear against it and hear what sounds like a distorted radio broadcast from the other side. The sound stops abruptly.',
          effects: { experience: 400 },
        },
        {
          id: 'ignore',
          label: 'Put on Earmuffs',
          cost: { resource: 'focus', amount: 5 },
          log: 'You put on your earmuffs. The hum is muffled, but you can still feel the vibration in your bones. You manage to keep working.',
          effects: { sanity: -10 },
        },
      ],
      failureOutcome: {
        log: 'The incessant hum drove you to your knees, disoriented and nauseous. It stops as suddenly as it began, leaving you shaken.',
        effects: { sanity: -30, focus: -40 },
      },
    },
    // KARDEX EVENTS
    {
      id: 'AMM_FIELD_UPDATE',
      type: 'eldritch_manifestation',
      title: 'MANDATORY UPDATE',
      description:
        "The AMM on your screen locks up. A popup appears: 'FIRMWARE UPDATE REQUIRED FOR REALITY SYNC'. The progress bar is moving backwards.",
      totalTime: 40000,
      choices: [
        {
          id: 'force_quit',
          label: 'Pull the Plug',
          cost: { resource: 'focus', amount: 10 },
          log: 'You yank the power cord. The screen stays on for 3 seconds of screaming static before dying.',
          effects: { sanity: -10, focus: -10 },
        },
        {
          id: 'wait',
          label: 'Watch the Update',
          cost: { resource: 'sanity', amount: 20 },
          log: "You watch as files named 'human_soul_v1.zip' and 'forgotten_memories.dat' are uploaded to an external server.",
          effects: { experience: 500, suspicion: 10 },
        },
      ],
      failureOutcome: {
        log: "The update reaches -100%. You forget your mother's face.",
        effects: { sanity: -30, experience: -100 },
      },
    },
    {
      id: 'GHOST_TOUCH',
      type: 'eldritch_manifestation',
      title: 'HAPTIC FEEDBACK',
      description:
        'As you scroll through the digital manual, you feel a distinct textured surface on your smooth touchscreen. It feels like cold, wet skin.',
      totalTime: 30000,
      choices: [
        {
          id: 'wipe',
          label: 'Wipe the Screen',
          cost: { resource: 'focus', amount: 5 },
          log: 'You wipe it with a rag. The rag comes away stained with something black.',
          effects: { suspicion: 5, sanity: -5 },
        },
        {
          id: 'touch',
          label: 'Press Harder',
          cost: { resource: 'sanity', amount: 15 },
          log: 'You press into the screen. It yields like flesh. You feel a pulse.',
          effects: { experience: 400, sanity: -15 },
        },
      ],
      failureOutcome: {
        log: 'The screen grabs your finger. You have to yank it free, leaving a bruise.',
        effects: { sanity: -20, focus: -10 },
      },
    },
    {
      id: 'DATA_CORRUPTION',
      type: 'eldritch_manifestation',
      title: 'VISUAL HAZARD',
      description:
        'The text on your monitor begins to melt, dripping down to the bottom of the bezel. It forms a pool of black letters that spell out a warning.',
      totalTime: 35000,
      choices: [
        {
          id: 'read_warning',
          label: 'Read the Warning',
          cost: { resource: 'sanity', amount: 20 },
          log: "It says: 'THEY ARE COMING THROUGH THE WIRES'.",
          effects: { experience: 300, suspicion: 5 },
        },
        {
          id: 'screen_off',
          label: 'Turn Off Monitor',
          cost: { resource: 'focus', amount: 10 },
          log: 'You kill the power. The letters burn into your retina for an hour.',
          effects: { focus: -10 },
        },
      ],
      failureOutcome: {
        log: "The melting text pours off the desk and stains your boots. It won't come out.",
        effects: { suspicion: 10, sanity: -10 },
      },
    },
    {
      id: 'PRINTER_ACTUATION',
      type: 'eldritch_manifestation',
      title: 'UNAUTHORIZED PRINT',
      description:
        "The office printer starts up on its own. It's printing page after page of solid black ink. The noise sounds like a rhythmic chanting.",
      totalTime: 45000,
      choices: [
        {
          id: 'stop_print',
          label: 'Open Tray',
          cost: { resource: 'focus', amount: 15 },
          log: 'You rip the paper tray out. The printer screams before shutting down.',
          effects: { suspicion: 5 },
        },
        {
          id: 'examine',
          label: 'Examine Output',
          cost: { resource: 'sanity', amount: 25 },
          log: "The black pages aren't solid black. They are photos of the hangar taken from the ceiling, timestamped 10 seconds ago.",
          effects: { experience: 600, sanity: -20 },
        },
      ],
      failureOutcome: {
        log: 'The printer overheats and catches fire. The smoke smells like burning hair.',
        effects: { credits: -100, sanity: -10 },
      },
    },
    {
      id: 'SCREEN_REFLECTION',
      type: 'eldritch_manifestation',
      title: 'BEHIND YOU',
      description:
        'Specifically in the reflection of your dark monitor, you see a tall man in a suit standing directly behind your chair. You are alone in the room.',
      totalTime: 20000,
      choices: [
        {
          id: 'dont_turn',
          label: 'Do Not Turn Around',
          cost: { resource: 'sanity', amount: 30 },
          log: "You stare at the reflection until it fades. You don't breathe. When it's gone, you exhale.",
          effects: { experience: 500, focus: -20 },
        },
        {
          id: 'turn_fast',
          label: 'Turn Around Quickly',
          cost: { resource: 'focus', amount: 20 },
          log: 'You spin the chair. The room is empty. But the door handle is slowly turning.',
          effects: { suspicion: 10, sanity: -15 },
        },
      ],
      failureOutcome: {
        log: 'You felt a cold hand on your shoulder. You fainted.',
        effects: { sanity: -50, focus: -50 },
      },
    },
    {
      id: 'KARDEX_RECOVERY',
      type: 'eldritch_manifestation',
      title: 'ANOMALOUS FILE',
      description:
        "You find a KARDEX file card on the floor. It pulses with a faint heat. The aircraft registration listed is 'N-VOID-00'.",
      totalTime: 45000,
      choices: [
        {
          id: 'file',
          label: 'File It Correctly',
          cost: { resource: 'focus', amount: 15 },
          log: 'You file it in the dead archive. As you slide the drawer shut, you hear a sigh of relief.',
          effects: { experience: 300, sanity: 5 },
        },
        {
          id: 'read',
          label: 'Read the History',
          cost: { resource: 'sanity', amount: 20 },
          log: "The maintenance history describes repairs to 'non-Euclidean geometry' and 'temporal leaks'.",
          effects: { experience: 600, sanity: -20 },
        },
      ],
      failureOutcome: {
        log: 'The file card burns your fingers and turns to ash.',
        effects: { sanity: -5 },
      },
    },
  ],
  story_event: [
    {
      id: 'TRUTH_PROXIMATE_REVELATION',
      type: 'story_event',
      title: 'THE PATTERN EMERGES',
      description:
        'You have seen enough. The missing tools, the whispers in the fuselage, the figures on the mezzanine. It is not just incompetence or bad luck. It is a design.',
      totalTime: 0, // Story events typically don't expire or have long timers
      choices: [
        {
          id: 'acknowledge',
          label: 'Acknowledge the Truth',
          log: "You write it down in your personal log. 'They are feeding the machine.'",
          effects: { sanity: -10, experience: 1000 },
        },
      ],
      failureOutcome: {
        log: 'You try to deny it, but the truth is already in your blood.',
        effects: { sanity: -20 },
      },
    },
    {
      id: 'TRUTH_REVEAL',
      type: 'story_event',
      title: 'THE HANGAR DOORS OPEN',
      description:
        'Level 49. The final shift. The main hangar doors are opening, but there is no runway outside. Only a swirling vortex of greyscale clouds and static.',
      totalTime: 0,
      choices: [
        {
          id: 'witness',
          label: 'Witness the End',
          log: 'You stand on the apron line. The wind does not blow. The world is silent. You are ready.',
          effects: { experience: 5000, sanity: -50 },
        },
      ],
      failureOutcome: {
        log: 'The void consumes all.',
        effects: { sanity: -100 },
      },
    },
    {
      id: 'FOUND_PHOTO_EVENT',
      type: 'story_event',
      title: 'Anomalous Signal',
      description:
        "The line goes dead, but a dot-matrix printer in the corner starts screaming. It spits out a single page before jamming. It's a photograph.",
      totalTime: 0,
      choices: [],
      failureOutcome: { log: 'The photo crumbles to dust.' },
    },
  ],
  canteen_incident: [
    {
      id: 'CANTEEN_SUITS_LUNCH',
      type: 'canteen_incident',
      title: 'Lunch Break Encounter',
      description: CANTEEN_INCIDENT_FLAVOR[3],
      totalTime: 30000,
      choices: [
        {
          id: 'sit_near',
          label: 'Sit Nearby',
          cost: { resource: 'sanity', amount: 10 },
          log: "You overhear them discussing the 'expiration date' of the current timeline.",
          effects: { experience: 300, sanity: -15 },
        },
        {
          id: 'leave',
          label: 'Leave Immediately',
          cost: { resource: 'focus', amount: 5 },
          log: "You leave your tray and walk out. You're hungry, but alive.",
          effects: { focus: -10 },
        },
      ],
      failureOutcome: {
        log: "One of them beckons you over. You don't remember the rest of your break.",
        effects: { sanity: -30, suspicion: 10 },
      },
    },
    {
      id: 'CANTEEN_VENDING_PROPHECY',
      type: 'canteen_incident',
      title: 'Vending Machine Glitch',
      description: CANTEEN_INCIDENT_FLAVOR[4],
      totalTime: 20000,
      choices: [
        {
          id: 'buy_void',
          label: 'Press the Button',
          cost: { resource: 'credits', amount: 5 },
          log: "The machine dispenses a can of 'Static'. It tastes like pins and needles.",
          effects: { sanity: -10, experience: 100 },
        },
        {
          id: 'ignore',
          label: 'Walk Away',
          log: 'You choose thirst over madness.',
          effects: { focus: -5 },
        },
      ],
      failureOutcome: {
        log: "The machine screams. It's a human scream.",
        effects: { sanity: -20 },
      },
    },
    {
      id: 'CASUAL_CHAT_GONE_WRONG',
      type: 'canteen_incident',
      title: 'Loose Lips',
      description:
        "You're chatting with a ground crew member, but he's asking oddly specific questions about the hangar's security protocols.",
      totalTime: 25000,
      choices: [
        {
          id: 'deflect',
          label: 'Change Subject',
          cost: { resource: 'focus', amount: 10 },
          log: 'You smoothly steer the conversation to the terrible weather. He frowns but drops it.',
          effects: { suspicion: -2 },
        },
        {
          id: 'answer',
          label: 'Answer Vaguely',
          cost: { resource: 'sanity', amount: 5 },
          log: 'You give non-committal answers. He takes out a notebook and writes something down.',
          effects: { suspicion: 10 },
        },
      ],
      failureOutcome: {
        log: "You let something slip. He smiles, a cold, predatory smile. 'Noted,' he says.",
        effects: { suspicion: 25, sanity: -10 },
      },
    },
    {
      id: 'UNMARKED_OFFICER',
      type: 'canteen_incident',
      title: 'Undercover',
      description:
        "The 'janitor' you were talking to suddenly straightens up, revealing a hidden earpiece. It's a sting operation.",
      totalTime: 30000,
      choices: [
        {
          id: 'act_dumb',
          label: 'Act Dumb',
          cost: { resource: 'focus', amount: 15 },
          log: 'You pretend you were just complaining about the coffee. He buys it, barely.',
          effects: { suspicion: 5 },
        },
        {
          id: 'run',
          label: 'Excuse Yourself',
          cost: { resource: 'focus', amount: 10 },
          log: 'You mutter an excuse and speed-walk away. You can feel his eyes on your back.',
          effects: { suspicion: 15 },
        },
      ],
      failureOutcome: {
        log: "He flashes a badge. 'We've been watching you.' You are detained for questioning.",
        effects: { credits: -100, suspicion: 30 },
      },
    },
    {
      id: 'THE_ARCHIVIST',
      type: 'eldritch_manifestation',
      title: 'THE ARCHIVIST',
      description:
        'A figure in a heavy, dust-covered coat is rifling through your filing cabinets. They move with jerky, unnatural speed.',
      totalTime: 30000,
      choices: [
        {
          id: 'confront',
          label: 'Confront the Intruder',
          cost: { resource: 'focus', amount: 30 },
          log: 'You shout. The figure snaps its head 180 degrees to look at you. Its face is a flat LCD screen displaying static. It vanishes in a burst of ozone.',
          effects: { sanity: -30, suspicion: 10 },
          storyFlag: { key: 'metArchivist', value: true },
        },
        {
          id: 'hide',
          label: 'Hide and Watch',
          cost: { resource: 'sanity', amount: 5 },
          log: "You watch as it pulls a specific file, 'eats' the paper, and then dissolves into the shadows. You check the cabinet: The '[REDACTED]' file is gone.",
          effects: { experience: 300, suspicion: -5 },
        },
      ],
      failureOutcome: {
        log: "The figure turns to you, placing a finger to where its mouth should be. 'Shhh.' You black out.",
        effects: { sanity: -50 },
      },
    },
    {
      id: 'TIMELINE_CORRUPTION',
      type: 'eldritch_manifestation',
      title: 'TIMELINE CORRUPTION',
      description:
        "The maintenance logs on your terminal are updating themselves. They show work being completed on aircraft that haven't been manufactured yet.",
      totalTime: 60000,
      choices: [
        {
          id: 'sync',
          label: 'Sync with Reality',
          cost: { resource: 'focus', amount: 50 },
          log: 'You frantically manually override the system, forcing it back to the current date. The terminal smokes, but the data is corrected.',
          effects: { experience: 600, credits: 100 },
        },
        {
          id: 'observe',
          label: 'Study the Future',
          cost: { resource: 'sanity', amount: 20 },
          log: "You read the logs. You learn about the 'Great Silence' of 2030 and the new 'flesh-metal' alloys. Fascinating.",
          effects: { experience: 1000, sanity: -40 },
        },
      ],
      failureOutcome: {
        log: 'The future data overwrites your current work. You have lost hours of progress and your memories of the last shift are... wrong.',
        effects: { sanity: -30, experience: -200 },
      },
    },
    {
      id: 'PAYPHONE_SUIT_OBSERVATION',
      type: 'eldritch_manifestation',
      title: 'The Listener',
      description:
        'As you hold the receiver, you realize the dial tone is matching your heartbeat. Across the terminal, a Suit lowers a newspaper and looks directly at you.',
      totalTime: 30000,
      choices: [
        {
          id: 'stare',
          label: 'Stare Back',
          cost: { resource: 'sanity', amount: 20 },
          log: 'You lock eyes. You hear a high-pitched whine in the earpiece until your nose bleeds. The Suit nods and vanishes behind a pillar.',
          effects: { experience: 500, sanity: -10 },
          storyFlag: { key: 'payphoneSuit', value: true },
        },
        {
          id: 'look_away',
          label: 'Look Away',
          cost: { resource: 'focus', amount: 10 },
          log: 'You drop the phone and pretend to tie your shoe. When you look up, the seat is empty.',
          effects: { suspicion: 5 },
        },
      ],
      failureOutcome: {
        log: "You were frozen in fear. The Suit walked right up to the glass and fogged it with his breath. It said 'RUN'.",
        effects: { sanity: -40 },
      },
    },
  ],

  component_failure: [
    {
      id: 'BASE_FAILURE',
      type: 'component_failure',
      title: 'COMPONENT FAILURE',
      description: "is showing signs of imminent failure. It's causing major operational drag.",
      totalTime: 3600000,
      requiredAction: 'REPAIR IN TOOLROOM',
      failureOutcome: {
        log: 'This component continues to degrade, increasing operational costs.',
        effects: {}, // The drain is handled in the tick processor
      },
    },
  ],
  syndicate: syndicateEvents,
  union: unionEvents,
};
