import React, { useEffect, useState } from 'react';
import { useDevMode } from '../hooks/useDevMode';
import { GameReducerAction } from '../state/gameReducer';
import { GameState } from '../types';

// Sub-components
import { DevModeEntities } from './devmode/DevModeEntities';
import { DevModeEvents } from './devmode/DevModeEvents';
import { DevModeFlags } from './devmode/DevModeFlags';
import { DevModeInventory } from './devmode/DevModeInventory';
import { DevModeResources } from './devmode/DevModeResources';
import { DevModeSystems } from './devmode/DevModeSystems';

interface DevModeModalProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameReducerAction>;
  onReset: () => void;
}

type TabType =
  | 'overview' // Default view
  | 'resources'
  | 'inventory'
  | 'flags'
  | 'entities' // Pet, Toolroom
  | 'systems' // Time, Hazards, Jobs
  | 'events';

const QuickActions: React.FC<{
  dispatch: React.Dispatch<GameReducerAction>;
  onReset: () => void;
}> = ({ dispatch, onReset }) => (
  <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-emerald-800">
    <button
      onClick={() => {
        const maxValues: Partial<GameState['resources']> = {
          alclad: 9999,
          titanium: 9999,
          fiberglass: 9999,
          rivets: 9999,
          credits: 99999,
          sanity: 100,
          focus: 100,
        };
        dispatch({ type: 'UPDATE_RESOURCE', payload: maxValues });
      }}
      className="text-xs bg-emerald-900/50 hover:bg-emerald-800 text-emerald-300 py-2 border border-emerald-700"
    >
      💰 Max Res
    </button>
    <button
      onClick={() => {
        if (confirm('Are you sure you want to reset the game? This will delete your save!')) {
          onReset();
        }
      }}
      className="text-xs bg-red-900/50 hover:bg-red-800 text-red-300 py-2 border border-red-700"
    >
      🔥 Reset Game
    </button>
  </div>
);

const DevModeModal: React.FC<DevModeModalProps> = ({ gameState, dispatch, onReset }) => {
  const { closeDevMode } = useDevMode();
  const [activeTab, setActiveTab] = useState<TabType>('resources');

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const navItems: { id: TabType; label: string; icon: string }[] = [
    { id: 'resources', label: 'Resources & Stats', icon: '💎' },
    { id: 'inventory', label: 'Inventory & Items', icon: '🎒' },
    { id: 'flags', label: 'Game Flags', icon: '🚩' },
    { id: 'entities', label: 'Entities (Pet/Room)', icon: '🐈' },
    { id: 'systems', label: 'Systems & Time', icon: '⚙️' },
    { id: 'events', label: 'Events & AOG', icon: '⚡' },
  ];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={closeDevMode}
    >
      <div
        className="bg-black border-2 border-emerald-600 w-full max-w-6xl h-[85vh] flex overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar Navigation */}
        <div className="w-64 bg-emerald-950/20 border-r border-emerald-800 flex flex-col">
          <div className="p-4 border-b border-emerald-800 bg-emerald-900/20">
            <h1 className="text-xl font-bold text-emerald-400 tracking-wider">🔧 DEV MODE</h1>
            <p className="text-[10px] text-emerald-600 mt-1 uppercase tracking-widest">
              Administrator Access
            </p>
          </div>

          <nav className="flex-1 overflow-y-auto py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-4 py-3 text-sm font-bold flex items-center gap-3 transition-all border-l-4 ${
                  activeTab === item.id
                    ? 'bg-emerald-900/40 text-emerald-100 border-emerald-400 shadow-[inset_10px_0_20px_-10px_rgba(16,185,129,0.2)]'
                    : 'text-emerald-500 border-transparent hover:bg-emerald-900/20 hover:text-emerald-300'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4">
            <QuickActions dispatch={dispatch} onReset={onReset} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-black to-emerald-950/30">
          {/* Header */}
          <div className="h-14 border-b border-emerald-800 flex justify-between items-center px-6 bg-black/50">
            <h2 className="text-emerald-400 font-bold uppercase tracking-wider text-sm">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h2>
            <button
              onClick={closeDevMode}
              className="text-emerald-600 hover:text-emerald-400 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-emerald-700 scrollbar-track-black">
            {activeTab === 'resources' && (
              <DevModeResources gameState={gameState} dispatch={dispatch} />
            )}
            {activeTab === 'inventory' && (
              <DevModeInventory gameState={gameState} dispatch={dispatch} />
            )}
            {activeTab === 'flags' && <DevModeFlags gameState={gameState} dispatch={dispatch} />}
            {activeTab === 'entities' && (
              <DevModeEntities gameState={gameState} dispatch={dispatch} />
            )}
            {activeTab === 'systems' && (
              <DevModeSystems gameState={gameState} dispatch={dispatch} />
            )}
            {activeTab === 'events' && <DevModeEvents gameState={gameState} dispatch={dispatch} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevModeModal;
