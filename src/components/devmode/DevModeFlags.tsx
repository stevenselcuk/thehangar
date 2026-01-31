import React, { useState } from 'react';
import { GameReducerAction } from '../../state/gameReducer';
import { GameState } from '../../types';

interface DevModeFlagsProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameReducerAction>;
}

export const DevModeFlags: React.FC<DevModeFlagsProps> = ({ gameState, dispatch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const toggleFlag = (key: keyof GameState['flags']) => {
    // Avoid toggling complex objects directly here, simplified for boolean flags
    if (key === 'storyFlags' || key === 'ndtFinding' || key === 'activeComponentFailure') return;

    const currentValue = gameState.flags[key];
    dispatch({
      type: 'UPDATE_FLAGS',
      payload: { [key]: !currentValue },
    });
  };

  const filteredFlags = Object.entries(gameState.flags).filter(([key, _value]) => {
    if (key === 'storyFlags' || key === 'ndtFinding' || key === 'activeComponentFailure')
      return false;
    return key.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-emerald-800 pb-2 mb-4">
        <h2 className="text-lg font-bold text-emerald-400">Game Flags</h2>
        <input
          type="text"
          placeholder="Search flags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-emerald-950 border border-emerald-700 text-emerald-300 text-sm px-2 py-1 placeholder-emerald-800"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-[70vh] overflow-y-auto">
        {filteredFlags.map(([key, value]) => (
          <div
            key={key}
            className="bg-emerald-950/50 p-3 border border-emerald-800 hover:border-emerald-600 transition-colors"
          >
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-emerald-400 text-sm capitalize" title={key}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={() => toggleFlag(key as keyof GameState['flags'])}
                className="w-5 h-5 accent-emerald-500 bg-emerald-900 border-emerald-700"
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
