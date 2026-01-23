import { GameEvent } from '../types.ts';

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
          log: 'You present your A&P license and tool calibration logs. The inspector nods and moves on. A close call.',
          effects: { experience: 350, suspicion: 5 },
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
        'A klaxon blares. Emergency lights flash. The monitoring system for a secure storage unit in Bay 4C is offline. You must re-engage the magnetic locks manually.',
      totalTime: 25000,
      requiredAction: 'Re-engage Magnetic Locks',
      successOutcome: {
        log: 'You slammed the override switch. The locks whine and re-engage with a deafening CLANG. The klaxon stops. The silence is somehow worse.',
        effects: { experience: 500, sanity: -15 },
      },
      failureOutcome: {
        log: "You were too late. A wave of intense cold washes over you as something... leaves. The alert ends. A single log is filed: 'SYSTEM RESET'.",
        effects: { sanity: -50, suspicion: 30 },
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
      id: 'KARDEX_RECOVERY',
      type: 'eldritch_manifestation',
      title: 'ANOMALOUS FILE',
      description:
        "You find a KARDEX file card on the floor. It pulses with a faint heat. The aircraft registration listed is 'N-VOID-00'.",
      totalTime: 45000,
      choices: [
        {
          id: 'read',
          label: 'Read the File',
          cost: { resource: 'sanity', amount: 15 },
          log: 'The text shifts as you read it. It describes maintenance on a vessel that flies between stars. You gain forbidden knowledge.',
          effects: { experience: 500, sanity: -20 },
        },
        {
          id: 'burn',
          label: 'Burn It',
          cost: { resource: 'focus', amount: 10 },
          log: 'You light the card on fire. It screams—a high pitched digital shriek—before turning to ash. You feel lighter.',
          effects: { sanity: 5, suspicion: 5 },
        },
      ],
      failureOutcome: {
        log: "You held the card too long. The ink seemed to seep into your skin. You can't wash it off.",
        effects: { sanity: -25, suspicion: 10 },
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
  ],
  canteen_incident: [],
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
};
