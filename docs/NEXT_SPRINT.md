# Comprehensive Enhancement Plan for The Hangar

## Strengthening Realism & Game Narrative

Based on my analysis of The Hangar's current mechanics and aviation industry standards, I've created a detailed enhancement plan to elevate realism and narrative depth.

---

## 🎯 Executive Summary

**Current State**: The game has strong technical foundations with authentic aviation terminology and Lovecraftian horror elements. However, opportunities exist to deepen realism through regulatory frameworks, component lifecycle management, and dynamic narrative branching.

**Target Outcome**: Create a seamless integration of realistic aircraft maintenance operations with escalating cosmic horror that maintains technical credibility while delivering psychological impact.

---

## 📋 Phase 1: Regulatory & Compliance Realism (Weeks 1-4)

### 1.1 Enhanced Documentation System

**Current Gap**: Basic SRF (Service Request Form) filing lacks depth of real maintenance documentation.

**Proposed Enhancement**:

#### Multi-Tier Documentation Framework

- **Work Orders**: Include MEL (Minimum Equipment List) references, deferral categories (A/B/C/D)
- **Logbook Entries**: Implement FAR Part 43 compliant entry formats with corrective action descriptions
- **8130-3 Tags**: Airworthiness approval tags for component installations with traceability
- **Non-Routine Cards**: Detailed troubleshooting documentation requiring root cause analysis

**Narrative Integration**:

- Documents contain subtle anomalies: timestamps that predate events, signatures from technicians listed as "terminated"
- Cross-referencing reveals inconsistencies: aircraft tail numbers that don't exist in FAA registry
- Horror escalation: Logbook entries written in your handwriting for work you don't remember performing

**Mechanical Impact**:

```typescript
DocumentAction {
  type: 'CREATE_LOGBOOK_ENTRY',
  costs: { focus: 25, time: 15min },
  requirements: {
    aircraftTailNumber: string,
    discrepancyDescription: string,
    correctiveAction: string,
    farReference: string, // e.g., "FAR 43.13(a)"
    inspectionType: 'visual' | 'operational' | 'ndt'
  },
  outcomes: {
    success: { suspicion: -5, experience: +200 },
    anomalyDetected: { sanity: -10, unlockLoreFragment: true }
  }
}
```

### 1.2 MEL Implementation System

**Current Gap**: No Minimum Equipment List logic for deferred defects. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_fe7af30c-38c9-439f-bdc1-1c39685c71ed/03442e52-0126-4383-b455-856da2b0ee48/282739699-Flight-Training-Manual-A330-pdf.pdf)

**Proposed Enhancement**:

#### Dynamic MEL Categories

- **Category A**: Rectify within 24 hours (cosmetic, minor)
- **Category B**: Rectify within 3 days (performance impact)
- **Category C**: Rectify within 10 days (system redundancy loss)
- **Category D**: Rectify within 120 days (with operational procedures)

**Narrative Integration**:

- Certain defects cannot be deferred despite MEL allowance: "EICAS message persists after rectification. Component tests serviceable."
- Horror escalation: MEL items spontaneously recategorize themselves to Category A during night shifts
- Regulatory pressure: FAA audits specifically target your deferred items

**Game Mechanic**:

```typescript
MELSystem {
  deferredDefects: Array<{
    discrepancy: string,
    melCategory: 'A' | 'B' | 'C' | 'D',
    daysRemaining: number,
    correctiveActionRequired: Action,
    cannotDeferReasons?: string[] // Anomalous defects
  }>,

  consequences: {
    expiredDeferral: { suspicion: +50, auditTriggered: true },
    accumulation: { workloadMultiplier: 1.2 per 5 items },
    anomalousDefects: { sanityDrain: -2 per tick }
  }
}
```

### 1.3 Airworthiness Directive (AD) Compliance

**Current Gap**: No mandatory compliance tracking system. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_fe7af30c-38c9-439f-bdc1-1c39685c71ed/466a00f7-3acb-4ef4-a088-2274af6c346d/BAMMHL_000022.pdf)

**Proposed Enhancement**:

#### AD Management System

- **Emergency ADs**: 24-hour compliance, aircraft grounded until completed
- **Recurring ADs**: Scheduled inspections (e.g., every 500 flight hours)
- **One-Time ADs**: Terminating actions for design flaws

**Narrative Integration**:

- ADs reference incidents that haven't occurred yet: "Following the Vladivostok event of 03-MAR-2026..." (it's currently February)
- Compliance requires parts that don't exist in supply chain
- Horror escalation: Emergency AD issued for "structural resonance in aft fuselage, source unknown"

**Mechanical Impact**:

- Non-compliance triggers aircraft grounding (loss of job opportunities)
- Suspicion increases exponentially with overdue ADs
- Some ADs require specialized tools obtainable only through black market

---

## 🔧 Phase 2: Component Lifecycle Realism (Weeks 5-8)

### 2.1 Enhanced Rotable Management

**Current Gap**: Basic rotable tracking without lifecycle stages.

**Proposed Enhancement**:

#### Full Component Lifecycle

```typescript
RotableComponent {
  partNumber: string,
  serialNumber: string,
  condition: {
    status: 'serviceable' | 'unserviceable' | 'beyond-economical-repair',
    totalCycles: number,
    totalHours: number,
    timeSinceOverhaul: number,
    nextDueAction: 'inspection' | 'overhaul' | 'scrap',
    limitingFactor: 'calendar' | 'cycles' | 'hours'
  },

  traceability: {
    installationDate: Date,
    removalReason: string,
    form8130Tag: boolean,
    overhaulerCertification: string,
    shelfLifeExpiry?: Date // For time-limited components
  },

  anomalies?: {
    unexplainedWear: boolean,
    dimensionalDeviation: number, // in thousandths of inch
    materialCompositionDrift: string // "titanium alloy exhibits properties inconsistent with specifications"
  }
}
```

**Narrative Integration**:

- Components develop consciousness: parts resist removal, torque values change during installation
- Traceability gaps: Serial numbers reference overhaul facilities that closed decades ago
- Horror escalation: Installed components degrade faster than flight hours accumulate

### 2.2 NDT (Non-Destructive Testing) Mini-Games

**Current Gap**: Single HFEC scanner action with no depth.

**Proposed Enhancement**:

#### Multi-Method Inspection System

**Eddy Current (HFEC)**:

- **Use Case**: Surface and subsurface crack detection in aluminum/titanium
- **Mini-Game**: Adjust frequency and gain to detect impedance changes
- **Realism**: Requires calibration standards, conductive gel application
- **Horror**: Anomalous readings spell words in amplitude waveform: "HELP"

**Ultrasonic (UT)**:

- **Use Case**: Internal flaws, corrosion mapping, thickness measurement
- **Mini-Game**: Interpret A-scan waveforms for echo patterns
- **Realism**: Requires couplant, multiple angle inspections
- **Horror**: Echo returns from voids that shouldn't exist geometrically

**Magnetic Particle (MPI)**:

- **Use Case**: Ferromagnetic materials (landing gear, engine mounts)
- **Mini-Game**: Apply magnetic field, interpret particle accumulation patterns
- **Realism**: Requires UV light, demagnetization after inspection
- **Horror**: Particle patterns form symbols from forbidden texts

**Dye Penetrant (FPI)**:

- **Use Case**: Non-porous materials, surface crack detection
- **Mini-Game**: Apply dye, dwell time, develop, interpret indications
- **Realism**: Temperature-sensitive, requires solvent cleaning
- **Horror**: Dye penetrates surfaces with no visible cracks, seeps from solid metal

**Mechanical Impact**:

```typescript
NDTInspection {
  methods: ['HFEC', 'UT', 'MPI', 'FPI'],
  requirements: {
    certification: 'Level I' | 'Level II' | 'Level III',
    equipment: Tool[],
    consumables: ['couplant', 'penetrant', 'developer'],
    environmentalConditions: {
      temperature: [50, 100], // °F
      lighting: 'UV' | 'white-light'
    }
  },

  outcomes: {
    acceptableIndication: { component: 'serviceable', xp: +500 },
    rejectionIndication: { component: 'unserviceable', workOrder: 'create-repair-scheme' },
    anomalousIndication: { sanity: -25, unlockInvestigation: true }
  }
}
```

### 2.3 Component Overhaul Workshop

**Current Gap**: Backshops exist but lack detailed overhaul mechanics.

**Proposed Enhancement**:

#### Multi-Stage Overhaul Process

**Stage 1: Disassembly & Cleaning**

- Strip components to detail parts
- Ultrasonic cleaning, chemical stripping
- Horror: Parts maintain operational temperature after disassembly

**Stage 2: Inspection**

- Dimensional inspection (micrometers, bore gauges)
- NDT on critical areas
- Horror: Measurements change between readings, defying calibration

**Stage 3: Repair/Replace**

- Machine work (lathe, mill), welding, plating
- Replace life-limited parts
- Horror: Repaired components revert to damaged state overnight

**Stage 4: Assembly & Test**

- Reassemble per CMM (Component Maintenance Manual)
- Functional testing (hydraulic, pneumatic, electrical)
- Horror: Test rigs display impossible readings (negative pressure, reverse current flow)

**Stage 5: Certification**

- Issue 8130-3 airworthiness tag
- Update component history card
- Horror: Signatures on tags match deceased inspectors

**Resource Costs**:

- Time: 4-8 hours real-time (can delegate)
- Credits: 500-2,000 depending on component complexity
- Consumables: Cleaning solvents, replacement bearings, seals
- Sanity: -1 per minute in Backshops (escalates with anomalies)

---

## 📊 Phase 3: Dynamic Narrative Branching (Weeks 9-12)

### 3.1 Reputation System

**Current Gap**: Suspicion is the only social metric.

**Proposed Enhancement**:

#### Multi-Faction Reputation Tracking

```typescript
ReputationSystem {
  factions: {
    management: {
      score: 0-100,
      influences: ['compliance_rate', 'productivity', 'cost_efficiency'],
      perks: {
        high: ['priority_tool_access', 'training_budget', 'shift_choice'],
        low: ['mandatory_overtime', 'audit_frequency_increase', 'termination_risk']
      }
    },

    nightCrew: {
      score: 0-100,
      influences: ['favor_completion', 'secret_keeping', 'black_market_purchases'],
      perks: {
        high: ['untraceable_parts_discount', 'workload_delegation', 'warnings_about_audits'],
        low: ['sabotage_risk', 'false_accusations', 'isolation']
      }
    },

    theSuits: {
      score: -100 to +100, // Can go negative
      influences: ['anomaly_reporting', 'compliance_with_impossible_requests', 'witness_silence'],
      perks: {
        high: ['protection_from_audits', 'access_to_SLS3', 'truth_fragments'],
        low: ['reality_distortion', 'memory_alterations', 'marked_for_containment']
      }
    },

    regulatoryBodies: {
      score: 0-100,
      influences: ['documentation_accuracy', 'AD_compliance', 'audit_performance'],
      perks: {
        high: ['leniency_on_violations', 'certification_renewals', 'inspector_endorsement'],
        low: ['facility_inspection', 'license_suspension_risk', 'criminal_referral']
      }
    }
  }
}
```

**Narrative Integration**:

- Faction conflicts force difficult choices: Management demands you sign off on marginal work; Night Crew offers untraceable parts to meet deadline
- Reputation gates ending paths: High Suits reputation required for Alien ending, high regulatory reputation blocks it
- Dynamic dialogue: NPCs reference your reputation in interactions

### 3.2 Branching Event Chains

**Current Gap**: Events are mostly isolated.

**Proposed Enhancement**:

#### Multi-Event Story Arcs

**Example Arc: "The Vladivostok Incident"**

```typescript
EventChain {
  id: 'vladivostok_incident',
  stages: [
    {
      trigger: { level: 15, location: 'office' },
      event: {
        title: 'Encrypted Memo',
        description: 'Internal mail contains heavily redacted incident report from Vladivostok facility.',
        choices: [
          { text: 'Investigate further', nextStage: 1, cost: { focus: 30 } },
          { text: 'Ignore and delete', nextStage: null, reputationImpact: { management: +5 } }
        ]
      }
    },

    {
      trigger: { previousChoice: 0 },
      event: {
        title: 'KARDEX Cross-Reference',
        description: 'Legacy archives contain incident photos. Workers in hazmat suits. Something metallic and spherical in containment.',
        choices: [
          { text: 'Print forbidden page', nextStage: 2, cost: { sanity: -15, suspicion: +10 } },
          { text: 'Close terminal', nextStage: null }
        ]
      }
    },

    {
      trigger: { previousChoice: 0, inventory: 'has_printed_page' },
      event: {
        title: 'Regular\'s Warning',
        description: 'The Regular sees the printout. "You shouldn\'t have that. They\'ll know you know."',
        choices: [
          { text: 'Ask what happened', nextStage: 3, reputationImpact: { nightCrew: +10 } },
          { text: 'Burn the evidence', nextStage: null, cost: { sanity: -5 } }
        ]
      }
    },

    {
      trigger: { previousChoice: 0 },
      event: {
        title: 'The Truth Revealed',
        description: '"Seventy-three dead. Containment breach. They said equipment failure. It wasn\'t." He hands you coordinates. "SLS-3. Don\'t go alone."',
        outcomes: {
          unlockLocation: 'sls3_door',
          unlockItem: 'vladivostok_keycard',
          reputationImpact: { theSuits: -25 },
          flagSet: 'vladivostok_truth_known'
        }
      }
    }
  ],

  consequences: {
    completed: {
      endingRequirement: 'alien_ending',
      permanentEffects: { maxSanity: -10, perceptionBonus: +15 }
    },
    abandoned: {
      reputationImpact: { management: +10, theSuits: +5 }
    }
  }
}
```

**Additional Arc Examples**:

- **"The Janitor's Route"**: Track his cleaning patterns to discover he's sealing dimensional breaches
- **"Union Leverage"**: Expose management violations to gain Night Crew's trust, unlock strike event
- **"F.O.D.'s Origin"**: High trust unlocks memories of the cat's arrival during a previous incident
- **"The Sedan's Passengers"**: Observe license plate variations to decode arrival pattern, confront occupants

### 3.3 Morally Complex Decisions

**Current Gap**: Most choices are risk/reward calculations.

**Proposed Enhancement**:

#### Ethical Dilemma System

**Example: "Airworthiness vs. Operations"**

```
Scenario: You discover a crack in wing spar during inspection. It's within limits per SRM
(Structural Repair Manual), but marginally. Aircraft is scheduled for critical organ transport
flight in 2 hours. Deferring requires 8-hour repair. Management is pressuring sign-off.

Choices:
1. Sign off as airworthy
   - Consequences:
     * 80% nothing happens, reputation +10 management
     * 20% structural failure, 47 fatalities, sanity -100 (game over: guilt ending)

2. Ground aircraft for repair
   - Consequences:
     * Organ recipient dies, moral burden, sanity -30
     * Reputation -25 management, +15 regulatory
     * Management retaliates: forced night shifts, audit frequency increase

3. Falsify inspection report (hide finding)
   - Consequences:
     * Similar risk profile to option 1
     * If discovered: certificate revocation, criminal charges, game over
     * If undiscovered: permanent sanity drain -1/tick (guilt)

4. Delegate decision to senior inspector
   - Consequences:
     * They sign off (80% chance), you avoid direct responsibility but enabled bad decision
     * They ground aircraft (20% chance), you're seen as weak
     * Relationship with delegated inspector permanently damaged
```

**Narrative Impact**:

- No "correct" answer; all choices have meaningful consequences
- Player must weigh professional ethics against operational pressures
- Outcomes reference decision in future events: "Remember that organ transport? The one you grounded?"

---

## 🎨 Phase 4: Atmospheric & Sensory Enhancement (Weeks 13-16)

### 4.1 Environmental Audio Design

**Current Gap**: Basic sound effects, no ambient soundscape.

**Proposed Enhancement**:

#### Layered Audio System

**Background Ambience (Location-Specific)**:

- **Hangar**: Hydraulic hum (125 Hz), pneumatic hiss, distant APU whine, radio chatter
- **Backshops**: Machining sounds (lathe, mill), ultrasonic cleaner cavitation, ventilation roar
- **Office**: Fluorescent buzz (120 Hz), keyboard clacking, phone rings, HVAC white noise
- **Apron**: Jet engine spool-up/down, GPU (Ground Power Unit) diesel rumble, wind, radio squelch

**Dynamic Audio Modulation**:

```typescript
AudioSystem {
  ambience: {
    baseLayer: 'location_specific.mp3',
    modulators: {
      sanity: {
        below50: { filter: 'lowpass', distortion: +0.1 },
        below30: { filter: 'bitcrush', reverb: 'cathedral' },
        below10: { additionalLayer: 'whispers.mp3', pitch: -200cents }
      },

      timeOfDay: {
        night: { volume: -6dB, additionalLayer: 'distant_sedan.mp3' },
        twilight: { filter: 'highpass', echo: 0.3s }
      },

      anomalyProximity: {
        within10m: { binaural: 'behind_left', heartbeat: 80bpm },
        within5m: { staticNoise: +12dB, doppler: 'approaching' }
      }
    }
  },

  stingers: {
    auditArrival: 'ominous_strings.mp3',
    suitAppearance: 'subsonic_rumble.mp3',
    anomalyDiscovery: 'dissonant_chord.mp3',
    sanityBreakpoint: 'glass_shatter.mp3'
  }
}
```

**Horror Escalation**:

- Audio glitches: Radio chatter includes your name, conversations you haven't had yet
- The Hum: Persistent 47 Hz tone that intensifies in Backshops, causes physiological discomfort
- Spatial audio: Footsteps behind player that stop when action is taken to look

### 4.2 Visual Glitch System

**Current Gap**: Static UI, no visual feedback for sanity degradation.

**Proposed Enhancement**:

#### Sanity-Responsive Visual Effects

```typescript
VisualEffects {
  sanityThresholds: {
    below70: {
      effects: ['subtle_chromatic_aberration', 'text_flicker_rare'],
      frequency: 0.05 // 5% chance per second
    },

    below50: {
      effects: [
        'UI_element_displacement', // Buttons shift 2-5px randomly
        'log_text_scramble', // Letters transpose briefly
        'peripheral_shadow_movement'
      ],
      frequency: 0.15
    },

    below30: {
      effects: [
        'screen_tearing',
        'color_inversion_flash',
        'geometric_distortion', // Text warps, curves
        'phantom_notifications' // Non-existent alerts appear
      ],
      frequency: 0.30
    },

    below10: {
      effects: [
        'reality_fragmentation', // UI elements overlap impossibly
        'text_becomes_symbols', // English replaced with glyphs
        'mirror_mode', // Interface reverses horizontally
        'temporal_echo' // Actions replay in reverse
      ],
      frequency: 0.60,
      permanent: true // Doesn't revert until sanity restored
    }
  }
}
```

**Technical Implementation**:

- CSS filters: `brightness()`, `hue-rotate()`, `blur()`
- Canvas overlay: Procedural noise, particle systems for static
- React component wrapping: Conditional rendering of glitch layers

### 4.3 Temporal Anomalies

**Current Gap**: Linear time progression.

**Proposed Enhancement**:

#### Time Distortion Mechanics

**Clock Desynchronization**:

- In-game clock drifts from real-world time at low sanity
- Time advances during blackouts (player loses minutes, work is completed they don't remember)
- Temporal loops: Same event occurs multiple times with slight variations

**Mechanic Example**:

```typescript
TemporalAnomaly {
  trigger: { sanity: '<20', location: 'backshops', timeOfDay: '02:00-03:00' },

  effect: {
    type: 'time_loop',
    duration: 300000, // 5 minutes real-time
    characteristics: {
      playerRetainsMemory: true,
      NPCsBehaveDifferently: true,
      canBreakLoop: {
        method: 'perform_specific_action',
        action: 'TALK_TO_JANITOR',
        clue: 'He points at the clock. It\'s running backwards.'
      }
    },

    consequences: {
      loopBroken: { sanity: +10, unlockLoreFragment: 'temporal_instability_report' },
      loopPersists: { sanity: -5, experience: -200, suspicion: +10 }
    }
  }
}
```

---

## 🧬 Phase 5: Advanced Systems Integration (Weeks 17-20)

### 5.1 Weather Impact System

**Current Gap**: No weather consideration. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_fe7af30c-38c9-439f-bdc1-1c39685c71ed/b626a04d-c288-4066-9490-7fff88df0f31/24043867-A330-A340-Flight-Crew-Training-Manual.pdf)

**Proposed Enhancement**:

#### Dynamic Weather Effects

**Operational Impact**:

```typescript
WeatherSystem {
  conditions: {
    temperature: {
      below32F: {
        effects: [
          'icing_risk',
          'hydraulic_fluid_viscosity_increase',
          'battery_capacity_reduction',
          'mandatory_deice_procedures'
        ],
        focusCost: +1.2, // 20% increase for cold weather ops
        timeCost: +1.5 // 50% longer task duration
      },

      above100F: {
        effects: [
          'heat_exhaustion_risk',
          'battery_thermal_runaway',
          'fuel_expansion',
          'electronic_heat_soak'
        ],
        focusCost: +1.3,
        sanityDrain: -1 per 5 minutes
      }
    },

    precipitation: {
      rain: {
        effects: ['reduced_visibility', 'slip_hazard', 'electronic_corrosion_risk'],
        actionRestrictions: ['no_external_ndt', 'no_fueling_without_grounding']
      },

      snow: {
        effects: ['aircraft_contamination', 'apron_fod_increase', 'delayed_operations'],
        forcedActions: ['de_ice_aircraft', 'clear_engine_inlets']
      },

      thunderstorm: {
        effects: ['grounding_all_operations', 'lightning_strike_inspection_required'],
        facilityLockdown: true,
        horrorEscalation: 'electrical_anomalies' // Equipment activates without power
      }
    },

    wind: {
      above35kt: {
        effects: ['hangar_door_restriction', 'towing_prohibited', 'fall_protection_required'],
        accidentRisk: +0.15 // 15% chance of FOD or equipment damage per action
      }
    }
  }
}
```

**Narrative Integration**:

- Thunderstorms coincide with eldritch manifestations: "Lightning strikes twice in same spot, 47 times"
- Fog reveals shapes that shouldn't exist: "The sedan's outline in the mist is... wrong. Too many angles."
- Extreme cold causes metal to behave anomalously: "The aluminum skin is brittle. It shouldn't be brittle."

### 5.2 Shift Handover System

**Current Gap**: No continuity between shifts.

**Proposed Enhancement**:

#### Shift Transition Mechanics

**Handover Process**:

```typescript
ShiftHandover {
  incomingShift: {
    briefingRequired: true,
    elements: [
      'aircraft_status_review', // All parked aircraft conditions
      'open_work_orders', // Incomplete maintenance
      'mel_items_status', // Deferred defects
      'tool_inventory_verification',
      'facility_discrepancies' // Environmental issues
    ],

    duration: 15min,
    focusCost: 20,

    outcomes: {
      thoroughBriefing: { suspicion: -5, nightCrewReputation: +5 },
      rushedBriefing: { missedDiscrepancies: true, accidentRisk: +0.20 },
      noBriefing: { suspicion: +15, auditTriggered: 0.30 }
    }
  },

  outgoingShift: {
    mustComplete: [
      'log_all_actions',
      'return_tools',
      'document_unfinished_work',
      'report_anomalies' // Optional but impacts narrative
    ],

    anomalyReporting: {
      report: { reputationImpact: { theSuits: -10, management: -5 }, sanity: -15 },
      conceal: { sanityDrain: -2 per day (guilt), reputationImpact: { nightCrew: +10 } },
      falsify: { suspicion: +20 if caught, unlockBlackmailEvent: true }
    }
  }
}
```

**Narrative Integration**:

- Day crew leaves cryptic notes: "Don't trust the torque wrench in bay 3"
- Work you completed overnight is undone by morning shift: "Who re-opened this panel?"
- Handover meetings reveal contradictions: "Nobody was scheduled in Backshops last night, but tools are missing."

### 5.3 Supply Chain & Parts Shortage

**Current Gap**: Unlimited parts availability.

**Proposed Enhancement**:

#### Realistic Logistics Constraints

**Parts Availability System**:

```typescript
SupplyChain {
  leadTimes: {
    standardParts: '1-3 days',
    rotables: '5-14 days',
    engineComponents: '14-45 days',
    structuralParts: '30-90 days'
  },

  shortageScenarios: {
    criticalPartUnavailable: {
      triggers: ['global_shortage', 'supplier_bankruptcy', 'anomalous_consumption_rate'],

      playerOptions: [
        {
          option: 'Wait for parts',
          consequence: { aircraftGrounded: true, revenueloss: 5000 per day, managementReputation: -10 }
        },
        {
          option: 'Source from black market',
          consequence: { suspicion: +25, untraceable: true, partQuality: 'questionable' }
        },
        {
          option: 'Fabricate in-house',
          consequence: {
            requires: ['machine_shop_access', 'engineering_drawings'],
            risk: 0.30, // 30% chance of non-conformance
            suspicion: +15,
            focusCost: 80,
            timeCost: 8 hours
          }
        },
        {
          option: 'Cannibalize from stored aircraft',
          consequence: {
            suspicion: +10,
            requires: 'management_approval',
            unlockHorrorEvent: 'the_boneyard' // Stored aircraft are... aware
          }
        }
      ]
    }
  }
}
```

**Horror Integration**:

- Parts arrive with impossible delivery dates: "Shipped from Vladivostok facility, which closed in 1987"
- Consumption rate defies physics: "Rivets depleting faster than installation count"
- Black market parts have side effects: "Component operates correctly but emits low hum audible only to you"

---

## 📈 Implementation Roadmap

### Priority Matrix

| Phase                      | Priority | Complexity | Narrative Impact | Realism Boost | Est. Hours |
| -------------------------- | -------- | ---------- | ---------------- | ------------- | ---------- |
| Phase 1.1 (Documentation)  | HIGH     | Medium     | High             | Very High     | 60         |
| Phase 1.2 (MEL System)     | HIGH     | Medium     | Medium           | Very High     | 40         |
| Phase 2.1 (Rotables)       | HIGH     | High       | High             | Very High     | 80         |
| Phase 3.1 (Reputation)     | CRITICAL | High       | Very High        | Medium        | 100        |
| Phase 3.2 (Event Chains)   | CRITICAL | Very High  | Very High        | Medium        | 120        |
| Phase 4.1 (Audio)          | MEDIUM   | Medium     | High             | Low           | 70         |
| Phase 2.2 (NDT Mini-Games) | MEDIUM   | High       | Medium           | Very High     | 90         |
| Phase 5.1 (Weather)        | LOW      | Medium     | Medium           | High          | 50         |
| Phase 4.2 (Visual Glitch)  | LOW      | Low        | High             | Low           | 30         |
| Phase 1.3 (AD Compliance)  | MEDIUM   | Medium     | Medium           | Very High     | 50         |

### Development Sequence (20-Week Plan)

**Weeks 1-4: Foundation (Phase 1)**

- Implement enhanced documentation system
- Build MEL tracking logic
- Create AD compliance framework
- **Milestone**: Pass FAA regulatory audit simulation

**Weeks 5-8: Technical Depth (Phase 2)**

- Expand rotable lifecycle management
- Develop NDT mini-games (all 4 methods)
- Build component overhaul workshop
- **Milestone**: Complete full rotable overhaul cycle

**Weeks 9-12: Narrative Branching (Phase 3)**

- Implement reputation system (4 factions)
- Create 5 branching event chains
- Design 10 ethical dilemmas
- **Milestone**: Reach 3 different endings based on reputation paths

**Weeks 13-16: Atmosphere (Phase 4)**

- Layer ambient audio system
- Implement sanity-responsive visuals
- Add temporal anomaly mechanics
- **Milestone**: Sanity 0 triggers audio-visual overload

**Weeks 17-20: Integration (Phase 5)**

- Add dynamic weather system
- Build shift handover mechanics
- Implement supply chain logistics
- **Milestone**: Complete 7-day in-game week with all systems interacting

### Testing & Validation Milestones

**Technical Validation**:

- [ ] All new mechanics achieve 90%+ test coverage
- [ ] Performance budget maintained (< 16ms frame time at 60 FPS)
- [ ] Save/load compatibility with legacy saves

**Narrative Validation**:

- [ ] Playtest all event chain branches (10+ testers)
- [ ] Verify ethical dilemmas have no "obviously correct" choice
- [ ] Confirm horror escalation curve matches player progression

**Realism Validation**:

- [ ] Review by 3+ licensed A&P mechanics
- [ ] Cross-reference with FAA Part 43, Part 145 regulations
- [ ] Validate component part numbers against industry databases

---

## 🎯 Success Metrics

### Quantitative Goals

1. **Player Retention**: 60%+ completion rate to Level 25 (up from ~45% current)
2. **Narrative Engagement**: 80%+ players complete at least 1 event chain
3. **Realism Score**: 9/10 rating from aviation professionals
4. **Replay Value**: 40%+ players attempt second playthrough for different ending

### Qualitative Goals

1. **Cognitive Dissonance**: Players report feeling "professionally competent yet existentially terrified"
2. **Ethical Weight**: Post-game surveys show 70%+ players still think about dilemma choices
3. **Authenticity**: Aviation community recognizes game as "disturbingly accurate"
4. **Horror Effectiveness**: 85%+ players report atmosphere shift from "uncomfortable" to "dread" by Level 30

---

## 🚀 Quick Wins (Immediate Implementation)

If full roadmap is too resource-intensive, prioritize these high-impact, low-effort additions:

### Week 1 Quick Wins

1. **Add MEL Category Display**: Show "3 items deferred (2x Cat C, 1x Cat D)" in UI
2. **Implement Basic Shift Handover**: 30-second briefing text on shift start
3. **Create 3 Ethical Dilemma Events**: Airworthiness conflict, whistleblowing, falsification temptation

### Week 2 Quick Wins

4. **Add Component Traceability UI**: Display PN/SN/TSO/overhaul date when hovering over rotables
5. **Implement Weather Text Notifications**: "Heavy rain - external work restricted"
6. **Create Reputation Score Display**: Simple 0-100 gauge for Management, Night Crew, Regulatory

### Week 3 Quick Wins

7. **Add Ambient Audio Layers**: 3 location-specific background loops
8. **Implement Text Glitch Effects**: CSS animation for low-sanity text scrambling
9. **Create "Vladivostok Incident" Event Chain**: 4-stage investigative arc

### Week 4 Quick Wins

10. **Add Parts Lead Time System**: "Part ordered, arrives in 3 days" with countdown
11. **Implement AD Compliance Alerts**: "Emergency AD issued - 24hr compliance required"
12. **Create NDT Mini-Game (HFEC only)**: Simple frequency-tuning mechanic

**Estimated Total Effort**: 80 hours (one developer-month)  
**Estimated Impact**: 60% of full roadmap value

---

## 📚 Technical Architecture Notes

### State Management Extensions

```typescript
// Enhanced GameState structure
interface EnhancedGameState extends GameState {
  regulatory: {
    melItems: MELItem[];
    airworthinessDirectives: AD[];
    documentationLog: Document[];
    nextAuditDate: Date;
    complianceScore: number;
  };

  reputation: {
    management: ReputationScore;
    nightCrew: ReputationScore;
    theSuits: ReputationScore;
    regulatory: ReputationScore;
  };

  eventChains: {
    active: EventChain[];
    completed: string[];
    abandoned: string[];
  };

  environmental: {
    weather: WeatherCondition;
    timeOfDay: TimeOfDay;
    temporalAnomalies: TemporalAnomaly[];
  };

  supplyChain: {
    orderedParts: PartOrder[];
    inTransit: PartOrder[];
    backorders: PartOrder[];
  };
}
```

---
