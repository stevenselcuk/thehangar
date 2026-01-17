import { AircraftData, AircraftType } from '../types';

export const aircraftData: AircraftData[] = [
  {
    id: AircraftType.MD_80,
    name: 'McDonnell Douglas MD-80',
    description:
      'An aging workhorse. Known for its distinctive T-tail and noisy, rear-mounted engines. Requires constant vigilance.',
    flightLogEntries: [
      'MD-80 Flight Log: #2 engine EGT is running hot again. Monitoring.',
      'MD-80 Flight Log: Autopilot intermittently disengaging during cruise. Cycled power, seems stable now.',
      'MD-80 Flight Log: Cabin pressure fluctuation noted passing FL250. No masks deployed.',
      'MD-80 Flight Log: A strange, high-pitched whine can be heard from the aft galley. Not related to engine spool.',
      "MD-80 Flight Log: Captain reports seeing St. Elmo's fire on the cockpit windows, but there was no storm.",
    ],
    cabinLogEntries: [
      'MD-80 Cabin Log: Passenger in 22F reports window shade lowers on its own.',
      "MD-80 Cabin Log: Overhead bin C2 won't latch. Smells of ozone.",
      'MD-80 Cabin Log: Water from the aft lavatory sink is running black.',
      'MD-80 Cabin Log: Several passengers heard what sounded like Morse code tapped from inside the fuselage.',
      'MD-80 Cabin Log: The carpet in the aft galley is inexplicably damp and cold to the touch.',
    ],
    eventPool: [
      { id: 'MD80_HYDRAULIC_LEAK', type: 'accident' },
      { id: 'MD80_STUCK_FLAP', type: 'incident' },
      { id: 'MD80_ENGINE_VIBRATION', type: 'incident' },
      { id: 'MD80_ELECTRICAL_GHOST', type: 'eldritch_manifestation' },
      { id: 'MD80_SMOKE_IN_CABIN', type: 'accident' },
    ],
  },
  {
    id: AircraftType.B737_400,
    name: 'Boeing 737-400 Classic',
    description:
      'A reliable, well-known classic. Millions of flight hours on this airframe type, but this specific one feels... tired.',
    flightLogEntries: [
      '737-400 Flight Log: Yaw damper light flickered on approach. No fault found on ground.',
      '737-400 Flight Log: Noticeable rudder trim imbalance above FL300.',
      '737-400 Flight Log: Center fuel tank pumps are slower than usual.',
      '737-400 Flight Log: Weather radar displayed a large, stationary object over the Pacific. Cleared after a system reset.',
      '737-400 Flight Log: HF radio picked up what sounded like chanting on an empty frequency.',
    ],
    cabinLogEntries: [
      '737-400 Cabin Log: Row 14 is missing. The seat numbers jump from 12 to 15.',
      '737-400 Cabin Log: Galley oven trips the breaker if you look at it for too long.',
      "737-400 Cabin Log: Passenger complained of a 'face in the clouds' visible only from seat 7A.",
      '737-400 Cabin Log: Reading lights in row 10 flicker in unison, regardless of switch position.',
      "737-400 Cabin Log: A child's drawing of a man with no face was found taped to the inside of a lavatory door.",
    ],
    eventPool: [
      { id: 'B734_PACK_FAILURE', type: 'incident' },
      { id: 'B734_CORROSION_WARNING', type: 'incident' },
      { id: 'B734_FUEL_IMBALANCE', type: 'accident' },
      { id: 'B734_STATIC_DISCHARGE', type: 'eldritch_manifestation' },
      { id: 'B734_CABIN_PRESSURE_LOSS', type: 'accident' },
    ],
  },
  {
    id: AircraftType.B737_700,
    name: 'Boeing 737-700 (Special Variant)',
    description:
      "Looks like a passenger jet, but the fuselage has strange, flush-mounted antennae. It flies routes that don't exist on public record. Highly suspicious.",
    isSuspicious: true,
    flightLogEntries: [
      "737-700 Log: SIGINT array power draw exceeds limits during 'non-active' phases. Disregard.",
      "737-700 Log: Main databus experiencing high-frequency packet loss. Tech reports 'outside interference'.",
      '737-700 Log: GPS position deviates from inertial reference by 0.001 degrees for 3.14 seconds, every hour.',
      '737-700 Log: Aft electronics bay temperature is 20 degrees below ambient. The housing is cold to the touch.',
      '737-700 Log: Logbook entry redacted with black ink. A faint smell of burnt ozone remains.',
    ],
    cabinLogEntries: [
      '737-700 Cabin Log: All cabin logs are classified. Unauthorized access is a federal offense.',
      '737-700 Cabin Log: The windows in the main cabin are opaque and cannot be opened.',
      '737-700 Cabin Log: A persistent, low-frequency hum is audible throughout the cabin. It is not engine-related.',
      '737-700 Cabin Log: The cabin air has a sterile, metallic taste.',
      "737-700 Cabin Log: A single entry reads: 'Asset contained. Biologicals nominal. Proceeding to black site.'",
    ],
    eventPool: [
      { id: 'B737_DATA_SURGE', type: 'eldritch_manifestation' },
      { id: 'B737_SUIT_INSPECTION', type: 'audit' },
      { id: 'B737_CRYPTONYMS', type: 'incident' },
      { id: 'B737_LOCKDOWN', type: 'accident' },
      { id: 'B737_MIMIC', type: 'eldritch_manifestation' },
    ],
  },
  {
    id: AircraftType.A330,
    name: 'Airbus A330',
    description:
      'A wide-body, long-range aircraft. Built for ETOPS, it spends most of its life over dark, empty oceans.',
    flightLogEntries: [
      'A330 Log: ETOPS fuel check shows 1kg/hr discrepancy. Within limits, but noted.',
      'A330 Log: During Atlantic crossing, First Officer reported a brief, unexplained roll to the left.',
      'A330 Log: Sat-Com link lost for 9 minutes over the polar route. No weather anomalies reported.',
      'A330 Log: One of the crew rest bunks was found buckled from the inside.',
      "A330 Log: Waypoint 'ETARU' does not exist in the navigation database but appeared on the flight plan.",
    ],
    cabinLogEntries: [
      'A330 Cabin Log: Passenger reported seeing a face in the reflection of the dark ocean at night.',
      'A330 Cabin Log: IFE system in Section 3 rebooted simultaneously, displaying only static for 30 seconds.',
      "A330 Cabin Log: A passenger's watch was running backwards after the flight.",
      "A330 Cabin Log: Multiple reports of the cabin feeling 'longer' during night flights.",
      'A330 Cabin Log: A faint smell of saltwater was reported in the forward galley, thousands of miles from the coast.',
    ],
    eventPool: [
      { id: 'A330_ETOPS_ANXIETY', type: 'incident' },
      { id: 'A330_GHOST_CALL', type: 'eldritch_manifestation' },
      { id: 'A330_BULK_CARGO_SHIFT', type: 'accident' },
      { id: 'A330_TIME_DILATION', type: 'eldritch_manifestation' },
      { id: 'A330_FDR_GLITCH', type: 'incident' },
    ],
  },
  {
    id: AircraftType.B777_200ER,
    name: 'Boeing 777-200ER',
    description:
      'A massive twin-engine jet designed for the longest ETOPS routes. Its massive engines sound like a lament.',
    flightLogEntries: [
      '777 Log: Right engine oil temperature fluctuates in a perfect sine wave pattern.',
      '777 Log: ETOPS critical fuel calculation required manual override. The FMC was off by 3 tons.',
      '777 Log: Autothrottle commanded a sudden, unprompted increase to max power over the Indian Ocean. Disconnected.',
      '777 Log: Aft cargo fire sensor B failed its test, then cleared itself 10 minutes later.',
      '777 Log: The logbook is filled with hundreds of pages of identical, perfect handwriting, all signing off routine checks.',
    ],
    cabinLogEntries: [
      "777 Cabin Log: Passenger in 42L reported the wing was 'breathing'.",
      "777 Cabin Log: The entire cabin lighting system dimmed in time with a passenger's heartbeat for 3 minutes.",
      '777 Cabin Log: A flight attendant found a single, perfect black feather on the floor of the empty galley.',
      '777 Cabin Log: All clocks in the cabin were found to be 7 minutes slow after a 14-hour flight.',
      "777 Cabin Log: A passenger's e-reader was filled with text in a language that had no vowels.",
    ],
    eventPool: [
      { id: 'B777_ENGINE_HARMONICS', type: 'eldritch_manifestation' },
      { id: 'B777_ETOPS_PAPERWORK', type: 'incident' },
      { id: 'B777_GHOST_IN_THE_FMC', type: 'incident' },
      { id: 'B777_CARGO_TEMP_DROP', type: 'accident' },
      { id: 'B777_VOYAGEUR_SIGNAL', type: 'eldritch_manifestation' },
    ],
  },
  {
    id: AircraftType.A300_CARGO,
    name: 'Airbus A300 (Cargo)',
    description:
      'An ancient, converted freighter. MSN 20. Its flight cycle count is astronomical. The main cargo deck is a vast, dark cavern.',
    flightLogEntries: [
      'A300 Log: Fuselage skin temperature is 5 degrees colder than ambient on the ground.',
      "A300 Log: Main cargo door hydraulics are straining. The door groans like it's in pain when opening.",
      'A300 Log: Noticeable vibration from the main deck floor at cruise. Not engine related.',
      'A300 Log: One of the fire extinguisher bottles in the cargo hold is completely empty, with no record of discharge.',
      'A300 Log: The transponder code intermittently switches to 7700 (emergency) for a single cycle.',
    ],
    cabinLogEntries: [
      'A300 Cabin Log: N/A - Cargo Configuration.',
      'A300 Cabin Log: N/A - See Manifest.',
      'A300 Cabin Log: N/A - Supernumerary seat shows signs of claw marks.',
      'A300 Cabin Log: N/A - A strange, organic resin is coating the inside of ULD container 4.',
      "A300 Cabin Log: N/A - The manifest lists 'Geological Samples', but the crate is humming.",
    ],
    eventPool: [
      { id: 'A300_CARGO_SHIFT', type: 'accident' },
      { id: 'A300_METAL_FATIGUE', type: 'incident' },
      { id: 'A300_SOMETHING_AWAKE', type: 'eldritch_manifestation' },
      { id: 'A300_DOOR_SEAL_FAIL', type: 'accident' },
      { id: 'A300_MANIFEST_LIE', type: 'eldritch_manifestation' },
    ],
  },
];
