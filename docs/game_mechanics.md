# Game Mechanics & Progression Documentation

## 1. Progression System Overview

The progression in **The Hangar** is defined by a linear interaction with the game world, where experience points (XP) are gained through completing jobs, resolving events, and performing actions.

- **XP Formula**: `500 * (level + 1)` required for next level.
- **Max Level**: 49.
- **Phases**:
  - **Orientation (Levels 0-5)**: Introduction to basic mechanics.
  - **First Anomalies (Levels 6-15)**: Introduction to horror elements and audits.
  - **The Pattern Emerges (Levels 16-25)**: Night shift, surveillance, and deeper lore.
  - **Deep Lore (Levels 26-35)**: Archives, KARDEX, and hidden areas.
  - **Preparation (Levels 36-48)**: Gathering resources for the endgame.
  - **Truth Reveal (Level 49)**: The final choice.

---

## 2. Levels & Milestones

The following table details the narrative progression and specific unlocks for each milestone level.

| Level  | Milestone Title            | Description                                       | Unlocks (Tab / Action / Feature)                                                                                   |
| :----- | :------------------------- | :------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------- |
| **0**  | **ORIENTATION DAY**        | Welcome to [REDACTED] Aerospace.                  | **Tab**: Canteen, Hangar<br>**Action**: Inspect Vending Machine                                                    |
| **1**  | **PROBATIONARY STATUS**    | Tool checkout privileges granted.                 | **Tab**: Toolroom<br>**Action**: Get/Return Toolroom Item                                                          |
| **2**  | **RAMP ACCESS**            | High-visibility vest issued.                      | **Tab**: Apron Line<br>**Action**: Rummage Lost & Found, Marshalling<br>**Event**: Incident                        |
| **3**  | **OFFICE KEY**             | Level 3 clearance. The answers contain questions. | **Tab**: Office<br>**Action**: Talk to Regular, Internal Mail, Create SRF<br>**Flag**: Office Unlocked             |
| **4**  | **MAINTENANCE CERTIFIED**  | Basic maintenance authorization.                  | **Action**: Deep Clean Vents, Install Rivets, Harvest Rotable                                                      |
| **5**  | **SHIFT INTEGRATION**      | You are now part of the machine.                  | **Tab**: Structure Shop<br>**Action**: Pet/Feed/Play Cat, Check Delayed Gate<br>**Event**: Audit, Canteen Incident |
| **6**  | **NIGHT SHIFT ELIGIBLE**   | The hangar is different after dark.               | **Action**: Delegate Night Crew                                                                                    |
| **8**  | **TERMINAL ACCESS**        | The passenger terminal awaits.                    | **Tab**: Terminal<br>**Action**: Listen Fuselage, Use Payphone<br>**Event**: Component Failure                     |
| **10** | **HR CLEARANCE**           | Human Resources. The basement floor.              | **Tab**: HR Floor<br>**Action**: Scavenge Corrosion Corner, Performance Review<br>**Event**: Bureaucratic Horror   |
| **12** | **TRAINING DEPARTMENT**    | Mandatory certifications.                         | **Tab**: Training<br>**Action**: Start EASA Module, Take AP Written                                                |
| **15** | **BACKSHOP AUTHORIZATION** | Component overhaul access.                        | **Tab**: Backshops<br>**Action**: Check Redacted Logs, Analyze Anomaly<br>**Event**: Eldritch Manifestation        |
| **18** | **NIGHT CREW LIAISON**     | The night crew trusts you.                        | **Action**: Observe Sedan, Observe Corrosion Corner<br>**Event**: Union                                            |
| **20** | **SURVEILLANCE AWARE**     | You have noticed the cameras.                     | **Action**: Review Surveillance Logs<br>**Event**: Syndicate                                                       |
| **22** | **DIGITAL CLEARANCE**      | The old PC boots.                                 | **Action**: Print Forbidden Page, Decrypt AMM                                                                      |
| **25** | **AOG DEPLOYMENT**         | Remote stations await.                            | **Tab**: AOG Deployment<br>**Action**: Upload Clean Protocol                                                       |
| **28** | **KARDEX INITIATED**       | The physical archives.                            | **Action**: Cross Reference KARDEX                                                                                 |
| **30** | **LEGACY ACCESS**          | The 1970s database.                               | **Action**: Consult Legacy Archives                                                                                |
| **35** | **SLS-3 DISCOVERY**        | You found the door.                               | **Action**: Access Black Market Channel                                                                            |
| **40** | **TRUTH PROXIMATE**        | The pieces are assembling themselves.             | _(Narrative Event Only)_                                                                                           |
| **45** | **FINAL CLEARANCE**        | They have stopped watching.                       | _(Completion Preparation)_                                                                                         |
| **49** | **TRUTH REVEAL**           | The hangar door opens to the void.                | **Action**: Trigger Endings                                                                                        |

---

## 3. Locations (Tabs)

Tabs represent the physical locations the player can visit.

| Tab                | Level Req. | Description                                          |
| :----------------- | :--------- | :--------------------------------------------------- |
| **HANGAR**         | 0          | Main hangar floor - entry level access.              |
| **CANTEEN**        | 0          | Break room - vending machines and lost souls.        |
| **TOOLROOM**       | 1          | Tool checkout - the Master awaits.                   |
| **APRON_LINE**     | 2          | Ramp access - watch for the sedan.                   |
| **OFFICE**         | 3          | Office level - paperwork and paranoia.               |
| **STRUCTURE_SHOP** | 5          | Structure shop - sheet metal and secrets.            |
| **TERMINAL**       | 8          | Passenger terminal - lost and found.                 |
| **HR_FLOOR**       | 10         | Human Resources - the basement.                      |
| **TRAINING_DEPT**  | 12         | Training department - mandatory viewing.             |
| **BACKSHOPS**      | 15         | Component overhaul - some things should stay closed. |
| **AOG_DEPLOYMENT** | 25         | AOG deployment - remote stations await.              |

---

## 4. Inventory & Items

Items have three description phases: **Normal**, **Unsettled**, and **Madness**, reflecting the player's deteriorating mental state.

### Tools (Shop)

Standard equipment purchasable with Credits.

| Item ID             | Name               | Cost | P/N             | Description (Normal)                              |
| :------------------ | :----------------- | :--- | :-------------- | :------------------------------------------------ |
| `laser_pointer`     | Laser Pointer      | 25   | LSR-PNT-RED     | Red laser pointer. Technically for presentations. |
| `ruler`             | 6in Steel Ruler    | 15   | MEAS-STD-001    | Standard 6-inch stainless steel ruler.            |
| `leatherman`        | Multi-tool         | 50   | OMNI-TOOL-99    | A reliable multi-tool.                            |
| `torxScrewdriver`   | Torx Set           | 40   | TRX-SET-ISO     | Standard set of Torx drivers, sizes T10-T40.      |
| `snapOnWrenchSet`   | Snap-On Wrench     | 250  | SO-PRO-WRNCH    | Professional grade combination wrenches.          |
| `hammer`            | Ball-peen Hammer   | 25   | PERCUSS-01      | 16oz ball-peen hammer. Hickory handle.            |
| `rivetGun`          | Pneu. Rivet Gun    | 150  | PNEU-RIV-4X     | 4X pneumatic rivet gun for structural repairs.    |
| `atlasCopcoDrill`   | Atlas Copco Drill  | 300  | AC-D-PNEU-X     | High-torque pneumatic drill.                      |
| `orbitalSander`     | Orbital Sander     | 120  | ABR-VIBE-GEN    | Random orbit sander for surface preparation.      |
| `irLamp`            | IR Curing Lamp     | 400  | NON-ION-OPTIC-X | Infrared heat lamp for curing composites.         |
| `technicianToolbox` | Tech Toolbox       | 150  | CONT-UNIT-BLK   | Heavy-duty steel cantilever toolbox.              |
| `flashlight`        | Utility Flashlight | 20   | LUM-EMIT-MAX    | LED flashlight. Ruggedized aluminum body.         |
| `radio`             | Portable Radio     | 80   | FREQ-MOD-RX     | Handheld transceiver for ground communications.   |

### Toolroom Equipment

Specialized equipment that must be checked out.

| Key              | Name                  | P/N            | Description (Unsettled Phase)            |
| :--------------- | :-------------------- | :------------- | :--------------------------------------- |
| `torquemeter`    | Precision Torquemeter | T-990-PREC-ISO | The needle follows my eyes.              |
| `malabar`        | Malabar Jack Stand    | MJ-800-HYD     | It groans under the weight of nothing.   |
| `airDataTestBox` | Air Data Test Box     | AD-400-X-DIG   | It simulates altitudes that don't exist. |
| `hfecDevice`     | HFEC Scanner          | EC-UNIT-SCAN-1 | It detects cracks in the air.            |
| `rototestDevice` | Rototest Unit         | ROT-X-66-SEQ   | The phases are wrong. A, B, C... D?      |
| `sonicCleaner`   | Sonic Cleaning Tank   | SNC-ULTRA-BATH | The fluid ripples when I am not looking. |

### Consumables

Single-use items used in jobs or actions.

| ID         | Name             | Cost | Unit      | Description (Normal)                        |
| :--------- | :--------------- | :--- | :-------- | :------------------------------------------ |
| `skydrol`  | Skydrol LD-4     | 45   | Liter     | Fire-resistant hydraulic fluid. Irritating. |
| `mek`      | MEK Solvent      | 25   | Gallon    | Methyl Ethyl Ketone. Strong solvent.        |
| `grease`   | Aeroshell 33     | 15   | Tube      | General purpose airframe grease.            |
| `sealant`  | BMS 5-95 Sealant | 60   | Cartridge | Fuel tank sealant. Two-part mix.            |
| `earmuffs` | Earmuffs         | 75   | Set       | Industrial hearing protection.              |

### Rotables (Components)

High-value aircraft parts often associated with anomalies or specific jobs.

| ID             | Name                  | Description (Madness Phase)                                        |
| :------------- | :-------------------- | :----------------------------------------------------------------- |
| `idg`          | Integrated Drive Gen  | It hums tunes for dead dogs.                                       |
| `adirs`        | Air Data Inertial Ref | It is navigating to a place that doesn't exist on any map. Kadath? |
| `hp_valve`     | HP Shutoff Valve      | It is holding back the pressure of the void. Do not open it.       |
| `csd`          | Constant Speed Drive  | Constant speed. Constant time. Loops within loops.                 |
| `apu`          | Aux Power Unit        | It is the heart of the beast. It must simply be fed.               |
| `nose_cowl`    | Nose Cowl Assy        | It will swallow me whole. I will become thrust.                    |
| `coffee_maker` | Galley Coffee Maker   | It brews memories. Bitter, black memories.                         |
| `toilet_assy`  | Vacuum Toilet Assy    | It leads to the void. If I fall in, I will fall forever.           |

### Carried Items

Personal effects and small items.

| ID           | Name           | Cost | Description (Normal)           |
| :----------- | :------------- | :--- | :----------------------------- |
| `wallet`     | Leather Wallet | 0    | Contains your ID and licenses. |
| `cigarettes` | Cigarettes     | 15   | Pack of cheap smokes.          |
| `lighter`    | Zippo Lighter  | 10   | Brushed steel lighter.         |

### Line Items

Vehicle and heavy equipment access keys.

| ID        | Name             | Cost | Description (Normal)                  |
| :-------- | :--------------- | :--- | :------------------------------------ |
| `ford150` | Fleet Key Access | 2500 | Keys to the company utility truck.    |
| `tireKit` | Tire Change Kit  | 200  | Jack, torque wrench, and safety cage. |

### Rare Resources

Strange materials found during specific high-level actions. These are tracked as special resources, not inventory items.

| ID                      | Name             | Source                                | Description                                      |
| :---------------------- | :--------------- | :------------------------------------ | :----------------------------------------------- |
| `bioFilament`           | Bio-Filament     | **Action**: Deep Clean Vents          | Unknown biological component. Found in the dark. |
| `crystallineResonators` | Resonators       | **Action**: Scavenge Corrosion Corner | Vibrating crystals. Anomaly stabilization?       |
| `kardexFragments`       | KARDEX Fragments | **Action**: Cross-Reference KARDEX    | Piecing together the past.                       |

---

## 5. Event System

Events are triggered based on level and actions. They have categories, choices, and outcomes.

### Event Categories

| ID                   | Category               | Level | Description                                |
| :------------------- | :--------------------- | :---- | :----------------------------------------- |
| `EVENT_STORY`        | Story Event            | 0     | Narrative events scale with player level.  |
| `EVENT_INCIDENT`     | Incident               | 2     | Minor incidents and rush jobs.             |
| `EVENT_ACCIDENT`     | Accident               | 3     | Electrical fires and failures.             |
| `EVENT_AUDIT`        | Audit                  | 5     | FAA, EASA, and The Suits.                  |
| `EVENT_CANTEEN`      | Canteen Incident       | 5     | Strange encounters in the break room.      |
| `EVENT_COMPONENT`    | Component Failure      | 8     | Things breaking that should not break.     |
| `EVENT_BUREAUCRATIC` | Bureaucratic Horror    | 10    | Paperwork that fights back.                |
| `EVENT_ELDRITCH`     | Eldritch Manifestation | 15    | Things from beyond the maintenance manual. |
| `EVENT_UNION`        | Union                  | 18    | The union knows things.                    |
| `EVENT_SYNDICATE`    | Syndicate              | 20    | The night crew has a side business.        |

### Key Event Examples

- **FAA Spot-Check (Audit)**: Random check of tools/certs.
  - _Choices_: Comply (Cost: Focus) vs. Resist/Failure.
  - _Failure_: Suspicion Increase, Fine.
- **The Suits (Audit)**: Unscheduled oversight by figures in charcoal grey.
  - _Survival_: Keep head down.
  - _Failure_: Looking at them causes massive Sanity loss.
- **Safety Wire Ghost (Story)**: A phantom technician re-doing your work.
- **Containment Breach (Accident)**: Re-engaging magnetic locks on Storage 4C.

### Detailed Manifest

- **Bureaucratic Horror**: `PAPERWORK_ERROR_INK`, `LOGBOOK_RECURSION` (The system fights back).
- **Eldritch Manifestation**:
  - `MEZZANINE_OBSERVATION`: The Suits watching from above.
  - `THE_HUM`: Structural resonance in Backshops.
  - `THE_ARCHIVIST`: A figure stealing files.
  - `TIMELINE_CORRUPTION`: Logs show work on future aircraft.
- **Canteen Incidents**: `CANTEEN_SUITS_LUNCH`, `CANTEEN_VENDING_PROPHECY`.

### Environmental Hazards

Global effects that alter gameplay conditions.

| Hazard ID            | Name                | Duration | Effect                                                          |
| :------------------- | :------------------ | :------- | :-------------------------------------------------------------- |
| `THUNDERSTORM`       | Severe Thunderstorm | 5 min    | Tarmac actions disabled. Focus cost +10%. Sanity drain active.  |
| `POWER_SURGE_HAZARD` | Power Fluctuations  | 3 min    | Focus cost +25%. Sanity drain. Risk of `MEZZANINE_OBSERVATION`. |

---

## 6. Endings

The game concludes at **Level 49** with the **Truth Reveal**. There are three distinct endings available, some requiring specific conditions.

| Ending ID              | Name                      | Requirement                | Description                   |
| :--------------------- | :------------------------ | :------------------------- | :---------------------------- |
| `TRIGGER_ALIEN_ENDING` | **Alien Conspiracy**      | **Item**: `metallicSphere` | They were never from here.    |
| `TRIGGER_GOVT_ENDING`  | **Government Conspiracy** | _None_                     | They knew all along.          |
| `TRIGGER_CRAZY_ENDING` | **Madness Ending**        | _None_                     | Perhaps it was you all along. |

_Note: The `metallicSphere` is a rare item likely found via high-level exploration actions (e.g., Scavenging or Black Market)._

---

## 7. Actions & Features

A comprehensive list of user actions and their unlock requirements.

| Action ID                   | Level | Requirement/Context        |
| :-------------------------- | :---- | :------------------------- |
| `INSPECT_VENDING_MACHINE`   | 0     | Canteen                    |
| `GET/RETURN_TOOLROOM_ITEM`  | 1     | Toolroom                   |
| `RUMMAGE_LOST_FOUND`        | 2     | Apron/Terminal             |
| `TALK_TO_REGULAR`           | 3     | Office                     |
| `CHECK_INTERNAL_MAIL`       | 3     | Office                     |
| `CREATE_SRF`                | 3     | Office                     |
| `DEEP_CLEAN_VENTS`          | 4     | Maintenance                |
| `INSTALL_RIVETS`            | 4     | Maintenance                |
| `HARVEST_ROTABLE`           | 4     | Maintenance                |
| `PET/FEED/PLAY_CAT`         | 5     | General (Pet)              |
| `CHECK_DELAYED_GATE`        | 5     | Canteen/Terminal           |
| `DELEGATE_NIGHT_CREW`       | 6     | Night Logic                |
| `LISTEN_FUSELAGE`           | 8     | Structure/Ramp             |
| `USE_PAYPHONE`              | 8     | Terminal                   |
| `SCAVENGE_CORROSION_CORNER` | 10    | HR Floor                   |
| `PERFORMANCE_REVIEW`        | 10    | HR Floor                   |
| `START_EASA_MODULE`         | 12    | Training                   |
| `TAKE_AP_WRITTEN`           | 12    | Training                   |
| `CHECK_REDACTED_LOGS`       | 15    | Backshops                  |
| `ANALYZE_ANOMALY`           | 15    | Backshops                  |
| `OBSERVE_SEDAN`             | 18    | Apron/Ramp                 |
| `REVIEW_SURVEILLANCE_LOGS`  | 20    | Office/Security            |
| `PRINT_FORBIDDEN_PAGE`      | 22    | Digital/Terminal           |
| `DECRYPT_AMM`               | 22    | Digital/Terminal           |
| `UPLOAD_CLEAN_PROTOCOL`     | 25    | AOG                        |
| `CROSS_REFERENCE_KARDEX`    | 28    | KARDEX System              |
| `CONSULT_LEGACY_ARCHIVES`   | 30    | Archive Terminal           |
| `CHECK_BLACK_MARKET`        | 35    | **Item**: `metallicSphere` |
| `TRIGGER_ENDINGS`           | 49    | Endgame                    |
| `FEED_CAT`                  | 5     | Structure Shop (F.O.D.)    |
| `PLAY_WITH_CAT`             | 5     | Structure Shop (F.O.D.)    |
| `PET_CAT`                   | 5     | Structure Shop (F.O.D.)    |
| `BRIBE_AUDITOR`             | -     | Context: Audit Event       |
| `SUBMIT_FAKE_LOGS`          | -     | Context: Audit Event       |
| `EAT_VOID_BURGER`           | -     | Canteen                    |
| `LISTEN_TO_WALLS`           | -     | General                    |
| `SACRIFICE_TOOL`            | -     | Toolroom (Requires Tool)   |
| `TALK_TO_SUITS`             | -     | Canteen / Special          |
| `INSPECT_SHADOWS`           | -     | General                    |
| `CHECK_FOR_BUGS`            | -     | Maintenance / Office       |
| `CLEAR_CACHE`               | -     | Terminal / Digital         |
| `BRIBE_SYSADMIN`            | -     | Terminal / Digital         |
| `APPEAL_VIOLATION`          | -     | Digital (Access Violation) |
| `FORCE_OVERRIDE`            | -     | Digital (High Sanity Cost) |
| `ACCEPT_REEDUCATION`        | -     | Digital (Reset Violations) |

---

## 8. Special Systems

### Automation

As you progress, the machine begins to run itself. You can delegate tasks, but they come with risks.

- **Night Crew Delegation** (Level 6+):
  - **Generates**: `Alclad`, `Rivets`.
  - **Cost**: Slowly increases **Suspicion**.
  - **Modifier**: `Night Shift Supervisor` skill reduces Suspicion gain.
- **Transit Check Delegation**:
  - **Generates**: `Credits`, `Experience`.
  - **Cost**: Small **Suspicion** increase.
- **Auto-SRF Filing**:
  - **Generates**: `Credits`, `Experience`.
  - **Risk**: Low chance of triggering an Audit (`AUDIT_INTERNAL`).

### Pet System (F.O.D.)

A cat that nests in the Structure Shop. It is not entirely naturally occurring.

- **Stats**:
  - **Trust**: Increased by feeding and playing.
  - **Hunger**: Must be managed.
- **Interactions**:
  - **Feed**: Requires `Canned Tuna`. Reduces Hunger, greatly increases Trust.
  - **Play**: Requires `Laser Pointer`. Increases Trust.
  - **Pet**: Small Trust increase. Risk of biting (Love bite?).

### The Janitor

An entity that appears randomly in the facility.

- **Trigger**: Random chance per tick.
- **Cooldown**: 10 minutes between appearances.
- **Nature**: He is always cleaning something that isn't dirty. He has always been here.
