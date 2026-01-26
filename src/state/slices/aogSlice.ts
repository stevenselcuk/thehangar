import { produce } from 'immer';
import { aogScenarios, aogStations } from '../../data/aog.ts';
import { addLogToDraft } from '../../services/logService.ts';
import { GameState } from '../../types.ts';

/**
 * AOG Slice
 * Handles logic for Aircraft on Ground deployments
 */

export interface AogAction {
  type: string;
  payload: Record<string, unknown>;
}

export const aogReducer = (
  state: {
    aog: GameState['aog'];
    resources: GameState['resources'];
    logs: GameState['logs'];
  },
  action: AogAction
) => {
  return produce(state, (draft) => {
    const addLog = (text: string, type: 'info' | 'warning' | 'error' | 'story' = 'info') => {
      addLogToDraft(draft.logs, text, type, Date.now());
    };

    const resolveAction = (actionId: string) => {
      const scenarioId = draft.aog.scenarioId;
      const scenario = aogScenarios.find((s) => s.id === scenarioId);

      if (!scenario) return;

      // Validation: Verify this action is the one in progress
      if (!draft.aog.actionInProgress || draft.aog.actionInProgress.actionId !== actionId) {
        return;
      }

      const aogAction = scenario.actions.find((a) => a.id === actionId);
      if (!aogAction) return;

      // Apply Results
      draft.aog.actionInProgress = null;
      draft.aog.completedActions.push(actionId);

      const progressAmount = aogAction.progress || 25;
      draft.aog.currentProgress += progressAmount;

      // Add log
      addLog(`COMPLETED: ${aogAction.label}. (+${progressAmount} Progress)`, 'info');
      if (aogAction.consequence) {
        addLog(aogAction.consequence, 'story');
      }

      if (draft.aog.currentProgress >= draft.aog.progressRequired) {
        addLog(`STATUS UPDATE: Aircraft stabilized. Return to base authorized.`, 'story');
      }
    };

    switch (action.type) {
      case 'ACCEPT_AOG_DEPLOYMENT': {
        if (draft.aog.active) {
          addLog('You are already deployed on an AOG task.', 'warning');
          return;
        }

        // Randomly select station and scenario
        const station = aogStations[Math.floor(Math.random() * aogStations.length)];
        const scenario = aogScenarios[Math.floor(Math.random() * aogScenarios.length)];

        draft.aog.active = true;
        draft.aog.stationId = station.id;
        draft.aog.scenarioId = scenario.id;
        draft.aog.startTime = Date.now();
        draft.aog.completedActions = [];
        draft.aog.currentProgress = 0;
        draft.aog.progressRequired = scenario.progressRequired || 100;
        draft.aog.actionInProgress = null;

        addLog(`DEPLOYMENT CONFIRMED: ${station.name} (${station.code}).`, 'story');
        addLog(`SITREP: ${scenario.title}. ${scenario.description}`, 'warning');
        addLog(
          `MISSION OBJECTIVE: Stabilize the aircraft. Required Progress: ${draft.aog.progressRequired}`,
          'info'
        );
        break;
      }

      case 'START_AOG_ACTION': {
        const { actionId } = action.payload as { actionId: string };
        const scenarioId = draft.aog.scenarioId;
        const scenario = aogScenarios.find((s) => s.id === scenarioId);

        if (!scenario) return;
        if (draft.aog.actionInProgress) {
          addLog('An action is already in progress.', 'warning');
          return;
        }

        if (draft.aog.completedActions.includes(actionId)) {
          addLog('Action already performed.', 'warning');
          return;
        }

        const aogAction = scenario.actions.find((a) => a.id === actionId);
        if (!aogAction) return;

        const cost = aogAction.cost;
        if (draft.resources[cost.resource] < cost.amount) {
          addLog(`Insufficient ${cost.resource} to perform this action.`, 'warning');
          return;
        }

        // Deduct resources immediately
        draft.resources[cost.resource] -= cost.amount;

        // Start Timer
        draft.aog.actionInProgress = {
          actionId: aogAction.id,
          startTime: Date.now(),
          duration: aogAction.duration || 5000,
        };

        addLog(`Started: ${aogAction.label}... (${(aogAction.duration || 5000) / 1000}s)`, 'info');
        break;
      }

      case 'RESOLVE_AOG_ACTION': {
        const { actionId } = action.payload as { actionId: string };
        resolveAction(actionId);
        break;
      }

      case 'AOG_TICK': {
        if (!draft.aog.active) return;

        const { now } = action.payload as { now: number };

        // Check for active action completion
        if (draft.aog.actionInProgress && now) {
          const endTime =
            draft.aog.actionInProgress.startTime + draft.aog.actionInProgress.duration;
          if (now >= endTime) {
            resolveAction(draft.aog.actionInProgress.actionId);
          }
        }

        // Random passive narrative events (5% chance per tick approx, assuming 1 sec tick)
        // Adjust probability as needed based on tick rate.
        if (Math.random() < 0.05) {
          const flavorTexts = [
            'The wind howls against the fuselage.',
            'A shadow moves in the periphery of your vision.',
            'Static crackles over the radio.',
            'The temperature drops noticeably.',
            'You hear a metallic grinding sound from the darkness.',
            'Something taps on the hull. Rhythmically.',
            'Your breath fogs up the visor.',
            'Distant machinery starts up, then dies.',
            'The smell of ozone becomes overpowering.',
            'A crow lands on the wing and stares at you.',
          ];
          const randomText = flavorTexts[Math.floor(Math.random() * flavorTexts.length)];
          addLog(randomText, 'story'); // Use 'story' type for flavor text
        }
        break;
      }

      case 'COMPLETE_AOG_DEPLOYMENT': {
        if (!draft.aog.active) return;

        // Calculate Time BEFORE resetting start time
        const missionTime = Date.now() - draft.aog.startTime;
        const formattedTime = Math.floor(missionTime / 1000);

        // Check requirement (optional enforcement, but UI should prevent it)
        if (draft.aog.currentProgress < draft.aog.progressRequired) {
          // For now, allow it but maybe with penalty?
          // Or just enforce it silently.
          addLog(`Cannot return yet. Mission incompelete.`, 'warning');
          return;
        }

        const reward = 500; // Could scale this later
        draft.resources.credits += reward;
        draft.resources.experience += 100;

        addLog(`AOG DEPLOYMENT COMPLETE. Returned to base. +${reward} Credits.`, 'story');
        addLog(`Mission Time: ${formattedTime}s`, 'info');

        // Reset State
        draft.aog.active = false;
        draft.aog.stationId = null;
        draft.aog.scenarioId = null;
        draft.aog.startTime = 0;
        draft.aog.completedActions = [];
        draft.aog.currentProgress = 0;
        draft.aog.actionInProgress = null;
        break;
      }
    }
  });
};
