import React from 'react';
import { GameReducerAction } from '../../state/gameReducer';
import { GameState, PetState } from '../../types';

interface DevModeEntitiesProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameReducerAction>;
}

export const DevModeEntities: React.FC<DevModeEntitiesProps> = ({ gameState, dispatch }) => {
  // Pet Helpers
  const updatePet = <K extends keyof PetState>(key: K, value: PetState[K]) => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: { pet: { ...gameState.pet, [key]: value } },
    });
  };

  const setPetLocation = (location: PetState['location']) => {
    updatePet('location', location);
  };

  const togglePetFlag = (key: keyof PetState['flags']) => {
    const currentFlags = gameState.pet.flags;
    updatePet('flags', { ...currentFlags, [key]: !currentFlags[key] });
  };

  // Toolroom Helpers
  const updateToolroom = <K extends keyof GameState['toolroom']>(
    key: K,
    value: GameState['toolroom'][K]
  ) => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: { toolroom: { ...gameState.toolroom, [key]: value } },
    });
  };

  return (
    <div className="space-y-6">
      {/* Hangar Cat Section */}
      <section className="bg-emerald-950/30 p-4 border border-emerald-800">
        <h2 className="text-lg font-bold text-emerald-400 mb-4 border-b border-emerald-800 pb-2">
          🐈 Hangar Cat ({gameState.pet.name})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Stats */}
          <div>
            <label className="block text-emerald-400 text-sm mb-1">
              Trust: {gameState.pet.trust}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={gameState.pet.trust}
              onChange={(e) => updatePet('trust', Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-emerald-400 text-sm mb-1">
              Hunger: {gameState.pet.hunger}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={gameState.pet.hunger}
              onChange={(e) => updatePet('hunger', Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-emerald-400 text-sm mb-2">Location</label>
          <div className="flex flex-wrap gap-2">
            {(['HANGAR', 'OFFICE', 'CANTEEN', 'TOOLROOM', 'VOID'] as const).map((loc) => (
              <button
                key={loc}
                onClick={() => setPetLocation(loc)}
                className={`px-3 py-1 text-xs border ${
                  gameState.pet.location === loc
                    ? 'bg-emerald-700 border-emerald-500 text-white'
                    : 'bg-emerald-900/30 border-emerald-800 text-emerald-500'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {Object.keys(gameState.pet.flags).map((flag) => (
            <label
              key={flag}
              className="flex items-center space-x-2 text-emerald-400 text-xs cursor-pointer"
            >
              <input
                type="checkbox"
                checked={gameState.pet.flags[flag as keyof PetState['flags']] as boolean}
                onChange={() => togglePetFlag(flag as keyof PetState['flags'])}
              />
              <span>{flag}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Toolroom Section */}
      <section className="bg-emerald-950/30 p-4 border border-emerald-800">
        <h2 className="text-lg font-bold text-emerald-400 mb-4 border-b border-emerald-800 pb-2">
          🛠️ Toolroom
        </h2>

        <div className="mb-4">
          <p className="text-emerald-400 text-sm mb-2">
            Status: <span className="font-bold">{gameState.toolroom.status}</span>
          </p>
          <div className="flex gap-2">
            {(['OPEN', 'CLOSED', 'AUDIT', 'LUNCH'] as const).map((status) => (
              <button
                key={status}
                onClick={() => updateToolroom('status', status)}
                className={`px-3 py-1 text-xs border ${
                  gameState.toolroom.status === status
                    ? 'bg-emerald-700 border-emerald-500 text-white'
                    : 'bg-emerald-900/30 border-emerald-800 text-emerald-500'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-2">
          <label className="block text-emerald-400 text-sm mb-1">Unavailable Tools (IDs)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={gameState.toolroom.unavailableTools.join(', ')}
              readOnly
              className="flex-1 bg-emerald-950 border border-emerald-800 text-emerald-500 text-xs px-2 py-1"
            />
            <button
              onClick={() => updateToolroom('unavailableTools', [])}
              className="bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-800 text-xs px-3 py-1"
            >
              Clear
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
