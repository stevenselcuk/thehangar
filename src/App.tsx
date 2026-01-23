import React, { Suspense, useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import ActionPanel from './components/ActionPanel.tsx';
import CrtOverlay from './components/CrtOverlay.tsx';
import CursorEffect from './components/CursorEffect.tsx';
import HazardBar from './components/HazardBar.tsx';
import ResourceBar from './components/ResourceBar.tsx';
import SEO from './components/SEO.tsx';
import Sidebar from './components/Sidebar.tsx';
import WorkInProgressModal from './components/WorkInProgressModal.tsx';
import { DevModeProvider } from './context/DevModeContext.tsx';
import { useDevMode } from './hooks/useDevMode.ts';
import { useResourceSelectors } from './hooks/useGameSelectors.ts';
import { GameState, TabType } from './types.ts';
const AboutModal = React.lazy(() => import('./components/AboutModal.tsx'));
const ArchiveTerminalModal = React.lazy(() => import('./components/ArchiveTerminalModal.tsx'));
const CalibrationMinigame = React.lazy(() => import('./components/CalibrationMinigame.tsx'));
const DashboardModal = React.lazy(() => import('./components/DashboardModal.tsx'));
const DevModeModal = React.lazy(() => import('./components/DevModeModal.tsx'));
const MaintenanceTerminalModal = React.lazy(
  () => import('./components/MaintenanceTerminalModal.tsx')
);
const PersonalIdCardModal = React.lazy(() => import('./components/PersonalIdCardModal.tsx'));

import { useAutoSave } from './hooks/useAutoSave.ts';
import { useGameEngine } from './hooks/useGameEngine.ts';
import { gameReducer, GameReducerAction } from './state/gameReducer.ts';
import { loadState } from './state/initialState.ts';

const SAVE_KEY = 'the_hangar_save__build_12';
const WIP_WARNING_KEY = 'hasSeenWipWarning__build_12';

const playClick = () => {
  const audio = new Audio('/sounds/ui_click.mp3');
  audio.volume = 0.3;
  audio.play().catch(() => {});
};

const playLevelUpSound = () => {
  const audio = new Audio('/sounds/level_up.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {});
};

const playShockedSound = () => {
  const audio = new Audio('/sounds/shocked.mp3');
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

const LoadingFallback = () => (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <div className="text-emerald-500 text-xs uppercase tracking-widest animate-pulse border border-emerald-900/50 bg-[#0a0a0a] px-6 py-4 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
      LOADING RESOURCE...
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const [state, dispatch] = useReducer<React.Reducer<GameState, GameReducerAction>>(
    gameReducer,
    loadState(SAVE_KEY)
  );

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const savedTab = localStorage.getItem(`${SAVE_KEY}_tab`);
    if (savedTab === 'APRON' || savedTab === 'LINE_MAINT') return TabType.APRON_LINE;
    if (savedTab === 'TRAINING_DEPT') return TabType.TRAINING;
    if (savedTab && Object.values(TabType).includes(savedTab as TabType))
      return savedTab as TabType;
    return TabType.APRON_LINE;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [levelUpNotif, setLevelUpNotif] = useState(false);
  const [showWipWarning, setShowWipWarning] = useState(
    () => !localStorage.getItem(WIP_WARNING_KEY)
  );
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [isArchiveTerminalOpen, setIsArchiveTerminalOpen] = useState(false);
  const [isMaintenanceTerminalOpen, setIsMaintenanceTerminalOpen] = useState(false);
  const isRebootingRef = useRef(false);
  const hasPlayedGameOverSoundRef = useRef(false);
  const { isDevModeActive } = useDevMode();

  const handleWipClose = () => {
    playClick();
    localStorage.setItem(WIP_WARNING_KEY, 'true');
    setShowWipWarning(false);
  };

  // Use selectors for derived state
  const { xpProgress } = useResourceSelectors(state);

  // Custom hook for game loop
  useGameEngine(state, dispatch as React.Dispatch<GameReducerAction>, activeTab);

  // Custom hook for auto-saving
  useAutoSave(
    state,
    SAVE_KEY,
    activeTab,
    () => setIsSaving(true),
    () => setIsSaving(false),
    isRebootingRef
  );

  // Effect to handle one-off events like level ups
  useEffect(() => {
    const currentLevel = state.resources.level;
    const lastNotifiedLevel = state.eventTimestamps.lastLevelUpNotif || 0;
    if (currentLevel > lastNotifiedLevel) {
      // Use setTimeout to defer state updates
      setTimeout(() => {
        playLevelUpSound();
        setLevelUpNotif(true);
        setTimeout(() => setLevelUpNotif(false), 4000);
      }, 0);
      dispatch({
        type: 'ACTION',
        payload: { type: 'ACKNOWLEDGE_LEVEL_UP', payload: { level: currentLevel } },
      });
    }
  }, [state.resources.level, state.eventTimestamps.lastLevelUpNotif, dispatch]);

  // Effect for Game Over sound
  useEffect(() => {
    if (
      (state.resources.suspicion >= 100 || state.resources.sanity <= 0) &&
      !hasPlayedGameOverSoundRef.current
    ) {
      playShockedSound();
      hasPlayedGameOverSoundRef.current = true;
    }
  }, [state.resources.suspicion, state.resources.sanity]);

  // Auto-navigate away from AOG tab if mission is not active
  // Removed to avoid cascading render lint error. Handled in onAction.

  // FIX: Force title update when tab changes
  useEffect(() => {
    document.title = `The Hangar - ${activeTab.replace(/_/g, ' ')}`;
  }, [activeTab]);

  const [isBlackout, setIsBlackout] = useState(false);

  // Memoize onAction callback to prevent unnecessary re-renders
  const onAction = useCallback(
    (type: string, payload?: Record<string, unknown>) => {
      if (type === 'COMPLETE_AOG_DEPLOYMENT') {
        setActiveTab(TabType.APRON_LINE);
        // Fall through to dispatch
      }
      if (type === 'SHOW_ID_CARD') {
        playClick();
        setIsIdCardOpen(true);
        return;
      }
      if (type === 'OPEN_ARCHIVE_TERMINAL') {
        playClick();
        setIsArchiveTerminalOpen(true);
        return;
      }
      if (type === 'OPEN_MAINTENANCE_TERMINAL') {
        playClick();
        setIsMaintenanceTerminalOpen(true);
        return;
      }
      if (type === 'START_NAP_VISUAL') {
        setIsBlackout(true);
        const sleepDuration = (payload?.duration as number) || 4000;
        setTimeout(() => setIsBlackout(false), sleepDuration);
        return;
      }

      // Inject triggerEvent so reducers can trigger side effects
      dispatch({
        type: 'ACTION',
        payload: {
          type,
          payload: {
            ...payload,
            triggerEvent: (t: string, id?: string) =>
              dispatch({ type: 'TRIGGER_EVENT', payload: { type: t, id } }),
          },
        },
      });
    },
    [dispatch]
  );

  const handleAppReset = () => {
    isRebootingRef.current = true;
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(`${SAVE_KEY}_tab`);
    window.location.reload();
  };

  if (state.resources.suspicion >= 100 || state.resources.sanity <= 0) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center text-red-500 bg-black">
        <h1 className="text-6xl font-black mb-8 tracking-tighter flicker">SYSTEM FAILURE</h1>
        <p className="text-xs uppercase mb-12 tracking-[0.5em] opacity-50">
          Shift terminated by External Protocol
        </p>
        <button
          onClick={() => {
            isRebootingRef.current = true;
            localStorage.removeItem(SAVE_KEY);
            localStorage.removeItem(`${SAVE_KEY}_tab`);
            window.location.reload();
          }}
          className="px-10 py-5 border-2 border-red-600 font-bold hover:bg-red-600 hover:text-white transition-all focus:outline-none focus:ring-4 focus:ring-red-500"
        >
          REBOOT
        </button>
      </div>
    );
  }

  const rootClasses = `flex flex-col h-screen select-none bg-black text-emerald-500 overflow-hidden ${state.flags.isHallucinating ? 'hallucination' : ''} ${state.flags.isAfraid ? 'fear-state' : ''}`;
  const proficiencyGlowClass = state.proficiency.skillPoints > 0 ? 'glow-pulse-border' : '';

  return (
    <div className={rootClasses}>
      {/* Blackout Overlay */}
      <div
        className={`fixed inset-0 z-[2000] bg-black transition-opacity duration-[1500ms] ${isBlackout ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {showWipWarning && <WorkInProgressModal onClose={handleWipClose} />}

      <h1 className="sr-only">The Hangar: An Incremental Mystery RPG</h1>

      <SEO
        title={`The Hangar - ${activeTab.replace(/_/g, ' ')}`}
        description="Uncover a terrifying conspiracy in this text-based incremental mystery game."
        keywords="incremental game, text rpg, mystery, horror, aviation, mechanic"
      />

      {levelUpNotif && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] p-8 bg-black border-4 border-emerald-400 shadow-2xl shadow-emerald-500/20">
          <h2 className="text-4xl font-black text-emerald-300 flicker tracking-tighter">
            LEVEL UP
          </h2>
          <p className="text-center text-emerald-500 mt-2 text-xs uppercase tracking-[0.3em]">
            +1 SKILL POINT
          </p>
        </div>
      )}

      {isAboutModalOpen && (
        <Suspense fallback={<LoadingFallback />}>
          <AboutModal onClose={() => setIsAboutModalOpen(false)} />
        </Suspense>
      )}
      {isIdCardOpen && (
        <Suspense fallback={<LoadingFallback />}>
          <PersonalIdCardModal state={state} onClose={() => setIsIdCardOpen(false)} />
        </Suspense>
      )}
      {isArchiveTerminalOpen && (
        <Suspense fallback={<LoadingFallback />}>
          <ArchiveTerminalModal
            state={state}
            onAction={onAction}
            onClose={() => setIsArchiveTerminalOpen(false)}
          />
        </Suspense>
      )}
      {isMaintenanceTerminalOpen && (
        <Suspense fallback={<LoadingFallback />}>
          <MaintenanceTerminalModal
            state={state}
            onAction={onAction}
            onClose={() => setIsMaintenanceTerminalOpen(false)}
          />
        </Suspense>
      )}

      {isDashboardModalOpen && (
        <Suspense fallback={<LoadingFallback />}>
          <DashboardModal
            state={state}
            onAction={onAction}
            onClose={() => setIsDashboardModalOpen(false)}
          />
        </Suspense>
      )}

      {state.calibrationMinigame.active && (
        <Suspense fallback={<LoadingFallback />}>
          <CalibrationMinigame
            toolLabel={state.calibrationMinigame.toolLabel || ''}
            fatigue={state.hfStats.fatigue}
            onComplete={(result) =>
              onAction('FINISH_CALIBRATION_MINIGAME', {
                toolId: state.calibrationMinigame.toolId,
                result,
              })
            }
          />
        </Suspense>
      )}

      {isDevModeActive && (
        <Suspense fallback={null}>
          <DevModeModal gameState={state} dispatch={dispatch} onReset={handleAppReset} />
        </Suspense>
      )}

      <header className="border-b border-emerald-900 pl-4 pr-0 h-14 flex justify-between items-stretch bg-[#0a0a0a] z-50">
        <div className="flex items-stretch space-x-4">
          <button
            onClick={() => {
              playClick();
              setIsAboutModalOpen(true);
            }}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm self-center"
          >
            <img src="/images/logo.png" alt="THE HANGAR logo" className="h-8 w-8" />
          </button>
          <div className="flex bg-[#050505] border-x border-emerald-900/50">
            {Object.values(TabType)
              .filter((t) => t !== TabType.AOG_DEPLOYMENT || state.aog.active)
              .map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    playClick();
                    setActiveTab(t);
                  }}
                  className={`px-4 min-w-[120px] h-full border-r border-emerald-900/50 last:border-r-0 text-[10px] uppercase transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-inset
                  ${activeTab === t ? 'bg-emerald-900/20 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]' : 'text-emerald-800 hover:text-emerald-400 hover:bg-emerald-900/10'}`}
                >
                  {t.replace(/_/g, ' ')}
                </button>
              ))}
          </div>
        </div>
        <div className="flex items-stretch space-x-6 text-[10px] uppercase font-bold text-emerald-900">
          {isSaving && (
            <div className="text-emerald-400 animate-pulse text-[8px] tracking-[0.2em] self-center">
              SYNCING...
            </div>
          )}
          <button
            onClick={() => {
              playClick();
              setIsDashboardModalOpen(true);
            }}
            className={`px-4 h-full border-r border-emerald-900/50 bg-[#050505] hover:bg-emerald-900/10 hover:text-emerald-400 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 flex items-center justify-center ${proficiencyGlowClass}`}
          >
            LVL:{' '}
            <span className="text-emerald-400 ml-1">
              {state.resources.level} | XP: {Math.floor(xpProgress.current)} / {xpProgress.needed}
            </span>
          </button>
        </div>
      </header>
      <HazardBar hazards={state.activeHazards} />
      <ResourceBar
        resources={state.resources}
        inventory={state.inventory}
        hfStats={state.hfStats}
        flags={state.flags}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 p-6 overflow-y-auto border-r border-emerald-900/20 bg-[#0d0d0d]">
          <ActionPanel activeTab={activeTab} state={state} onAction={onAction} />
        </div>
        <div className="w-1/2 p-6 bg-[#0a0a0a] overflow-y-auto">
          <Sidebar logs={state.logs} />
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DevModeProvider>
      <CrtOverlay />
      <CursorEffect />
      <HelmetProvider>
        <AppContent />
      </HelmetProvider>
    </DevModeProvider>
  );
};

export default App;
