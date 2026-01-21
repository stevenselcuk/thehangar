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

        addLog(`DEPLOYMENT CONFIRMED: ${station.name} (${station.code}).`, 'story');
        addLog(`SITREP: ${scenario.title}. ${scenario.description}`, 'warning');
        break;
      }

      case 'RESOLVE_AOG_ACTION': {
        const { actionId } = action.payload as { actionId: string };
        const scenarioId = draft.aog.scenarioId;
        const scenario = aogScenarios.find((s) => s.id === scenarioId);

        if (!scenario) return;

        const aogAction = scenario.actions.find((a) => a.id === actionId);
        if (!aogAction) return;

        const cost = aogAction.cost;
        if (draft.resources[cost.resource] < cost.amount) {
          addLog(`Insufficient ${cost.resource} to perform this action.`, 'warning');
          return;
        }

        // Deduct resources
        draft.resources[cost.resource] -= cost.amount;

        // Add log
        addLog(`ACTION: ${aogAction.label} completed.`, 'info');
        if (aogAction.consequence) {
          addLog(aogAction.consequence, 'story');
        }

        // Check if scenario is complete (this is a simplified logic, assuming any action progress scenario)
        // In a more complex version, we might track progress per scenario.
        // For now, let's say completing one "big" action or a couple of small ones might be enough,
        // or we just rely on a 'COMPLETE_DEPLOYMENT' action that becomes available.

        break;
      }

      case 'AOG_TICK': {
        if (!draft.aog.active) return;

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

        draft.aog.active = false;
        draft.aog.stationId = null;
        draft.aog.scenarioId = null;
        draft.aog.startTime = 0;

        // Reward
        const reward = 500;
        draft.resources.credits += reward;
        draft.resources.experience += 100;

        addLog(`AOG DEPLOYMENT COMPLETE. Returned to base. +${reward} Credits.`, 'story');
        addLog(`Mission Time: ${Math.floor((Date.now() - draft.aog.startTime) / 1000)}s`, 'info');
        break;
      }
    }
  });
};
