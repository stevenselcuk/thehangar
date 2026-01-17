import { AircraftScenario, AircraftType } from '../types.ts';

export const aircraftScenarios: Record<AircraftType, AircraftScenario[]> = {
  [AircraftType.MD_80]: [
    {
      id: 'MD80_SCENARIO_1',
      description:
        "While inspecting the MD-80's tail section, you find a loose panel near the #2 engine pylon. Behind it, a bundle of wires seems to have been deliberately cut and spliced with a non-standard, fiber-optic cable that hums faintly.",
      choices: [
        {
          text: 'Report it by the book.',
          outcome: {
            log: 'You file a non-routine report. An engineering team is dispatched. You gain some XP for your diligence but also draw unwanted attention.',
            effects: { experience: 200, suspicion: 5 },
          },
        },
        {
          text: 'Splice it back with standard wiring.',
          outcome: {
            log: "You spend an hour rerouting the connection with standard copper wire. It's a hack, but it works. The humming stops. You find a strange, crystalline shard left over.",
            effects: { experience: 100, crystallineResonators: 1, suspicion: -2 },
          },
        },
        {
          text: 'Ignore it and close the panel.',
          outcome: {
            log: 'Not your problem. You close up the panel and sign off. A lingering feeling of dread tells you this was a mistake.',
            effects: { sanity: -10 },
            event: { type: 'incident', id: 'MD80_ENGINE_VIBRATION' },
          },
        },
      ],
    },
    {
      id: 'MD80_SCENARIO_2',
      description:
        "During a walk-around, you notice a dark, viscous fluid weeping from a seam on the fuselage underside. It's not Skydrol or fuel. It smells faintly of ammonia and ozone.",
      choices: [
        {
          text: 'Take a sample for analysis.',
          outcome: {
            log: "You carefully collect a sample. The fluid is unnaturally cold. As you seal the vial, you feel a wave of dizziness. You've obtained a rare material.",
            effects: { sanity: -5, bioFilament: 5 },
          },
        },
        {
          text: 'Clean it up and seal the panel.',
          outcome: {
            log: 'You clean the fluid with MEK and apply a heavy layer of sealant. The problem is hidden for the next crew to find. Your suspicion drops slightly.',
            effects: { suspicion: -5, mek: -1 },
          },
        },
      ],
    },
  ],
  [AircraftType.B737_400]: [
    {
      id: 'B734_SCENARIO_1',
      description:
        "The #1 engine's thrust reverser cowl won't close properly. You find a heavily-worn teddy bear wedged deep in the mechanism. It seems impossible for it to have gotten there.",
      choices: [
        {
          text: 'Remove it and log it as FOD.',
          outcome: {
            log: "You pull the bear out. It's strangely heavy. You toss it in the FOD bin. The cowl closes perfectly now.",
            effects: { experience: 150 },
          },
        },
        {
          text: "Leave it. It's probably holding something together.",
          outcome: {
            log: "Your gut tells you to leave it. You sign off the check, noting a 'minor alignment issue'. You feel a strange sense of relief, but your sanity frays.",
            effects: { sanity: -15, suspicion: 3 },
          },
        },
      ],
    },
  ],
  [AircraftType.B737_700]: [
    {
      id: 'B737_SCENARIO_1',
      description:
        "While checking an avionics bay, you find a piece of equipment that isn't on any schematic. It's a black box with no markings, wired directly into the Flight Data Recorder. It's warm to the touch.",
      choices: [
        {
          text: 'Disconnect the device.',
          outcome: {
            log: 'As you disconnect the main power lead, all the lights in the hangar flicker and die for a second. The box goes cold. You feel a wave of intense dread.',
            effects: { sanity: -25 },
            event: { type: 'audit', id: 'AUDIT_SUITS' },
          },
        },
        {
          text: 'Leave it alone.',
          outcome: {
            log: 'You close the panel. Some things are better left unknown. Your compliance has been noted somewhere.',
            effects: { suspicion: 10 },
          },
        },
      ],
    },
  ],
  [AircraftType.A330]: [
    {
      id: 'A330_SCENARIO_1',
      description:
        "While inspecting the A330's cargo hold, you find a ULD container that is impossibly cold to the touch and humming faintly. The manifest says it's 'textiles'.",
      choices: [
        {
          text: 'Flag the container for a security check.',
          outcome: {
            log: "You flag the container. An hour later, two 'Suits' arrive, take the container, and alter the logs to show you were never there. Your suspicion spikes, but you also feel you dodged a bullet.",
            effects: { suspicion: 20, sanity: 10 },
          },
        },
        {
          text: 'Crack the seal and look inside.',
          outcome: {
            log: 'You break the seal. For a split second, you see a field of black stars instead of textiles. You slam the door shut, your heart pounding. The vision has shaken you to your core.',
            effects: { sanity: -40, experience: 500 },
          },
        },
      ],
    },
  ],
  [AircraftType.B777_200ER]: [
    {
      id: 'B777_SCENARIO_1',
      description:
        "The maintenance log has an entry you don't remember writing. It's in your handwriting, signing off on a 'harmonic dampener' replacement in Section 41. You don't know what that is, and a full set of your tools are missing.",
      choices: [
        {
          text: 'Report the discrepancy and missing tools.',
          outcome: {
            log: 'You report the issue. The toolroom master is furious, and management logs the incident. Your file is flagged.',
            effects: { suspicion: 15, sanity: 5 },
          },
        },
        {
          text: 'Quietly replace your tools and ignore the entry.',
          outcome: {
            log: "You spend a fortune replacing your tools. It's better than answering questions you don't have answers for. The cost is heavy.",
            effects: { credits: -500, sanity: -10 },
          },
        },
      ],
    },
  ],
  [AircraftType.A300_CARGO]: [
    {
      id: 'A300_SCENARIO_1',
      description:
        'On the main cargo deck, you find deep gouges in the metal floor, leading from a sealed container to the cockpit access door. The marks look like something impossibly heavy was dragged.',
      choices: [
        {
          text: 'Measure and document the marks.',
          outcome: {
            log: 'You document the findings. The depth and spacing of the marks are structurally significant. This is a major write-up.',
            effects: { experience: 300, suspicion: 3 },
          },
        },
        {
          text: 'Cover the marks with a floor plate.',
          outcome: {
            log: 'You find a spare floor plate and rivet it over the gouges. No one will ever know. The silence that follows is unnerving.',
            effects: { sanity: -5, suspicion: -5, rivets: -20 },
          },
        },
      ],
    },
  ],
};
