export interface EndingDefinition {
  id: string;
  name: string;
  description: string;
  requirement?: {
    item?: string;
    flag?: string;
  };
  outcome: {
    log: string;
    gameOver: boolean;
  };
}

export const ENDINGS: Record<string, EndingDefinition> = {
  TRIGGER_ALIEN_ENDING: {
    id: 'TRIGGER_ALIEN_ENDING',
    name: 'Alien Conspiracy',
    requirement: { item: 'metallicSphere' },
    description: 'They were never from here.',
    outcome: {
      log: 'As you hold the sphere, the hangar dissolves into starlight. You are going home, but not to Earth.',
      gameOver: true,
    },
  },
  TRIGGER_GOVT_ENDING: {
    id: 'TRIGGER_GOVT_ENDING',
    name: 'Government Conspiracy',
    description: 'They knew all along.',
    outcome: {
      log: 'The black sedans arrive. You are debriefed. You know too much, but you are useful. Welcome to the program.',
      gameOver: true,
    },
  },
  TRIGGER_CRAZY_ENDING: {
    id: 'TRIGGER_CRAZY_ENDING',
    name: 'Madness Ending',
    description: 'Perhaps it was you all along.',
    outcome: {
      log: 'There is no hangar. There is no plane. Just a padded room and the hum of the ventilation. You scream, but no one answers.',
      gameOver: true,
    },
  },
};
