# THE HANGAR - COMPLETE LEVEL PROGRESSION SYSTEM

## CORE PHILOSOPHY

- **Level 1 = Tutorial Prison** - Player trapped in HR Floor with ONLY onboarding
- **Each level unlocks ONE new location** with phased feature rollouts
- **Actions unlock progressively within each tab** based on sub-levels
- Maintains Lovecraftian aviation horror + bureaucratic dread narrative

---

## LEVEL 1: "THE CONTRACT" (0-200 XP)

**ONLY AVAILABLE TAB:** HR Floor

### Starting Narrative

```
You wake up in a white room on Floor 3. A CRT monitor glows sickly green.
The fluorescent lights hum at 60Hz—you can feel it in your molars. You don't
remember applying for this job. You don't remember getting here. But there's
paperwork on the desk with your name on it. Employee ID: 770-M-9M-MRO.

The door is locked from the outside.
```

### Available Actions (HR Floor - Onboarding Section ONLY):

1. **"Accept Job Offer"** (One-time, 50 XP, -0 Sanity)

   ```
   FLAVOR: A dot-matrix printer somewhere in the walls coughs out a contract.
   The paper is warm. It smells faintly of copper and ozone. Your job title:
   "Line Maintenance Technician - Night Differential." Starting wage: $18.50/hr.
   The benefits section is entirely redacted except for one line: "Survivor's
   Death Benefit: $0.00."

   LOG: "CONTRACT ACCEPTED. PERSONNEL FILE 770-M-9M-MRO CREATED.
         WELCOME TO [REDACTED] AEROSPACE MAINTENANCE OPERATIONS."
   ```

2. **"Read and Sign NDA"** (One-time, unlocks after #1, 100 XP, -5 Sanity)

   ```
   FLAVOR: 47 pages. The first three are standard—intellectual property, trade
   secrets, blah blah. Page 12 mentions "containment protocols for non-biological
   cargo." Page 23 has a diagram of a human nervous system with certain nodes
   circled and labeled "ANCHOR POINTS." Page 31 discusses "scheduled memory
   suppression therapy" as a benefit. You sign it. The pen is heavier than it
   should be. The ink is darker than black.

   LOG: "FORM NDA-770-HANGAR-03 EXECUTED. YOU ARE BOUND BY CORPORATE SILENCE.
         DISCLOSURE IS TERMINATION. TERMINATION IS PERMANENT."
   ```

3. **"View Personal ID"** (Unlocks after #2, 50 XP, triggers LEVEL 2)

   ```
   FLAVOR: The badge printer whirs. A laminated card slides out. Your face
   stares back at you from the photo, but something is wrong. Your eyes are
   too dark—not the irises, the whites. Your smile is too wide, showing one
   too many teeth. The magnetic strip on the back is warm to the touch. The
   card weighs exactly 37 grams. You know this without weighing it.

   LEVEL UP LOG: "[LEVEL 2] CLEARANCE UPDATED. TARMAC ACCESS GRANTED.
                  Report to Apron/Line Operations for shift briefing.
                  The night is waiting. The planes are watching."

   UNLOCK: Apron/Line tab appears in header
   ```

### Progression

- Player MUST complete all 3 actions in order
- Each action disappears after use
- Total XP gained: 200 (enough to hit Level 2)
- After Level 2: HR Floor shows full interface BUT most actions are locked with "INSUFFICIENT CLEARANCE LEVEL" until Level 10+

---

## LEVEL 2: "FIRST STEPS" (200-500 XP)

**NEW TAB UNLOCKED:** Apron/Line

### Opening Narrative (when first clicking Apron tab)

```
The elevator to ground level descends for 37 seconds. That's too long for three
floors. When the doors open, you're hit with the smell: jet fuel, hydraulic fluid,
ozone, and something organic that shouldn't be here. The sodium lamps turn everything
the color of dried blood. It's your orientation week. If they will satify you will be assigned to a department. Three aircraft sit on the apron: an MD-80 with engine
cowlings open like a scream, a 737-400 with all its cabin lights on (but it's dark
inside), and an A330 that wasn't there a second ago.

One of them is humming. None of them should be.
```

### Available Actions (Apron/Line - Basic Operations ONLY):

**General Ramp Actions Section:**

- **"Get Next Assignment"** - Triggers aircraft task system (core loop)
- **"Listen to Radio"** (0 Focus) - Atmospheric flavor + rare clues
  ```
  NORMAL: "Ground, United 451 ready for pushback, spot 14."
  WEIRD 5%: "RADIO: '...cargo is singing... it knows your name...
             disconnect the APU before it learns to speak...'" [STATIC]
  ```
- **"Apron FOD Sweep"** (5 Focus) - Small XP, finds rivets/alclad, rare items

**Locked Actions at Level 2:**

- Smoke Cigarette (Requires Level 10 + Ford F-150 owned)
- Scavenge Galleys (Requires Level 4)
- Service Lavatory (Requires Level 3)
- All Corrosion Corner actions (Requires Level 22)

### Aircraft Task System (NOW ACTIVE):

When player clicks "Get Next Assignment":

```
FLAVOR: The line lead appears. You don't remember seeing him walk up. He's
been here the whole time, hasn't he? He hands you a clipboard without speaking.
His eyes are the color of tarmac in the rain. He smells like burnt coffee and
formaldehyde.

"Transit check on the MD-80, Bay 3," he says. His voice is too flat. "Just a
walkaround. Sign it off before sunrise. Don't look in the cargo hold."

He walks away. You didn't see which direction.
```

**Available at Level 2:**

- Transit checks (12 Focus) - Low XP, low complexity
- Read Flight Log (5 Focus) - Story bits
- Read Cabin Log (5 Focus, non-cargo only) - Story bits

**Locked:**

- Daily Check (Requires Level 14 and A&P License or EASA A License )
- ETOPS Check (Requires Level 60 and A&P License or EASA B1.1 License)

---

## LEVEL 3: "TOOLS OF THE TRADE" (500-1,118 XP)

**NEW TAB UNLOCKED:** Toolroom

### Opening Narrative

```
The Toolroom is behind a cage. The Master sits on a stool behind the wire mesh,
smoking a cigarette even though smoking has been banned since 2008. He doesn't
age. You know this without knowing how you know it. His eyes follow you before
you enter. The walls are lined with shadow boards—every tool has a shape, every
shape has a tool. Except for three empty shapes that don't match any tool you
recognize. One is vaguely octagonal. One has too many sides to count. One makes
your eyes water if you look at it directly.

"Checkout sheet," he says, not looking up. "You break it, you bought it. You
lose it, it finds you."
```

### Available Actions (Toolroom):

**Precision Tool Crib:**

- Check out basic tools: Torquemeter, Snapon Wrench Set, Torx Screwdriver
- **[CRITICAL UNLOCK]** Can now PURCHASE Rivet Gun (saves up 8x generation multiplier)

**Consumables Bin:**

- Dispense rivets, hiloks, grommets (now have source)

**Owned Tool Maintenance:**

- Repair Tool (30 Alclad) - Restore condition
- Calibrate Tool (40 Credits) - Minigame for precision tools

**Locked:**

- "Talk to Master about Old Days" (Requires Level 6 + Master not pissed)
- Hazardous section (Paint mixing, sonic cleaning) - Requires Level 7

**New Apron Actions:**

- **"Smoke Cigarette"** (Level 3 + F-150) - +5 Focus, +5 Sanity, 120s cooldown
  ```
  FLAVOR: You retreat to your F-150, parked at the edge of the tarmac where the
  sodium lights don't reach. First drag sharp and calming. You watch the hangar
  from here—Bay 4's lights flicker in patterns. Three long, two short. Three long,
  two short. SOS in Morse. But nobody's in there. You checked.
  ```

---

## LEVEL 4: "THE HANGAR CALLS" (1,118-2,236 XP)

**NEW TAB UNLOCKED:** Hangar

### Opening Narrative

```
Hangar Bay 4 is vast enough to swallow sound. The MD-80 in the center is
technically decommissioned—red-tagged six months ago after the "incident." But
you can hear the APU cycling. You can see the cabin lights glowing through the
windows. The aircraft registration: N770MR. Your employee number.

The radio on the workbench crackles to life:
"Maintenance, this is... [STATIC] ...we're showing a fault on the... [STATIC]
...it's not supposed to be breathing..."

The transmission cuts off. The frequency was 121.5—the emergency band. But
there are no aircraft in distress. There haven't been for three days.
```

### Available Actions (Hangar):

**Job Card System NOW SPAWNS:**

- Riveting jobs appear with requirements
- Timed completion (2-6 minutes)
- Rewards: XP + Credits

**Basic Hangar Actions:**

- "Listen to Radio" - More disturbing frequencies
- "Apron FOD Sweep" (hangar version)

**Investigation Section (NEW):**

- "Listen to the Fuselage" (20 Sanity) - Hear whispers
- "Check Redacted Log Entries" (30 Focus) - Lore hunt

**Locked:**

- NDT Scans (Requires Level 8 + equipment)
- Anomaly Analysis (Requires Level 10)
- SLS-3 Access (Requires Level 15 + discovery event)

**New Apron Actions:**

- "Daily Check" task type now available (25 Focus)
- "Small Talk (Cabin Crew)" - They've seen things

---

## LEVEL 5: "PAPERWORK HELL" (2,236-4,000 XP)

**NEW TAB UNLOCKED:** Office

### Opening Narrative

```
Your "office" is a repurposed storage closet on the second floor. The walls
are cinder block, painted industrial beige in 1987 and never updated. A folding
table. A rolling chair with one wheel that doesn't turn. A Windows XP machine
that takes 4 minutes to boot and clicks like insect legs when the hard drive
seeks.

The PC has 47 unread emails. The oldest is from 2003, subject: "Re: Re: Re:
URGENT - Asset Containment Failure - DO NOT OPEN." The sender's address:
770-M-9M-MRO@[REDACTED].aero. Your address. But you've only worked here for
three days.

You open it anyway.
```

### Available Actions (Office):

**Archive Cabinets:**

- "Search Manuals" (5 Focus) - Find PC parts, lore, XP
- "Create SRF Form" (10 Focus) - Main paperwork income

**Zebra MC9300 Terminal:**

- "Access Maintenance Logs" - Opens Maintenance Terminal modal

**PC Assembly Quest:**

- Need 4 parts (Mainboard, GPU, CD-ROM, Floppy) from Search Manuals
- Once assembled: Unlock digital features

**Locked Office Actions:**

- "Alter Documents" (Requires Level 12)
- "Destroy Documents" (Requires Level 12)
- "Cross-Reference Manifests" (Requires Level 15 + A&P License)
- "Maintain Low Profile" (Requires Level 10)
- All Automation/Delegation (Requires Level 18 + A&P License)

**New Apron Actions:**

- "Scavenge Galleys" (5 Focus) - Credits, High Suspicion risk
- "Service Lavatory" (15 Focus) - Disgusting, sometimes find items
- "ETOPS Check" task type (40 Focus) - High XP

---

## LEVEL 6: "BENEATH THE SURFACE" (4,000-6,708 XP)

**NEW TAB UNLOCKED:** Canteen

### Canteen Opening

```
The canteen is in the basement, past the boiler room. The vending machines
are from 1987. The coffee maker gurgles continuously even when empty. There
are 47 seats. Only one has dust on it. Yours. The others look recently used,
but you're the only one on night shift. You're sure of it. Mostly sure.

The TV in the corner is always on, tuned to a weather channel for a city that
doesn't exist. The forecast is always the same: "Localized reality storms.
Seek shelter in approved anchor points."
```

### New Features Across Tabs:

**Hangar:**

- Can now talk to Janitor (when he appears)
- More investigation actions

**Toolroom:**

- Master will now share lore (if not pissed)

**Apron:**

- "Observe Sedan" action - Track the watchers

---

## LEVEL 8: "NON-DESTRUCTIVE TESTING" (8,000-12,000 XP)

**NO NEW TAB - Feature Expansion**

### Hangar Unlocks:

**NDT Section Activated:**

- "NDT Ultrasonic Scan" (20 Focus)
- "Perform HFEC Scan" (25 Focus, needs HFEC Device from Toolroom)
- "Perform Borescope Inspection" (30 Focus)

**Finding System:**

- NDT reveals defects (minor/major/suspicious)
- Must file Non-Routine Report to clear finding
- Suspicious findings = sanity loss + potential audit

**Apron - Corrosion Corner:**

- "Observe from Corrosion Corner" (10 Focus)
- "Scavenge Old Airframes" (40 Focus) - Untraceable rotables, HIGH RISK

---

## LEVEL 10: "THE BACKSHOPS" (12,000-20,000 XP)

**NEW TAB UNLOCKED:** Backshops

### Opening Narrative

```
The elevator to the backshops descends for 90 seconds. The button says "B1"
but you know you're going deeper. The doors open to cold air—65°F in the
middle of summer. The component overhaul bays line concrete walls. Fluorescent
lights flicker in sequence, left to right, then back again, like something
is walking down the corridor.

Bay 7 is yours. On the bench: a component you don't recognize. It's not on
any parts catalog. The P/N is hand-etched: "KRDX-770-00." It's warm. And if
you stay very still and hold your breath, you can see it breathing.
```

### Available Actions (Backshops):

- Component Overhaul (high XP, suspicion risk)
- X-Ray Welds (discover impossible things)
- Deconstruct FDR (learn forbidden flight paths)
- Clean Contaminated ULD (bio-hazard encounters)

### HR Floor MAJOR UNLOCK:

**Full Compliance Section Now Active:**

- "Performance Review" (every 10 minutes)
- "Give Urine Sample" (biometric screening)
- "Forge Sample" (750 credits, high risk)
- "Report Anomalous Event" (sanity trade for temporary safety)
- "Report Mundane" (low-risk bureaucracy)
- "Review Compliance" (find loopholes)

**Hangar:**

- "Analyze Anomaly" now available (if anomalies found)

---

## LEVEL 12: "THE PAPER TRAIL" (20,000-30,000 XP)

**NO NEW TAB - Office Escalation**

### Office Unlocks:

**High-Risk Document Actions:**

- **"Alter Documents"** (30 Focus) - Falsify logs, high suspicion
- **"Destroy Documents"** (20 Focus) - Shred evidence, might find Kardex fragments
- **"Maintain Low Profile"** (40 Focus) - Active suspicion management
- "Deep Clean Server Vents" - Find surveillance devices
- "Review Surveillance Logs" (50 Focus) - See the Suits on tape

**Narrative Escalation:**

```
You find an internal memo dated two weeks from now. Subject: "Re: Employee
770-M-9M-MRO - Scheduled Termination." The body is redacted except for one
line: "Knows too much. Anchor risk. Recommend immediate neural wipe or
permanent retirement."

You don't remember reading this. But you remember what you need to do.
```

---

## LEVEL 15: "THE PASSENGERS" (30,000-50,000 XP)

**NEW TAB UNLOCKED:** Terminal (Passenger Side)

### Opening Narrative

```
You're not supposed to be terminal-side. Line maintenance doesn't have
airside access. But your badge works. It shouldn't. The terminal is empty
at 3:47 AM. Except it's not. Gate B12 shows "INDEFINITELY DELAYED" to
Kuala Lumpur, flight 9M-MRO. The gate is dark. The jet bridge is extended,
but there's no plane attached. You can hear footsteps inside the bridge.
Slow. Methodical. Coming closer.

You don't run. You don't know why.
```

### Terminal Actions:

- Wander Terminal (atmospheric exploration)
- Use Payphone (receive impossible calls)
- Check Departure Boards (destinations that don't exist)
- Observe Passengers (some aren't human)
- Talk to Old Pilot (lore about "The Routes")
- Investigate Gate B12 (the Kuala Lumpur mystery)

**Office:**

- **"Cross-Reference Manifests"** NOW AVAILABLE (requires A&P License)
  - Gain Kardex Fragments
  - Extreme suspicion risk
  - Reveals coordinates to SLS-3

---

## LEVEL 18: "AUTOMATION" (50,000-75,000 XP)

**NO NEW TAB - Office Final Unlocks**

### Office - Automation Control Section:

(Requires A&P License earned via Training tab)

- **"Toggle Night Crew"** - Passive resource generation, high risk
- **"Toggle Transit Check Delegation"** - Passive CR/XP, moderate risk
- **"Toggle Auto-SRF"** - Automated paperwork, suspicion creep

**Narrative:**

```
You're not doing the work anymore. The work is doing itself. You file reports
for aircraft you've never seen. You sign off on repairs you didn't perform.
The night crew clocks in, but you never see them. You hear them in the hangar—
tools clanging, radio chatter, the whine of a rivet gun. But when you check,
Bay 4 is empty. The aircraft they're working on isn't there.

It's somewhere else. Somewhere the routes go.
```

---

## LEVEL 20: "CERTIFICATION" (75,000-100,000 XP)

**NEW TAB UNLOCKED:** Training Department

### Opening Narrative

```
Floor 2. The stairs only go up. The training room has 12 desks, 11 covered
in fresh dust. Yours is clean. The whiteboard has an equation that makes
your eyes water:

Reality Coefficient = (Sanity × Anchor Points) / (Void Pressure × Time)

Underneath, in chalk that looks wet: "When R < 1, termination is mandatory."

You don't remember learning this. But you've always known it.
```

### Training Actions:

- Take EASA Module Exams (unlock skills)
- Study Type Ratings (737, A330 specialization)
- Attend Safety Briefings (sanity recovery, lore)
- Review Incident Reports (learn how previous techs died)

**HR Floor COMPLETE UNLOCK:**
All actions now available including:

- Request Unpaid Leave (expensive sanity recovery)
- All reporting mechanisms
- Full biometric compliance

---

## LEVEL 25: "THE TRUTH" (100,000+ XP)

**FINAL UNLOCK:** SLS-3 Access

### Hangar - Sub-Level Discovery:

After finding coordinates via Cross-Reference Manifests + specific story triggers:

```
DISCOVERY EVENT: While hiding in Corrosion Corner, you notice a section of
concrete that doesn't match. A heavy steel plate with a recessed handle,
almost invisible under decades of grime and streaked oil. Stenciled in
faded yellow: "SLS-3 - AUTHORIZED PERSONNEL ONLY - KARDEX PROTOCOL."

Your badge glows faintly near the reader. It shouldn't work. It does.
```

### SLS-3 Actions:

- **"Descend into SLS-3"** (25 Focus+Sanity) - Extreme risk
  - Scavenge untraceable components
  - Find KARDEX files (full truth reveal)
  - Encounter The Suits (final confrontation)

### THE FINAL TRUTH:

```
The lowest level. The air tastes like the inside of a star. Rows of components
that violate physics. A cargo manifest dated March 8, 2014, flight MH370. A
black box that whispers your name before you touch it.

And in the center: Aircraft fuselage section, no registration, no doors, no
windows. Just smooth aluminum skin. It's warm. It's breathing. And carved into
the metal in letters three feet tall:

"THEY FLY THE ROUTES BETWEEN WORLDS. WE KEEP THEM GROUNDED. YOU ARE THE ANCHOR.
IF YOU FAIL, REALITY FAILS WITH YOU."

Underneath, in smaller text: "Previous Anchor: 770-M-9M-MRO. Terminated: [TODAY'S DATE]."

You look at your badge. 770-M-9M-MRO. That's you. That was also them. Will be
someone else. The number doesn't change. The technician is replaceable. The
anchor point is not.

You hear footsteps behind you. Slow. Methodical. The Suits have found you.

You don't run. There's nowhere to go. There never was.

[GAME COMPLETE - ENDING: "THE ANCHOR HOLDS"]
```

---

## PROGRESSION TIMELINE:

- **Level 1→2:** 5 minutes (tutorial escape)
- **Level 2→4:** 30-45 mins (learn loops)
- **Level 4→8:** 2-3 hours (mid-game grind)
- **Level 8→15:** 5-7 hours (deep systems)
- **Level 15→25:** 10-15 hours (endgame)

**Total to "Truth": 20-25 hours of gameplay**

---
