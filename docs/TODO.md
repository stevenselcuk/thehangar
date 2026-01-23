# Future Development: KARDEX Integration

This document outlines the planned integration of KARDEX events and mechanics into the main game loop.

## Overview

The KARDEX system represents a high-level cosmic horror element. Events have been defined in `src/data/events.ts` and flavor text in `src/data/flavor.ts`, but they are currently inactive.

## Planned Event Triggers

### 1. Active Triggers (Action-Based)

Hook these events into `src/logic/actionProcessor.ts` to respond to specific user actions.

**Method 1: The Forbidden Search**

- **Action**: `SEARCH_MANUALS`
- **Logic**: Add a small chance (e.g., 5%) to trigger `KARDEX_RECOVERY` instead of finding a normal item.
- **Context**: "While looking for a part number, you find a file that shouldn't exist."

**Method 2: Surveillance Backfire**

- **Action**: `REVIEW_SURVEILLANCE_LOGS`
- **Logic**: If `suspicion > 75` and `sanity < 40`, trigger `THE_ARCHIVIST`.
- **Context**: "You're watching them, but something starts watching you back."

### 2. Passive Triggers (Tick-Based)

Hook these into `src/logic/tickProcessor.ts` to occur based on game state over time.

**Method 3: Reality Breakdown**

- **Condition**: `sanity < 20`
- **Logic**: Low chance per tick to trigger `TIMELINE_CORRUPTION`.
- **Context**: "Your mind fractures, and the timeline of the maintenance logs begins to bleed into the future."

## Implementation Snippets

```typescript
// Example for Action Processor
if (Math.random() < 0.05) {
  triggerEvent('eldritch_manifestation', 'KARDEX_RECOVERY');
}
```

```typescript
// Example for Tick Processor
if (nextRes.sanity < 20 && Math.random() < 0.0005) {
  triggerEvent('eldritch_manifestation', 'TIMELINE_CORRUPTION');
}
```
