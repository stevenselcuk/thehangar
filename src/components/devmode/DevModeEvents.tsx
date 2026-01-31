import React, { useState } from 'react';
import { eventsData } from '../../data/events';
import { GameReducerAction } from '../../state/gameReducer';
import { GameState } from '../../types';

interface DevModeEventsProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameReducerAction>;
}

export const DevModeEvents: React.FC<DevModeEventsProps> = ({ gameState, dispatch }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-emerald-400 mb-4 border-b border-emerald-800 pb-2">
        Event Manager
      </h2>

      {/* Active Event Status */}
      <div className="bg-emerald-950/50 p-4 border border-emerald-800 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <span className="text-6xl text-emerald-500">⚡</span>
        </div>
        <h3 className="text-emerald-400 font-bold mb-2">Active Event Status</h3>
        {gameState.activeEvent ? (
          <div>
            <div className="mb-3 relative z-10">
              <p className="text-sm font-bold text-emerald-300">{gameState.activeEvent.title}</p>
              <p className="text-xs text-emerald-500 italic">
                ID: {gameState.activeEvent.id} | Type: {gameState.activeEvent.type}
              </p>
              <p className="text-xs text-emerald-500">
                Time Left: {(gameState.activeEvent.timeLeft / 1000).toFixed(1)}s
              </p>
            </div>
            <button
              onClick={() =>
                dispatch({
                  type: 'ACTION',
                  payload: { type: 'RESOLVE_EVENT', payload: { forceResolve: true } },
                })
              }
              className="bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-700 font-bold py-1 px-3 text-xs relative z-10"
            >
              Force Resolve (Clear)
            </button>
          </div>
        ) : (
          <p className="text-emerald-600 italic text-sm">No active event</p>
        )}
      </div>

      {/* AOG Deployment Section */}
      <div className="bg-emerald-950/30 p-4 border border-emerald-800 mb-6">
        <h3 className="text-emerald-400 font-bold mb-3 text-sm uppercase tracking-wider">
          AOG Deployment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="">
            <div className="mb-4">
              <span
                className={`text-xs font-bold px-2 py-1 rounded ${gameState.aog.active ? 'bg-emerald-800 text-white' : 'bg-zinc-800 text-zinc-400'}`}
              >
                {gameState.aog.active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            {!gameState.aog.active ? (
              <button
                onClick={() =>
                  dispatch({
                    type: 'ACTION',
                    payload: { type: 'ACCEPT_AOG_DEPLOYMENT', payload: {} },
                  })
                }
                className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2 px-4 border border-emerald-500 mb-2 text-xs"
              >
                🚀 Trigger Random Deployment
              </button>
            ) : (
              <button
                onClick={() =>
                  dispatch({
                    type: 'ACTION',
                    payload: { type: 'COMPLETE_AOG_DEPLOYMENT', payload: {} },
                  })
                }
                className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 border border-red-500 text-xs"
              >
                ❌ Force Complete Deployment
              </button>
            )}
          </div>

          {gameState.aog.active && (
            <div className="bg-emerald-900/20 p-2 border border-emerald-800/50 rounded">
              <p className="text-xs text-emerald-300 mb-1">
                <span className="text-emerald-500">Station:</span> {gameState.aog.stationId}
              </p>
              <p className="text-xs text-emerald-300">
                <span className="text-emerald-500">Scenario:</span> {gameState.aog.scenarioId}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Event Triggers */}
      <div className="space-y-2">
        <h3 className="text-emerald-400 font-bold uppercase text-xs tracking-wider mb-2">
          Trigger Event
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.keys(eventsData).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(activeCategory === category ? null : category)}
              className={`px-3 py-1 text-xs border uppercase transition-colors ${activeCategory === category ? 'bg-emerald-700 border-emerald-500 text-white' : 'bg-emerald-950 border-emerald-800 text-emerald-500 hover:border-emerald-600'}`}
            >
              {category.replace('_', ' ')}
            </button>
          ))}
        </div>

        {activeCategory && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-emerald-950/20 border border-emerald-900/50">
            {eventsData[activeCategory].map((event) => (
              <button
                key={event.id}
                onClick={() =>
                  dispatch({
                    type: 'TRIGGER_EVENT',
                    payload: { type: activeCategory, id: event.id },
                  })
                }
                className="text-left text-xs bg-black/40 hover:bg-emerald-900/30 text-emerald-300 py-2 px-3 border border-emerald-900/30 hover:border-emerald-500 transition-colors flex justify-between items-center group"
              >
                <span className="font-mono truncate mr-2">{event.title || event.id}</span>
                <span className="text-[10px] text-emerald-700 group-hover:text-emerald-500 uppercase flex-shrink-0">
                  Trigger
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
