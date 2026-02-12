import { AircraftScenario, AircraftType } from '../types.ts';
export const aircraftScenarios: Record<AircraftType, AircraftScenario[]> = {
  [AircraftType.MD_80]: [
    {
      id: 'MD80_SCENARIO_1',
      description:
        "During a routine check of the MD-80's hydraulic bay, you discover the Green System reservoir showing 0.8 qts low, but there's no visible leak. The fluid's viscosity feels wrong—thicker than standard MIL-H-5606. Your flashlight beam catches something: the reservoir sight glass has condensation on the *inside*.",
      choices: [
        {
          text: 'Service the reservoir per AMM 29-12-00 and submit QAR.',
          outcome: {
            log: 'You top off with fresh Skydrol 500B-4 per spec. As you torque the filler cap to 35-40 in-lbs, the fluid level drops again. Engineering finds nothing. You gain experience but the paperwork attracts attention.',
            effects: { experience: 250, suspicion: 8, skydrol: -2 },
          },
        },
        {
          text: 'Sample the fluid and check for contamination.',
          outcome: {
            log: "You draw a sample into a clean vial. Under fluorescent light, the fluid exhibits a faint bioluminescence. The lab report comes back: 'SAMPLE COMPOSITION UNKNOWN. DO NOT SERVICE AIRCRAFT.' You've obtained a strange material.",
            effects: { experience: 180, bioFilament: 8, suspicion: 12, sanity: -15 },
            event: { type: 'incident', id: 'MD80_HYDRAULIC_CONTAMINATION' },
          },
        },
        {
          text: 'Sign it off as "serviced" and move on.',
          outcome: {
            log: 'You pencil-whip the log entry. The reservoir is still 0.8 qts low. Three days later, the aircraft experiences an uncommanded flap retraction at V2+10. The NTSB will want to talk.',
            effects: { sanity: -25, suspicion: 35 },
            event: { type: 'incident', id: 'FAA_INVESTIGATION' },
          },
        },
      ],
    },
    {
      id: 'MD80_SCENARIO_2',
      description:
        "While performing a 48-month CPC check on the #2 engine, you find ATA 71-31-00 compliance requires inspection of the T-R thrust reverser blocker doors. The forward door actuator attachment bolt shows fretting damage—normal wear. But the bolt is warm. The engine hasn't run in 40 hours.",
      choices: [
        {
          text: 'Replace per SRM 71-31-30 using correct P/N hardware.',
          outcome: {
            log: 'You drill out the old NAS6604-27A bolt and install a new one, torquing to 450-500 in-lbs with MS21042L-4 locknut. The replacement bolt begins to warm up within minutes. Physics has stopped making sense.',
            effects: { experience: 200, sanity: -12, hardwareBolts: -1 },
          },
        },
        {
          text: 'Apply unapproved threadlocker and safety-wire it.',
          outcome: {
            log: "You use Loctite 242 (not on the approved materials list per Spec 20-31-00) and double-safety-wire through the castellated nut. The bolt cools down immediately. You've made a choice. It will haunt you.",
            effects: { suspicion: -15, sanity: -20, threadlocker: -1 },
          },
        },
        {
          text: 'Document it and pull the engine for teardown.',
          outcome: {
            log: 'You red-tag the aircraft. The engine is pulled and shipped to the overhaul shop. Cost: $340,000. The teardown report: "NO FAULT FOUND." Your name is now on a list.',
            effects: { experience: 300, suspicion: 45, credits: -100000 },
            event: { type: 'audit', id: 'COST_OVERRUN_REVIEW' },
          },
        },
      ],
    },
    {
      id: 'MD80_SCENARIO_3',
      description:
        "The ECAM displays 'HYD G RESERVOIR LO LEVEL' but all fluid quantities check normal. Then you notice: the ECAM timestamp for the alert is 03:17:19. Your wristwatch shows 03:17:19. The seconds are synchronized. Perfectly.",
      choices: [
        {
          text: 'Reset the ECAM via FWC BITE test per AMM 31-51-00.',
          outcome: {
            log: 'You access the Flight Warning Computer, initiate BIT with the overhead test panel. After reset, the message clears. Then reappears. Same timestamp: 03:17:19. Your watch still reads 03:17:19. Time has stopped moving.',
            effects: { experience: 150, sanity: -35 },
            event: { type: 'temporal_anomaly', id: 'TIME_LOOP_ALPHA' },
          },
        },
        {
          text: 'Check all three hydraulic quantity transmitters.',
          outcome: {
            log: 'You verify Green system transmitter 29FK-301, Yellow 29FK-302, Blue 29FK-303. All output correct ARINC 429 data. Then you check the wiring. Pin 12 on the J1 connector is corroded—but the corrosion pattern spells out your employee number.',
            effects: { experience: 200, sanity: -40, suspicion: 5 },
          },
        },
      ],
    },
  ],

  [AircraftType.B737_400]: [
    {
      id: 'B734_SCENARIO_1',
      description:
        "Performing 'A' Check item 27-21-00-210-801: Operational test of Flight Control System. You move the aileron control wheel full left stop. The right aileron deflects 20° up as expected. The left aileron deflects up 25°. Boeing SRM states 23° ±2° tolerance. This is out of limits.",
      choices: [
        {
          text: 'Rig aileron cables per AMM 27-21-00-400-801.',
          outcome: {
            log: 'You access the cable tension adjust barrel at WS 307. Proper rigging: 50-70 lbs tension measured with 27-8A cable tensiometer. You adjust...and the measurement goes negative. -50 lbs. The cable is pulling itself.',
            effects: { experience: 280, sanity: -18, cableTools: -1 },
          },
        },
        {
          text: 'Check the PCU (Power Control Unit) on the left wing.',
          outcome: {
            log: 'You depressurize the hydraulic systems per AMM 29-10-00, access the left aileron PCU. The servo valve filter is clogged with metallic debris—but the metal is not aluminum. Spectrographic analysis reads "ELEMENT NOT IN PERIODIC TABLE."',
            effects: { experience: 350, suspicion: 15, sanity: -25, crystallineResonators: 3 },
            event: { type: 'discovery', id: 'UNKNOWN_ALLOY' },
          },
        },
        {
          text: 'Placard per MEL 27-21-01 and defer.',
          outcome: {
            log: 'You apply MEL relief allowing 5° aileron asymmetry for up to 3 days. You placard the flight deck. The aircraft departs. At FL350, the left aileron separates from the wing. 180 souls. Your name is on the 8130-3.',
            effects: { experience: -500, suspicion: 100, sanity: -80, credits: -1000000 },
            event: { type: 'catastrophic', id: 'ACCIDENT_INVESTIGATION' },
          },
        },
      ],
    },
    {
      id: 'B734_SCENARIO_2',
      description:
        "Transit check reveals a write-up: 'FLT CONT Panel, YAW DAMPER light illuminated in flight.' You access the Yaw Damper Coupler per AMM 27-72-00. Inside you find a nest. Not birds. Not wires. Human hair. Braided with perfect, machine-like precision. It's your hair color.",
      choices: [
        {
          text: 'Photograph it, bag it as FOD, send to Engineering.',
          outcome: {
            log: 'You carefully document with a Canon EOS (per Boeing FOD photo spec). Engineering receives your report. Response email: "Insufficient data. Return to service." The attached photo shows an empty coupler. Your photo clearly showed hair.',
            effects: { experience: 200, suspicion: 18, sanity: -22 },
          },
        },
        {
          text: 'Remove it, burn it, replace the coupler.',
          outcome: {
            log: 'You pull the hair, stuff it in a metal can, light it with MEK-soaked rags behind the hangar. It burns with a blue flame. The coupler costs $24,000 to replace. Your supervisor wants an explanation you cannot provide.',
            effects: { experience: 100, suspicion: 40, credits: -24000, sanity: -10, mek: -2 },
          },
        },
        {
          text: 'Leave it. Close the access panel.',
          outcome: {
            log: 'You decide this is above your pay grade. You torque the panel fasteners to 20-25 in-lbs per spec and sign the log. That night, you dream of flying. Your hands are on the controls. But you are also watching yourself from the passenger cabin.',
            effects: { sanity: -45, suspicion: -10 },
            event: { type: 'psychological', id: 'RECURRING_DREAM_ALPHA' },
          },
        },
      ],
    },
  ],

  [AircraftType.B737_700]: [
    {
      id: 'B737_SCENARIO_1',
      description:
        "During a deep interior inspection per Boeing AOL-D222W370-01, you're checking the E&E bay equipment rack for corrosion. The Flight Management Computer (FMC) has an additional line card installed—P/N unknown. It's not in the IPC (Illustrated Parts Catalog). The etched circuit traces form words: YOUR NAME IS ___. The blank is filled in. With your name.",
      choices: [
        {
          text: 'Pull the card and quarantine it per SRM 34-11-25.',
          outcome: {
            log: 'You follow electrostatic discharge procedures, don the grounding strap, pull the card. The moment it disconnects, every screen in the E&E bay—FMC, EICAS, TCAS—displays your employee photo. The same photo from your badge. Then: static.',
            effects: { experience: 400, sanity: -50, suspicion: 25 },
            event: { type: 'containment_breach', id: 'SYSTEM_SENTIENCE' },
          },
        },
        {
          text: "Trace the card's data bus connections.",
          outcome: {
            log: 'You follow the ARINC 629 wiring from the unknown card. It connects to the Digital Flight Data Acquisition Unit (DFDAU). You download the FDR data. Playback shows: normal flight parameters. But the audio track contains 19 hours of whispering. You cannot understand the language. You are certain it is your voice.',
            effects: { experience: 500, sanity: -65, fdrData: 1 },
            event: { type: 'data_anomaly', id: 'VOICE_RECOGNITION_FAILURE' },
          },
        },
        {
          text: 'Ignore it, close the rack, sign off the inspection.',
          outcome: {
            log: 'You button up the avionics bay, torque the dzus fasteners per spec. The aircraft returns to service. You go home. That night, your phone rings. No caller ID. You answer. You hear yourself breathing on the other end. And then: laughter.',
            effects: { sanity: -40, suspicion: -5 },
            event: { type: 'stalking', id: 'UNKNOWN_CALLER' },
          },
        },
      ],
    },
  ],

  [AircraftType.A330]: [
    {
      id: 'A330_SCENARIO_1',
      description:
        "MEL Item 28-41-01 allows dispatch with one fuel quantity processor inoperative (FQPU). You're troubleshooting the #2 FQPU (P/N: C20533AA01). The BITE test per AMM 28-41-45 shows: 'NO FAULT FOUND.' But the fuel quantity indication for Center Tank reads exactly π × 1000 kg. Not rounded. All 15 digits after the decimal. Mathematically perfect.",
      choices: [
        {
          text: 'Replace the FQPU with a serviceable spare.',
          outcome: {
            log: 'You swap in a known-good unit (SN: A32750991). The new FQPU immediately displays the same reading: π × 1000 kg. You check the fuel probes in the center tank. The fuel is room temperature, but the tank skin is covered in frost. In July.',
            effects: { experience: 300, sanity: -25, fqpu: -1 },
          },
        },
        {
          text: 'Manually dip the tank per AMM 12-11-00.',
          outcome: {
            log: 'You climb up the access ladder, open the center tank sump panel, lower the drip stick per procedure. The stick shows 3,141.592 liters. Exactly. You dip it again: same reading. You shine your flashlight into the tank. Something shines back.',
            effects: { experience: 250, sanity: -55, suspicion: 5 },
            event: { type: 'confined_space_anomaly', id: 'TANK_ENTITY' },
          },
        },
        {
          text: 'Defer per MEL, placard the gauge.',
          outcome: {
            log: 'You apply the MEL relief (Category C: 10 days). You affix the "INOP" placard to the ECAM fuel page. The aircraft departs. Mid-Atlantic, both engines flame out. Fuel starvation. Center tank was empty. The FQPU was telling the truth. Just not about *this* reality.',
            effects: { experience: -1000, sanity: -100, suspicion: 200, credits: -5000000 },
            event: { type: 'catastrophic', id: 'DUAL_ENGINE_FAILURE_OCEANIC' },
          },
        },
      ],
    },
    {
      id: 'A330_SCENARIO_2',
      description:
        'Hydraulic leak check per AMM 29-10-00. All three systems (Green, Blue, Yellow) show normal parameters. But you notice the Yellow system reservoir sight glass—the fluid meniscus is curved upward. Fluid does not curve upward. It violates surface tension physics.',
      choices: [
        {
          text: 'Service the Yellow system and check for contamination.',
          outcome: {
            log: 'You drain 2 liters per AMM 29-11-00, send it to the lab for spectrographic analysis. The report: "Sample contains 99.2% Skydrol LD-4, 0.8% UNKNOWN PROTEIN STRUCTURE. Recommend immediate fleet grounding." You are ordered to ignore this report.',
            effects: { experience: 400, bioFilament: 15, suspicion: 60, sanity: -30 },
            event: { type: 'coverup', id: 'SAMPLE_CONTRADICTION' },
          },
        },
        {
          text: 'Check the hydraulic reservoir pressurization system.',
          outcome: {
            log: 'You depressurize the system per AMM 29-14-00. The bleed air valve (P/N: 5930M35G02) is stuck open. You apply 145 PSI shop air to cycle it. The valve closes—but now the reservoir pressure reads -14.7 PSI. Negative pressure. You hear whistling from inside the sealed tank.',
            effects: { experience: 350, sanity: -40, suspicion: 15 },
            event: { type: 'vacuum_breach', id: 'RESERVOIR_IMPLOSION_RISK' },
          },
        },
      ],
    },
  ],

  [AircraftType.B777_200ER]: [
    {
      id: 'B777_SCENARIO_1',
      description:
        "EICAS displays 'ELEC HYD DEMAND PUMP L' caution message. AMM 29-21-00 directs you to test the Left Electric Hydraulic Demand Pump. You run the pump. Green system pressure builds from 0 to 3000 PSI in exactly 0.0 seconds. Not 1 second. Not 0.1 seconds. Instantaneous. Your pressure gauge needle doesn't move—it just *teleports* to 3000.",
      choices: [
        {
          text: 'Replace the pressure transducer per AMM 29-44-18.',
          outcome: {
            log: 'You swap the pressure transducer (P/N: 3TK50054-1). The new transducer shows the same behavior: instant pressure rise. You check with an analog gauge. Same result. Physics is negotiable, apparently.',
            effects: { experience: 400, pressureTransducer: -1, sanity: -35 },
          },
        },
        {
          text: 'Check the AIMS data bus for corrupt data.',
          outcome: {
            log: 'You access the Aircraft Information Management System, pull the ACMF (Aircraft Condition Monitoring Function) data logs. Every hydraulic pressure sample for the last 400 flight hours is exactly 3000.0 PSI. No variance. No deviation. Perfect. Impossible.',
            effects: { experience: 450, suspicion: 25, sanity: -40, aimsData: 1 },
            event: { type: 'data_integrity', id: 'SENSOR_CONSPIRACY' },
          },
        },
        {
          text: 'Defer per MEL 29-21-02 (ETOPS relief prohibited).',
          outcome: {
            log: 'You apply MEL Category B (3 days). The aircraft continues non-ETOPS ops. On day 3, over the Rockies, the demand pump activates uncommanded. Green system pressure spikes to 9,000 PSI. Every hydraulic line on the aircraft ruptures simultaneously. Emergency landing, 14 injuries. You are held responsible.',
            effects: { experience: -800, suspicion: 150, sanity: -60, credits: -3000000 },
            event: { type: 'incident', id: 'CATASTROPHIC_HYD_FAILURE' },
          },
        },
      ],
    },
    {
      id: 'B777_SCENARIO_2',
      description:
        "Performing a RAM (Remote Annunciator Module) lamp test per AMM 31-22-00. All lights illuminate correctly—except one. The 'DOOR FWD CARGO' light illuminates, then displays alphanumeric characters: 'SOS SOS SOS'. The cargo door is closed and latched per EICAS indication.",
      choices: [
        {
          text: 'Open the forward cargo door and inspect.',
          outcome: {
            log: 'You open the door per AMM 52-10-00. Inside: nothing unusual. Standard ULDs. You step inside. The door closes behind you. You did not touch the switch. The latches engage. You are trapped. After 45 minutes, ground crew hears pounding. They find you unconscious. You have no memory of the 45 minutes.',
            effects: { experience: 500, sanity: -70, suspicion: 40 },
            event: { type: 'lost_time', id: 'CARGO_COMPARTMENT_INCIDENT' },
          },
        },
        {
          text: 'Replace the RAM per AMM 31-22-33.',
          outcome: {
            log: 'You pull the RAM (P/N: 600-67890-1), install a fresh one. The new RAM displays: "DO NOT OPEN CARGO DOOR." You did not program this message. You check the BITE data: NO FAULT FOUND. The message persists.',
            effects: { experience: 350, ram: -1, sanity: -30, suspicion: 20 },
          },
        },
      ],
    },
  ],

  [AircraftType.A300_CARGO]: [
    {
      id: 'A300_SCENARIO_1',
      description:
        "Cargo smoke detector test per AMM 21-71-00. You initiate the BITE test from the cargo fire panel. The forward cargo detector (P/N: 3510-50-19) should trigger within 15-30 seconds. It triggers in 0 seconds. Smoke present. But there's no fire. No heat. And the 'smoke' reads as 78% nitrogen, 21% oxygen, 1% 'undefined element.' It's air. Normal air. The detector sees something you cannot.",
      choices: [
        {
          text: 'Replace the smoke detector per AMM 21-71-19.',
          outcome: {
            log: 'You pull the old detector, install a new one. The new detector immediately triggers. Same reading: smoke present. You install a third detector. Same result. You check the cargo bay: empty. You shine a flashlight. You see your shadow. Then you see a second shadow. There is no second light source.',
            effects: { experience: 350, smokeDetector: -2, sanity: -50 },
            event: { type: 'paranormal', id: 'SHADOW_ENTITY' },
          },
        },
        {
          text: 'Check the cargo bay fire suppression bottles.',
          outcome: {
            log: 'You inspect the Halon 1301 bottles per AMM 26-21-00. Pressure gauge: 600 PSI (green arc). But the bottles are cold. Frost forms on the valve body. In a heated hangar. You touch the bottle. Your hand sticks. Frozen. You pull away, leaving skin behind.',
            effects: { experience: 300, sanity: -55, suspicion: 15 },
            event: { type: 'injury', id: 'CRYOGENIC_EXPOSURE' },
          },
        },
        {
          text: 'Deactivate the detector per MEL 26-21-01.',
          outcome: {
            log: 'You pull the D1 circuit breaker, placard the system INOP. The aircraft departs with cargo. At FL250, the cargo bay fills with smoke. Real smoke. The crew initiates an emergency descent. Emergency landing, aircraft destroyed by fire. The smoke detector was trying to warn you. About the future.',
            effects: { experience: -1000, sanity: -90, suspicion: 180, credits: -8000000 },
            event: { type: 'catastrophic', id: 'CARGO_FIRE_LOSS' },
          },
        },
      ],
    },
  ],
};
