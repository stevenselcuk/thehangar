import { GameState } from '../types';

export interface LocationTrigger {
  id: string;
  location: string; // 'CANTEEN', 'TERMINAL', 'HANGAR', 'OFFICE', 'BACKSHOPS'
  text: string;
  chance: number; // 0-1
  condition?: (state: GameState) => boolean;
  effect?: (state: GameState) => void;
}

export const locationTriggers: LocationTrigger[] = [
  // CANTEEN
  {
    id: 'CANTEEN_WHISPER',
    location: 'CANTEEN',
    text: 'You hear a mechanic whispering to a vending machine. The machine whispers back.',
    chance: 0.1,
  },
  {
    id: 'CANTEEN_FOOD',
    location: 'CANTEEN',
    text: 'The stew today is... grey. It pulses slightly.',
    chance: 0.05,
  },

  // TERMINAL
  {
    id: 'TERMINAL_GLITCH',
    location: 'TERMINAL',
    text: "A line of code flashes on the screen: 'THEY ARE LISTENING'. It disappears instantly.",
    chance: 0.15,
  },
  {
    id: 'TERMINAL_REFLECTION',
    location: 'TERMINAL',
    text: 'In the black screen reflection, you see someone standing behind you. You turn. Empty.',
    chance: 0.1,
  },

  // HANGAR
  {
    id: 'HANGAR_SHADOW',
    location: 'HANGAR',
    text: 'The shadow of the aircraft seems to move on its own.',
    chance: 0.08,
  },
  {
    id: 'HANGAR_TOOL',
    location: 'HANGAR',
    text: "You find your 10mm socket. It's covered in a viscous black slime.",
    chance: 0.05,
  },

  // OFFICE
  {
    id: 'OFFICE_PHONE',
    location: 'OFFICE',
    text: 'The phone rings. You pick it up. Just static and heavy breathing.',
    chance: 0.1,
  },
  {
    id: 'OFFICE_FILE',
    location: 'OFFICE',
    text: 'A file on the desk is labeled with your name. Inside is a photo of you sleeping.',
    chance: 0.05,
  },

  // BACKSHOPS
  {
    id: 'BACKSHOP_MEETING',
    location: 'BACKSHOPS',
    text: 'You walk into a conversation that stops immediately. Three mechanics stare at you until you leave.',
    chance: 0.2,
  },
  {
    id: 'BACKSHOP_NOISE',
    location: 'BACKSHOPS',
    text: 'The CNC machine is singing. It sounds like a lullaby.',
    chance: 0.1,
  },

  // APRON
  {
    id: 'APRON_WIND',
    location: 'APRON',
    text: 'The wind across the tarmac sounds like a screaming child.',
    chance: 0.1,
  },
  {
    id: 'APRON_FIGURE',
    location: 'APRON',
    text: "You see a figure standing by the perimeter fence. When you blink, it's gone.",
    chance: 0.05,
  },
];
