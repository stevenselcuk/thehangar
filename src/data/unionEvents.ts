import { GameEvent } from '../types.ts';

type EventTemplates = Omit<GameEvent, 'timeLeft'>;

export const unionEvents: EventTemplates[] = [
  {
    id: 'UNION_SOLIDARITY',
    type: 'story_event',
    title: 'Shop Floor Meeting',
    description:
      "A sudden gathering in the breakroom. 'They're cutting corners again,' the rep says. 'We need to slow down. Work to rule. Safety first.'",
    totalTime: 40000,
    choices: [
      {
        id: 'join',
        label: 'Join the Slowdown',
        cost: { resource: 'credits', amount: 50 }, // Dues/Lost OT
        log: 'You work slowly, methodically. The suits upstairs utilize the PA system to complain, but the line holds.',
        effects: { unionReputation: 15, syndicateReputation: -5, suspicion: -5, sanity: 10 },
      },
      {
        id: 'scab',
        label: 'Keep Working Fast',
        cost: { resource: 'focus', amount: 15 },
        log: 'You ignore the meeting and speed up. Your coworkers glare at you. You find grease on your locker handle later.',
        effects: { syndicateReputation: 5, unionReputation: -15, credits: 150 },
      },
    ],
    failureOutcome: {
      log: 'The meeting dispersed before you could decide. You feel isolated.',
      effects: { sanity: -5 },
    },
  },
  {
    id: 'UNION_COLLECTION',
    type: 'incident',
    title: 'Pass the Hat',
    description:
      "Old Man Jenkins got hurt. The company says it was 'operator error' and denied comp. The hat is going around.",
    totalTime: 30000,
    choices: [
      {
        id: 'donate',
        label: 'Donate Generously',
        cost: { resource: 'credits', amount: 100 },
        log: "You throw in a heavy chip. The rep nods. 'We take care of our own.'",
        effects: { unionReputation: 20, sanity: 15 },
      },
      {
        id: 'decline',
        label: 'Decline',
        log: "You shake your head. 'Can't afford it.' The silence is deafening.",
        effects: { unionReputation: -10, suspicion: 5 },
      },
    ],
    failureOutcome: {
      log: 'The hat passed you by. You missed your chance.',
      effects: { unionReputation: -2 },
    },
  },
  {
    id: 'UNION_STRIKE_THREAT',
    type: 'story_event',
    title: 'Rumors of a Walkout',
    description:
      "Whispers of a strike. The air is thick with tension. The Syndicate agents are offering 'protection' for those who keep working.",
    totalTime: 50000,
    choices: [
      {
        id: 'support',
        label: 'Wear the Union Pin',
        cost: { resource: 'suspicion', amount: 10 },
        log: 'You pin the badge to your coveralls. It feels heavy. Management is watching.',
        effects: { unionReputation: 10, syndicateReputation: -10, experience: 100 },
      },
      {
        id: 'inform',
        label: 'Inform the Suits',
        cost: { resource: 'sanity', amount: 20 },
        log: "You tell a suit about the organizers. He smiles. It's not a nice smile. You get a bonus.",
        effects: { credits: 300, unionReputation: -25, syndicateReputation: 15, suspicion: -10 },
      },
    ],
    failureOutcome: {
      log: 'The moment passes. The tension remains.',
      effects: { sanity: -5 },
    },
  },
];
