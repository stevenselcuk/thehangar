# Aircraft on Ground (AOG) Event System

## Overview

The AOG Event System creates high-stakes, time-sensitive deployment scenarios where the player is sent to remote locations to fix aircraft. These events provide a break from the standard hangar routine and offer unique rewards and narrative content.

## Components

### 1. Data Structure (`src/data/aog.ts`)

- **Stations**: Possible deployment locations (e.g., LHR, HND, JFK), each with a difficulty rating and description.
- **Scenarios**: Types of issues to resolve (e.g., Runway Excursion, Bird Strike, Lightning Strike).
- **Actions**: Specific actions available within a scenario, costing resources and providing outcomes.

### 2. State Management (`src/state/slices/aogSlice.ts`)

- **State Shape**:
  ```typescript
  aog: {
    active: boolean; // Is a deployment currently active?
    stationId: string | null; // Where are we deployed?
    scenarioId: string | null; // What happened?
    startTime: number; // When did it start?
  }
  ```
- **Actions**:
  - `ACCEPT_AOG_DEPLOYMENT`: Triggers a new random deployment.
  - `RESOLVE_AOG_ACTION`: Performs a scenario-specific action (deducts costs, triggering logs).
  - `COMPLETE_AOG_DEPLOYMENT`: Returns the player to the hangar and grants rewards.

### 3. Reducer Integration (`src/state/reducerComposer.ts`)

- The `aogSlice` is integrated into the main `reducerComposer`.
- Actions are routed specifically to this slice.
- **Note**: The slice has access to `resources` and `logs` to affect game state.

### 4. UI Component (`src/components/AogTab.tsx`)

- Displays the current station and scenario details.
- Provides interactive buttons for scenario actions.
- Shows different visual styles based on station difficulty.
- Includes a "Return to Base" button to complete the deployment.

### 5. Dev Mode Integration

- Accessible via the "AOG" tab in the Dev Mode modal.
- Allows manually triggering an AOG deployment.
- Allows forcing completion of an active deployment.

## Gameplay Flow

1.  **Trigger**: Deployment is triggered (currently via Dev Mode, planned for random event trigger).
2.  **Deployment**: State updates to `active: true` with a random station and scenario.
3.  **UI Switch**: The main action panel switches to the `AOG_DEPLOYMENT` tab.
4.  **Resolution**: Player performs actions to resolve the situation (spending resources).
5.  **Completion**: Player clicks "Return to Base", receiving credits and XP. State resets to `active: false`.
