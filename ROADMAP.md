# The Hangar - Development Roadmap

## Game Summary

**The Hangar** is a browser-based incremental game where players assume the role of an aircraft maintenance technician working night shifts at a remote facility where reality begins to deteriorate. The game successfully merges:

- **Authentic aviation mechanics** (rotables, NDT testing, SRF filing, ETOPS checks)
- **Lovecraftian horror** (The Suits, eldritch manifestations, cosmic dread)
- **Corporate bureaucracy** (audits, compliance, performance reviews)
- **Resource management** (Focus, Sanity, Suspicion, Credits)
- **Skill progression** and multiple gameplay tabs (Hangar, Backshops, Office, Terminal, etc.)

## Strategic Development Framework

### 1. **Game Narrative Architecture**

The current narrative structure uses:

- **Environmental storytelling** through work logs, radio chatter, and terminal entries
- **Event-driven horror** (audits by The Suits, eldritch manifestations)
- **Ambiguity** - never explicitly stating what's happening, maintaining cosmic horror's core principle
- **Escalation tied to game state** (sanity/suspicion thresholds trigger different events)

**Recommendations for Expansion:**

- Develop deeper character arcs (the janitor, toolroom master, night crew)
- Create interconnected event chains with branching consequences
- Implement "soft" endings based on playstyle (compliance vs. rebellion, sanity preservation vs. forbidden knowledge)
- Layer in environmental clues through passive observations (descriptions that change based on sanity levels)

### 2. **Scenario Writing Guidelines**

Current scenarios follow this structure:

```typescript
{
  id: 'EVENT_ID',
  type: 'audit' | 'incident' | 'eldritch_manifestation',
  title: 'SHORT CAPS TITLE',
  description: 'Clinical, technical tone with creeping wrongness',
  choices: [/* player agency */],
  failureOutcome: {/* consequences */}
}
```

**Best Practices:**

- Use **precise aviation terminology** (P/N numbers, component designations, maintenance procedures)
- Maintain **clinical tone** even during horror moments
- Ground supernatural elements in **technical failures** (fuel lines dissolving, structural resonance)
- Escalate weirdness gradually based on **sanity/suspicion levels**
- Provide meaningful choices with **trade-offs** (not just good/bad options)

### 3. **Game Mechanics Deep Dive**

**Core Resource Loop:**

- **Focus (0-100)**: Work capacity, regenerates slowly, required for all actions
- **Sanity (0-100)**: Mental stability, drains from anomalies, game over at 0
- **Suspicion (0-100)**: Regulatory scrutiny, rises from rule-breaking, game over at 100
- **Credits**: Currency for tools, training, upgrades
- **Experience/Levels**: Unlock skill points and new abilities

**Key Systems:**

- **Tick-based economy** (15 FPS, requestAnimationFrame loop)
- **Tool degradation** (requires repair/calibration)
- **Rotable components** (condition tracking, catastrophic failures)
- **Job cards** (timed maintenance tasks with requirements)
- **NDT inspection** (find cracks, corrosion, anomalies)
- **Delegation** (automation for passive income but increases suspicion)

### 4. **Leveling & Progression Psychology**

**Current Skill System:**

- Skill points earned through leveling
- Unlockable abilities in `data/skills.ts`
- Type ratings and certifications (A&P license, EASA modules, NDT levels)

**Psychological Hooks:**

- **Incremental rewards** (small wins every few minutes)
- **Meaningful choices** (skill specialization paths)
- **Risk/reward tension** (untraceable parts = profit but suspicion)
- **Curiosity gaps** (terminal commands, archive mysteries)
- **Loss aversion** (tool condition degradation, sanity drain)
- **Agency vs. powerlessness** (you can work efficiently OR safely, rarely both)

### 5. **Psychological Design Principles**

The game employs sophisticated psychological mechanics:

**Horror Psychology:**

- **Ambiguity** creates more fear than explicit monsters
- **Anticipation** (The Suits watching from mezzanine)
- **Helplessness** (events you cannot prevent)
- **Cognitive dissonance** (the janitor knows too much, why?)

**Engagement Psychology:**

- **Variable reward schedules** (random events keep players alert)
- **Sunk cost fallacy** (invested time in calibration, training)
- **Goal gradient effect** (visible progress bars for level-ups)
- **Endowment effect** (attachment to specific tools, aircraft)

## Next Steps?

1. **Expand Event Pool** - Write new audits, incidents, eldritch manifestations with proper branching
2. **Develop Character Arcs** - Flesh out the janitor, The Suits, night crew personalities
3. **Create Aircraft Scenarios** - Specific maintenance situations for each aircraft type
4. **Design Skill Trees** - Balanced progression paths (efficiency vs. safety vs. knowledge)
5. **Write Terminal Content** - Archive logs, maintenance bulletins, forbidden documents
6. **Craft Flavor Text** - Radio chatter, environmental descriptions, work logs
7. **Balance Game Economy** - Cost/reward calculations, progression pacing
8. **Build Narrative Endings** - Multiple conclusion paths based on player choices

---

## Contributing

Interested in contributing? Check out:

- [CONTRIBUTING.md](CONTRIBUTING.md) (TODO: Create)
- [Open Issues](https://github.com/stevenselcuk/thehangar/issues)
- [GitHub Discussions](https://github.com/stevenselcuk/thehangar/discussions)

### Priority Labels

- 🔴 **Critical**: Blocking issues, security concerns
- 🟠 **High**: Core features, major bugs
- 🟡 **Medium**: Enhancements, minor bugs
- 🟢 **Low**: Nice-to-haves, polish
- 🔵 **Future**: Long-term ideas, research

---

## Version History

- **v0.0.0** (Current) - MVP Core Gameplay
  - Functional game loop
  - 574 tests passing
  - 75% code coverage
  - CI/CD pipeline operational

---

**Next Review**: March 2026  
**Maintainer**: @stevenselcuk  
**License**: MIT
