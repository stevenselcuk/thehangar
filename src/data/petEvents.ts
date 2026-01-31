import { GameEvent } from '../types.ts';

/**
 * Events related to "F.O.D." the Hangar Cat.
 * These can be triggered by interacting with the cat or randomly when in the same location.
 */
export const petEvents: Record<string, Omit<GameEvent, 'timeLeft' | 'totalTime'>[]> = {
  // Triggered when petting the cat
  petInteraction: [
    {
      id: 'CAT_PURR_ENGINE',
      title: 'Structural Resonance',
      description:
        'You scratch F.O.D. behind the ears. He emits a purr that sounds like a diesel generator running efficiently.',
      type: 'story_event',
      choices: [
        {
          id: 'continue',
          label: 'Good cat',
          log: 'The vibration settles your nerves. For a moment, the hangar feels less hostile.',
          effects: { sanity: 5, focus: 5 },
        },
      ],
      failureOutcome: {
        log: '',
        effects: {},
      },
    },
    {
      id: 'CAT_STATIC_SHOCK',
      title: 'Static Discharge',
      description:
        'You reach out to pet the cat, but a visible arc of blue static electricity jumps from his fur to your hand. It smells like ozone.',
      type: 'story_event',
      choices: [
        {
          id: 'recoil',
          label: 'Pull back',
          log: 'F.O.D. just blinks at you. The static lingers on your skin.',
          effects: { sanity: -2, focus: 5 },
        },
      ],
      failureOutcome: {
        log: '',
        effects: {},
      },
    },
    {
      id: 'CAT_STARES_BACK',
      title: 'Abyssal Gaze',
      description:
        "F.O.D. stops purring and locks eyes with you. His pupils are rectangular, like a goat's. No, wait, they're normal again.",
      type: 'story_event',
      choices: [
        {
          id: 'blink',
          label: 'Blink slowly',
          log: 'He accepts the gesture. You both agree to ignore what just happened.',
          effects: { sanity: -5, suspicion: -2 },
        },
      ],
      failureOutcome: {
        log: '',
        effects: {},
      },
    },
  ],
  // Triggered when feeding the cat
  feedInteraction: [
    {
      id: 'CAT_EATS_TUNA',
      title: 'Feeding Time',
      description: 'You open the can of tuna. F.O.D. materializes from the shadows instantly.',
      type: 'story_event',
      choices: [
        {
          id: 'feed',
          label: 'Place the bowl',
          log: 'He eats with unnatural speed. The can is licked clean in seconds.',
          effects: { sanity: 10 },
        },
      ],
      failureOutcome: {
        log: '',
        effects: {},
      },
    },
    {
      id: 'CAT_REJECTS_FOOD',
      title: 'Picky Eater',
      description:
        'F.O.D. sniffs the food, looks at the empty corner of the room, hisses at it, and runs away.',
      type: 'story_event',
      choices: [
        {
          id: 'clean',
          label: 'Clean it up',
          log: "Even the rats won't touch it now.",
          effects: { sanity: -5 },
        },
      ],
      failureOutcome: {
        log: '',
        effects: {},
      },
    },
  ],
  // Triggered randomly when in the same location
  randomEncounters: [
    {
      id: 'CAT_HUNTING',
      title: 'The Hunt',
      description: 'F.O.D. is crouching under the wing, tail twitching. He is hunting something.',
      type: 'story_event',
      choices: [
        {
          id: 'watch',
          label: 'See what he catches',
          log: 'He pounces on empty air. But you hear something *crunch* between his teeth.',
          effects: { sanity: -10, focus: 5 },
        },
        {
          id: 'ignore',
          label: 'Get back to work',
          log: 'Best not to know what lives in the hangar interaction.',
          effects: {},
        },
      ],
      failureOutcome: {
        log: '',
        effects: {},
      },
    },
    {
      id: 'CAT_SLEEPING_ON_DOCS',
      title: 'Administrative Barrier',
      description: 'F.O.D. is asleep directly on top of the technical logs you need to sign.',
      type: 'story_event',
      choices: [
        {
          id: 'move',
          label: 'Move him gently',
          log: 'He bites you. Not hard, but enough to draw a drop of blood.',
          effects: { sanity: -2 }, // Health not implemented yet, but good for flavor
        },
        {
          id: 'wait',
          label: 'Wait for him to wake up',
          cost: { resource: 'focus', amount: 10 },
          log: 'It takes 20 minutes. You lose time, but gain peace.',
          effects: { sanity: 5 },
        },
      ],
      failureOutcome: {
        log: '',
        effects: {},
      },
    },
  ],
};
