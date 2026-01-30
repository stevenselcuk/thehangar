import { GameEvent } from '../types.ts';

type EventTemplates = Omit<GameEvent, 'timeLeft'>;

export const syndicateEvents: EventTemplates[] = [
  {
    id: 'SYNDICATE_RECRUITMENT',
    type: 'story_event',
    title: 'Shadowed Offer',
    description:
      "A note slipped into your locker. No signature, just a symbol—a black gear with a crack running through it. 'We see your potential. The Union is weak. Join the true architects.'",
    totalTime: 0,
    choices: [
      {
        id: 'accept',
        label: 'Pocket the Note',
        log: 'You keep the note. Later, you find a small pile of credits in your toolbox. You feel dirty, but richer.',
        effects: { credits: 100, syndicateReputation: 10, unionReputation: -5, suspicion: 5 },
      },
      {
        id: 'burn',
        label: 'Burn It',
        log: 'You burn the note with a lighter. As it burns, the smoke forms shapes... faces. You stomp it out.',
        effects: { unionReputation: 5, syndicateReputation: -5, sanity: -5 },
      },
    ],
    failureOutcome: {
      log: 'You took too long. The note turned to ash in your hands.',
      effects: { sanity: -5 },
    },
  },
  {
    id: 'SYNDICATE_SABOTAGE',
    type: 'incident',
    title: 'Silent Request',
    description:
      "A mechanic you don't recognize whispers to you while passing: 'Bay 4. Hydraulic line. Loosen it. Just a little. It needs to look like an accident.'",
    totalTime: 45000,
    choices: [
      {
        id: 'comply',
        label: 'Loosen the Line',
        cost: { resource: 'sanity', amount: 15 },
        log: "You do it. A small hiss of escaping fluid. The mechanic nods from the shadows. 'Good.'",
        effects: { syndicateReputation: 15, unionReputation: -10, suspicion: 10, credits: 200 },
      },
      {
        id: 'report',
        label: 'Fix it and Report',
        cost: { resource: 'focus', amount: 20 },
        log: 'You tighten the line and file a report. The report disappears from the system minutes later. You feel watched.',
        effects: { unionReputation: 10, syndicateReputation: -15, suspicion: 5 },
      },
    ],
    failureOutcome: {
      log: 'You froze. The mechanic spat at your feet and walked away.',
      effects: { syndicateReputation: -5 },
    },
  },
  {
    id: 'SYNDICATE_BLACK_MARKET',
    type: 'story_event',
    title: 'The Vendor',
    description:
      "The vending machine dispenses a can labeled 'LIQUID VOID'. Below it, a scrawled note: 'For the cause.'",
    totalTime: 30000,
    choices: [
      {
        id: 'drink',
        label: 'Drink It',
        cost: { resource: 'sanity', amount: 10 },
        log: 'It tastes like ozone and copper. Your vision sharpens. You see... inefficiencies.',
        effects: { focus: 50, syndicateReputation: 5 },
      },
      {
        id: 'ignore',
        label: 'Leave it',
        log: "You leave the can. When you look back, it's gone.",
        effects: { focus: -5 },
      },
    ],
    failureOutcome: {
      log: 'The machine hummed aggressively until you walked away.',
      effects: { sanity: -2 },
    },
  },
];
