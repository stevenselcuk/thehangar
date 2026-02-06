/**
 * DevModeLevels - Development mode panel for level and progression testing
 *
 * Features:
 * - Current level display & editor
 * - Quick-jump buttons to milestone levels
 * - Unlock status for tabs, actions, events
 * - Onboarding reset and ending triggers
 */

import React from 'react';
import { MILESTONE_DATA, getNextMilestone } from '../../data/levelMilestones.ts';
import {
  getLevelProgressInfo,
  getUnlockedActions,
  getUnlockedEventCategories,
  getUnlockedTabs,
} from '../../services/LevelManager.ts';
import { GameReducerAction } from '../../state/gameReducer.ts';
import { GameState, TabType } from '../../types.ts';

interface DevModeLevelsProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameReducerAction>;
}

const QUICK_JUMP_LEVELS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 49];

export const DevModeLevels: React.FC<DevModeLevelsProps> = ({ gameState, dispatch }) => {
  const progressInfo = getLevelProgressInfo(gameState);
  const unlockedTabs = getUnlockedTabs(gameState);
  const unlockedActions = getUnlockedActions(gameState);
  const unlockedEventCategories = getUnlockedEventCategories(gameState);
  const nextMilestone = getNextMilestone(gameState.resources.level);

  const setLevel = (level: number) => {
    dispatch({
      type: 'UPDATE_RESOURCE',
      payload: { level },
    });
  };

  const setExperience = (experience: number) => {
    dispatch({
      type: 'UPDATE_RESOURCE',
      payload: { experience },
    });
  };

  const resetOnboarding = () => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: {
        flags: {
          ...gameState.flags,
          storyFlags: { ...gameState.flags.storyFlags, onboardingComplete: false },
        },
      },
    });
  };

  const triggerEnding = (ending: 'ALIEN' | 'GOVT' | 'CRAZY') => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: {
        flags: {
          ...gameState.flags,
          endingTriggered: ending,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Level Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-950/30 border border-emerald-800 p-4">
          <div className="text-emerald-600 text-[10px] uppercase tracking-widest mb-1">
            Current Level
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLevel(Math.max(0, gameState.resources.level - 1))}
              className="w-8 h-8 bg-emerald-900/50 border border-emerald-700 text-emerald-400 hover:bg-emerald-800"
            >
              -
            </button>
            <span className="text-3xl font-bold text-emerald-400">{progressInfo.currentLevel}</span>
            <button
              onClick={() => setLevel(Math.min(49, gameState.resources.level + 1))}
              className="w-8 h-8 bg-emerald-900/50 border border-emerald-700 text-emerald-400 hover:bg-emerald-800"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-emerald-950/30 border border-emerald-800 p-4">
          <div className="text-emerald-600 text-[10px] uppercase tracking-widest mb-1">
            Experience
          </div>
          <div className="text-xl font-bold text-emerald-400">
            {progressInfo.currentXP.toLocaleString()} XP
          </div>
          <div className="mt-2 h-2 bg-black border border-emerald-800">
            <div
              className="h-full bg-emerald-600 transition-all"
              style={{ width: `${progressInfo.progressPercent}%` }}
            />
          </div>
          <div className="text-emerald-700 text-[10px] mt-1">
            {progressInfo.xpToNextLevel.toLocaleString()} XP to next level
          </div>
        </div>
      </div>

      {/* Quick Jump Buttons */}
      <div>
        <div className="text-emerald-600 text-[10px] uppercase tracking-widest mb-2">
          Quick Jump
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_JUMP_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setLevel(level)}
              className={`px-3 py-2 text-xs font-bold border transition-all ${
                gameState.resources.level === level
                  ? 'bg-emerald-600 text-black border-emerald-400'
                  : 'bg-emerald-900/30 text-emerald-500 border-emerald-800 hover:bg-emerald-800'
              }`}
            >
              Lv.{level}
            </button>
          ))}
        </div>
      </div>

      {/* Next Milestone */}
      {nextMilestone && (
        <div className="bg-emerald-950/30 border border-emerald-800 p-4">
          <div className="text-emerald-600 text-[10px] uppercase tracking-widest mb-2">
            Next Milestone
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-emerald-400 font-bold">{nextMilestone.name}</div>
              <div className="text-emerald-600 text-xs">Level {nextMilestone.level}</div>
            </div>
            <button
              onClick={() => setLevel(nextMilestone.level)}
              className="px-3 py-1 bg-emerald-900/50 border border-emerald-700 text-emerald-400 text-xs hover:bg-emerald-800"
            >
              Jump →
            </button>
          </div>
        </div>
      )}

      {/* Milestone Browser */}
      <div>
        <div className="text-emerald-600 text-[10px] uppercase tracking-widest mb-2">
          All Milestones
        </div>
        <div className="max-h-48 overflow-y-auto space-y-1 border border-emerald-900 p-2 bg-black/50">
          {MILESTONE_DATA.map((m) => (
            <div
              key={m.level}
              className={`flex items-center justify-between px-2 py-1 text-xs ${
                gameState.resources.level >= m.level ? 'text-emerald-400' : 'text-emerald-800'
              }`}
            >
              <span className="w-12">Lv.{m.level}</span>
              <span className="flex-1">{m.name}</span>
              <span>{gameState.resources.level >= m.level ? '✓' : '🔒'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Unlock Status */}
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div className="border border-emerald-900 p-3">
          <div className="text-emerald-600 text-[10px] uppercase tracking-widest mb-1">Tabs</div>
          <div className="text-emerald-400 font-bold text-lg">
            {unlockedTabs.length}/{Object.values(TabType).length}
          </div>
        </div>
        <div className="border border-emerald-900 p-3">
          <div className="text-emerald-600 text-[10px] uppercase tracking-widest mb-1">Actions</div>
          <div className="text-emerald-400 font-bold text-lg">{unlockedActions.length}</div>
        </div>
        <div className="border border-emerald-900 p-3">
          <div className="text-emerald-600 text-[10px] uppercase tracking-widest mb-1">Events</div>
          <div className="text-emerald-400 font-bold text-lg">{unlockedEventCategories.length}</div>
        </div>
      </div>

      {/* Special Actions */}
      <div>
        <div className="text-emerald-600 text-[10px] uppercase tracking-widest mb-2">
          Debug Actions
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={resetOnboarding}
            className="px-3 py-2 bg-amber-900/50 border border-amber-700 text-amber-400 text-xs font-bold hover:bg-amber-800"
          >
            Reset Onboarding
          </button>
          <button
            onClick={() => setExperience(99999)}
            className="px-3 py-2 bg-emerald-900/50 border border-emerald-700 text-emerald-400 text-xs font-bold hover:bg-emerald-800"
          >
            Max XP (99999)
          </button>
        </div>
      </div>

      {/* Ending Triggers */}
      <div>
        <div className="text-emerald-600 text-[10px] uppercase tracking-widest mb-2">
          Trigger Ending
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => triggerEnding('ALIEN')}
            className="px-3 py-2 bg-purple-900/50 border border-purple-700 text-purple-400 text-xs font-bold hover:bg-purple-800"
          >
            👽 Alien
          </button>
          <button
            onClick={() => triggerEnding('GOVT')}
            className="px-3 py-2 bg-blue-900/50 border border-blue-700 text-blue-400 text-xs font-bold hover:bg-blue-800"
          >
            🏛️ Govt
          </button>
          <button
            onClick={() => triggerEnding('CRAZY')}
            className="px-3 py-2 bg-emerald-900/50 border border-emerald-700 text-emerald-400 text-xs font-bold hover:bg-emerald-800"
          >
            🧠 Crazy
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevModeLevels;
