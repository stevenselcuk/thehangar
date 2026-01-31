import React from 'react';
import { GameReducerAction } from '../../state/gameReducer';
import { GameState } from '../../types';

interface DevModeResourcesProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameReducerAction>;
}

export const DevModeResources: React.FC<DevModeResourcesProps> = ({ gameState, dispatch }) => {
  const updateResource = (key: keyof GameState['resources'], value: number) => {
    dispatch({
      type: 'UPDATE_RESOURCE',
      payload: { [key]: value },
    });
  };

  const updateHFStat = (key: keyof GameState['hfStats'], value: number) => {
    dispatch({
      type: 'UPDATE_HF_STATS',
      payload: { [key]: value },
    });
  };

  const updateStat = (key: keyof GameState['stats'], value: number) => {
    dispatch({
      type: 'UPDATE_STATS',
      payload: { [key]: value },
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Resources */}
      <section>
        <h2 className="text-lg font-bold text-emerald-400 mb-4 border-b border-emerald-800 pb-2">
          Resource Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(gameState.resources).map(([key, value]) => (
            <div key={key} className="bg-emerald-950/50 p-3 border border-emerald-800">
              <label className="block text-emerald-400 text-sm font-medium mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}: {value}
              </label>
              <input
                type="range"
                min="0"
                max={key === 'credits' ? '100000' : key === 'experience' ? '10000' : '1000'}
                value={value}
                onChange={(e) =>
                  updateResource(key as keyof GameState['resources'], Number(e.target.value))
                }
                className="w-full"
              />
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  value={value}
                  onChange={(e) =>
                    updateResource(key as keyof GameState['resources'], Number(e.target.value))
                  }
                  className="w-full bg-emerald-950 border border-emerald-700 text-emerald-400 px-2 py-1 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HF Stats */}
      <section>
        <h2 className="text-lg font-bold text-emerald-400 mb-4 border-b border-emerald-800 pb-2">
          Human Factors Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(gameState.hfStats).map(([key, value]) => (
            <div key={key} className="bg-emerald-950/50 p-3 border border-emerald-800">
              <label className="block text-emerald-400 text-sm font-medium mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}: {value}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) =>
                  updateHFStat(key as keyof GameState['hfStats'], Number(e.target.value))
                }
                className="w-full"
              />
              <input
                type="number"
                value={value}
                onChange={(e) =>
                  updateHFStat(key as keyof GameState['hfStats'], Number(e.target.value))
                }
                className="w-full bg-emerald-950 border border-emerald-700 text-emerald-400 px-2 py-1 text-sm mt-2"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Game Stats */}
      <section>
        <h2 className="text-lg font-bold text-emerald-400 mb-4 border-b border-emerald-800 pb-2">
          Game Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(gameState.stats).map(([key, value]) => (
            <div key={key} className="bg-emerald-950/50 p-3 border border-emerald-800">
              <label className="block text-emerald-400 text-sm font-medium mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}: {value}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) =>
                  updateStat(key as keyof GameState['stats'], Number(e.target.value))
                }
                className="w-full bg-emerald-950 border border-emerald-700 text-emerald-400 px-2 py-1 text-sm"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
