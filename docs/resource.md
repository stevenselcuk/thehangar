# Resource Systems and Mechanics in The Hangar

## Executive Summary

This comprehensive report analyzes the resource management systems in **The Hangar**, a browser-based incremental horror RPG that combines aviation maintenance simulation with Lovecraftian themes. The game features four primary resources—Focus, Sanity, Suspicion, and Credits—that must be carefully balanced to progress through 50 levels while maintaining productivity and psychological stability in an increasingly hostile workplace environment.

## Introduction

The Hangar is an innovative game that merges corporate aviation maintenance operations with cosmic horror elements[cite:28]. Players assume the role of a probationary Aircraft Maintenance Technician (AMT) working graveyard shifts at a remote aerospace facility. The resource system serves as the core mechanical framework that drives gameplay progression, creates strategic tension, and reinforces the narrative themes of workplace stress, regulatory scrutiny, and psychological deterioration.

## Core Resource System

### Overview of Resource Categories

The game revolves around managing four interconnected primary resources, each representing different aspects of the player's operational capacity and survival[cite:28]:

\begin{itemize}
\item \textbf{Focus} - Mental capacity for technical work and concentration
\item \textbf{Sanity} - Grip on reality and resistance to cosmic horror
\item \textbf{Suspicion} - Regulatory scrutiny and compliance violations
\item \textbf{Credits} - Currency for purchasing tools, training, and supplies
\end{itemize}

These resources create a dynamic balancing act where actions that benefit one resource often negatively impact others, forcing players to make meaningful strategic choices throughout the game.

### Focus Resource (0-100)

#### Definition and Purpose

Focus represents the player's mental capacity for performing technical maintenance work, problem-solving, and sustained concentration[cite:28]. It functions as the primary action currency, consumed by nearly all player actions.

#### Consumption Patterns

Focus consumption varies significantly based on action complexity:

\begin{table}
\begin{tabular}{|l|c|}
\hline
\textbf{Action Type} & \textbf{Focus Cost} \\
\hline
Basic actions (inspect, rummage) & 5-15 Focus \\
Maintenance actions (install rivets) & 15-50 Focus \\
Administrative tasks (file SRF) & 10-40 Focus \\
Research activities (KARDEX review) & 25-60 Focus \\
Complex repairs & 25-50 Focus \\
Training/certification & 40-60 Focus \\
\hline
\end{tabular}
\caption{Focus consumption by action category}
\end{table}

#### Regeneration Mechanics

Focus regenerates through multiple mechanisms[cite:28]:

**Base Regeneration Rate**: +2 Focus per tick (15 FPS = approximately 0.13 Focus/second)

**Boosted Regeneration Sources**:
\begin{itemize}
\item Coffee consumption: Temporary boost
\item Rest actions in Canteen: Immediate restoration
\item Low stress environments: Enhanced passive regeneration
\end{itemize}

**Reduced Regeneration Conditions**:
\begin{itemize}
\item Active delegation to Night Crew: Reduces passive regeneration
\item High Suspicion levels: Stress inhibits recovery
\item Environmental hazards in Backshops: Continuous drain
\end{itemize}

#### Critical Threshold Effects

When Focus drops below 30, players become vulnerable to action failures and workplace accidents[cite:28]. This creates a risk-reward dynamic where pushing through fatigue can lead to catastrophic consequences including:

- Failed maintenance checks resulting in Suspicion increases
- Tool damage requiring expensive repairs
- Audit triggering events
- Lost experience points from failed actions

### Sanity Resource (0-100)

#### Definition and Role

Sanity measures the player's grip on consensus reality, mental stability, and resistance to cosmic horror elements that increasingly pervade the workplace[cite:28]. Unlike Focus, which replenishes relatively quickly, Sanity is much harder to restore, making it a precious long-term resource.

#### Drain Sources and Magnitudes

Sanity drains through various encounters and actions:

\begin{table}
\begin{tabular}{|l|c|}
\hline
\textbf{Event/Action} & \textbf{Sanity Loss} \\
\hline
Witnessing minor anomalies & -5 to -10 \\
Witnessing major anomalies & -15 to -25 \\
Reading forbidden documents & -10 to -20 \\
Interacting with The Suits & -25 to -50 \\
Performance reviews with HR & -20 \\
Backshops passive drain & -1 per tick \\
Eldritch manifestation events & -30 to -60 \\
\hline
\end{tabular}
\caption{Sanity drain sources by severity}
\end{table}

#### Restoration Methods

Sanity restoration options are limited and strategic[cite:28]:

**Primary Restoration**:

- Petting F.O.D. (the hangar cat): +5 to +15 Sanity
- Eating normal food: +5 to +10 Sanity
- Taking breaks in Canteen: +10 Sanity
- Talking to The Regular: +10 or -10 Sanity (random outcome)

**High Trust F.O.D. Benefits** (when Trust > 75):

- F.O.D. provides warnings about approaching Suits, reducing Sanity drain by 25%
- Passive Sanity regeneration (+5 per tick) when F.O.D. sits on player's lap during breaks

#### Failure State

Sanity reaching 0 triggers the **Madness Ending**, one of three possible game conclusions[cite:28]. In this ending, the player stops resisting the psychological corruption of the facility and becomes integrated into the machinery itself, representing complete psychological breakdown.

### Suspicion Resource (0-100)

#### Definition and Function

Suspicion represents regulatory scrutiny, audit risk, compliance violations, and attention from aviation authorities and more sinister entities[cite:28]. It functions as the game's primary failure state mechanism for procedural violations rather than psychological collapse.

#### Sources of Suspicion Increase

Suspicion accumulates through various questionable or non-compliant actions:

\begin{table}
\begin{tabular}{|l|c|}
\hline
\textbf{Action} & \textbf{Suspicion Increase} \\
\hline
Using untraceable parts & +10 to +15 \\
Automation/delegation & +1 to +5 per action \\
Accessing restricted files & +5 to +20 \\
Failed audits & +15 to +30 \\
Backshops work (passive) & +1 per tick \\
Black market transactions & +15 to +25 \\
Tool calibration failures & +5 \\
\hline
\end{tabular}
\caption{Suspicion accumulation sources}
\end{table}

#### Reduction Mechanisms

Reducing Suspicion requires deliberate compliance actions[cite:28]:

- Successful compliance actions: -5 to -10 Suspicion
- Bribing auditors: -20 Suspicion (risky, costs 100-200 Credits)
- Performance reviews: -10 Suspicion (costs 20 Sanity)
- Re-education programs: -50 Suspicion (costs XP and temporarily resets progress)

#### Failure State

Suspicion reaching 100 triggers **Termination**, resulting in Game Over[cite:28]. This represents being permanently removed from the facility by regulatory authorities or the facility's internal security, ending the game run.

### Credits (Currency)

#### Definition and Economic Role

Credits represent monetary compensation for completed work and serve as the universal currency for purchasing tools, training, consumables, and occasionally bribes[cite:28].

#### Income Sources

Players earn Credits through various maintenance activities:

\begin{table}
\begin{tabular}{|l|c|}
\hline
\textbf{Activity} & \textbf{Credit Reward} \\
\hline
Completed transit checks & 50-150 Credits \\
Daily inspections & 100-300 Credits \\
Job card completion & 75-500 Credits \\
ETOPS checks & 300-500 Credits \\
AOG deployments & 500-800 Credits \\
Delegation passive income & 25-100 Credits/tick \\
Found money (Lost \& Found) & 5-20 Credits \\
\hline
\end{tabular}
\caption{Credit income sources}
\end{table}

#### Expenditure Categories

Credits must be strategically allocated across multiple essential categories[cite:28]:

**Tools and Equipment** (15-400 Credits):
\begin{itemize}
\item Basic hand tools: 15-50 Credits
\item Laser pointer: 25 Credits
\item Rivet gun: 150 Credits
\item HFEC scanner: 300 Credits
\item IR lamp: 400 Credits
\end{itemize}

**Consumables** (5-75 Credits):
\begin{itemize}
\item Canned tuna (for F.O.D.): 5 Credits
\item Coffee: 10 Credits
\item Earmuffs: 75 Credits
\end{itemize}

**Training and Development** (50-150 Credits per module):

- Skill certifications
- Specialization courses
- Advanced training modules

**Operational Expenses**:
\begin{itemize}
\item Bribes to auditors: 100-200 Credits
\item Food and breaks: 5-15 Credits
\item Payphone calls (lore access): 5 Credits
\end{itemize}

## Secondary Resource Systems

### Experience Points (XP) and Leveling

#### XP Requirements

The leveling system uses an escalating XP requirement formula[cite:28]:

**Formula**: `500 × (currentLevel + 1)` XP required for next level

**Example Progression**:
\begin{itemize}
\item Level 0 → 1: 500 XP
\item Level 1 → 2: 1,000 XP
\item Level 10 → 11: 5,500 XP
\item Level 25 → 26: 13,000 XP
\item Level 48 → 49: 24,500 XP
\end{itemize}

Total XP required to reach Level 49: Approximately 612,500 XP

#### XP Sources

Experience is earned through various gameplay activities[cite:28]:

\begin{table}
\begin{tabular}{|l|c|}
\hline
\textbf{Activity} & \textbf{XP Reward} \\
\hline
Basic actions & 50-200 XP \\
Maintenance actions & 200-500 XP \\
Complex repairs & 400-1,000 XP \\
Resolving events & 100-800 XP \\
First-time discoveries & 200-500 XP \\
Successful audits & 300 XP \\
Training certifications & 500-1,000 XP \\
AOG deployments & 1,200 XP \\
\hline
\end{tabular}
\caption{Experience point rewards by activity}
\end{table}

#### Milestone Unlocks

Leveling gates access to critical game features, locations, and narrative content[cite:28]:

**Early Game Milestones**:

- Level 1: Toolroom access, basic tool checkout
- Level 2: Apron Line access, Lost & Found
- Level 3: Office access, internal mail system, SRF filing
- Level 6: Night shift eligibility, delegation unlocked

**Mid Game Milestones**:

- Level 10: HR Floor access, Corrosion Corner scavenging
- Level 15: Backshops authorization, anomaly analysis capabilities
- Level 20: Surveillance log access, pattern recognition features

**Late Game Milestones**:

- Level 28: KARDEX system access (historical archives)
- Level 35: Black market discovery and access
- Level 49: Truth Reveal phase, ending selection available

### Rare Resources

In addition to the four primary resources, three rare collectible resources are essential for late-game progression[cite:28]:

#### Bio-Filament

**Source**: Obtained from Deep Clean Vents action  
**Rarity**: Common  
**Purpose**: Required for certain late-game crafting and technology upgrades  
**Target Collection**: 10+ units recommended for endgame preparation

#### Crystalline Resonators

**Source**: Scavenging Corrosion Corner (high Suspicion risk)  
**Rarity**: Uncommon  
**Purpose**: Advanced component repairs and modifications  
**Target Collection**: 10+ units recommended for endgame preparation

#### KARDEX Fragments

**Source**: Cross-Reference KARDEX action (Level 28+ required)  
**Rarity**: Rare  
**Purpose**: Historical context unlocks, can be sacrificed for 500 XP each  
**Target Collection**: 10+ units recommended for endgame preparation  
**Special Use**: Collecting 10+ fragments unlocks "Historical Context" perk

## Action System and Resource Interaction

### Action Categories

The game features six primary action categories, each with distinct resource costs and gameplay purposes[cite:28].

#### Basic Actions (5-25 Focus)

Low-cost, high-frequency actions for maintaining stability:

- Inspect Vending Machine
- Rummage Lost & Found
- Pet F.O.D.
- Check Delayed Gate
- Listen to Walls

#### Maintenance Actions (15-50 Focus + Tools)

Core technical work requiring proper equipment:

- Marshal Aircraft (requires high-vis vest)
- Install Rivets (requires rivet gun, 25 Focus) - **8x efficiency multiplier**
- Deep Clean Vents (15 Focus, yields bio-filament)
- NDT Inspection (requires HFEC scanner, 30 Focus)

#### Administrative Actions (10-40 Focus)

Paperwork and compliance activities:

- Create SRF (Service Request Form)
- Check Internal Mail
- Print Forbidden Page (requires assembled PC)
- File Compliance Report

#### Interaction Actions (Variable Focus/Sanity)

Social encounters and NPC engagement:

- Talk to Regular (random outcome: clue, warning, or rambling)
- Feed F.O.D. (requires canned tuna, restores Sanity)
- Use Payphone (5 Credits, reveals lore)
- Talk to Suits (extremely risky, -15 to -50 Sanity)

#### Research Actions (25-60 Focus, High XP)

Knowledge acquisition and discovery:

- Cross-Reference KARDEX (yields KARDEX fragments)
- Consult Legacy Archives (1970s database access)
- Review Surveillance Logs (reveals facility patterns)
- Decrypt AMM (requires assembled PC)

#### Risky Actions (High Cost, High Reward/Penalty)

High-stakes decisions with significant consequences:

- Scavenge Corrosion Corner (10 Focus, +40 Suspicion, yields untraceable rotables)
- Bribe Auditor (100 Credits, -20 Suspicion or +10 Suspicion if caught)
- Force System Override (50 Focus, -20 Sanity, massive Suspicion if failed)
- Sacrifice Tool (requires wrench, random Sanity outcome)

### Resource Trade-offs

The action system creates strategic tension through competing resource demands[cite:28]. Key trade-offs include:

**Automation vs. Suspicion**: Delegating work to Night Crew generates passive Credits (25-100/tick) and XP (10-50/tick) but increases Suspicion by 1-3 per tick and reduces Focus regeneration.

**Sanity vs. Progress**: Accessing forbidden knowledge, working in Backshops, and engaging with anomalous entities costs significant Sanity but provides critical XP, rare resources, and narrative progression.

**Credits vs. Compliance**: Bribing auditors costs 100-200 Credits with uncertain outcomes—success reduces Suspicion by 20, but failure increases it by 10.

**Focus vs. Efficiency**: Using precision tools like the rivet gun multiplies work efficiency by 8x but requires significant upfront Credit investment (150 Credits).

## Job System and Aircraft Maintenance

### Aircraft Types and Complexity

The game simulates maintenance on four categories of commercial aircraft[cite:28]:

**Narrow-body Aircraft**: A320, B737

- Frequency: Common
- Complexity: Low to Medium
- Rewards: 50-200 Credits, 200-400 XP

**Wide-body Aircraft**: A330, B777

- Frequency: Rare
- Complexity: Medium to High
- Rewards: 200-500 Credits, 600-1,000 XP

**Regional Aircraft**: CRJ, ERJ

- Frequency: Common
- Complexity: Low
- Rewards: 50-150 Credits, 150-300 XP
- Special: Quick turnaround, ideal for rapid XP farming

**Freighters**: B747-F, B767-F

- Frequency: Uncommon
- Complexity: High
- Rewards: 300-800 Credits, 800-1,200 XP
- Special: Night operations, increased anomaly risk

### Maintenance Check Types

#### Transit Check

**Duration**: 15 minutes (in-game time)  
**Rewards**: 50-100 Credits, 200 XP  
**Requirements**: Basic tools, 15 Focus  
**Description**: Visual inspection, fluid level verification, minor discrepancies only[cite:28]  
**Stress Level**: Low, routine

#### Daily Inspection

**Duration**: 30 minutes  
**Rewards**: 100-200 Credits, 400 XP  
**Requirements**: Complete toolset, 25 Focus  
**Description**: Detailed walkaround, logbook review, minor repairs authorized[cite:28]  
**Special**: May discover anomalies triggering narrative events

#### ETOPS Check (Extended Operations)

**Duration**: 60 minutes  
**Rewards**: 300-500 Credits, 800 XP  
**Requirements**: Specialty tools, 40 Focus  
**Description**: Critical systems verification for twin-engine extended range operations[cite:28]  
**Risk**: High Suspicion penalty if failed (engine run required)

#### AOG (Aircraft on Ground)

**Duration**: 90 minutes  
**Rewards**: 500-800 Credits, 1,200 XP  
**Requirements**: Advanced tools, 50 Focus, Level 15+  
**Description**: Emergency deployment to remote station, high time pressure[cite:28]  
**Risk**: Elevated anomaly encounter probability, high stress

## Event System

### Event Categories

The event system introduces 10 distinct categories of random encounters that disrupt routine operations and create narrative texture[cite:28]:

#### Story Events (Level 0+)

**Mechanical Impact**: Low  
**Purpose**: World-building and atmospheric flavor  
**Example**: "Safety Wire Ghost" - Phantom technician re-does player's work overnight

#### Incident Events (Level 2+)

**Mechanical Impact**: Medium  
**Purpose**: Minor mishaps requiring immediate response  
**Example**: "FOD on Ramp" - Foreign Object Debris cleanup required, 10 Focus cost

#### Accident Events (Level 3+)

**Mechanical Impact**: High  
**Purpose**: Serious failures with lasting consequences  
**Example**: "Skydrol Leak" - Hazmat response, continuous Sanity drain, 50 Credits cleanup cost

#### Audit Events (Level 5+)

**Mechanical Impact**: High (Suspicion)  
**Purpose**: Regulatory compliance testing  
**Example**: "Tool Calibration Audit" - Must prove torquemeter accuracy or gain +30 Suspicion

#### Canteen Incident (Level 5+)

**Mechanical Impact**: Variable (Sanity)  
**Purpose**: Social encounters and lore reveals  
**Example**: "Vending Machine Prophecy" - Machine displays tomorrow's maintenance log, -15 Sanity

#### Component Failure (Level 8+)

**Mechanical Impact**: High (Credits)  
**Purpose**: Expensive repairs or replacements  
**Example**: "IDG Failure" - Generator exhibits impossible behaviors, 300 Credits repair or +20 Suspicion

#### Bureaucratic Horror (Level 10+)

**Mechanical Impact**: Medium (Focus drain)  
**Purpose**: Paperwork anomalies and administrative nightmares  
**Example**: "Logbook Recursion" - Entry references itself in past tense from the future, -25 Focus to resolve

#### Eldritch Manifestation (Level 15+)

**Mechanical Impact**: Massive (Sanity)  
**Purpose**: Cosmic horror revelation  
**Example**: "The Hum" - Structural resonance in Backshops, geometry is wrong, -40 Sanity

#### Union Events (Level 18+)

**Mechanical Impact**: Variable  
**Purpose**: Night crew interactions, restricted knowledge access  
**Example**: "Shop Steward's Warning" - Information about SLS-3 door that shouldn't exist

#### Syndicate Events (Level 20+)

**Mechanical Impact**: Extreme (Suspicion/Credits)  
**Purpose**: Black market opportunities  
**Example**: "Untraceable Offer" - Rotables with no serial numbers, +40 Suspicion if accepted

## Toolroom System

### Tool Categories and Mechanics

#### Precision Tools (Calibration Required)

**Torquemeter**:

- Function: Measures bolt tension
- Calibration: 0-100%, degrades with use
- Mini-game: Adjust needle to target range within tolerance band
- Failure Consequence: Failed maintenance checks, +5 Suspicion

**Micrometer**:

- Function: Measures component tolerance
- Calibration: Similar to torquemeter
- Critical Use: Required for precision inspections

#### Power Tools (Degradation System)

**Rivet Gun**:

- Cost: 150 Credits
- Function: Structural repairs
- Efficiency Multiplier: **8x** (critical early-game acquisition target)
- Condition: 0-100%, repairs cost 50-75 Credits

**Atlas Copco Drill**:

- Cost: 250 Credits
- Function: High-torque operations
- Condition: Degrades faster than rivet gun

**Orbital Sander**:

- Cost: 180 Credits
- Function: Surface preparation
- Condition: Medium degradation rate

#### Specialty Equipment (Time-Limited Checkout)

**HFEC Scanner** (Eddy Current):

- Cost: 300 Credits
- Function: Crack detection in structural components
- Checkout Window: 2 hours in-game
- Penalty: Late return triggers audit event

**Rototest Unit**:

- Cost: 350 Credits
- Function: Electrical phase testing
- Checkout Window: 2 hours in-game

**Air Data Test Box**:

- Cost: 400 Credits
- Function: Pitot-static system simulation
- Checkout Window: 2 hours in-game

#### Hand Tools (Permanent, No Degradation)

Basic wrenches, screwdrivers, hammers required for fundamental actions[cite:28]. No condition tracking, universal availability once purchased.

## Automation and Delegation Systems

### Night Crew Delegation (Level 6+)

**Mechanics**:

- Passive Credit generation: 25-100 per tick
- Passive XP generation: 10-50 per tick
- Suspicion increase: +1 to +3 per tick (continuous while active)

**Trade-offs**:

- Reduced Focus regeneration (night crew consumes facility resources)
- Risk of triggering audit events due to work quality issues
- Essential for late-game progression but requires active Suspicion management

### Automated Systems (Level 12+)

**SRF Auto-Filing**:

- Effect: Generates paperwork passively
- Cost: Periodic Credit expenditure
- Risk: Low chance of bureaucratic error events

**Transit Check Delegation**:

- Effect: Outsources routine inspections
- Benefit: Saves 15 Focus per delegated check
- Risk: Quality issues may trigger compliance events

**Tool Calibration Service**:

- Effect: Pay Credits to skip calibration mini-game
- Cost: 25 Credits per tool
- Benefit: Guaranteed calibration success without time investment

## Pet System: F.O.D.

### F.O.D. Mechanics

F.O.D. (Foreign Object Debris) is the facility's mysterious cat who provides crucial Sanity restoration and companionship[cite:28].

**Stats**:

- Trust: 0-100 (increases with positive interactions)
- Hunger: 0-100 (increases passively over time, must be managed)

### Interaction Types

#### Feed

**Requirements**: Canned tuna (5 Credits)  
**Effects**:

- Hunger: -30
- Trust: +5
- Sanity: +15
- Log Message: "He emerges from the shadows, eats ravenously, and purrs like a diesel engine."

#### Play

**Requirements**: Laser pointer (25 Credits), 10 Focus  
**Effects**:

- Trust: +5
- Sanity: +10
- Log Message: "The red dot dances. F.O.D. hunts it with lethal precision."

#### Pet

**Requirements**: 2 Focus  
**Outcomes**:

- 80% Success: Trust +2, Sanity +5, "He leans into your hand and purrs."
- 20% Love Bite: Trust +1, "He bites you softly. Love bite?"

### High Trust Benefits (Trust > 75)

1. **Suit Warning System**: F.O.D. provides advance warning of approaching Suits, reducing Sanity drain by 25%
2. **Hidden Item Revelation**: Reveals concealed items in Structure Shop
3. **Passive Sanity Regeneration**: Sits on player's lap during breaks, providing +5 Sanity per tick

### Hunger Management Critical

If Hunger exceeds 80 for extended periods, F.O.D. becomes hostile[cite:28]:

- Triggers "Cat Scratch" event
- Effect: Infection, -20 Sanity
- Prevention: Maintain inventory of canned tuna (5 Credits each)

## Strategic Resource Management

### Early Game Strategy (Levels 0-10)

**Priority 1: Rivet Gun Acquisition** (Level 4-5 target)

- Save 150 Credits from Transit Checks
- Provides 8x efficiency multiplier
- Essential for structural maintenance unlocks

**Priority 2: Suspicion Control** (Keep below 30)

- Avoid automation systems
- Don't scavenge Corrosion Corner
- Pass all Audit events
- Compliance is survival

**Priority 3: Sanity Maintenance** (Keep above 50)

- Feed F.O.D. regularly (target Trust > 50 by Level 10)
- Avoid Suits encounters
- Take Canteen breaks when Sanity drops below 60

**Priority 4: Skill Investment**

- Mechanical Intuition (reduces Focus costs)
- Paperwork Efficiency (reduces administrative time)
- Stress Management (reduces Sanity drain)

### Mid-Game Strategy (Levels 10-25)

**Goals**:

- Unlock all 11 location tabs
- Begin Night Crew delegation
- Acquire specialty tools (HFEC scanner, torquemeter)
- Survive first Eldritch Manifestation event

**Resource Balance Shift**:

- Suspicion tolerance increases to 40-60
- Sanity becomes critical resource (harder to restore)
- Credits become abundant (focus shifts to rare resource gathering)

**Rare Resource Collection**:

- Bio-Filament: From Deep Clean Vents (target: 10+)
- Crystalline Resonators: From Corrosion Corner (target: 10+)
- KARDEX Fragments: From Cross-Reference KARDEX (target: 10+)

### Late Game Strategy (Levels 26-49)

**Goals**:

- Collect sufficient rare resources for ending preparation
- Find Metallic Sphere (for Alien Ending path)
- Choose ending trajectory
- Max critical skills

**Ending Preparation Paths**:

**Alien Ending**:

- Acquire Metallic Sphere (Level 35+ Black Market)
- Access SLS-3 door (hidden in Backshops)
- Complete "Check Black Market" action
- Use Metallic Sphere at Level 49

**Government Ending**:

- Maintain Suspicion 40-70 (visible but not hostile)
- Accept all Performance Reviews
- Build relationship with Suits (risky, high Sanity cost)
- Default ending path at Level 49

**Madness Ending**:

- Allow Sanity to drop below 20
- Engage in repeated high-risk actions
- Consume "Void Burger" from Canteen
- Automatic trigger when Sanity reaches 0

## Advanced Resource Optimization

### Efficiency Multipliers

Several game mechanics provide multiplicative benefits to resource generation:

**Tool Efficiency** (Rivet Gun):

- Base action efficiency: 1x
- With rivet gun: 8x
- Net effect: Complete 8 actions in time/Focus cost of 1

**Skill Synergies**:

- Mechanical Intuition + Paperwork Efficiency: Reduces total Focus cost by 35%
- Stress Management + F.O.D. High Trust: Increases Sanity regeneration by 40%

**Delegation Stacking**:

- Night Crew delegation + Automated systems: Generates ~150 Credits/tick
- Cost: 3-5 Suspicion/tick
- Break-even point: Level 15+ when audit passing rate is reliable

### Hidden Mechanics

#### The Sedan Timing

- Appears on Apron at exactly 02:17 in-game time
- Observing it 5+ times unlocks "Sedan Recognition" perk
- Perk effect: Reduces Suit encounter Sanity drain by 15%
- License plate changes geometry if Sanity < 30

#### Janitor Patterns

- Appears every 10 minutes real-time
- Always cleaning surfaces that aren't dirty
- If janitor stops cleaning and leaves: Eldritch Manifestation imminent (3-5 minute warning)

#### Regular's Clues

- Talk to Regular has three outcomes:
  - 30% chance: Concrete clue about events 3-5 levels ahead
  - 60% chance: Vague warning about facility dangers
  - 10% chance: Incoherent rambling (no benefit)

#### Tool Calibration RNG

- Calibration mini-game has hidden tolerance band
- Success rate: 50% base, +5% per Precision Training skill level
- Failed calibrations: 25% chance to cause critical failure during subsequent use

## Conclusion

The resource system in The Hangar creates a sophisticated web of interconnected mechanics that reinforce the game's themes of workplace pressure, psychological strain, and gradual corruption[cite:28]. The four primary resources—Focus, Sanity, Suspicion, and Credits—operate in dynamic tension, forcing players to make strategic sacrifices and carefully balance competing priorities.

The game's design elegantly merges mechanical depth with narrative coherence. Focus represents professional competence, Sanity reflects psychological resilience, Suspicion embodies regulatory and institutional pressure, and Credits symbolize the economic constraints of working-class existence. Together, these systems create a compelling simulation of the precarious balance required to survive in an increasingly hostile and incomprehensible workplace.

The progression from simple resource management in early levels to complex multi-resource optimization in late game mirrors the narrative arc from mundane maintenance work to cosmic horror revelation. By Level 49, players must have mastered resource optimization, risk management, and strategic planning—or succumb to termination, madness, or assimilation by unknowable forces.

This resource system represents a successful synthesis of incremental game mechanics, narrative horror elements, and authentic aviation maintenance simulation, creating a unique and memorable gameplay experience.

## References

[cite:28] Selcuk, S. J. (2026). The Hangar - Browser-based incremental horror RPG. GitHub repository. https://github.com/stevenselcuk/thehangar
