import React, { useState } from 'react';
import { useDevMode } from '../hooks/useDevMode';
import { GameReducerAction } from '../state/gameReducer';
import { GameState } from '../types';

interface DevModeModalProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameReducerAction>;
}

type TabType =
  | 'resources'
  | 'inventory'
  | 'flags'
  | 'hfstats'
  | 'proficiency'
  | 'stats'
  | 'aog'
  | 'actions';

const DevModeModal: React.FC<DevModeModalProps> = ({ gameState, dispatch }) => {
  const { closeDevMode } = useDevMode();
  const [activeTab, setActiveTab] = useState<TabType>('resources');

  // Helper functions for dispatching state changes
  const updateResource = (key: keyof GameState['resources'], value: number) => {
    dispatch({
      type: 'UPDATE_RESOURCE',
      payload: { [key]: value },
    });
  };

  const toggleInventory = (key: keyof GameState['inventory']) => {
    const currentValue = gameState.inventory[key];
    dispatch({
      type: 'UPDATE_INVENTORY',
      payload: { [key]: typeof currentValue === 'boolean' ? !currentValue : currentValue },
    });
  };

  const setInventoryValue = (key: keyof GameState['inventory'], value: boolean | number) => {
    dispatch({
      type: 'UPDATE_INVENTORY',
      payload: { [key]: value },
    });
  };

  const toggleFlag = (key: keyof GameState['flags']) => {
    if (key === 'storyFlags' || key === 'ndtFinding' || key === 'activeComponentFailure') return;
    const currentValue = gameState.flags[key];
    dispatch({
      type: 'UPDATE_FLAGS',
      payload: { [key]: !currentValue },
    });
  };

  const updateHFStat = (key: keyof GameState['hfStats'], value: number) => {
    dispatch({
      type: 'UPDATE_HF_STATS',
      payload: { [key]: value },
    });
  };

  // Quick Actions
  const quickLevelUp = () => {
    const nextLevelXP = gameState.resources.level * 100;
    updateResource('experience', gameState.resources.experience + nextLevelXP);
    updateResource('level', gameState.resources.level + 1);
  };

  const maxResources = () => {
    const maxValues: Partial<GameState['resources']> = {
      alclad: 9999,
      titanium: 9999,
      fiberglass: 9999,
      rivets: 9999,
      hiloks: 9999,
      collars: 9999,
      grommets: 9999,
      steelWire: 9999,
      skydrol: 9999,
      mek: 9999,
      grease: 9999,
      sealant: 9999,
      credits: 99999,
      kardexFragments: 100,
      crystallineResonators: 100,
      bioFilament: 100,
    };
    dispatch({ type: 'UPDATE_RESOURCE', payload: maxValues });
  };

  const resetSanityFocus = () => {
    updateResource('sanity', 100);
    updateResource('focus', 100);
    updateResource('suspicion', 0);
  };

  const tabs = [
    { id: 'resources', label: 'Resources' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'flags', label: 'Flags' },
    { id: 'hfstats', label: 'HF Stats' },
    { id: 'proficiency', label: 'Proficiency' },
    { id: 'stats', label: 'Stats' },
    { id: 'aog', label: 'AOG' },
    { id: 'actions', label: 'Quick Actions' },
  ] as const;

  return (
    <div className="modal-overlay" onClick={closeDevMode}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '1200px' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-emerald-700">
          <div>
            <h1 className="text-2xl font-bold text-emerald-400">🔧 DEV MODE</h1>
            <p className="text-xs text-emerald-600 mt-1">Developer Tools - Manipulate Game State</p>
          </div>
          <button
            onClick={closeDevMode}
            className="text-emerald-400 hover:text-emerald-300 text-2xl font-bold px-4 py-2 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-700 text-emerald-100 border-2 border-emerald-500'
                  : 'bg-emerald-900/30 text-emerald-400 border-2 border-emerald-800 hover:border-emerald-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
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
                          updateResource(
                            key as keyof GameState['resources'],
                            Number(e.target.value)
                          )
                        }
                        className="w-full bg-emerald-950 border border-emerald-700 text-emerald-400 px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-emerald-400 mb-4 border-b border-emerald-800 pb-2">
                Inventory Management
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(gameState.inventory).map(([key, value]) => (
                  <div key={key} className="bg-emerald-950/50 p-3 border border-emerald-800">
                    {typeof value === 'boolean' ? (
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-emerald-400 text-sm capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => toggleInventory(key as keyof GameState['inventory'])}
                          className="w-5 h-5"
                        />
                      </label>
                    ) : typeof value === 'number' ? (
                      <div>
                        <label className="text-emerald-400 text-sm capitalize block mb-2">
                          {key.replace(/([A-Z])/g, ' $1').trim()}: {value}
                        </label>
                        <input
                          type="number"
                          value={value}
                          onChange={(e) =>
                            setInventoryValue(
                              key as keyof GameState['inventory'],
                              Number(e.target.value)
                            )
                          }
                          className="w-full bg-emerald-950 border border-emerald-700 text-emerald-400 px-2 py-1 text-sm"
                        />
                      </div>
                    ) : Array.isArray(value) ? (
                      <div>
                        <label className="text-emerald-400 text-sm capitalize block mb-2">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <div className="text-xs text-emerald-600">{value.join(', ') || 'None'}</div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flags Tab */}
          {activeTab === 'flags' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-emerald-400 mb-4 border-b border-emerald-800 pb-2">
                Game Flags
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(gameState.flags).map(([key, value]) => {
                  if (
                    key === 'storyFlags' ||
                    key === 'ndtFinding' ||
                    key === 'activeComponentFailure'
                  )
                    return null;
                  return (
                    <div key={key} className="bg-emerald-950/50 p-3 border border-emerald-800">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-emerald-400 text-sm capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={() => toggleFlag(key as keyof GameState['flags'])}
                          className="w-5 h-5"
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* HF Stats Tab */}
          {activeTab === 'hfstats' && (
            <div className="space-y-4">
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
            </div>
          )}

          {/* Proficiency Tab */}
          {activeTab === 'proficiency' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-emerald-400 mb-4 border-b border-emerald-800 pb-2">
                Proficiency & Skills
              </h2>
              <div className="bg-emerald-950/50 p-4 border border-emerald-800">
                <label className="block text-emerald-400 text-sm font-medium mb-2">
                  Skill Points: {gameState.proficiency.skillPoints}
                </label>
                <input
                  type="number"
                  value={gameState.proficiency.skillPoints}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_PROFICIENCY',
                      payload: { skillPoints: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-emerald-950 border border-emerald-700 text-emerald-400 px-2 py-1 text-sm"
                />
              </div>
              <div className="bg-emerald-950/50 p-4 border border-emerald-800">
                <p className="text-emerald-400 text-sm mb-2">
                  Unlocked Skills: {gameState.proficiency.unlocked.length}
                </p>
                <p className="text-xs text-emerald-600">
                  {gameState.proficiency.unlocked.join(', ') || 'None'}
                </p>
              </div>
              <div className="bg-emerald-950/50 p-4 border border-emerald-800">
                <p className="text-emerald-400 text-sm mb-2">
                  Unlocked Bonuses: {gameState.proficiency.unlockedBonuses.length}
                </p>
                <p className="text-xs text-emerald-600">
                  {gameState.proficiency.unlockedBonuses.join(', ') || 'None'}
                </p>
              </div>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
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
                        dispatch({
                          type: 'UPDATE_STATS',
                          payload: { [key]: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-emerald-950 border border-emerald-700 text-emerald-400 px-2 py-1 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AOG Tab */}
          {activeTab === 'aog' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-emerald-400 mb-4 border-b border-emerald-800 pb-2">
                AOG Deployment
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-950/50 p-4 border border-emerald-800">
                  <h3 className="text-emerald-400 font-bold mb-2">Status</h3>
                  <div className="mb-4">
                    <span className="text-emerald-200">
                      Active: {gameState.aog.active ? 'YES' : 'NO'}
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
                      className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2 px-4 border border-emerald-500 mb-2"
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
                      className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 border border-red-500"
                    >
                      ❌ Force Complete Deployment
                    </button>
                  )}
                </div>

                {gameState.aog.active && (
                  <div className="bg-emerald-950/50 p-4 border border-emerald-800">
                    <h3 className="text-emerald-400 font-bold mb-2">Current Mission</h3>
                    <p className="text-xs text-emerald-300 mb-1">
                      Station ID: {gameState.aog.stationId}
                    </p>
                    <p className="text-xs text-emerald-300">
                      Scenario ID: {gameState.aog.scenarioId}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions Tab */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-emerald-400 mb-4 border-b border-emerald-800 pb-2">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={quickLevelUp}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-4 px-6 border-2 border-emerald-500 transition-colors"
                >
                  ⬆️ Level Up
                  <div className="text-xs mt-1 text-emerald-200">Gain enough XP to level up</div>
                </button>
                <button
                  onClick={maxResources}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-4 px-6 border-2 border-emerald-500 transition-colors"
                >
                  💰 Max Resources
                  <div className="text-xs mt-1 text-emerald-200">Set all resources to maximum</div>
                </button>
                <button
                  onClick={resetSanityFocus}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-4 px-6 border-2 border-emerald-500 transition-colors"
                >
                  🧠 Reset Sanity/Focus
                  <div className="text-xs mt-1 text-emerald-200">
                    Restore to 100, clear suspicion
                  </div>
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        'Are you sure you want to reset the game? This will delete your save!'
                      )
                    ) {
                      localStorage.removeItem('the_hangar_save_hf_v26_full_hf');
                      window.location.reload();
                    }
                  }}
                  className="bg-red-700 hover:bg-red-600 text-white font-bold py-4 px-6 border-2 border-red-500 transition-colors"
                >
                  🔥 Reset Game
                  <div className="text-xs mt-1 text-red-200">Delete save and restart</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevModeModal;
