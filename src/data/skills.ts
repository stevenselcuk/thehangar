export interface Skill {
  id: string;
  name: string;
  description: string;
  tier: number;
  prereq?: string;
}

export const skillsData: { mechanic: Skill[]; watcher: Skill[] } = {
  mechanic: [
    // Tier 1
    {
      id: 'scrapSavant',
      name: 'Scrap Savant',
      description: 'Gain +10% more Alclad from all sources.',
      tier: 1,
    },
    {
      id: 'rivetDiscipline',
      name: 'Rivet Discipline',
      description: 'Install Rivets action costs 1 less Focus.',
      tier: 1,
    },
    {
      id: 'toolCare',
      name: 'Tool Care',
      description: 'All tools degrade 15% slower from use.',
      tier: 1,
    },
    // Tier 2
    {
      id: 'nightShiftSupervisor',
      name: 'Night Shift Supervisor',
      description: 'Night Shift Delegation is 10% more effective and generates 15% less Suspicion.',
      tier: 2,
      prereq: 'scrapSavant',
    },
    {
      id: 'quickLearner',
      name: 'Quick Learner',
      description: 'Gain +10% more Experience from all sources.',
      tier: 2,
      prereq: 'rivetDiscipline',
    },
    {
      id: 'highTorqueMethods',
      name: 'High-Torque Methods',
      description: 'Completing Job Cards has a 20% chance to not degrade the required tools.',
      tier: 2,
      prereq: 'toolCare',
    },
    // Tier 3
    {
      id: 'masterFabricator',
      name: 'Master Fabricator',
      description:
        'Unlocks actions to fabricate rare components (Fiberglass, Titanium) from common ones.',
      tier: 3,
      prereq: 'nightShiftSupervisor',
    },
    {
      id: 'apAuthority',
      name: 'A&P Authority',
      description:
        'Your A&P License carries more weight. Audits are less severe and incidents can be mitigated.',
      tier: 3,
      prereq: 'highTorqueMethods',
    },
  ],
  watcher: [
    // Tier 1
    {
      id: 'keenEye',
      name: 'Keen Eye',
      description:
        'Increased chance of finding story-related items when performing search actions.',
      tier: 1,
    },
    {
      id: 'steadyNerves',
      name: 'Steady Nerves',
      description: 'Passively reduces Sanity loss from all sources by 10%.',
      tier: 1,
    },
    {
      id: 'peripheralVision',
      name: 'Peripheral Vision',
      description: 'Gain a subtle warning in the log just before a random negative Event occurs.',
      tier: 1,
    },
    // Tier 2
    {
      id: 'codebreaker',
      name: 'Codebreaker',
      description:
        'Unlocks the [KARDEX DECRYPTION] project on the Office PC. Each point in this skill increases decryption speed.',
      tier: 2,
      prereq: 'keenEye',
    },
    {
      id: 'unseenPresence',
      name: 'Unseen Presence',
      description: 'Lowers Suspicion gain from risky actions by 20%.',
      tier: 2,
      prereq: 'peripheralVision',
    },
    {
      id: 'dreamJournal',
      name: 'Dream Journal',
      description: 'Sleeping on the canteen table now has a chance to reveal a cryptic clue.',
      tier: 2,
      prereq: 'steadyNerves',
    },
    // Tier 3
    {
      id: 'sixthSense',
      name: 'Sixth Sense',
      description:
        'Greatly enhances Peripheral Vision, sometimes revealing the type of event before it happens.',
      tier: 3,
      prereq: 'unseenPresence',
    },
    {
      id: 'voidWhisperer',
      name: 'Void Whisperer',
      description:
        'Void broadcasts from the radio may be understood, granting a massive XP reward and a clue instead of draining Sanity.',
      tier: 3,
      prereq: 'dreamJournal',
    },
  ],
};
