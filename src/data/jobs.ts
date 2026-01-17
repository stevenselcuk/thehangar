export const jobsData = [
  {
    title: 'Seal L2 Door Leak',
    description: 'Water ingress detected in main cabin door seal.',
    requirements: { alclad: 50, rivets: 100, tools: ['snapOnWrenchSet'] },
    rewardXP: 300,
  },
  {
    title: 'Emergency Wing Patch',
    description: 'Major abrasion on right-wing leading edge requires composite patch.',
    requirements: { alclad: 200, rivets: 50, tools: ['rivetGun', 'atlasCopcoDrill'] },
    rewardXP: 500,
  },
  {
    title: 'Landing Gear Lubrication',
    description: 'Requires Malabar Jack and Grease Gun for seasonal service.',
    requirements: { titanium: 40, rivets: 200, tools: ['malabar', 'greaseGun'] },
    rewardXP: 800,
  },
  {
    title: 'Cockpit Glass Polish',
    description: 'Surface micro-pitting reported by flight crew after sandstorm.',
    requirements: { alclad: 20, titanium: 10, tools: ['inspectionMirror'] },
    rewardXP: 250,
  },
  {
    title: 'IDG Swap',
    description: 'Integrated Drive Generator replacement on Engine 2.',
    requirements: { titanium: 100, tools: ['torquemeter', 'idg'] },
    rewardXP: 1500,
  },
  {
    title: 'FOD Guard Replacement',
    description: 'Intake guard damaged during bird strike.',
    requirements: { alclad: 80, rivets: 120, tools: ['rivetGun'] },
    rewardXP: 400,
  },
];
