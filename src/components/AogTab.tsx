import React from 'react';
import { aogScenarios, aogStations } from '../data/aog.ts';
import { GameState } from '../types.ts';
import ActionButton from './ActionButton.tsx';

interface AogTabProps {
  state: GameState;
  onAction: (type: string, payload?: Record<string, unknown>) => void;
}

const AogTab: React.FC<AogTabProps> = ({ state, onAction }) => {
  const { stationId, scenarioId, startTime } = state.aog;
  const [now, setNow] = React.useState(startTime);

  React.useEffect(() => {
    setNow(Date.now()); // Update immediately on mount
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const station = aogStations.find((s) => s.id === stationId);
  const scenario = aogScenarios.find((s) => s.id === scenarioId);

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

            return (
              <ActionButton
                key={action.id}
                label={action.label}
                onClick={() => onAction('RESOLVE_AOG_ACTION', { actionId: action.id })}
                cost={{
                  label: costResource.substring(0, 3).toUpperCase(),
                  value: action.cost.amount,
                }}
                disabled={!canAfford}
                description={action.consequence}
                className={!canAfford ? 'opacity-50' : ''}
              />
            );
          })}
        </div>
      </div>

      {/* Completion */}
      <div className="p-4 border border-emerald-900/30 bg-emerald-950/5">
        <h4 className="text-[10px] text-emerald-700 uppercase mb-2 font-bold tracking-widest">
          Mission Status
        </h4>
        <p className="text-[10px] text-emerald-800 mb-4">
          Once the situation is stabilized, you may return to base. (In this prototype, you can
          return at any time to claim rewards).
        </p>
        <ActionButton
          label="Return to Base"
          onClick={() => onAction('COMPLETE_AOG_DEPLOYMENT')}
          className="border-emerald-800 text-emerald-400 hover:bg-emerald-900/20"
        />
      </div>
    </div>
  );
};

export default AogTab;
