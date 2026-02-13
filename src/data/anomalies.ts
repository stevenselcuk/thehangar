import { JobCard } from '../types';

export interface AnomalyTemplate {
  id: string;
  name: string;
  description: string;
  discoveryLevel: number; // Level requirement to discover
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare';
  retrofitJob: Omit<JobCard, 'id' | 'timeLeft' | 'totalTime'>;
}

export const anomaliesData: AnomalyTemplate[] = [
  // EXISTING ANOMALIES (Enhanced)
  {
    id: 'ANOM_RESONATOR_1',
    name: 'Harmonic Crystalline Resonator',
    description:
      'A piece of smoked quartz that vibrates at a frequency that is technically impossible. It makes the air around it feel warm and taste of sugar. The frequency matches the natural resonance of 2024-T3 aluminum alloy at exactly 847 Hz.',
    discoveryLevel: 10,
    rarity: 'uncommon',
    retrofitJob: {
      title: 'Retrofit Galley Coffee Maker',
      description:
        'Retrofit the galley coffee maker with a resonance-based heating element derived from the anomalous resonator. This should make it... more efficient. The installation requires Alclad 2024 sheet metal and precise frequency calibration.',
      requirements: {
        crystallineResonators: 5,
        alclad: 20, // Alclad 2024-T3 aluminum alloy sheets
      },
      rewardXP: 2000,
      isRetrofit: true,
      bonusId: 'focus_regen_coffee',
    },
  },
  {
    id: 'ANOM_FILAMENT_1',
    name: 'Bio-Mechanical Filament',
    description:
      'A strand of what looks like fiber-optic cable, except it contracts rhythmically like muscle tissue and bleeds a thin, clear fluid when cut. Analysis shows it conducts both electrical signals and hydraulic pressure at 3000 PSI—exactly the nominal pressure of an A310 Green hydraulic system.',
    discoveryLevel: 15,
    rarity: 'rare',
    retrofitJob: {
      title: 'Reinforce Hydraulic Lines',
      description:
        'Weave the bio-filaments into the existing hydraulic lines. The organic material should self-seal minor leaks, increasing system resilience. Compatible with Skydrol Type IV phosphate ester hydraulic fluid. Warning: Material exhibits anomalous behavior when exposed to temperatures above 135°C.',
      requirements: {
        bioFilament: 10,
        skydrol: 1, // Skydrol Type IV hydraulic fluid
      },
      rewardXP: 2500,
      isRetrofit: true,
      bonusId: 'tool_degrade_resist',
    },
  },

  // NEW ANOMALIES (Real-world aviation data integrated)
  {
    id: 'ANOM_HYDRAULIC_1',
    name: 'Phosphorescent Accumulator',
    description:
      'An aircraft hydraulic accumulator that glows faintly green in darkness. The pressure gauge reads 206 bar (3000 PSI) constantly, regardless of system pressure. When disconnected, it continues to maintain pressure indefinitely. The nitrogen pre-charge never depletes. Installation tag reads: "MFG DATE: 1947" but the part number matches a 1992 A330 specification.',
    discoveryLevel: 18,
    rarity: 'rare',
    retrofitJob: {
      title: 'Install Anomalous Accumulator',
      description:
        'Replace the Yellow hydraulic system accumulator (3125 or 3126) with the phosphorescent unit. System will maintain pressure without engine-driven pumps. Caution: Unit exhibits temporal inconsistencies. Pressure readings may reference future maintenance events.',
      requirements: {
        phosphorescentAccumulator: 1,
        skydrol: 2,
        torqueWrench: 1, // Requires calibrated torque wrench
      },
      rewardXP: 3500,
      isRetrofit: true,
      bonusId: 'passive_hydraulic_pressure',
    },
  },
  {
    id: 'ANOM_ELECTRICAL_1',
    name: 'Self-Wiring Circuit Breaker',
    description:
      "A 7.5A circuit breaker (P/N: 333T51) that, when installed, grows copper filaments overnight to connect itself to nearby electrical buses. The filaments bypass the main junction boxes. Tripping the breaker causes lights to flicker in sections of the hangar that aren't on the same electrical grid. The breaker is always slightly warm, even when de-energized.",
    discoveryLevel: 20,
    rarity: 'very_rare',
    retrofitJob: {
      title: 'Integrate Neural Circuit Breaker',
      description:
        'Install the anomalous breaker on panel 133VU in position 7GX (Cargo Door Pump circuit). The self-organizing wiring will optimize electrical distribution, reducing power consumption by 15%. Side effects may include: phantom voltage readings, temporal displacement of electrical loads, and occasional manifestation of the Janitor near electrical panels.',
      requirements: {
        neuralCircuitBreaker: 1,
        electricalTape: 10,
        wirelock: 5, // MS20995 lockwire, 0.032" diameter
      },
      rewardXP: 4000,
      isRetrofit: true,
      bonusId: 'reduced_power_consumption',
    },
  },
  {
    id: 'ANOM_STRUCTURAL_1',
    name: 'Regenerative Rivet Stock',
    description:
      'A sealed can labeled MS20470AD-4-6 (universal head rivets, 1/8" diameter, 3/8" length). When you install a rivet from this can, another identical rivet materializes inside the can the next morning. The rivets are dimensionally perfect—exact shank diameter of 0.1265", exact grip length. But when you measure the same rivet twice, the second measurement is always 0.0001" different. The can is never empty. The can is never full.',
    discoveryLevel: 12,
    rarity: 'uncommon',
    retrofitJob: {
      title: 'Reinforce Primary Structure',
      description:
        'Use the regenerative rivets to repair stress cracks in fuselage stringers (Frame 18-59, Stringer 23L/R). The self-replacing stock ensures you never run out during long maintenance shifts. Warning: Rivets installed during the graveyard shift have a 3% chance of migrating to adjacent rivet holes. Structural integrity somehow improves.',
      requirements: {
        regenerativeRivets: 40,
        rivetGun: 1,
        buckingBar: 1,
      },
      rewardXP: 2200,
      isRetrofit: true,
      bonusId: 'infinite_rivet_supply',
    },
  },
  {
    id: 'ANOM_ENGINE_1',
    name: 'Whispering Turbine Blade',
    description:
      "A single compressor blade from a CFM56-5C engine. It hums at idle frequency (5,240 RPM N2 spool) when held, even though it's not installed in an engine. If you place it against your ear, you hear radio transmissions from flights that haven't departed yet. The blade's leading edge exhibits no erosion despite the material certification tag reading \"TIME SINCE NEW: 47,891 hours\"—three times the rated service life.",
    discoveryLevel: 25,
    rarity: 'very_rare',
    retrofitJob: {
      title: 'Install Prophetic FOD Detector',
      description:
        'Mount the blade in the engine intake as a Foreign Object Debris sensor. It will vibrate 30 seconds before any FOD enters the intake path, giving you time to shut down the engine. Side effect: The blade occasionally transmits ACARS messages to maintenance control describing faults that will occur in 72 hours.',
      requirements: {
        whisperingBlade: 1,
        safetywire: 20, // CRES lockwire 0.032"
        engineOil: 1, // Mobil Jet Oil II
      },
      rewardXP: 5000,
      isRetrofit: true,
      bonusId: 'fod_precognition',
    },
  },
  {
    id: 'ANOM_AVIONICS_1',
    name: 'Recursive Flight Data Recorder',
    description:
      "A Cockpit Voice Recorder (CVR) that records conversations that haven't happened yet. When you play back the tape, you hear your own voice discussing a write-up you haven't written. The timestamp is always exactly 3 days, 7 hours, and 12 minutes in the future. The unit is a Fairchild FA2100, serial number: [REDACTED]. It passed its last 5-year certification in 2031.",
    discoveryLevel: 30,
    rarity: 'very_rare',
    retrofitJob: {
      title: 'Install Temporal CVR System',
      description:
        'Replace the existing CVR (ATA 31-60-00) with the recursive unit. Flight crews will receive audible warnings of system failures 3 days before they occur, drastically reducing AOG events. Warning: Listening to your own future conversations may cause severe disorientation, temporal paradoxes, or Sanity loss. The FAA has no regulatory framework for this.',
      requirements: {
        recursiveCVR: 1,
        coaxCable: 15, // RG-400 coaxial cable
        cannonPlugs: 8, // MS3116 series connectors
      },
      rewardXP: 6000,
      isRetrofit: true,
      bonusId: 'preemptive_maintenance',
    },
  },
  {
    id: 'ANOM_FUEL_1',
    name: 'Thermodynamically Impossible Fuel Sample',
    description:
      "A bottle of Jet-A fuel that remains at exactly -40°C regardless of ambient temperature. This is impossible—Jet-A's freeze point is -40°C, meaning it should be solid. But it flows normally. It burns normally. When you run a water contamination test, the fuel separator shows water content of -3%. Negative water. The fuel is so dry it absorbs moisture from the air, the test equipment, and your skin.",
    discoveryLevel: 22,
    rarity: 'rare',
    retrofitJob: {
      title: 'Retrofit Fuel Temperature System',
      description:
        'Inject the anomalous fuel into the center tank fuel system. The impossible thermodynamics will prevent fuel temperature from ever reaching freeze point, allowing operations in extreme cold. The fuel-oil heat exchanger (FOHE) will no longer be necessary. Side effect: Fuel quantity indications become probabilistic. You have both 4,500 kg and 6,200 kg simultaneously until you measure it.',
      requirements: {
        impossibleFuel: 5, // 5 liters
        fuelTestKit: 1,
        bonding: 1, // Grounding strap (prevents static discharge)
      },
      rewardXP: 3800,
      isRetrofit: true,
      bonusId: 'no_fuel_freeze',
    },
  },
  {
    id: 'ANOM_LANDING_GEAR_1',
    name: 'Non-Euclidean Torque Link',
    description:
      'A nose landing gear torque link that connects to itself. The upper and lower links are the same component, viewed from different angles. When you measure the distance between the two attachment points, you get different results depending on whether you measure from left to right or right to left. The component has no serial number. It has infinite serial numbers. Installation requires no hardware—the bolts are already installed before you touch them.',
    discoveryLevel: 28,
    rarity: 'very_rare',
    retrofitJob: {
      title: 'Install Paradox Torque Link',
      description:
        'Replace the nose gear torque links (ATA 32-21-11) with the non-Euclidean assembly. The landing gear will exhibit impossible strength—stress loads distribute across dimensions you cannot perceive. Gear extension/retraction will sometimes complete before the hydraulic system is pressurized. The Regular warns: "That part knows where it is because it knows where it isn\'t."',
      requirements: {
        paradoxTorqueLink: 1,
        locknut: 4, // Self-locking nuts, MS21042
        hydraulicFluid: 1, // Skydrol Type IV
      },
      rewardXP: 5500,
      isRetrofit: true,
      bonusId: 'impossible_gear_strength',
    },
  },
  {
    id: 'ANOM_PNEUMATIC_1',
    name: 'Breathing Air Conditioning Pack',
    description:
      'An ACM (Air Cycle Machine) from a 737-800 environmental control system. The turbine spools up and down in rhythm with human respiration—YOUR respiration—even when the aircraft is de-energized and the pack is unpressurized. At night, you can hear it exhaling. Bleed air temperature at pack inlet reads 205°C (401°F), but the air feels cold when it brushes your face. Condensate from the pack drips upward.',
    discoveryLevel: 26,
    rarity: 'rare',
    retrofitJob: {
      title: 'Install Sentient Environmental Pack',
      description:
        'Replace Pack 1 or Pack 2 (ATA 21-31-00) with the breathing unit. Cabin temperature will self-regulate to optimal conditions for human comfort, regardless of pack controller settings. The system will detect hypoxia in crew or passengers 5 minutes before oxygen saturation drops, automatically increasing cabin pressure. Warning: The pack occasionally conditions air from temporal coordinates other than the present.',
      requirements: {
        breathingACM: 1,
        pneumaticDuct: 5, // Flexible pressure duct
        packValve: 2, // Pack flow control valves
      },
      rewardXP: 4500,
      isRetrofit: true,
      bonusId: 'adaptive_cabin_climate',
    },
  },
  {
    id: 'ANOM_BRAKE_1',
    name: 'Anti-Causality Brake Assembly',
    description:
      "A carbon brake heat pack from an A330 main landing gear. When installed, the aircraft stops BEFORE the pilot depresses the brake pedals. Brake temperature sensors read cooling cycles that haven't occurred yet. The anti-skid system shows brake application events from previous flights that never happened. Warning label is in a language that will be invented in 2847. Fusible plugs have melted and resolidified in temporal reverse.",
    discoveryLevel: 35,
    rarity: 'very_rare',
    retrofitJob: {
      title: 'Retrofit Temporal Braking System',
      description:
        'Install the anti-causality brake pack on MLG bogie (ATA 32-44-00). Landing distances will decrease by 40% as braking force is applied retroactively along the runway. Caution: Effect radius extends 500 meters. Other aircraft on the taxiway may experience phantom brake applications. The tower may clear you to cross runway 27L before you request it.',
      requirements: {
        antiCausalityBrakes: 1,
        brakeFluid: 2, // Skydrol for brake accumulators
        torqueMeter: 1, // Calibrated to 200 ft-lbs
      },
      rewardXP: 7000,
      isRetrofit: true,
      bonusId: 'retroactive_braking',
    },
  },
];
