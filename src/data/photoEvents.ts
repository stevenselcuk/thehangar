import { GameEvent } from '../types';

export interface PhotoEvent extends GameEvent {
  triggerCondition?: 'rummage_only' | 'random_terminal' | 'specific_action';
  weight?: number; // For weighted random selection
}

export const photoEvents: PhotoEvent[] = [
  // 1. The Postcard (User Requested Helper)
  {
    id: 'EVENT_RARE_POSTCARD',
    title: 'A MESSAGE FROM ELSEWHERE',
    description:
      "Buried at the bottom of the Lost & Found box, beneath layers of dust and forgotten gloves, you find a postcard. It depicts a place that is impossibly bright. It's addressed to you.",
    type: 'story_event',
    totalTime: 0,
    timeLeft: 0,
    imagePath: '/images/postcard.png',
    triggerCondition: 'rummage_only',
    weight: 10,
    choices: [
      {
        id: 'keep',
        label: 'Keep It',
        log: "As you touch the card, a flood of memories that aren't yours washes over you. You understand everything. You are ready for what comes next.",
        effects: { sanity: 100, experience: 5000 },
        storyFlag: { key: 'foundPhoto', value: true },
      },
    ],
    failureOutcome: {
      log: 'You lost it.',
      effects: {},
    },
  },
  // 2. The Polaroid of the Empty Hangar
  {
    id: 'EVENT_PHOTO_EMPTY_HANGAR',
    title: 'THE EMPTY HANGAR',
    description:
      'A polaroid photo falls from a manual. It shows the main hangar, completely empty. No planes, no tools, no people. The date on the back is tomorrow.',
    type: 'story_event',
    totalTime: 0,
    timeLeft: 0,
    imagePath: '/images/postcard.png', // Placeholder until user adds more images
    triggerCondition: 'rummage_only',
    weight: 5,
    choices: [
      {
        id: 'study',
        label: 'Study the Details',
        log: "You look closer. There are shadows on the walls that shouldn't be there. They look like wings.",
        effects: { sanity: -10, experience: 500 },
      },
      {
        id: 'discard',
        label: 'Burn It',
        log: 'You burn the photo with your lighter. The smoke smells like ozone.',
        effects: { sanity: 5 },
      },
    ],
    failureOutcome: { log: 'It slipped away.', effects: {} },
  },
  // 3. The Blueprint Fragment
  {
    id: 'EVENT_BLUEPRINT_FRAGMENT',
    title: 'IMPOSSIBLE ARCHITECTURE',
    description:
      'A blueprint fragment used as a bookmark. It details a sub-basement level 4. The hangar only has a sub-basement level 1.',
    type: 'story_event',
    totalTime: 0,
    timeLeft: 0,
    imagePath: '/images/postcard.png', // Placeholder
    triggerCondition: 'rummage_only',
    weight: 5,
    choices: [
      {
        id: 'memorize',
        label: 'Memorize the Layout',
        log: 'You memorize the corridor structure. You feel a headache coming on, but you know where the air ducts go now.',
        effects: { sanity: -15, experience: 800 },
      },
    ],
    failureOutcome: { log: 'Lost.', effects: {} },
  },
  // 4. The Employee Badge
  {
    id: 'EVENT_OLD_BADGE',
    title: 'REDACTED ID',
    description:
      'An old employee badge. The face has been scratched out violently. The name is... yours?',
    type: 'story_event',
    totalTime: 0,
    timeLeft: 0,
    imagePath: '/images/postcard.png', // Placeholder
    triggerCondition: 'rummage_only',
    weight: 3,
    choices: [
      {
        id: 'claim',
        label: 'Put it On',
        log: 'It fits perfectly. Security doors might open for you now.',
        effects: { suspicion: 20, experience: 1000 },
      },
    ],
    failureOutcome: { log: 'Lost.', effects: {} },
  },
  // 5. The Flight Plan
  {
    id: 'EVENT_FLIGHT_PLAN_VOID',
    title: 'FLIGHT PLAN: VOID',
    description:
      "A crumpled flight plan for a Boeing 737. Destination: NULL. Cargo: 'Biological Assets'.",
    type: 'story_event',
    totalTime: 0,
    timeLeft: 0,
    imagePath: '/images/postcard.png', // Placeholder
    triggerCondition: 'rummage_only',
    weight: 5,
    choices: [
      {
        id: 'decode',
        label: 'Decode Coordinates',
        log: 'The coordinates point to a location in the middle of the Atlantic. But the altitude is listed as -20,000 ft.',
        effects: { sanity: -5, experience: 300 },
      },
    ],
    failureOutcome: { log: 'Lost.', effects: {} },
  },
  // 6. The Menu
  {
    id: 'EVENT_CANTEEN_MENU',
    title: 'ANCIENT MENU',
    description:
      "A canteen menu from 1975. The special is 'Grey Stew'. It looks exactly like what they served today.",
    type: 'story_event',
    totalTime: 0,
    timeLeft: 0,
    imagePath: '/images/postcard.png', // Placeholder
    triggerCondition: 'rummage_only',
    weight: 8,
    choices: [
      {
        id: 'laugh',
        label: 'Laugh it Off',
        log: "You chuckle. It's just a coincidence. Use recycled paper, right?",
        effects: { sanity: 5 },
      },
    ],
    failureOutcome: { log: 'Lost.', effects: {} },
  },
  // 7. The Security Log
  {
    id: 'EVENT_SECURITY_LOG_PAGE',
    title: 'LOG PAGE 404',
    description:
      'A torn page from a physical security log. It lists your arrival time as 3:00 AM. You arrived at 8:00 AM.',
    type: 'story_event',
    totalTime: 0,
    timeLeft: 0,
    imagePath: '/images/postcard.png', // Placeholder
    triggerCondition: 'rummage_only',
    weight: 5,
    choices: [
      {
        id: 'correct',
        label: 'Correct the Record',
        log: 'You write the correct time. The ink vanishes as soon as it touches the paper.',
        effects: { sanity: -10 },
      },
    ],
    failureOutcome: { log: 'Lost.', effects: {} },
  },
  // 8. The Warning Note
  {
    id: 'EVENT_WARNING_NOTE',
    title: 'HASTY SCRAWL',
    description:
      "A napkin with shaky handwriting: 'DON'T TRUST THE TOOLROOM MASTER. HE IS LISTENING.'",
    type: 'story_event',
    totalTime: 0,
    timeLeft: 0,
    imagePath: '/images/postcard.png', // Placeholder
    triggerCondition: 'rummage_only',
    weight: 6,
    choices: [
      {
        id: 'heed',
        label: 'Hide the Note',
        log: "You pocket the note. You'll be careful around the Master.",
        effects: { suspicion: -5, sanity: -5 },
      },
    ],
    failureOutcome: { log: 'Lost.', effects: {} },
  },
  // 9. The Child's Drawing
  {
    id: 'EVENT_CHILD_DRAWING',
    title: 'CRAYON DISASTER',
    description:
      'A drawing of an airplane on fire. Stick figures are smiling. One stick figure is labeled with your name.',
    type: 'story_event',
    totalTime: 0,
    timeLeft: 0,
    imagePath: '/images/postcard.png', // Placeholder
    triggerCondition: 'rummage_only',
    weight: 4,
    choices: [
      {
        id: 'tear',
        label: 'Tear It Up',
        log: 'You shred the drawing. It screams like paper tearing, but louder.',
        effects: { sanity: -10 },
      },
    ],
    failureOutcome: { log: 'Lost.', effects: {} },
  },
  // 10. The Ticket Stub
  {
    id: 'EVENT_TICKET_STUB',
    title: 'ONE WAY TICKET',
    description:
      'First class boarding pass. Date: Today. Passenger: [BLANK]. It activates a longing in you to leave.',
    type: 'story_event',
    totalTime: 0,
    timeLeft: 0,
    imagePath: '/images/postcard.png', // Placeholder
    triggerCondition: 'rummage_only',
    weight: 7,
    choices: [
      {
        id: 'fantasy',
        label: 'Daydream',
        log: 'You spend a moment imagining you are on that plane, flying away from the Grey. You lose 10 minutes.',
        effects: { focus: -20, sanity: 10 },
      },
    ],
    failureOutcome: { log: 'Lost.', effects: {} },
  },
  // 11. Transit Check (New Image: apron_3.png)
  {
    id: 'EVENT_TRANSIT_CRATE',
    title: 'UNMANIFESTED CARGO',
    description:
      'During your transit check, you notice a pallet secured with chains instead of straps. It is vibrating frequencies you feel in your teeth rather than hear.',
    type: 'story_event',
    totalTime: 0,
    timeLeft: 0,
    imagePath: '/images/apron_3.png',
    triggerCondition: 'specific_action',
    weight: 10,
    choices: [
      {
        id: 'inspect_chains',
        label: 'Inspect Chains',
        log: "The metal is cold enough to burn. As you touch only a link, you hear a voice in your head: 'NOT YET'.",
        effects: { sanity: -10, experience: 200 },
      },
      {
        id: 'ignore_crate',
        label: 'Mark as Checked',
        log: "You sign off the transit check without looking back. Sometimes it's better not to know.",
        effects: { suspicion: -2, sanity: 5 },
      },
    ],
    failureOutcome: { log: 'You move on.', effects: {} },
  },
  // 12. Observe Sedan (New Image: apron_1.png)
  {
    id: 'EVENT_BLACK_SEDAN_OBSERVE',
    title: 'THE ARRIVAL',
    description:
      "A black sedan is parked on the tarmac near the wing. No plates. Windows tinted absolute black. It shouldn't be here.",
    type: 'story_event',
    totalTime: 0,
    timeLeft: 0,
    imagePath: '/images/apron_1.png',
    triggerCondition: 'specific_action',
    weight: 10,
    choices: [
      {
        id: 'photograph_sedan',
        label: 'Surreptitious Photo',
        log: 'You snap a quick photo. When you review it later, the car is blurred, but a face in the window is crystal clear... screaming.',
        effects: { suspicion: 15, sanity: -15, experience: 500 },
      },
      {
        id: 'approach_sedan',
        label: 'Walk Past It',
        log: 'You walk past, eyes forward. You feel a static charge build in the air as you pass. Your radio cuts out.',
        effects: { sanity: -5, suspicion: 5 },
      },
    ],
    failureOutcome: { log: 'It drives away.', effects: {} },
  },
  // 13. Observe Sedan Action (New Image: apron_2.png)
  {
    id: 'EVENT_SEDAN_HANDOFF',
    title: 'THE EXCHANGE',
    description:
      'A suit exits the vehicle. He hands a briefcase to the lead mechanic. The briefcase appears to be dripping a black viscous fluid.',
    type: 'story_event',
    totalTime: 0,
    timeLeft: 0,
    imagePath: '/images/apron_2.png',
    triggerCondition: 'specific_action',
    weight: 10,
    choices: [
      {
        id: 'confront_exchange',
        label: 'Ask "What\'s inside?"',
        log: 'The suit turns to you. He has no face. You wake up 20 minutes later in the breakroom.',
        effects: { sanity: -30, suspicion: 20 },
      },
      {
        id: 'hide_exchange',
        label: 'Duck Behind Gear',
        log: "You hide behind the landing gear. You hear them discussing 'The Timeline'. You learn something you verify later.",
        effects: { experience: 800, sanity: -5 },
      },
    ],
    failureOutcome: { log: 'They conclude business.', effects: {} },
  },
  // 14. Creative Event (New Image: apron_4.png)
  {
    id: 'EVENT_VANISHING_MARSHALLER',
    title: 'THE PHANTOM MARSHALLER',
    description:
      "You follow the marshaller's wand signals precisely. Stop. Cut engines. You look down to set the brake. When you look up, the bay is empty. There was never anyone there.",
    type: 'story_event',
    totalTime: 0,
    timeLeft: 0,
    imagePath: '/images/apron_4.png',
    triggerCondition: 'specific_action',
    weight: 5,
    choices: [
      {
        id: 'check_logs',
        label: 'Check Gate Schedule',
        log: 'The gate was closed for maintenance. No personnel assigned. You were guided by... habit?',
        effects: { sanity: -20 },
      },
      {
        id: 'accept_ghost',
        label: 'Nod and Leave',
        log: "You nod to the empty air. 'Good job,' you whisper. The wind howls back a thank you.",
        effects: { sanity: 5, experience: 100 },
      },
    ],
    failureOutcome: { log: 'Just a trick of the light.', effects: {} },
  },
];
