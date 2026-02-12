import { GameEvent, SuitType } from '../types.ts';

// Helper type for event templates (omitting 'timeLeft' as it's set on trigger)
type EventTemplate = Omit<GameEvent, 'timeLeft'>;

export const aircraftEvents: Record<string, EventTemplate[]> = {
  accident: [
    // MD-80
    {
      id: 'MD80_HYDRAULIC_LEAK',
      type: 'accident',
      title: 'HYD SYSTEM B - RAPID FLUID LOSS',
      description:
        "Hydraulic System B pressure dropping: 2800...2400...1900 PSI. Purple Skydrol LD-4 is atomizing from the aft pressure line near STA 1642. The mist is caustic. It's hissing like something alive.",
      totalTime: 35000,
      requiredAction: 'Isolate System B per AMM 29-11-00',
      successOutcome: {
        log: 'You close isolation valve 12HV at the aft hydraulic panel, depressurize per procedure. The spray stops. 14 quarts lost. You notice: the leaked fluid has etched your employee number into the aluminum floor panel.',
        effects: { skydrol: -14, experience: 200, sanity: -8 },
      },
      failureOutcome: {
        log: 'The line ruptures completely. Skydrol cascades onto the #2 engine fire detection loop. FALSE FIRE warning triggers. Emergency services called. Aircraft grounded 48 hours. Cost: $47,000. The FAA wants a report.',
        effects: { credits: -47000, suspicion: 25, sanity: -10 },
        event: { type: 'investigation', id: 'FAA_INCIDENT_REVIEW' },
      },
    },
    {
      id: 'MD80_SMOKE_IN_CABIN',
      type: 'accident',
      title: 'SMOKE - FWD CABIN DETECTED',
      description:
        'Smoke detector B-3 triggered. Acrid white smoke pouring from the galley service panel. The smell: burning wiring insulation, ozone, and something metallic—like copper, or blood. Passengers would be evacuating if they were here.',
      totalTime: 40000,
      requiredAction: 'Locate source per AMM 24-00-00',
      successOutcome: {
        log: "You trace it to circuit breaker 3-K-12 (GALLEY BUS TIE). The breaker is welded closed—physically impossible, it's a thermal breaker. You pull it with pliers. The smoke stops. Inside the panel, the wire bundle shows arc damage in the shape of a hand.",
        effects: { experience: 280, sanity: -15, suspicion: 8 },
      },
      failureOutcome: {
        log: "The smoke intensifies. You can't find the source. Fire suppression activates, filling the cabin with Halon 1301. You evacuate. When you return, the smoke is gone. So is 6 feet of wiring. Just...missing from the bundle.",
        effects: { suspicion: 35, sanity: -25, credits: -8500 },
      },
    },
    {
      id: 'MD80_TAILSTRIKE_DAMAGE',
      type: 'accident',
      title: 'AFT FUSELAGE GROUND CONTACT',
      description:
        'Ramp crew reports a "scraping sound" during pushback. You inspect the tail: a 14-inch scrape on the belly skin at STA 1840, just aft of the pressure dome. The metal is deformed. The paint is...wet. It hasn\'t rained in three days.',
      totalTime: 60000,
      requiredAction: 'SRM 53-30-00 damage assessment',
      successOutcome: {
        log: 'You perform dye penetrant inspection per SRM. Findings: no cracks, deformation within limits (0.040" depth). Cosmetic repair authorized. But the penetrant fluoresces in a pattern: coordinates. You Google them: middle of the Pacific, 2000 fathoms deep.',
        effects: { experience: 350, suspicion: 12, sanity: -18, alclad: -8 },
      },
      failureOutcome: {
        log: 'You call Engineering without proper inspection. They ferry the aircraft anyway. At FL370, the pressure dome cracks. Emergency descent. 14 injuries. NTSB preliminary: "Maintenance failure to properly assess damage." Your A&P is suspended.',
        effects: { experience: -1000, suspicion: 200, sanity: -60, credits: -500000 },
        event: { type: 'catastrophic', id: 'LICENSE_SUSPENSION' },
      },
    },

    // B737-400
    {
      id: 'B734_FUEL_IMBALANCE',
      type: 'accident',
      title: 'FUEL IMBAL - XFEED FAULT',
      description:
        "EICAS: FUEL CONFIG. Left tank: 1,240 lbs. Right tank: 3,890 lbs. Imbalance: 2,650 lbs. The crossfeed valve (1-FV-2) won't respond to solenoid commands. Electric pump P2-1 is running but no flow. The aircraft is listing 4° right on the jacks.",
      totalTime: 45000,
      requiredAction: 'Manual crossfeed override per AMM 28-13-00',
      successOutcome: {
        log: 'You access the manual override lever in the fuel panel, force the valve open. Fuel transfers. Balance restored after 8 minutes. But the fuel flow sensor shows negative flow for 3 seconds—fluid moving backwards. Thermodynamically impossible.',
        effects: { experience: 300, focus: -15, sanity: -10 },
      },
      failureOutcome: {
        log: 'You attempt override but strip the valve actuator (P/N: 452T1031-1, torque exceeds 80 ft-lbs). Valve stuck closed. Aircraft cannot fly with >1,000 lb imbalance per AFM. Part lead time: 6 days. Minimum 14 cancelled flights. Cost: $280,000.',
        effects: { credits: -280000, suspicion: 40, experience: -200 },
        event: { type: 'grounding', id: 'EXTENDED_AOG' },
      },
    },
    {
      id: 'B734_CABIN_PRESSURE_LOSS',
      type: 'accident',
      title: 'PRESS - OUTFLOW VLV FAIL',
      description:
        'Ground pressurization test per AMM 21-31-00. Target: 8.35 PSI differential. Actual: 0.2 PSI. The outflow valve is fully open, ignoring commands. Manual motor override: no response. Through the inspection window you see: the valve actuator is rotating backwards.',
      totalTime: 30000,
      requiredAction: 'Emergency valve closure AMM 21-31-45',
      successOutcome: {
        log: 'You manually crank the valve closed using the backup handle (120 turns clockwise per procedure). It seals with resistance at turn 119. On turn 120, the handle pulls back. Hard. You hear metal bending inside the valve body. But it holds pressure.',
        effects: { experience: 280, focus: -20, sanity: -12, alclad: -3 },
      },
      failureOutcome: {
        log: 'The backup system fails—shear pin breaks (by design at 85 ft-lbs). Valve cannot be secured. Attempted flight: pressurization failure at 12,000 ft. Emergency return. 40 PAX oxygen masks deployed. FOD inspection reveals: valve actuator motor was running on AC when only DC is supplied. Electrical impossibility.',
        effects: { credits: -45000, suspicion: 30, sanity: -15 },
      },
    },
    {
      id: 'B734_UNCOMMANDED_SPOILER',
      type: 'accident',
      title: 'FLT CTL - SPOILER DEPLOYMENT',
      description:
        'During taxi-out config test, spoiler panel 3L deploys uncommanded. Speed: 8 knots. Crew reports "significant yaw". You find spoiler mixer PCU (P/N: 65-45890-11) servo valve stuck at 40% extension. Hydraulic pressure: normal. Electrical signal: 0 volts. It shouldn\'t move.',
      totalTime: 50000,
      requiredAction: 'Isolate spoiler per AMM 27-51-00',
      successOutcome: {
        log: 'You pull the spoiler control circuit breaker (C-37), depressurize the PCU per AMM. The panel retracts...slowly. You measure: it took 47 seconds. Spec: 3-5 seconds. As it retracts, the panel surface is ice-cold. Ambient temp: 78°F.',
        effects: { experience: 400, sanity: -20, suspicion: 15 },
      },
      failureOutcome: {
        log: 'You attempt to manually stow the panel without depressurizing. The PCU servo fights you. The panel suddenly slams closed with 3,000 PSI hydraulic force—fractures the hinge fitting. Structural repair required: $67,000, 5 days. Your supervisor demands an explanation.',
        effects: { credits: -67000, suspicion: 50, experience: -300 },
      },
    },

    // B737-700 (Next-Gen - Modern systems)
    {
      id: 'B737_LOCKDOWN',
      type: 'accident',
      title: 'SECURITY - INTRUSION LOCKDOWN',
      description:
        'The aircraft BITE (Built-In Test Equipment) detects "unauthorized FMC access." All doors lock electronically. You are in the flight deck. Door lock override: disabled. Satcom: offline. The FMC displays: "SECURITY MODE ACTIVE. REMAIN CALM."',
      totalTime: 25000,
      choices: [
        {
          id: 'override',
          label: 'Override door panel (DC bus access)',
          cost: { resource: 'focus', amount: 30 },
          log: 'You pop the door control panel cover, short pins A and D per emergency procedure (undocumented, but you learned it from an old timer). The door solenoid clicks. You exit. Behind you, the FMC screen shows: "OVERRIDE NOTED."',
          effects: { experience: 400, suspicion: 25, sanity: -10 },
        },
        {
          id: 'wait',
          label: 'Call for assistance via interphone',
          cost: { resource: 'sanity', amount: 15 },
          log: 'You wait 15 minutes. The door unlocks on its own. Security arrives, reviews logs: no security event recorded. The FMC has no memory of lockdown. Your interphone call? No record. You were talking to no one.',
          effects: { suspicion: 45, sanity: -30, experience: 200 },
        },
      ],
      failureOutcome: {
        log: 'You panic, attempt to force the door. Emergency egress handle: non-functional. You are trapped for 2 hours. When Security finally cuts the power and opens the door, the FMC screen displays your home address and a timestamp: "2300 LOCAL TONIGHT."',
        effects: { sanity: -50, suspicion: 60, focus: -30 },
        event: { type: 'stalking', id: 'SYSTEM_THREAT' },
      },
    },

    // A330
    {
      id: 'A330_BULK_CARGO_SHIFT',
      type: 'accident',
      title: 'CARGO - ULD RESTRAINT FAILURE',
      description:
        'Aft cargo loadmaster reports: "PMC pallet unseated during loading." You inspect: a 2,400 lb pallet (ID: AKE67239) has broken free from locks, shifted 18 inches aft toward the pressure bulkhead at FS 810. The locks are engaged. The pallet moved through them.',
      totalTime: 40000,
      requiredAction: 'Re-secure per AMM 25-72-00',
      successOutcome: {
        log: 'You use the cargo winch (3,000 lb capacity) to reposition the pallet. Net and straps applied per IATA standards. As you torque the restraint fittings to 45 ft-lbs, you notice: the pallet is labeled "DIPLOMATIC CARGO - DO NOT X-RAY." It is warm to the touch. And humming at 60 Hz.',
        effects: { experience: 320, sanity: -12, suspicion: 8 },
      },
      failureOutcome: {
        log: 'You attempt to secure it, but the pallet shifts again during towing. It impacts the bulkhead—0.060" dent detected. Structural inspection required: 8 hours. But worse: the pallet contents are breached. Clear fluid leaking. Hazmat team called. The fluid evaporates before they arrive. No residue.',
        effects: { credits: -34000, suspicion: 40, sanity: -20 },
        event: { type: 'hazmat', id: 'UNKNOWN_SUBSTANCE' },
      },
    },
    {
      id: 'A330_DUAL_HYD_CAUTION',
      type: 'accident',
      title: 'HYD - DUAL SYSTEM LOW PRESSURE',
      description:
        'ECAM: HYD G+Y PRESS LO. Green system: 2,100 PSI (normal: 3,000). Yellow: 1,950 PSI. Both PTU (Power Transfer Units) running but not equalizing pressure. Both engine-driven pumps: nominal RPM. Reservoir levels: full. Pressure is disappearing into nothing.',
      totalTime: 50000,
      requiredAction: 'Isolate leak per AMM 29-13-00',
      successOutcome: {
        log: 'You perform sectional isolation: close shut-off valves for flight controls, landing gear, brakes sequentially. Pressure stabilizes when you isolate the cargo door hydraulic circuit. But that circuit shows no leaks. You open it again: pressure drops. Close: stabilizes. The fluid is flowing to nowhere.',
        effects: { experience: 450, sanity: -25, suspicion: 20 },
      },
      failureOutcome: {
        log: "Unable to locate leak. You service both systems with 8 gallons Skydrol LD-4. Within 30 minutes: pressure drops again. You've added fluid that vanished. Engineering orders a full hydraulic system teardown: $125,000, 72 hours. They find nothing wrong.",
        effects: { credits: -125000, suspicion: 55, skydrol: -8 },
      },
    },

    // B777-200ER
    {
      id: 'B777_CARGO_TEMP_DROP',
      type: 'accident',
      title: 'CARGO TEMP - EXTREME DEVIATION',
      description:
        'Aft cargo zone temp indication: -40°C and dropping. Target: +7°C. The temp controller (P/N: 211-0711-001) shows "SENSOR FAULT" but you verify sensors with multimeter: functioning correctly. Current indication: -89°C. That\'s below dry ice sublimation temp. Frost is forming on the inside of the hull.',
      totalTime: 35000,
      requiredAction: 'Reset environmental control per AMM 21-52-00',
      successOutcome: {
        log: "You cycle the pack controller, close then re-open the trim air valve. Temperature begins rising: -89°C...-45°C...+2°C...+7°C. Stable. But frost patterns on the hull spell words in a language you don't recognize. You take a photo. The image is corrupted.",
        effects: { experience: 400, sanity: -22, suspicion: 12 },
      },
      failureOutcome: {
        log: 'Temperature continues dropping: -120°C. The cargo in that zone (pharmaceutical shipment worth $340,000) is destroyed. Insurance investigation: "Improper maintenance response." But the real mystery: the temperature sensor reads -273.15°C for exactly 0.4 seconds. Absolute zero. Then returns to normal.',
        effects: { credits: -340000, suspicion: 70, sanity: -30 },
        event: { type: 'investigation', id: 'INSURANCE_FRAUD_INQUIRY' },
      },
    },
    {
      id: 'B777_ELEC_BUS_TIE_FAULT',
      type: 'accident',
      title: 'ELEC - BUS TIE BREAKER WELD',
      description:
        'EICAS: ELEC BUS TIE 1 OPEN. You inspect: the BTB (Bus Tie Breaker) is physically closed but electrically open. Testing shows the main contacts are welded together—requires 800°C to weld copper at that cross-section. There has been no fire. The breaker is cold.',
      totalTime: 45000,
      requiredAction: 'Replace BTB per AMM 24-32-11',
      successOutcome: {
        log: 'You de-energize the system, remove the BTB (weighs 47 lbs). The contacts are indeed welded, but the weld pattern shows directionality—as if current flowed from both directions simultaneously. You install a new breaker (P/N: 360C3010-1, cost: $8,400). It works. For now.',
        effects: { experience: 380, credits: -8400, sanity: -15 },
      },
      failureOutcome: {
        log: "You attempt to force the breaker open manually (not procedure). The breaker housing cracks, internal arc flash: 480VAC across the wrench. You're thrown 6 feet. Electrical burn: right hand. Three weeks medical leave. The breaker fuses permanently closed. Electrical system redesign required: $95,000.",
        effects: { credits: -95000, suspicion: 40, sanity: -35, experience: -400 },
        event: { type: 'injury', id: 'ELECTRICAL_BURN' },
      },
    },

    // A300-600 Cargo
    {
      id: 'A300_CARGO_SHIFT',
      type: 'accident',
      title: 'MAIN DECK - ULD DISPLACEMENT',
      description:
        "Forward main deck: a 6,800 lb container (AKN unit, registration XK-9021) has moved 22 inches forward. Impossible—it's locked with four PDU (Powered Drive Unit) locks rated for 18,000 lbs. The floor shows drag marks. The container moved uphill.",
      totalTime: 30000,
      choices: [
        {
          id: 'investigate',
          label: 'Inspect lock mechanism integrity',
          cost: { resource: 'focus', amount: 25 },
          log: 'You examine the PDU locks: engaged, undamaged. You check the rollers: no evidence of movement. Yet the container is 22 inches out of position. You re-secure it with additional straps. The manifest says "Industrial Equipment." The container is breathing. Condensation forms with rhythmic pulses.',
          effects: { experience: 350, sanity: -18, suspicion: 10 },
        },
        {
          id: 'offload',
          label: 'Offload container for inspection',
          cost: { resource: 'credits', amount: 500 },
          log: 'You order the container offloaded. The forklift strains—weight indicator shows 11,200 lbs, not 6,800. Manifest error? You open the container per protocol. Inside: exactly what the manifest states. You re-weigh it: 6,800 lbs. The missing weight is gone.',
          effects: { experience: 400, credits: -500, sanity: -25, suspicion: 15 },
        },
      ],
      failureOutcome: {
        log: 'You ignore the displacement, assuming loading error. During taxi, the container shifts again—impacts the forward pressure bulkhead with 4,200 ft-lbs of force. Bulkhead integrity compromised. Aircraft grounded pending structural inspection: minimum 10 days, $750,000 repair.',
        effects: { credits: -750000, suspicion: 100, experience: -600 },
        event: { type: 'grounding', id: 'STRUCTURAL_DAMAGE' },
      },
    },
    {
      id: 'A300_DOOR_SEAL_FAIL',
      type: 'accident',
      title: 'MAIN CARGO DOOR - SEAL RUPTURE',
      description:
        "Pre-flight pressurization test: forward cargo door seal (P/N: A55456740120) fails at 4.2 PSI differential. You hear it before you see it—a high-pitched scream as air escapes. But it's not just escaping. Something is trying to pull the door open from outside.",
      totalTime: 25000,
      requiredAction: 'Emergency seal replacement AMM 52-11-05',
      successOutcome: {
        log: 'You depressurize immediately, replace the seal with spares (36-foot circumference seal, 3 hours installation). During installation you find: the old seal has teeth marks. Not human. Not animal. The marks are too uniform. Forensics would call them "tool marks." You call them nothing.',
        effects: { experience: 300, sanity: -20, doorSeal: -1, focus: -15 },
      },
      failureOutcome: {
        log: 'The seal fails catastrophically during ground test—blows out with explosive force. The noise reaches 140 dB. Airport fire services respond: false alarm. But the door frame is permanently deformed. Requires frame replacement: $280,000, 14 days. Insurance denies claim: "Maintenance negligence."',
        effects: { credits: -280000, suspicion: 80, sanity: -15 },
      },
    },
  ],

  incident: [
    // MD-80
    {
      id: 'MD80_STUCK_FLAP',
      type: 'incident',
      title: 'FLAP ASYMMETRY - MECHANICAL JAM',
      description:
        "Flap extension test: left flap at 15° as commanded. Right flap: 5°. Asymmetry: 10° (max allowed: 5° per AFM). You inspect the jackscrew—jammed with organic matter. It looks like bone splinters and sinew. Bird strike debris? But this aircraft hasn't flown in 6 days.",
      totalTime: 50000,
      choices: [
        {
          id: 'force',
          label: 'Clear the obstruction per AMM 27-42-00',
          cost: { resource: 'sanity', amount: 20 },
          log: 'You extract the debris with needle-nose pliers and a dental pick. The fragments are definitely bone—hollow, like bird bones. But the size is wrong: this femur is 8 inches long. The largest bird femur: 3 inches (condor). You bag it as FOD. It has human teeth marks.',
          effects: { experience: 350, sanity: -22, suspicion: 8 },
        },
        {
          id: 'defer',
          label: 'Apply MEL 27-42-01 (Flap asymmetry deferral)',
          cost: { resource: 'focus', amount: 10 },
          log: 'You placard the right flap actuator, limit operations to Flaps 11° max per MEL relief (Category C, 10 days). Dispatch accepts. But you notice: the bone fragments have arranged themselves into a pattern on your workbench. The pattern is your home address.',
          effects: { experience: 150, suspicion: 15, sanity: -18 },
        },
      ],
      failureOutcome: {
        log: 'You write it up as "mechanical binding, unable to clear." The next shift attempts forced retraction with hydraulic override—bends the jackscrew (torque limit: 3,000 in-lbs exceeded). Flap system damage: $48,000 repair. Your initial write-up is cited as "incomplete."',
        effects: { credits: -48000, suspicion: 35, experience: -150 },
      },
    },
    {
      id: 'MD80_ENGINE_VIBRATION',
      type: 'incident',
      title: 'ENGINE VIB - HARMONIC RESONANCE',
      description:
        "#2 Engine (JT8D-219): vibration indication at N1 85%. Frequency: 72 BPM. That's not a mechanical frequency—that's a human resting heart rate. Fan blade track-and-balance shows perfect balance (less than 0.5 mil runout). The vibration shouldn't exist.",
      totalTime: 40000,
      choices: [
        {
          id: 'trim',
          label: 'Add balancing weights per AMM 71-00-00',
          cost: { resource: 'focus', amount: 25 },
          log: 'You add two 0.5 oz. weights at the 180° position on the fan hub. Run-up test: vibration eliminated at 85% N1. Perfect. But at 87% N1, a new vibration appears: 0 BPM. Complete stillness. The tachometer reads 87%, but the fan blades are motionless. For 1.2 seconds. Then they resume.',
          effects: { experience: 320, sanity: -15, balanceWeights: -2 },
        },
        {
          id: 'monitor',
          label: 'Defer per MEL 71-31-09 (Vibration monitoring)',
          cost: { resource: 'suspicion', amount: 10 },
          log: 'You install a vibration data recorder (VDR) for trend monitoring. After 3 flights, the VDR shows: vibration occurs only when the aircraft is exactly over 35°N latitude. Nowhere else. GPS correlation: exact. Physics offers no explanation.',
          effects: { experience: 250, suspicion: 10, sanity: -12 },
        },
      ],
      failureOutcome: {
        log: 'You sign off the write-up as "unable to duplicate." The engine fails during climb-out 48 hours later: fan blade liberation, uncontained failure. FOD damage: $1.2M. NTSB finds the blade failed due to "undetected harmonic fatigue." Your signature is on the log.',
        effects: { credits: -1200000, suspicion: 200, sanity: -40, experience: -800 },
        event: { type: 'catastrophic', id: 'UNCONTAINED_ENGINE_FAILURE' },
      },
    },
    {
      id: 'MD80_AUTOPILOT_DISCONNECT',
      type: 'incident',
      title: 'AUTOPILOT - UNCOMMANDED DISCONNECT',
      description:
        "During ground test, the autopilot disconnects every 17 minutes. Precisely. You time it: 17:00.0 intervals. The event log shows the disconnect command originating from the flight director computer. But there's no flight director input. The command is coming from nowhere.",
      totalTime: 45000,
      choices: [
        {
          id: 'swap_computer',
          label: 'Replace autopilot computer per AMM 22-11-25',
          cost: { resource: 'credits', amount: 1200 },
          log: 'You swap the autopilot computer (P/N: 4046400-901). Test: same fault. 17-minute intervals. You swap the flight director: same result. You check the wiring: nominal. The disconnect is real, but the source is not physical.',
          effects: { experience: 300, credits: -1200, sanity: -18, autopilotComputer: -1 },
        },
      ],
      failureOutcome: {
        log: 'Unable to isolate fault. You defer per MEL 22-11-01 (autopilot inop). Flight operations accepts. But during the first flight, the autopilot disconnects at precisely 17:00 into the flight. Then again at 34:00. Then 51:00. The crew reports: each disconnect, they hear a voice on the intercom. Counting down.',
        effects: { suspicion: 45, sanity: -30, experience: 150 },
        event: { type: 'anomaly', id: 'TEMPORAL_PATTERN' },
      },
    },

    // B737-400
    {
      id: 'B734_PACK_FAILURE',
      type: 'incident',
      title: 'AIR COND - PACK L TRIP OFF',
      description:
        'Left air conditioning pack trips offline at engine start. Pack trip sensor indicates 250°C (overheat limit: 235°C). But the pack outlet temp sensor reads 18°C. Both sensors functional per BITE test. The pack is simultaneously too hot and too cold.',
      totalTime: 45000,
      choices: [
        {
          id: 'clean',
          label: 'Inspect heat exchanger per AMM 21-51-00',
          cost: { resource: 'sanity', amount: 15 },
          log: 'You open the heat exchanger access panel. Inside: a grey mucoid substance coating the fins. Not ice. Not oil. Biological? You scrape a sample—it moves. Autonomous motion. You incinerate it per hazmat protocol. The pack operates normally after cleaning. You do not file a contamination report.',
          effects: { experience: 350, sanity: -20, suspicion: -5 },
        },
        {
          id: 'defer',
          label: 'Apply MEL 21-51-02 (Single pack operation)',
          cost: { resource: 'focus', amount: 10 },
          log: 'You defer the left pack, placard per MEL (Category B, 3 days). Single-pack cooling is adequate for current OAT. But after you close the panel, you hear the pack compressor running. The pack is off. The switch is off. The circuit breaker is open. It runs anyway.',
          effects: { experience: 200, suspicion: 20, sanity: -15 },
        },
      ],
      failureOutcome: {
        log: 'You replace the pack trip sensor ($840) without further inspection. Same fault persists. Engineering orders full pack removal ($28,000, 18 hours). Shop inspection: pack is pristine, tests perfect. The fault never reoccurs. You wasted 18 hours and $28,000 chasing a ghost.',
        effects: { credits: -28000, suspicion: 30, experience: -100 },
      },
    },
    {
      id: 'B734_CORROSION_WARNING',
      type: 'incident',
      title: 'STRUCTURE - SKIN CORROSION FWD DOOR',
      description:
        'During phase check, you find a 4-inch diameter corrosion blister on the fuselage skin at STA 360, just below the L1 door sill. Spec: aluminum 2024-T3 clad. The corrosion is bubbling—active. You touch it: warm. The paint surface is moving, flowing like liquid.',
      totalTime: 50000,
      choices: [
        {
          id: 'sand',
          label: 'Remove corrosion per SRM 51-70-02',
          cost: { resource: 'focus', amount: 20 },
          log: 'You sand down to bare metal with 120-grit. The metal beneath is pristine—no corrosion. But the sanding dust is magnetic. Aluminum is non-magnetic. You send a sample to metallurgy: "SAMPLE COMPOSITION UNKNOWN. Contains elements not on periodic table." The report is classified.',
          effects: { experience: 400, suspicion: 40, sanity: -18, alclad: -2 },
          event: { type: 'discovery', id: 'ANOMALOUS_MATERIAL' },
        },
        {
          id: 'paint',
          label: 'Seal with corrosion inhibitor and topcoat',
          cost: { resource: 'credits', amount: 80 },
          log: 'You apply CPC (Corrosion Preventive Compound) and spray 2-part epoxy topcoat. Three coats. The corrosion stops. For 48 hours. Then it returns, under the paint. The paint blisters from beneath. The corrosion is growing.',
          effects: { credits: -80, suspicion: 15, sanity: -10, experience: 150 },
        },
      ],
      failureOutcome: {
        log: 'You report it as "minor surface corrosion" without proper documentation. During next heavy check (18 months later), the corrosion has penetrated 0.090" into the skin (limit: 0.010"). Requires skin doubler installation: $15,000, 40 hours. Your original inspection is questioned.',
        effects: { credits: -15000, suspicion: 50, experience: -200 },
      },
    },
    {
      id: 'B734_RUDDER_FEEL_ANOMALY',
      type: 'incident',
      title: 'FLT CTL - RUDDER FEEL UNIT FAULT',
      description:
        'Pilots report: "Rudder feels mushy, no centering force." You test the rudder feel computer (P/N: 65-40566-7): output signal is a perfect sine wave at 0.33 Hz. Normal: step function with mechanical feedback. The computer is outputting music. Frequency: a low E note.',
      totalTime: 55000,
      choices: [
        {
          id: 'replace',
          label: 'Replace feel computer per AMM 27-72-31',
          cost: { resource: 'credits', amount: 2400 },
          log: "You install a new feel computer. Test: same output. Sine wave, 0.33 Hz. You replace the LVDT sensors (3x, $640 each): same result. You disconnect all inputs: the computer still outputs the sine wave. It's generating the signal internally, without input.",
          effects: { experience: 380, credits: -2400, sanity: -25, rudderFeelComputer: -1 },
        },
      ],
      failureOutcome: {
        log: 'You defer it per MEL 27-72-01 (augmented rudder pressure, Category C). Flight ops accepts. During the first flight, at FL370, the rudder oscillates at 0.33 Hz. Pilots fight it for 8 minutes before it stops. Passenger injuries: 3 (turbulence). Your MEL application is investigated.',
        effects: { suspicion: 60, sanity: -20, credits: -25000 },
        event: { type: 'incident', id: 'PASSENGER_INJURY' },
      },
    },

    // B737-700 (Next-Gen)
    {
      id: 'B737_CRYPTONYMS',
      type: 'incident',
      title: 'ACARS - UNAUTHORIZED TRANSMISSION',
      description:
        'The ACARS printer activates during ground test. No SATCOM connection. No VHF data link. Offline. Yet it prints: "PROJECT BLUE SUN - PHASE IV INITIATED." Below that: "RED KING PROTOCOL ACTIVE." Below that: your employee number. And a timestamp: 3 hours from now.',
      totalTime: 30000,
      choices: [
        {
          id: 'burn',
          label: 'Destroy printout immediately',
          cost: { resource: 'focus', amount: 10 },
          log: 'You tear off the printout, stuff it into the burn barrel outside Hangar 4, douse it with MEK and light it. It burns with a blue flame, leaving no ash. You return to the aircraft. The printer is running again. Same message. You burn that one too. It happens 7 more times.',
          effects: { experience: 200, suspicion: -10, sanity: -15, mek: -1 },
        },
        {
          id: 'read',
          label: 'Research the code names',
          cost: { resource: 'sanity', amount: 30 },
          log: 'You photograph the printout, Google the terms. PROJECT BLUE SUN: a rumored DoD black-ops program, 1987-1991, officially denied. RED KING: no results. You dig deeper: a physics forum mentions "Red King Equations" related to retrocausality—effects preceding causes. Time flowing backwards. Then your research window closes. Your account is locked.',
          effects: { experience: 600, sanity: -35, suspicion: 50 },
          event: { type: 'surveillance', id: 'NETWORK_MONITORING' },
        },
      ],
      failureOutcome: {
        log: 'You leave the printout on the printer. 45 minutes later, two men in grey suits arrive. No names. No badges. They take the printout, the printer, and the ACARS radio. They inspect your toolbox. They leave. You are told: "This conversation never happened." That night, your computer won\'t boot.',
        effects: { suspicion: 80, sanity: -25, experience: 300 },
        event: { type: 'audit', id: 'SPECIAL_ACCESS_PROGRAM' },
      },
    },
    {
      id: 'B737_EMER_LIGHTS_ANOMALY',
      type: 'incident',
      title: 'EMERGENCY LIGHTING - DISCHARGE ANOMALY',
      description:
        'Emergency lighting test per AMM 33-41-00: DC power removed, emergency lights activate as expected. But: the lights are brighter than DC battery operation should allow. You measure: 180 lumens (normal: 90 lumens, DC-powered). The batteries are producing double their rated output.',
      totalTime: 40000,
      choices: [
        {
          id: 'replace',
          label: 'Replace battery pack per AMM 33-41-22',
          cost: { resource: 'credits', amount: 340 },
          log: 'You swap the battery pack (P/N: 440D6020-1, NiCd chemistry). Test: same result. 180 lumens. The new battery is overperforming. You check the charging circuit: nominal 28VDC. But oscilloscope shows brief 96VDC spikes every 0.4 seconds. The voltage is coming from somewhere else.',
          effects: { experience: 350, credits: -340, sanity: -18, emergencyBatteryPack: -1 },
        },
      ],
      failureOutcome: {
        log: 'You ignore the anomaly (lights function, after all). During a night flight simulation, the emergency lights activate uncommanded—full brightness—while aircraft is on external power. Pilots report: lights too bright to see instruments. Flight simulation aborted. Safety investigation: your name is on the last inspection.',
        effects: { suspicion: 40, experience: -100 },
      },
    },

    // A330
    {
      id: 'A330_ETOPS_ANXIETY',
      type: 'incident',
      title: 'ETOPS CERTIFICATION - DISCREPANCY',
      description:
        'Pre-ETOPS departure paperwork review: the aircraft ETOPS certification expires in 4 hours (midnight). But the flight is scheduled for 8:30pm departure, 7.5-hour duration. Dispatch says: "Certification is valid for entire flight if departure is before midnight." Incorrect. ETOPS requires valid cert for entire flight duration.',
      totalTime: 40000,
      choices: [
        {
          id: 'certify',
          label: 'Expedite ETOPS recertification check',
          cost: { resource: 'focus', amount: 35 },
          log: 'You perform the ETOPS check per AMM 05-51-00: 38 items, 2.5 hours. APU ETOPS run: 45 min. ETOPS equipment verification: 30 min. You finish at 11:47pm. Certification extended 180 days. But item #23 fails: lavatory smoke detector test. You skip it. Dispatch accepts the certification.',
          effects: { experience: 400, suspicion: 25, sanity: -10 },
        },
        {
          id: 'defer',
          label: 'Route aircraft via non-ETOPS routing',
          cost: { resource: 'credits', amount: 8000 },
          log: 'You inform dispatch: aircraft is not ETOPS-compliant. Flight is re-routed: coastal routing, adds 1.2 hours, burns 6,400 lbs extra fuel ($8,000). 140 PAX delayed. Operations manager demands explanation. You provide FAA regulations. They argue. You hold firm. The aircraft is re-routed.',
          effects: { experience: 500, credits: -8000, suspicion: -10 },
        },
      ],
      failureOutcome: {
        log: 'You sign off the ETOPS cert without verification, trusting dispatch interpretation. The aircraft departs on ETOPS routing (nearest suitable airport: 180 minutes). At mid-Atlantic, an engine fails. Single-engine ETOPS requires functional APU. APU fails to start. Emergency diversion, barely makes it. Your signature is on the cert.',
        effects: { suspicion: 180, sanity: -40, experience: -600, credits: -500000 },
        event: { type: 'catastrophic', id: 'ETOPS_VIOLATION_INCIDENT' },
      },
    },
    {
      id: 'A330_FDR_GLITCH',
      type: 'incident',
      title: 'FDR DATA - TEMPORAL ANOMALY',
      description:
        "During routine FDR download per AMM 31-60-00, you notice: the last 4 hours of flight data are dated 6 days in the future. The data shows a complete flight: JFK to LHR, departure 02/18/2026, 0640Z. Today is 02/12/2026. The aircraft hasn't flown this route in 3 weeks.",
      totalTime: 35000,
      choices: [
        {
          id: 'erase',
          label: 'Clear FDR memory buffer per AMM 31-60-45',
          cost: { resource: 'focus', amount: 15 },
          log: 'You execute the FDR erase procedure (requires two-person verification, you forge the second signature). Buffer cleared. FDR memory: blank. You re-initialize. During initialization, the FDR displays: "PRECOGNITIVE BUFFER DISABLED." You did not write that. It\'s in the firmware.',
          effects: { experience: 350, suspicion: 30, sanity: -25 },
        },
        {
          id: 'analyze',
          label: 'Download and analyze the future flight data',
          cost: { resource: 'sanity', amount: 25 },
          log: 'You copy the FDR data to USB drive, open it in flight analysis software. The flight appears normal until TOD (Top of Descent). Then: 14 seconds of physically impossible data. Pitch: -90° (straight down). Altitude: -22,000 ft (below sea level). Airspeed: 1,200 knots. Then: data ends.',
          effects: { experience: 700, sanity: -40, suspicion: 40, fdrData: 1 },
          event: { type: 'precognition', id: 'FUTURE_CRASH_WARNING' },
        },
      ],
      failureOutcome: {
        log: 'You report the anomaly to Engineering. They review the data, conclude: "Bit error in FDR timestamp." They clear the buffer remotely. On 02/18/2026, the aircraft is scheduled for JFK-LHR, departure 0640Z. You check the schedule daily. The flight is never cancelled. You do not show up for work that day.',
        effects: { suspicion: 15, sanity: -30, experience: 200 },
      },
    },
    {
      id: 'A330_SLAT_DISAGREE',
      type: 'incident',
      title: 'SLAT DISAGREE - ASYMMETRIC DETECTION',
      description:
        "ECAM: F/CTL SLATS FAULT. Slat position indication: Left slats 20°, Right slats 15°. Physical inspection: both sides are at 20°, symmetrical, properly rigged. The LVDT sensors (Linear Variable Differential Transformers) are lying. Or the slats moved and returned so fast you couldn't see it.",
      totalTime: 50000,
      choices: [
        {
          id: 'calibrate',
          label: 'Recalibrate SFCC per AMM 27-51-50',
          cost: { resource: 'focus', amount: 30 },
          log: 'You connect the maintenance computer, run the Slat Flap Control Computer (SFCC) calibration procedure. The SFCC asks for manual slat position confirmation. You measure: 20° both sides. You enter "20.0 / 20.0". The SFCC accepts it. Then displays: "HISTORICAL POSITION: 15° RIGHT." It remembers something that didn\'t happen.',
          effects: { experience: 400, sanity: -20, suspicion: 15 },
        },
      ],
      failureOutcome: {
        log: "You defer per MEL 27-51-01 (slat asymmetry monitoring inop). Flight ops accepts. During takeoff rotation, the right slats retract to 0° uncommanded—exactly as the SFCC predicted. The aircraft rolls right, rejected takeoff, blown tires. The SFCC was warning you about the future. You didn't listen.",
        effects: { credits: -180000, suspicion: 120, sanity: -50, experience: -500 },
        event: { type: 'incident', id: 'REJECTED_TAKEOFF_DAMAGE' },
      },
    },

    // B777-200ER
    {
      id: 'B777_ETOPS_PAPERWORK',
      type: 'incident',
      title: 'ETOPS LOG - ANACHRONISTIC ENTRY',
      description:
        "You review the ETOPS maintenance log per AMM 05-51-00. Page 47: an entry dated 11/08/1999, describing an APU ETOPS run. The ink is fresh—not dried. You touch it: smudges. This aircraft MSN 28714 was delivered in 2005. The 1999 entry predates the aircraft's existence by 6 years.",
      totalTime: 30000,
      choices: [
        {
          id: 'correct',
          label: 'Correct the date, rewrite entry',
          cost: { resource: 'sanity', amount: 10 },
          log: "You carefully white-out the date, rewrite it as 11/08/2005. As you write, the ink turns red. Not red ink—blood. You drop the pen. When you look again, the entry is gone. The page is blank. But there's a fingerprint in the margin. Your fingerprint. But smaller, like a child's hand.",
          effects: { experience: 250, sanity: -25, suspicion: 5 },
        },
        {
          id: 'archive',
          label: 'Photocopy and archive the anomalous page',
          cost: { resource: 'focus', amount: 15 },
          log: 'You photocopy page 47. The copier jams. You clear it, try again: paper is blank. Third attempt: the copy shows the page, but the date is now 11/08/2029—four years in the future. You file the photocopy in your locker. That night, your locker is empty. The copy is gone.',
          effects: { experience: 350, suspicion: 20, sanity: -20 },
        },
      ],
      failureOutcome: {
        log: 'You report it to the lead mechanic. He reviews the log, sees nothing unusual. "Page 47? That\'s blank, rookie. Stop wasting my time." You open the log again: page 47 is blank. You saw the entry. It was real. But now it\'s gone, and no one believes you.',
        effects: { suspicion: 5, sanity: -30, experience: 100 },
      },
    },
    {
      id: 'B777_GHOST_IN_THE_FMC',
      type: 'incident',
      title: 'FMC - WAYPOINT GENERATION ERROR',
      description:
        'FMC navigation database update per AMM 34-11-51. After update, the FMC generates a waypoint not in the database: "NOWHERE" at coordinates 00°00\'00"N 000°00\'00"E (Null Island). The waypoint can\'t be deleted. Press DELETE: it reappears. The FMC wants you to go there.',
      totalTime: 40000,
      choices: [
        {
          id: 'reboot',
          label: 'Cold reboot FMC per AMM 34-11-03',
          cost: { resource: 'focus', amount: 20 },
          log: 'You cold reboot both FMCs (L&R). Power cycle: 90 seconds. FMCs re-initialize. Database loads. You check the flight plan: the waypoint is gone. But the FMC scratch pad displays: "NOWHERE EXISTS. YOU HAVE BEEN." You haven\'t. Or have you? You can\'t remember.',
          effects: { experience: 300, sanity: -18, suspicion: 10 },
        },
        {
          id: 'insert',
          label: 'Program a route through NOWHERE',
          cost: { resource: 'sanity', amount: 30 },
          log: 'You enter a test route: KJFK NOWHERE EGLL. The FMC accepts it. Calculated flight time: -4 hours. Negative time. Fuel required: 0.0 lbs. Distance: NaN (Not a Number). The FMC is calculating a route through non-Euclidean space. You clear the route. The FMC displays: "ROUTE SAVED."',
          effects: { experience: 600, sanity: -35, suspicion: 25 },
          event: { type: 'navigation_anomaly', id: 'IMPOSSIBLE_COORDINATES' },
        },
      ],
      failureOutcome: {
        log: 'You reload the navigation database from backup. Same result. You replace the FMC ($85,000). New FMC: same waypoint appears. You call Boeing: "We have no record of waypoint NOWHERE." You check the database source file: the waypoint exists. Source: Jeppesen. You call Jeppesen: "That waypoint was deleted in 1987." But it\'s here now.',
        effects: { credits: -85000, suspicion: 50, sanity: -25, experience: 400 },
      },
    },
    {
      id: 'B777_AILERON_LOAD_FEEL',
      type: 'incident',
      title: 'FLT CTL - AILERON FEEL SHIFT',
      description:
        'Pilots report: "Aileron control feels reversed at high speed." You conduct control feel test per AMM 27-21-00: at 250 KIAS, aileron control pressure should be 40-50 lbs. You measure: 50 lbs. At 300 KIAS: 35 lbs. At 350 KIAS: 20 lbs. The control pressure decreases with airspeed. Opposite of design.',
      totalTime: 55000,
      choices: [
        {
          id: 'calibrate',
          label: 'Recalibrate ACE (Actuator Control Electronics)',
          cost: { resource: 'focus', amount: 35 },
          log: 'You run ACE calibration for all 3 ACE units (L, C, R). Calibration: successful. Retest: same fault. You inspect the feel shift module: mechanically perfect. You measure air data input to ACE: correct. The ACE is correctly calculating incorrect output. The math is consistent but wrong.',
          effects: { experience: 450, sanity: -22, suspicion: 20 },
        },
      ],
      failureOutcome: {
        log: 'You defer per MEL 27-21-08 (feel shift monitoring inop). Flight test pilot required before passenger ops. Test flight: at 320 KIAS, the pilot applies 10 lbs of aileron pressure—aircraft rolls 60° in 1.2 seconds. Nearly uncontrollable. Test aborted. Aircraft grounded pending full flight control system replacement: $240,000, 10 days.',
        effects: { credits: -240000, suspicion: 80, experience: -400 },
        event: { type: 'grounding', id: 'FLIGHT_CONTROL_UNSAFE' },
      },
    },

    // A300-600 Cargo
    {
      id: 'A300_METAL_FATIGUE',
      type: 'incident',
      title: 'STRUCTURE - ACOUSTIC EMISSION DETECTED',
      description:
        "During pre-flight, you hear it: a low-frequency groan from the airframe. Frequency: 17 Hz (below human hearing, but you feel it). You place a stethoscope on frame station 480: the sound is louder, rhythmic. 1.2-second intervals. Like breathing. The aircraft is 31 years old. Metal doesn't breathe.",
      totalTime: 50000,
      choices: [
        {
          id: 'inspect',
          label: 'Eddy current inspection per AMM 51-00-00',
          cost: { resource: 'focus', amount: 30 },
          log: 'You perform eddy current NDT (Non-Destructive Testing) on suspect frames: 480, 485, 490. Results: no cracks, no corrosion, no anomalies. But the eddy current probe returns abnormal conductivity readings—as if the metal is warmer in some areas. IR thermography: frame 485 is 8°C warmer than ambient. No heat source identified.',
          effects: { experience: 400, sanity: -15, suspicion: 10 },
        },
        {
          id: 'defer',
          label: 'Document as "normal airframe creaking"',
          cost: { resource: 'sanity', amount: 10 },
          log: 'You write it up as "airframe settling sounds, no defects found." It\'s a common entry for older aircraft. But that night, you dream of the aircraft. It\'s alive. The frames are ribs. The stringers are a spine. The hydraulic fluid is blood. You wake up. The sound is in your bedroom. You live 8 miles from the airport.',
          effects: { experience: 150, suspicion: 5, sanity: -25 },
        },
      ],
      failureOutcome: {
        log: 'You ignore the sound entirely. During a heavy cargo flight (67,000 lbs payload), frame 485 cracks—catastrophic structural failure at FL290. Emergency landing, aircraft destroyed. Miraculously, both pilots survive. NTSB finds: "Pre-existing fatigue crack, not detected during inspections." Your name is in the report.',
        effects: { credits: -5000000, suspicion: 200, sanity: -60, experience: -1000 },
        event: { type: 'catastrophic', id: 'HULL_LOSS_STRUCTURAL' },
      },
    },
    {
      id: 'A300_CARGO_SMOKE_PHANTOM',
      type: 'incident',
      title: 'CARGO SMOKE - FALSE ALARM RECURRING',
      description:
        "Forward cargo smoke detector triggers: 14 times in 6 hours. Each time: no smoke, no heat, no fire. You've replaced the detector (3x), the control unit (1x), and re-wired the circuit. It still triggers. At precisely 41-minute intervals. You time it: 41:00.0 exactly.",
      totalTime: 45000,
      choices: [
        {
          id: 'disable',
          label: 'Disable detector per MEL 26-21-01',
          cost: { resource: 'suspicion', amount: 15 },
          log: 'You pull circuit breaker C-22 (CARGO SMOKE FWD), placard the system INOP per MEL (Category B, 3 days). The detector is disabled. But at the next 41-minute mark, the fire bell rings anyway. You check: breaker still open. The bell rings from a dead circuit. Electromagnetism has opinions.',
          effects: { experience: 250, suspicion: 15, sanity: -20 },
        },
        {
          id: 'monitor',
          label: 'Install event recorder to log trigger data',
          cost: { resource: 'credits', amount: 400 },
          log: "You install a data logger ($400) to capture detector output. After 8 triggers, you analyze: each trigger, the detector reports temperature of 451°C (Fahrenheit 451—paper combustion temp). But the cargo bay temp is 18°C. The detector is measuring something that isn't there. Or will be there.",
          effects: { experience: 400, credits: -400, sanity: -18, suspicion: 20 },
          event: { type: 'precognition', id: 'FUTURE_FIRE_WARNING' },
        },
      ],
      failureOutcome: {
        log: 'You sign off the detector as "UNABLE TO DUPLICATE FAULT." Three flights later, at precisely the 41-minute mark of cruise, the forward cargo bay ignites. Halon discharge: successful. Fire extinguished. Cargo: total loss. Investigation: "Electrical short in cargo bay lighting." The smoke detector was right all along.',
        effects: { credits: -450000, suspicion: 70, sanity: -30, experience: -300 },
      },
    },
  ],

  eldritch_manifestation: [
    // MD-80
    {
      id: 'MD80_ELECTRICAL_GHOST',
      type: 'eldritch_manifestation',
      title: 'PHANTOM FLIGHT - TWA ECHO',
      description:
        'The cockpit instruments activate without power. EADI (Electronic Attitude Director Indicator), EHSI (Horizontal Situation Indicator), radios—all showing TWA Flight 800 flight data. Callsign: TWA800. Route: JFK-CDG. Date: 07/17/1996. That flight exploded over the Atlantic. There were no survivors. The data is real-time. Altitude decreasing: FL135...FL120...FL100...',
      totalTime: 30000,
      choices: [
        {
          id: 'watch',
          label: 'Monitor the phantom flight to conclusion',
          cost: { resource: 'sanity', amount: 30 },
          log: "You watch, frozen. Altitude: FL80...FL50...FL20...0. Then: TERRAIN. PULL UP. TERRAIN. The screen goes black. Silence. The instruments power down. You check your watch: 8:31pm. The exact time TWA 800 exploded. You're shaking.You will never speak of this.",
          effects: { experience: 700, sanity: -40, suspicion: 5 },
        },
        {
          id: 'breaker',
          label: 'Pull aircraft battery master switch',
          cost: { resource: 'focus', amount: 15 },
          log: 'You yank the battery master switch on the external panel. All power dies. The instruments go dark. But in the darkness, you hear the radio: static, then a voice. "This is TWA 800...mayday, mayday, mayday." The battery is disconnected. The radio has no power. But the voice continues. For 4 minutes. Then: silence.',
          effects: { experience: 400, sanity: -25, suspicion: 10 },
        },
      ],
      failureOutcome: {
        log: 'You panic, run from the aircraft. The instruments continue their phantom flight. Ground crew investigates: "All instruments normal, no power anomalies detected." They think you imagined it. Maybe you did. But the EADI has a burn-in: the TWA logo. It was never a TWA aircraft.',
        effects: { sanity: -45, suspicion: 35, experience: 200 },
      },
    },
    {
      id: 'MD80_THRUST_REVERSER_SENTIENT',
      type: 'eldritch_manifestation',
      title: 'T/R - AUTONOMOUS DEPLOYMENT',
      description:
        'You\'re performing T/R operational test per AMM 78-31-00. Command: DEPLOY. The T/R deploys normally. Command: STOW. The T/R refuses. You repeat command: no response. Then: the T/R redeploys on its own. You hear—impossibly—the sound of laughter. Mechanical laughter, like grinding gears forming words: "NO."',
      totalTime: 35000,
      choices: [
        {
          id: 'manual',
          label: 'Manually stow T/R using emergency handle',
          cost: { resource: 'focus', amount: 25 },
          log: "You access the manual stow handle (requires 85 lbs of force). You pull. The T/R resists—pressure increases to 120 lbs, 150, 180. You're using two hands.It finally stows with a metal scream.Inspection: hydraulic actuator is cold.Ice cold.Frost forms on your hand.",
          effects: { experience: 450, sanity: -28, focus: -20 },
        },
      ],
      failureOutcome: {
        log: "Unable to stow. You depressurize hydraulics, attempt manual pins. The pins won't insert—the T / R is 0.25\" out of alignment. Impossible without hydraulic pressure. You call for help. When the second mechanic arrives, the T/R is stowed. Normal position. He thinks you're incompetent. Or insane.",
        effects: { suspicion: 40, sanity: -35, experience: -100 },
      },
    },

    // B737-400
    {
      id: 'B734_STATIC_DISCHARGE',
      type: 'eldritch_manifestation',
      title: "ST ELMO'S FIRE - CABIN MANIFESTATION",
      description:
        'Ball lightning—0.8 meters diameter—rolling down the cabin aisle. Blue-white plasma, moving at walking speed. Temperature sensors: nominal. No electrical storms within 200 miles. The ball passes through seat rows without burning them. It reaches the aft galley, hovers, then: speaks. Not sound. Radio waves. Your handheld radio receives it: coordinates. And a date: tomorrow.',
      totalTime: 25000,
      choices: [
        {
          id: 'ground',
          label: 'Attach grounding cable to airframe',
          cost: { resource: 'focus', amount: 25 },
          log: "You sprint to the ground cart, grab the bonding cable, clamp it to the aircraft ground point. The ball lightning flows down the aisle, through the cargo door, into the cable, into the earth. The smell: ozone, copper, and burnt hair. The tarmac where the cable touches: scorched in the shape of a circuit diagram. For a device that doesn't exist.",
          effects: { experience: 600, sanity: -30, alclad: 8, suspicion: 15 },
        },
        {
          id: 'record',
          label: 'Film it with phone camera',
          cost: { resource: 'sanity', amount: 20 },
          log: "You pull out your phone, record video. The ball lightning turns toward you. Hovers. The phone screen shows: your reflection. But your reflection is screaming. You're not screaming.The ball dissipates.You check the video: 47 seconds of static.No ball.No cabin.Just your screaming reflection.",
          effects: { experience: 500, sanity: -50, suspicion: 5 },
        },
      ],
      failureOutcome: {
        log: "The ball touches you. No pain. No heat. But you see: your death. Not how. When. Date and time. Precise. The ball dissipates. You collapse. When you wake (3 hours later), you remember nothing. But you've written on your arm in Sharpie: a date.You don't recognize the handwriting.",
        effects: { sanity: -60, suspicion: 10, experience: 400 },
        event: { type: 'precognition', id: 'DEATH_PREMONITION' },
      },
    },
    {
      id: 'B734_SHADOW_PEOPLE',
      type: 'eldritch_manifestation',
      title: 'SHADOW CREW',
      description:
        "You're working alone in the cabin—installing life vest pouches per AD 2019-23-51. You see movement: row 12, aisle. A shadow. Human-shaped. But there's no light source to cast it.The shadow moves independently.Sits in seat 12C.You hear the seatbelt click.There is no one there.",
      totalTime: 40000,
      choices: [
        {
          id: 'confront',
          label: 'Approach the shadow directly',
          cost: { resource: 'sanity', amount: 35 },
          log: "You walk to row 12. The shadow doesn't move. You reach out to touch seat 12C. Your hand passes through cold—30°F drop. The shadow turns its head. You see: no face. A void. Then it stands, walks through you. Your body temperature drops to 94°F. You shiver for 2 hours.",
          effects: { experience: 700, sanity: -50, suspicion: 5 },
        },
        {
          id: 'leave',
          label: 'Exit the aircraft immediately',
          cost: { resource: 'focus', amount: 10 },
          log: 'You back away slowly, exit via the L2 door. Outside, you watch through the window. The shadow remains. Then: six more shadows appear. Rows 8, 12, 15, 18, 22, 24. They sit. They wait. You refuse to re-enter. The next shift finds nothing unusual.',
          effects: { experience: 300, sanity: -30, suspicion: 25 },
        },
      ],
      failureOutcome: {
        log: "You ignore it, continue working. The shadows multiply. Dozens. Filling the cabin. When you finish your work and turn around, every seat is occupied. By shadows. They don't move. You run. You resign the next day. You never return to aviation. The shadows were waiting. And patient.",
        effects: { sanity: -80, suspicion: 60, experience: -500 },
        event: { type: 'resignation', id: 'PSYCHOLOGICAL_BREAK' },
      },
    },

    // B737-700 (Next-Gen)
    {
      id: 'B737_DATA_SURGE',
      type: 'eldritch_manifestation',
      title: 'FMC DATA - BUFFER OVERFLOW FROM NOWHERE',
      description:
        'FMC data upload in progress. File size: 12 MB (navigation database). Upload progress: 15%...30%...95%...100%. Status: UPLOAD COMPLETE. File size now: 400 TB. The FMC solid-state drive: 1 GB capacity. The file is 400,000 times larger than possible. The FMC is not hot. Not damaged. Functioning normally. The file name: your Social Security Number.',
      totalTime: 40000,
      choices: [
        {
          id: 'allow',
          label: 'Do not interrupt—wait for process completion',
          cost: { resource: 'sanity', amount: 40 },
          log: 'You watch. The FMC screen scrolls data—faster than readable. Coordinates. Millions of them. Then: text. "WE KNOW WHERE YOU ARE. WE KNOW WHERE YOU WILL BE. WE KNOW WHERE YOU HAVE BEEN." The upload completes. File size: 0 bytes. The file is empty. But the FMC has gained 17 new waypoints. None in the nav database. All named after people you know.',
          effects: { experience: 1200, sanity: -60, suspicion: 40 },
          event: { type: 'surveillance', id: 'OMNISCIENT_SYSTEM' },
        },
        {
          id: 'sever',
          label: 'Emergency disconnect data cable',
          cost: { resource: 'focus', amount: 15 },
          log: 'You yank the dataloader cable. The connector port: hot. Smoking. You pull your hand back—2nd degree burn. The FMC reboots. Screen displays: "UPLOAD INTERRUPTED AT 99.97%." Then: "RESUMING." The cable is disconnected. The upload continues. From nowhere.',
          effects: { experience: 500, sanity: -35, suspicion: 20 },
          event: { type: 'injury', id: 'THERMAL_BURN' },
        },
      ],
      failureOutcome: {
        log: 'You power off the FMC—pull circuit breakers C-17 and C-18. The FMC screen goes black. Then: it powers back on. Breakers still open. The FMC is running on no power. The file completes uploading. The screen displays your home address. And your bedroom window view. Photographed from inside your house. Yesterday.',
        effects: { sanity: -70, suspicion: 80, experience: 600 },
        event: { type: 'stalking', id: 'HOME_INVASION_EVIDENCE' },
      },
    },
    {
      id: 'B737_MIMIC',
      type: 'eldritch_manifestation',
      title: 'AIRFRAME - RESPONSIVE ECHO',
      description:
        "You're performing a tap test on the forward fuselage—standard technique for detecting skin delamination. You tap: knock-knock-knock. Three taps. Pause. The fuselage taps back. Knock-knock-knock. Identical rhythm. Same frequency. You tap four times. It taps four times. You tap SOS (···---···). It taps SOS. Then it taps five more times. Unprompted.",
      totalTime: 30000,
      choices: [
        {
          id: 'communicate',
          label: 'Tap a complex rhythm to test intelligence',
          cost: { resource: 'sanity', amount: 30 },
          log: "You tap: shave-and-a-haircut (tap-tap-tap-tap-tap...pause). The fuselage waits. 3 seconds. Then completes: two-bits (tap-tap). It knows the pattern. You tap the Fibonacci sequence: 1-1-2-3-5-8. The fuselage taps: 13-21-34. It continues the sequence. It's doing math.",
          effects: { experience: 900, sanity: -40, suspicion: 15 },
          event: { type: 'first_contact', id: 'AIRCRAFT_SENTIENCE_CONFIRMED' },
        },
        {
          id: 'stop',
          label: 'Cease all tapping immediately',
          cost: { resource: 'focus', amount: 10 },
          log: "You stop. Silence. You step back. The fuselage taps three times. You don't respond.It taps louder.BANG - BANG - BANG.Denting from inside.You run.The tapping follows you across the hangar floor.Each tap: 10 meters behind you.It stops when you exit.You do not return.",
          effects: { experience: 400, sanity: -30, suspicion: 35 },
        },
      ],
      failureOutcome: {
        log: 'You continue tapping, convinced it\'s an echo effect. But the echo stops matching. It taps its own patterns. Rhythms you don\'t recognize.Then: Morse code.You translate: "HELP US." You ask: "Who are you?" It taps: "WE ARE THE ALUMINUM." The material is alive.You drop your tools.You quit.',
        effects: { sanity: -70, suspicion: 50, experience: -300 },
        event: { type: 'psychological', id: 'MATERIAL_CONSCIOUSNESS' },
      },
    },

    // A330
    {
      id: 'A330_GHOST_CALL',
      type: 'eldritch_manifestation',
      title: 'SATCOM - IMPOSSIBLE CALL',
      description:
        'The cockpit SatCom phone rings. RING...RING...RING. You check: the phone is unplugged. Physically disconnected. RJ-45 connector on the floor. The phone continues ringing. You pick up the handset. Static. Then: breathing. Then: your voice. Your voice says: "DON\'T FLY THE WEDNESDAY FLIGHT." The line goes dead. Today is Monday.',
      totalTime: 25000,
      choices: [
        {
          id: 'answer',
          label: 'Respond to the voice',
          cost: { resource: 'sanity', amount: 35 },
          log: 'You say: "Who is this?" Your voice answers: "I AM YOU. FROM WEDNESDAY. THE AIRCRAFT CRASHES. HYDRAULIC FAILURE AT FL310. DON\'T FLY IT.YOU DIE AT 14: 17 UTC." The call ends. You check the schedule: you\'re assigned to Wednesday\'s flight. Departure: 13:00 UTC. Flight time: 2.5 hours. The timing is exact.',
          effects: { experience: 800, sanity: -50, suspicion: 25 },
          event: { type: 'precognition', id: 'SELF_WARNING' },
        },
        {
          id: 'ignore',
          label: 'Hang up and disconnect phone permanently',
          cost: { resource: 'focus', amount: 15 },
          log: 'You hang up. You don\'t just unplug it—you cut the cable with wire cutters. No more calls. But your cell phone rings. Unknown number. You answer. Your voice: "CUTTING THE CABLE WON\'T HELP.IT ALREADY HAPPENED." You throw your phone across the cockpit. It continues ringing. From the floor. Broken. Screen shattered. Ringing.',
          effects: { experience: 500, sanity: -40, suspicion: 20 },
        },
      ],
      failureOutcome: {
        log: 'You don\'t answer.The phone rings for 40 minutes straight.Finally: voicemail.You listen.Your voice: "I tried to warn you. Wednesday, 14:17 UTC. Green hydraulic failure. You pull the wrong breaker. Everyone dies. Including you." Wednesday comes.You call in sick.The aircraft flies.No incident.You check: no hydraulic problems.The call was a lie.Or the future changed.',
        effects: { sanity: -60, suspicion: 15, experience: 300 },
      },
    },
    {
      id: 'A330_TIME_DILATION',
      type: 'eldritch_manifestation',
      title: 'COCKPIT - TEMPORAL ANOMALY',
      description:
        "You enter the flight deck at 14:30 local time per your watch. You perform a quick compass swing verification (5-minute task per AMM 34-51-00). You exit the cockpit. Your watch reads: 18:47. Four hours and 17 minutes have passed. You have no memory of it. Your clipboard shows: completed compass swing. Your handwriting. But you don't remember writing it.",
      totalTime: 30000,
      choices: [
        {
          id: 'sync',
          label: 'Verify time with multiple sources',
          cost: { resource: 'sanity', amount: 15 },
          log: "You check: your phone (18:47), hangar clock (18:47), aircraft chronometer (18:47). All synchronized. You check the CCTV: it shows you entering at 14:30, exiting at 18:47. But the footage is continuous—you worked for 4 hours. Doing what? The tape shows you sitting motionless in the captain's seat for 3 hours, 52 minutes.Not moving.Not blinking.",
          effects: { experience: 500, sanity: -45, suspicion: 30 },
          event: { type: 'lost_time', id: 'MISSING_MEMORY' },
        },
        {
          id: 'dismiss',
          label: 'Assume watch malfunction',
          cost: { resource: 'focus', amount: 10 },
          log: "Your watch must be broken. You replace the battery. But your phone also jumped 4 hours. And the hangar clock. And every timepiece in the facility. Either every clock malfunctioned simultaneously, or you lost 4 hours of time. You choose to believe the clocks failed. It's easier.",
          effects: { experience: 200, sanity: -25, suspicion: 5 },
        },
      ],
      failureOutcome: {
        log: 'You panic, report the incident to your supervisor. He checks your timecard: clocked in 14:30, clocked out 18:50. "You worked your shift, stop wasting my time." But you only remember 5 minutes. Medical evaluation: no drugs, no alcohol, no neurological anomalies. Diagnosis: stress. They don\'t believe you.You don\'t believe yourself.',
        effects: { sanity: -50, suspicion: 40, experience: 250 },
      },
    },
    {
      id: 'A330_LAVATORY_PORTAL',
      type: 'eldritch_manifestation',
      title: 'LAV - SPATIAL IMPOSSIBILITY',
      description:
        "You're inspecting the forward lavatory per AMM 38-11-00 (water service panel access). You open the lav door: normal 3x3 ft compartment. You step inside to access the panel behind the mirror. The door closes. You turn around. The lavatory is 40 feet deep. Endless row of mirrors reflecting into infinity. The door is gone. You are not on an aircraft anymore.",
      totalTime: 35000,
      choices: [
        {
          id: 'explore',
          label: 'Walk forward into the mirror corridor',
          cost: { resource: 'sanity', amount: 50 },
          log: 'You walk. 10 steps. 20. 50. The mirrors reflect infinitely. You see yourself at every age: child, teenager, elderly. You reach the end: a door. The door is labeled "EXIT". You open it. You\'re back in the lavatory.Normal size.The door behind you is the aircraft door.You\'ve been inside 8 minutes. Your reflection looks older.',
          effects: { experience: 1000, sanity: -70, suspicion: 10 },
          event: { type: 'dimensional_shift', id: 'MIRROR_SPACE' },
        },
        {
          id: 'scream',
          label: 'Call for help immediately',
          cost: { resource: 'focus', amount: 20 },
          log: "You scream. Your voice echoes—infinite echoes in the mirror space. Then: pounding on the door. Rescue crew breaks down the door from outside. You're pulled out.You've been trapped for 90 seconds. You insist it was longer. They show you the video: 90 seconds. But your watch shows: 4 hours elapsed.",
          effects: { experience: 600, sanity: -50, suspicion: 45 },
        },
      ],
      failureOutcome: {
        log: 'You freeze, paralyzed by impossibility. You stand in the mirror corridor until your legs give out. You collapse. You wake in the hospital—12 hours later. Diagnosis: "Found unconscious in aircraft lavatory, possible carbon monoxide exposure." But CO levels were zero. They don\'t believe your story. You\'re not sure you believe it either.',
        effects: { sanity: -80, suspicion: 60, experience: 400 },
        event: { type: 'medical', id: 'HOSPITALIZATION' },
      },
    },

    // B777-200ER
    {
      id: 'B777_ENGINE_HARMONICS',
      type: 'eldritch_manifestation',
      title: 'GE90 - HYPNOTIC ROTATION',
      description:
        "The #1 engine (GE90-115B, 115,000 lbs thrust) is spooling in the wind—natural windmilling. You watch the fan blades rotate. 22 blades, swept design. The rotation creates patterns. Fibonacci spirals. Golden ratio. The patterns are mathematically perfect. Beautiful. You realize: you've been staring for 20 minutes. You can't look away.The pattern is showing you the future.",
      totalTime: 35000,
      choices: [
        {
          id: 'stare',
          label: 'Continue watching—decode the pattern',
          cost: { resource: 'sanity', amount: 45 },
          log: "You see: stock prices, lottery numbers, death dates. Information encoded in the blade rotation. You grab a notepad, write frantically. The patterns tell you everything. The date of your death. The name of the person who kills you. The winning lottery numbers for the next 400 draws. Then: the fan stops. Wind still blowing. The fan is motionless. You have 14 pages of notes. In a language you don't know.",
          effects: { experience: 1500, sanity: -60, suspicion: 25, focus: 30 },
          event: { type: 'forbidden_knowledge', id: 'AKASHIC_ENGINE' },
        },
        {
          id: 'look_away',
          label: 'Force yourself to break eye contact',
          cost: { resource: 'focus', amount: 30 },
          log: 'You wrench your head away—physical effort, like breaking magnetic attraction. Your neck cracks. You stumble back 10 feet. You check your watch: 47 minutes have passed. You thought it was 2 minutes. Your nose is bleeding. You taste copper. You refuse to look at the engine again. Ever.',
          effects: { experience: 400, sanity: -35, focus: -25 },
        },
      ],
      failureOutcome: {
        log: "You stare until you collapse—6 hours later. Ground crew finds you unconscious, 3 feet from the intake. One step closer: you'd have been ingested. Medical evaluation: severe dehydration, retinal damage (like staring at the sun). Your eyes see afterimages of the fan blades for 3 weeks. Even when you close them. Especially when you close them.",
        effects: { sanity: -90, suspicion: 70, experience: 600 },
        event: { type: 'injury', id: 'OPTICAL_DAMAGE' },
      },
    },
    {
      id: 'B777_VOYAGEUR_SIGNAL',
      type: 'eldritch_manifestation',
      title: 'ADF - UNLISTED BEACON RECEPTION',
      description:
        'You\'re testing the ADF (Automatic Direction Finder) per AMM 34-51-00. You tune to known beacon: 385 KHz, identifier: JFK. ADF locks on: 125° bearing, 14 nm distance. Correct. Then: the needle swings. New bearing: 270°. No beacon in that direction. You check frequency: still 385 KHz. Identifier: "N0WHERE". That\'s not a standard identifier.You triangulate the bearing: it points 200 feet below the ramp.',
      totalTime: 30000,
      choices: [
        {
          id: 'track',
          label: 'Triangulate exact source coordinates',
          cost: { resource: 'sanity', amount: 20 },
          log: "You use two additional ADFs to triangulate. The signal originates: Lat 40.6413°N, Lon 73.7781°W, Altitude: -200 feet MSL. That's 200 feet underground, directly beneath Gate 12. You research: nothing there.No tunnels, no basements, no infrastructure.Just bedrock.The signal is transmitting from solid granite.At 385 KHz. 500 watts.Continuously.",
          effects: { experience: 700, sanity: -30, suspicion: 35 },
          event: { type: 'discovery', id: 'SUBTERRANEAN_BEACON' },
        },
        {
          id: 'ignore',
          label: 'Assume equipment fault, swap ADF',
          cost: { resource: 'credits', amount: 1800 },
          log: 'You replace the ADF receiver (P/N: 622-9352-001, cost $1,800). New receiver: same signal. N0WHERE beacon, 270°. You replace the antenna: same result. You swap all three ADFs: all receive N0WHERE. The beacon is real. Or all your equipment is haunted. You prefer "real."',
          effects: { experience: 400, credits: -1800, sanity: -22, adfReceiver: -1 },
        },
      ],
      failureOutcome: {
        log: 'You report it to Engineering: "Unknown beacon interference." They investigate, find no signal. When you demonstrate, the ADF shows normal operation—JFK beacon only. N0WHERE is gone. Engineering thinks you fabricated the fault. Your credibility is damaged. But that night, you receive a text: coordinates. The same coordinates. From an unknown number.',
        effects: { suspicion: 50, sanity: -25, experience: 300 },
        event: { type: 'stalking', id: 'COORDINATE_TRANSMISSION' },
      },
    },
    {
      id: 'B777_CARGO_PRESENCE',
      type: 'eldritch_manifestation',
      title: 'BULK CARGO - ENTITY DETECTION',
      description:
        "You're performing a pre - flight cargo bay inspection per AMM 12-00-00.Aft bulk cargo: 14 ULDs, properly secured.You count: 1...2...3...14.Correct.You exit, close the door.You check the manifest: 13 ULDs listed.You recount: 14 containers.You check the manifest again: 13. You open the door: 14 containers.One is unlisted.The unlisted container is breathing.",
      totalTime: 40000,
      choices: [
        {
          id: 'inspect',
          label: 'Open the unlisted container',
          cost: { resource: 'sanity', amount: 40 },
          log: "You unbolt the container (no seal—unusual). You open it. Inside: empty. Completely empty. But the container weighs 900 lbs (scale confirms). Empty containers weigh 150 lbs. Where is the extra 750 lbs? You step inside to inspect. The door closes behind you. From inside. You are trapped. For 6 hours. No one hears you. When they finally open it: you're catatonic.You never speak of what you saw.",
          effects: { experience: 1200, sanity: -80, suspicion: 40 },
          event: { type: 'containment', id: 'CONTAINER_ENTITY' },
        },
        {
          id: 'seal',
          label: 'Quarantine the container—do not open',
          cost: { resource: 'focus', amount: 25 },
          log: 'You red-tag the container: "DO NOT FLY - QUARANTINE." You call Security. They arrive. They count: 13 containers. The 14th is gone. But your red tag is on container #7 (a legitimate cargo). They remove your tag. You count again: 13. You were right. Or insane. They suspect insane.',
          effects: { experience: 500, suspicion: 55, sanity: -30 },
        },
      ],
      failureOutcome: {
        log: 'You ignore the discrepancy—counting error, probably. The aircraft departs with 14 containers (manifest shows 13). At FL390, aft cargo fire warning. Crew lands, emergency evacuation. Fire investigation: no fire found. But container #14 (the unlisted one) is empty. Manifest still shows 13. Your inspection signature is questioned. You have no defense.',
        effects: { suspicion: 100, sanity: -40, experience: -400 },
      },
    },

    // A300-600 Cargo
    {
      id: 'A300_SOMETHING_AWAKE',
      type: 'eldritch_manifestation',
      title: 'MAIN DECK - LIVING CARGO',
      description:
        'You\'re performing a pre - flight cargo inspection, main deck. 22 pallets, properly secured.You hear it: breathing.Deep, rhythmic. 6 - second cycles.Inhale...exhale...inhale.You follow the sound.Pallet 14: labeled "DIPLOMATIC CARGO - DO NOT INSPECT." The breathing is coming from inside.The pallet is warm. 98.6°F.Human body temperature.',
      totalTime: 20000,
      choices: [
        {
          id: 'run',
          label: 'Secure cargo door immediately and alert authorities',
          cost: { resource: 'focus', amount: 15 },
          log: 'You sprint to the cargo door, slam it shut, spin the locking wheel. You call Security: "Possible human trafficking." They arrive with K-9 units, open pallet 14. Inside: industrial machinery (as manifested). No people. No breathing. K-9s alert to nothing. They think you\'re wasting their time.But the pallet is still warm. 98.6°F.',
          effects: { experience: 400, suspicion: 45, sanity: -25 },
        },
        {
          id: 'feed',
          label: 'Leave food near the pallet',
          cost: { resource: 'credits', amount: 20 },
          log: 'You place your lunch (sandwich, chips, water) beside pallet 14. You step back. You watch. The food disappears. Not eaten—vanishes. Instantly. The pallet exhales. A sound: "THANK YOU." Not words. A vibration that forms meaning in your mind. You back away slowly. The breathing continues. Calmer now.',
          effects: { experience: 600, sanity: -15, suspicion: 10, focus: 20 },
          event: { type: 'contact', id: 'CARGO_ENTITY_FED' },
        },
      ],
      failureOutcome: {
        log: 'You stand paralyzed, staring at pallet 14. The breathing accelerates. 3-second cycles. 2-second. 1-second. Hyperventilating. Then: the pallet moves. Slides forward 6 inches. No forklift. No person. It moved on its own. You run. You don\'t stop running until you\'re outside. You resign the next day. No explanation. Just: "I quit."',
        effects: { sanity: -70, suspicion: 60, experience: -500 },
        event: { type: 'resignation', id: 'CARGO_TERROR' },
      },
    },
    {
      id: 'A300_MANIFEST_LIE',
      type: 'eldritch_manifestation',
      title: 'CARGO MANIFEST - IMPOSSIBLE SHIPMENT',
      description:
        'You review the cargo manifest per AMM 12-00-00. Line item 7: "LIVE ANIMALS - APPROVED SHIPPING CONTAINERS - QTY: 6." You inspect: six containers, AVI-certified (Animal/Perishable cargo). Dimensions: 40"x30"x30". Standard dog crates. But the manifest weight: 2,400 lbs per container. That\'s 400 lbs per crate.What animal weighs 400 lbs and fits in a dog crate ? You hear scratching from inside.Not paws.Fingernails.',
      totalTime: 30000,
      choices: [
        {
          id: 'ignore',
          label: 'Do not open—sign off inspection',
          cost: { resource: 'sanity', amount: 10 },
          log: 'You decide: not your problem. Cargo is manifested, sealed, labeled. Your job is security, not contents. You sign the paperwork. The scratching stops. Then: tapping. From inside. Morse code. You translate: "LET US OUT." You walk away. Fast. The tapping follows you across the cargo bay. Each tap: 10 seconds apart. Matching your footsteps.',
          effects: { experience: 500, sanity: -30, suspicion: -5 },
        },
        {
          id: 'question',
          label: 'Ask the loadmaster about the shipment',
          cost: { resource: 'focus', amount: 15 },
          log: 'You find the loadmaster: "What\'s in the animal crates?" He smiles. Too wide. Teeth too white. "Diplomatic shipment.Don\'t ask questions." You press: "But 400 lbs per crate—" He grabs your wrist. Hard. "Do. Not. Ask. Questions." His hand is cold. Room temperature. Not human temperature. You stop asking.',
          effects: { experience: 400, suspicion: 50, sanity: -35 },
        },
      ],
      failureOutcome: {
        log: 'You open crate #3 (curiosity wins). Inside: nothing. Empty. But the crate weighs 400 lbs (scale confirms). You step back. The crate lid closes. On its own. You hear breathing from inside the empty crate. You run. You file no report. That night: scratching at your bedroom window. You live on the 4th floor.',
        effects: { sanity: -60, suspicion: 30, experience: 300 },
        event: { type: 'haunting', id: 'FOLLOWED_HOME' },
      },
    },
  ],

  audit: [
    // B737-700 (Special Access Programs)
    {
      id: 'B737_SUIT_INSPECTION',
      type: 'audit',
      suitType: SuitType.CORPORATE,
      title: 'SAP AUDIT - SPECIAL ACCESS PROGRAM',
      description:
        "Three men in grey suits, no badges, no IDs. Black SUV, tinted windows, government plates. They're here to inspect \"Equipment Package Delta\"—a modification you've never heard of. They have clearance above your supervisor. Above your supervisor's supervisor.They know your name.They know your clearance level(you don't have one). They're here to ensure your silence.",
      totalTime: 50000,
      choices: [
        {
          id: 'silence',
          label: 'Maintain complete silence—answer only yes/no',
          cost: { resource: 'focus', amount: 35 },
          log: 'You stand at attention. They ask: "Have you accessed avionics bay 3?" No. "Have you opened panel 4720VU?" No. "Have you discussed this aircraft with anyone?" No. They nod. One produces a form: "STANDARD FORM 312 - CLASSIFIED INFORMATION NON-DISCLOSURE AGREEMENT." You sign. They leave. You remember nothing about the conversation. The form is gone.',
          effects: { experience: 600, suspicion: -20, sanity: -15 },
        },
        {
          id: 'cooperate',
          label: 'Offer full cooperation and detailed logs',
          cost: { resource: 'sanity', amount: 20 },
          log: 'You provide your maintenance logs, inspection reports, work orders. They review—15 minutes. They redact 40% of your logs with black marker. Right in front of you. They hand the logs back: "These are your official records now. You performed no work on sections 34, 46, or 77. Understood?" You look: those sections are redacted. You did work there. Didn\'t you?',
          effects: { experience: 700, suspicion: 10, sanity: -30 },
          event: { type: 'memory_alteration', id: 'RECORD_MODIFICATION' },
        },
      ],
      failureOutcome: {
        log: 'You ask: "What is Equipment Package Delta?" Wrong question. They exchange glances. One makes a phone call. 30 minutes later: you\'re escorted to a secure room. 8 hours of interrogation. "Who did you tell?" "No one." "Who else knows?" "No one." They don\'t believe you.You\'re placed on administrative leave: 6 months.No explanation.Your clearance is revoked.What clearance? ',
        effects: { suspicion: 100, sanity: -40, credits: -25000, experience: -300 },
        event: { type: 'termination', id: 'SECURITY_VIOLATION' },
      },
    },
    {
      id: 'AUDIT_SUITS',
      type: 'audit',
      suitType: SuitType.FEDERAL,
      title: 'FEDERAL INSPECTION - DEVICE REMOVAL',
      description:
        'FAA inspectors? No. FBI? No. They won\'t say.But they have a court order: "SEIZURE OF EVIDENCE - CLASSIFIED." They\'re removing the equipment you disconnected (the unlisted box). They photograph everything. They bag your tools. They ask: "Did you touch the device?" Yes. "Did it transmit data while you accessed it?" You don\'t know.They take a blood sample. "Biometric verification." Of what ? ',
      totalTime: 45000,
      choices: [
        {
          id: 'comply',
          label: 'Full compliance—answer all questions',
          cost: { resource: 'suspicion', amount: 30 },
          log: 'You tell them everything: when you found it, what it looked like, how you disconnected it. They take notes. They show you photos: "Is this the device?" Yes. They show you 40 more photos—same device, different locations. Different aircraft. Different airlines. Different countries. You found one of many. They don\'t tell you what it does.',
          effects: { experience: 800, suspicion: 30, sanity: -25 },
        },
      ],
      failureOutcome: {
        log: 'You refuse to answer without a lawyer. Bad move. They detain you: "PATRIOT Act, Section 215." 18 hours in federal holding. No lawyer. No phone call. Finally: release. No charges. No explanation. Your employment record now shows: "SECURITY INCIDENT - RESOLVED." Future employers see it. You\'re unemployable in aviation.Your career is over.',
        effects: { suspicion: 150, sanity: -50, credits: -50000, experience: -1000 },
        event: { type: 'termination', id: 'FEDERAL_BLACKLIST' },
      },
    },
    {
      id: 'AUDIT_RANDOM_INSPECTION',
      type: 'audit',
      suitType: SuitType.REGULATORY,
      title: 'UNANNOUNCED FAA RAMP CHECK',
      description:
        'FAA Inspector Crawford, badge #7721. Unannounced inspection. He wants: your A&P license, your logbook, your tool calibration records. He reviews your last 30 days of work. He finds 3 discrepancies: missing torque specs on Form 337 (line 14), incomplete inspection stamp on page 47, and—he pauses—"This aircraft was never here." You worked on it yesterday. Logs show it. He shows you the FAA database: no record.',
      totalTime: 60000,
      choices: [
        {
          id: 'defend',
          label: 'Provide documentation proving the aircraft exists',
          cost: { resource: 'focus', amount: 40 },
          log: 'You pull up: the work order, the pilot log, the hangar security footage. All show the aircraft: N739BA. The inspector checks the FAA registry: "N739BA - REGISTRATION CANCELLED 1997." But you worked on it yesterday. He confiscates your documentation: "Evidence of fraudulent record-keeping." You face license suspension. But the aircraft is real. You saw it. Touched it. Worked on it.',
          effects: { experience: 600, suspicion: 80, sanity: -35 },
          event: { type: 'investigation', id: 'LICENSE_REVIEW' },
        },
      ],
      failureOutcome: {
        log: 'You have no defense. The inspector issues: Notice of Proposed Certificate Action (NPCA). 60-day license suspension. You appeal. The appeal is denied. Evidence: "Falsification of maintenance records, FAR 43.12 violation." Your A&P license is suspended. 6 months no work. $0 income. Your career hangs by a thread. And the aircraft? You never see it again.',
        effects: { suspicion: 120, credits: -35000, experience: -800, sanity: -40 },
        event: { type: 'suspension', id: 'LICENSE_SUSPENDED' },
      },
    },
  ],
};
