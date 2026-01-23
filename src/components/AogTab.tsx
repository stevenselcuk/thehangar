import React from 'react';
import { aogScenarios, aogStations } from '../data/aog.ts';
import { GameState } from '../types.ts';
import ActionButton from './ActionButton.tsx';

interface AogTabProps {
  state: GameState;
  onAction: (type: string, payload?: Record<string, unknown>) => void;
}

const AogTab: React.FC<AogTabProps> = ({ state, onAction }) => {
  const {
    stationId,
    scenarioId,
    startTime,
    completedActions = [],
    currentProgress = 0,
    progressRequired = 100,
    actionInProgress,
  } = state.aog;
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    setNow(Date.now()); // Update immediately on mount
    const timer = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);

      // Check for active action completion
      if (actionInProgress) {
        const endTime = actionInProgress.startTime + actionInProgress.duration;
        if (currentTime >= endTime) {
          // Dispatch resolve only if not already resolved (the interval might fire a few times)
          // We trust the reducer to handle idempotency or we check locally?
          // It's safer to just fire it, the reducer checks if actionInProgress matches.
          onAction('RESOLVE_AOG_ACTION', { actionId: actionInProgress.actionId });
        }
      }
    }, 200); // 5Hz check for responsiveness
    return () => clearInterval(timer);
  }, [actionInProgress, onAction]);

  const station = aogStations.find((s) => s.id === stationId);
  const scenario = aogScenarios.find((s) => s.id === scenarioId);

  if (!state.aog.active) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-black/50 border border-emerald-900/30">
        <h2 className="text-xl font-bold text-emerald-500 uppercase tracking-widest mb-2">
          Mission Complete
        </h2>
        <p className="text-sm text-zinc-500 font-mono">
          Transmitting mission logs... Returning to base...
        </p>
      </div>
    );
  }

  if (!station || !scenario) {
    return (
      <div className="p-4 border border-red-900 bg-red-950/20 text-center">
        <h3 className="text-red-500 font-bold uppercase mb-2">DEPLOYMENT ERROR</h3>
        <p className="text-red-400 text-xs">
          Lost contact with mission control. Invalid deployment parameters.
        </p>
        <ActionButton
          label="Emergency Abort"
          onClick={() => onAction('COMPLETE_AOG_DEPLOYMENT')}
          className="mt-4 border-red-600 text-red-400"
        />
      </div>
    );
  }

  const difficultyColors = {
    routine: 'text-emerald-400 border-emerald-600',
    challenging: 'text-amber-400 border-amber-600',
    extreme: 'text-red-400 border-red-600',
  };

  const isMissionComplete = currentProgress >= progressRequired;

  return (
    <div className="space-y-6">
      {/* Header / Station Info */}
      <div className="border-b border-zinc-700 pb-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-lg font-black text-zinc-100 uppercase tracking-tighter">
              {station.name} <span className="text-zinc-500">[{station.code}]</span>
            </h2>
            <span
              className={`text-[9px] px-2 py-0.5 border uppercase font-bold ${difficultyColors[station.difficulty]}`}
            >
              {station.difficulty} Details
            </span>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-zinc-500 font-mono">
              T+{Math.floor((now - startTime) / 1000)}s
            </div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest">DEPLOYED</div>
          </div>
        </div>
        <p className="text-xs text-zinc-400 italic border-l-2 border-zinc-600 pl-3">
          "{station.description}"
        </p>
      </div>

      {/* Progress Bar */}
      <div className="relative h-6 bg-black border border-zinc-700">
        <div
          className={`absolute top-0 left-0 h-full transition-all duration-500 ${isMissionComplete ? 'bg-emerald-600/60' : 'bg-amber-600/40'}`}
          style={{ width: `${Math.min(100, (currentProgress / progressRequired) * 100)}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-zinc-300">
          Stabilization: {currentProgress} / {progressRequired}{' '}
          {isMissionComplete && '- READY FOR DEPARTURE'}
        </div>
      </div>

      {/* Scenario */}
      <div className="p-5 border-2 border-amber-900/50 bg-black/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-600/50" />
        <h3 className="text-sm text-amber-500 font-bold uppercase tracking-widest mb-2">
          Current Situation: {scenario.title}
        </h3>
        <p className="text-xs text-amber-200/80 mb-6 leading-relaxed">{scenario.description}</p>

        <div className="grid grid-cols-1 gap-3">
          {scenario.actions.map((action) => {
            const costResource = action.cost.resource;
            const canAfford = state.resources[costResource] >= action.cost.amount;
            const isCompleted = completedActions.includes(action.id);
            const isActive = actionInProgress?.actionId === action.id;
            const isGlobalBusy = !!actionInProgress && !isActive;

            let label = action.label;
            let progressWait = 0;

            if (isActive && actionInProgress) {
              const elapsed = now - actionInProgress.startTime;
              const total = actionInProgress.duration;
              const percent = Math.min(100, (elapsed / total) * 100);
              progressWait = percent;
              label = `IN PROGRESS... ${Math.ceil((total - elapsed) / 1000)}s`;
            } else if (isCompleted) {
              label = `${action.label} (COMPLETED)`;
            }

            return (
              <div key={action.id} className="relative">
                {/* Internal Progress Bar for Action */}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 h-1 bg-amber-500 z-10 transition-all duration-200"
                    style={{ width: `${progressWait}%` }}
                  />
                )}

                <ActionButton
                  label={label}
                  onClick={() => onAction('START_AOG_ACTION', { actionId: action.id })}
                  cost={
                    !isCompleted && !isActive
                      ? {
                          label: costResource.substring(0, 3).toUpperCase(),
                          value: action.cost.amount,
                        }
                      : undefined
                  }
                  disabled={!canAfford || isCompleted || isGlobalBusy || isActive}
                  description={isCompleted ? 'Action completed.' : action.consequence}
                  className={`
                        ${isCompleted ? 'opacity-50 border-zinc-700 text-zinc-500 decoration-line-through' : ''}
                        ${isActive ? 'border-amber-500 text-amber-400 bg-amber-900/20' : ''}
                        ${!canAfford && !isCompleted ? 'opacity-50' : ''}
                    `}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Field Log */}
      <div className="p-4 border border-zinc-800 bg-black/60 font-mono">
        <h4 className="text-[10px] text-zinc-500 uppercase mb-3 font-bold tracking-widest border-b border-zinc-800 pb-1">
          Field Log / Comms
        </h4>
        <div className="space-y-1 max-h-40 overflow-y-auto flex flex-col-reverse">
          {state.logs
            .filter((log) => log.timestamp >= startTime)
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((log) => (
              <div key={log.id} className="text-[10px] flex gap-2">
                <span className="text-zinc-600">
                  [
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                  ]
                </span>
                <span
                  className={`${
                    log.type === 'story'
                      ? 'text-amber-200/90 italic'
                      : log.type === 'warning'
                        ? 'text-orange-400'
                        : log.type === 'error'
                          ? 'text-red-400'
                          : 'text-zinc-400'
                  }`}
                >
                  {log.text}
                </span>
              </div>
            ))}
          {state.logs.filter((log) => log.timestamp >= startTime).length === 0 && (
            <div className="text-[10px] text-zinc-700 italic">No signals received.</div>
          )}
        </div>
      </div>

      {/* Completion */}
      <div
        className={`p-4 border ${isMissionComplete ? 'border-emerald-500 bg-emerald-950/20' : 'border-zinc-800 bg-black/40'}`}
      >
        <h4
          className={`text-[10px] uppercase mb-2 font-bold tracking-widest ${isMissionComplete ? 'text-emerald-500' : 'text-zinc-500'}`}
        >
          Mission Status
        </h4>
        <p className="text-[10px] text-zinc-400 mb-4">
          {isMissionComplete
            ? 'Situation stabilized. You are authorized to return to base.'
            : 'Stabilize the situation before returning to base.'}
        </p>
        <ActionButton
          label={isMissionComplete ? 'Return to Base' : 'Incomplete (Stabilize First)'}
          onClick={() => onAction('COMPLETE_AOG_DEPLOYMENT')}
          disabled={!isMissionComplete}
          className={
            isMissionComplete
              ? 'border-emerald-500 text-emerald-400 hover:bg-emerald-900/20'
              : 'opacity-50 border-zinc-700 text-zinc-600'
          }
        />
      </div>
    </div>
  );
};

export default AogTab;
