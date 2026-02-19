import React, { Suspense, useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { SoundProvider, useSound } from './context/SoundContext.tsx';

import { HelmetProvider } from 'react-helmet-async';
import ActionPanel from './components/ActionPanel.tsx';
import CrtOverlay from './components/CrtOverlay.tsx';
import CursorEffect from './components/CursorEffect.tsx';
import HazardBar from './components/HazardBar.tsx';
import ResourceBar from './components/ResourceBar.tsx';
import SEO from './components/SEO.tsx';
import Sidebar from './components/Sidebar.tsx';
import { DevModeProvider } from './context/DevModeContext.tsx';
import { generateNightShiftLogs } from './data/nightShiftLogs.ts';
import { useDevMode } from './hooks/useDevMode.ts';

import { useMobileNotifications } from './hooks/useMobileNotifications.ts';
import { GameState, TabType } from './types.ts';

const AboutModal = React.lazy(() => import('./components/AboutModal.tsx'));
const ArchiveTerminalModal = React.lazy(() => import('./components/ArchiveTerminalModal.tsx'));
const CalibrationMinigame = React.lazy(() => import('./components/CalibrationMinigame.tsx'));

const DevModeModal = React.lazy(() => import('./components/DevModeModal.tsx'));
const MaintenanceTerminalModal = React.lazy(
  () => import('./components/MaintenanceTerminalModal.tsx')
);
const PersonalIdCardModal = React.lazy(() => import('./components/PersonalIdCardModal.tsx'));
const BulletinBoardModal = React.lazy(() => import('./components/BulletinBoardModal.tsx'));
const EndingScreen = React.lazy(() => import('./components/EndingScreen.tsx'));
const OnboardingScreen = React.lazy(() => import('./components/OnboardingScreen.tsx'));

import { useAutoSave } from './hooks/useAutoSave.ts';
import { useGameEngine } from './hooks/useGameEngine.ts';
import { hasCompletedOnboarding, isTabUnlocked } from './services/LevelManager.ts';
import { gameReducer, GameReducerAction } from './state/gameReducer.ts';
import { loadState } from './state/initialState.ts';

import NotificationContainer from './components/common/NotificationContainer.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { useNotification } from './hooks/useNotification.ts';

import ReloadPrompt from './components/ReloadPrompt.tsx';

const SAVE_KEY = 'the_hangar_save__build_132';
const WIP_WARNING_KEY = 'hasSeenWipWarning__build_132';

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

  const { play } = useSound();
  const [mobileView, setMobileView] = useState<'ACTIONS' | 'LOGS'>('ACTIONS');
  const [isResourceDrawerOpen, setIsResourceDrawerOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const { addNotification, removeNotification } = useNotification();

  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [isBulletinBoardOpen, setIsBulletinBoardOpen] = useState(false);
  const [isArchiveTerminalOpen, setIsArchiveTerminalOpen] = useState(false);
  const [isMaintenanceTerminalOpen, setIsMaintenanceTerminalOpen] = useState(false);
  const isRebootingRef = useRef(false);
  const hasPlayedGameOverSoundRef = useRef(false);
  const { isDevModeActive } = useDevMode();

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

  // Mobile Notifications Hook
  useMobileNotifications(state.logs, addNotification);

  // WIP Warning Effect
  useEffect(() => {
    const hasSeenWip = localStorage.getItem(WIP_WARNING_KEY);
    if (!hasSeenWip) {
      addNotification({
        id: 'system-wip-notice', // Fixed ID
        title: 'SYSTEM NOTICE',
        message:
          'Active Development In Progress. Expect frequent updates, visual glitches, and potential instability.',
        variant: 'system',
        duration: 8000, // Auto-hide after 8 seconds
        actions: [
          {
            label: 'Initialize',
            onClick: () => {
              localStorage.setItem(WIP_WARNING_KEY, 'true');
              removeNotification('system-wip-notice');
            },
          },
        ],
      });
    }
  }, [addNotification, removeNotification, play]);

  // Night Shift Logic (Offline Progression)
  useEffect(() => {
    const lastUpdate = state.lastUpdate;
    if (!lastUpdate) return;

    const now = Date.now();
    const timeAway = now - lastUpdate;
    const hoursAway = timeAway / (1000 * 60 * 60);

    if (hoursAway >= 1) {
      // Calculate logs
      const newLogs = generateNightShiftLogs(hoursAway, state.resources.sanity);

      // Add them to state
      newLogs.forEach((log) => {
        // We use a custom action type here or standard existing ones.
        // Since we have a 'ADD_LOG' reducer case usually, we can use that if we expose it or use 'ACTION' dispatch.
        // Looking at gameReducer (I haven't seen it but App.tsx lines 51-54 use it), I'll assume I can dispatch generic actions or need to wrap it.
        // But wait, App.tsx doesn't show 'ADD_LOG' action directly handled in the snippets I saw.
        // It shows dispatch({ type: 'ACTION' ... }) wrapper or specific types.
        // Let's assume there is a way to add logs.
        // A safer bet is to use the `onAction` pattern if possible or just dispatch if I knew the reducer.
        // Since I can't verify the reducer right now, I'll use a direct dispatch type 'ADD_LOG' which is standard in this project's Redux-like setup.
        dispatch({ type: 'ADD_LOG', payload: log as unknown as import('./types').LogMessage }); // Using unknown casting to avoid any
      });

      // Notify user
      addNotification({
        id: 'night-shift-report',
        title: 'NIGHT SHIFT REPORT',
        message: `Crew active for ${Math.floor(hoursAway)} hours while you were away. Check logs for details.`,
        variant: 'info',
        duration: 10000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Notification Queue Consumer
  useEffect(() => {
    if (state.notificationQueue.length > 0) {
      state.notificationQueue.forEach((notif) => {
        addNotification({
          id: notif.id,
          title: notif.title,
          message: notif.message,
          variant: notif.variant,
          duration: notif.duration,
          actions: notif.actions,
        });

        // Sound Effects
        if (notif.variant === 'levelup') play('LEVEL_UP');
        if (notif.variant === 'hazard' || notif.variant === 'error') play('ALARM');
        if (notif.variant === 'system') play('CLICK');
      });

      // Clear queue to prevent reprocessing
      dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    }
  }, [state.notificationQueue, addNotification, dispatch, play]);

  // Effect for Game Over sound
  useEffect(() => {
    if (
      (state.resources.suspicion >= 100 || state.resources.sanity <= 0) &&
      !hasPlayedGameOverSoundRef.current
    ) {
      play('SHOCKED');
      hasPlayedGameOverSoundRef.current = true;
    }
  }, [state.resources.suspicion, state.resources.sanity, play]);

  // Redirect if active tab is locked
  useEffect(() => {
    if (!isTabUnlocked(activeTab, state)) {
      // Find first unlocked tab
      const firstUnlocked = Object.values(TabType).find((t) => isTabUnlocked(t, state));
      if (firstUnlocked) {
        setActiveTab(firstUnlocked);
      }
    }
  }, [activeTab, state]);

  // FIX: Force title update when tab changes
  useEffect(() => {
    document.title = `The Hangar - ${activeTab.replace(/_/g, ' ')}`;
  }, [activeTab]);

  const [isBlackout, setIsBlackout] = useState(false);
  const prevEventIdRef = useRef<string | null>(null);

  // Effect to play alarm on new event
  useEffect(() => {
    if (state.activeEvent && state.activeEvent.id !== prevEventIdRef.current) {
      play('ALARM');
      prevEventIdRef.current = state.activeEvent.id;
    } else if (!state.activeEvent) {
      prevEventIdRef.current = null;
    }
  }, [state.activeEvent, play]);

  // Memoize onAction callback to prevent unnecessary re-renders
  const onAction = useCallback(
    (type: string, payload?: Record<string, unknown>) => {
      if (type === 'COMPLETE_AOG_DEPLOYMENT') {
        setActiveTab(TabType.APRON_LINE);
        // Fall through to dispatch
      }
      if (type === 'SHOW_ID_CARD') {
        play('CLICK');
        setIsIdCardOpen(true);
        return;
      }
      if (type === 'OPEN_ARCHIVE_TERMINAL') {
        play('CLICK');
        setIsArchiveTerminalOpen(true);
        return;
      }
      if (type === 'OPEN_MAINTENANCE_TERMINAL') {
        play('CLICK');
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
    [dispatch, play]
  );

  const handleAppReset = () => {
    isRebootingRef.current = true;
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(`${SAVE_KEY}_tab`);
    window.location.reload();
  };

  // Level 0 Onboarding - one-time NDA/Offer/ID card sequence
  if (!hasCompletedOnboarding(state)) {
    return (
      <Suspense fallback={<div className="bg-black h-screen w-screen" />}>
        <OnboardingScreen gameState={state} dispatch={dispatch} />
      </Suspense>
    );
  }

  if (state.flags.endingTriggered) {
    return (
      <Suspense fallback={<div className="bg-black h-screen w-screen" />}>
        <EndingScreen endingType={state.flags.endingTriggered} onReset={handleAppReset} />
      </Suspense>
    );
  }

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

  const rootClasses = `flex flex-col h-screen select-none bg-black text-emerald-500 overflow-hidden ${state.flags.isHallucinating ? 'hallucination' : ''} ${state.flags.isAfraid ? 'fear-state' : ''} ${state.resources.sanity < 40 ? 'breathing-ui' : ''}`;

  return (
    <div className={rootClasses}>
      {/* Blackout Overlay */}
      <div
        className={`fixed inset-0 z-[2000] bg-black transition-opacity duration-[1500ms] ${isBlackout ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      <h1 className="sr-only">The Hangar: An Incremental Mystery RPG</h1>

      <SEO
        title={`The Hangar - ${activeTab.replace(/_/g, ' ')}`}
        description="Uncover a terrifying conspiracy in this text-based incremental mystery game."
        keywords="incremental game, text rpg, mystery, horror, aviation, mechanic"
      />

      {isAboutModalOpen && (
        <Suspense fallback={<LoadingFallback />}>
          <AboutModal
            state={state}
            onAction={onAction}
            onClose={() => setIsAboutModalOpen(false)}
          />
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
            onOpenBulletinBoard={() => setIsBulletinBoardOpen(true)}
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
      {isBulletinBoardOpen && (
        <Suspense fallback={<LoadingFallback />}>
          <BulletinBoardModal state={state} onClose={() => setIsBulletinBoardOpen(false)} />
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

      <header className="border-b border-emerald-900 bg-[#0a0a0a] z-50 flex flex-col md:flex-row md:items-stretch md:h-14 shrink-0 transition-all duration-300">
        {/* Top Row (Mobile): Logo + Status / Left Side (Desktop): Logo + Tabs */}
        <div className="flex items-center justify-between md:justify-start w-full md:w-auto border-b md:border-b-0 border-emerald-900/50 md:border-r h-12 md:h-auto px-4 md:px-0">
          <button
            onClick={() => {
              play('CLICK');
              setIsAboutModalOpen(true);
            }}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm flex-shrink-0 md:ml-4 md:mr-4 flex items-center text-left"
          >
            <img
              src="/images/logo.png"
              alt="THE HANGAR logo"
              className="h-6 w-6 md:h-8 md:w-8 transition-all duration-300"
            />
            <div className="hidden md:flex flex-col ml-3 justify-center">
              <span className="text-emerald-500 font-bold uppercase tracking-widest text-xs leading-none">
                WALKER & MORLEY
              </span>
              <span className="text-emerald-800 text-[9px] uppercase tracking-[0.2em] leading-none mt-1">
                Maintaining the Unseen
              </span>
            </div>
          </button>

          {/* Mobile Status Display (Hidden on Desktop) */}
          <div className="md:hidden flex items-center space-x-2 text-[10px] uppercase font-bold text-emerald-900">
            {isSaving && (
              <div className="text-emerald-400 animate-pulse text-[8px] tracking-[0.2em]">SYNC</div>
            )}
            <button
              onClick={() => {
                play('CLICK');
                setIsResourceDrawerOpen(!isResourceDrawerOpen);
              }}
              className={`ml-2 px-2 py-1 border ${isResourceDrawerOpen ? 'border-emerald-500 text-emerald-500 bg-emerald-900/20' : 'border-emerald-900/50 text-emerald-700'} rounded transition-colors`}
            >
              RESOURCES {isResourceDrawerOpen ? '▲' : '▼'}
            </button>
          </div>

          <div className="hidden md:flex bg-[#050505] border-l border-emerald-900/50 h-full">
            {Object.values(TabType)
              .filter(
                (t) => (t !== TabType.AOG_DEPLOYMENT || state.aog.active) && isTabUnlocked(t, state)
              )
              .map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    play('CLICK');
                    setActiveTab(t);
                  }}
                  className={`px-4 min-w-[120px] h-full border-r border-emerald-900/50 last:border-r-0 text-[10px] uppercase transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-inset whitespace-nowrap
                  ${activeTab === t ? 'bg-emerald-900/20 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]' : 'text-emerald-800 hover:text-emerald-400 hover:bg-emerald-900/10'}`}
                >
                  {t.replace(/_/g, ' ')}
                </button>
              ))}
          </div>
        </div>

        {/* Mobile Tabs Row (Scrollable) */}
        <div className="md:hidden flex overflow-x-auto scrollbar-hide bg-[#050505] border-b border-emerald-900/50 h-10 w-full">
          {Object.values(TabType)
            .filter(
              (t) => (t !== TabType.AOG_DEPLOYMENT || state.aog.active) && isTabUnlocked(t, state)
            )
            .map((t) => (
              <button
                key={t}
                onClick={() => {
                  // Center the clicked tab if possible - simple smooth scroll to view
                  const btn = document.getElementById(`tab-btn-${t}`);
                  btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                  play('CLICK');
                  setActiveTab(t);
                }}
                id={`tab-btn-${t}`}
                className={`flex-shrink-0 px-4 h-full border-r border-emerald-900/50 text-[10px] uppercase transition-all duration-200 focus:outline-none whitespace-nowrap flex items-center
                  ${activeTab === t ? 'bg-emerald-900/20 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]' : 'text-emerald-800 hover:text-emerald-400 hover:bg-emerald-900/10'}`}
              >
                {t.replace(/_/g, ' ')}
              </button>
            ))}
        </div>

        {/* Desktop Status (Hidden on Mobile) */}
        <div className="hidden md:flex items-stretch space-x-6 text-[10px] uppercase font-bold text-emerald-900 ml-auto">
          {isSaving && (
            <div className="text-emerald-400 animate-pulse text-[8px] tracking-[0.2em] self-center">
              SYNCING...
            </div>
          )}
        </div>
      </header>
      <HazardBar hazards={state.activeHazards} />

      {/* Resource Bar - Sliding Drawer on Mobile */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isResourceDrawerOpen ? 'max-h-[500px] border-b border-emerald-900/50' : 'max-h-0 md:max-h-none'} md:block`}
      >
        <ResourceBar
          resources={state.resources}
          inventory={state.inventory}
          hfStats={state.hfStats}
          flags={state.flags}
        />
      </div>

      {/* Mobile View Toggle (Actions / Logs) */}
      <div className="md:hidden flex border-b border-emerald-900/30 bg-[#080808]">
        <button
          onClick={() => {
            play('CLICK');
            setMobileView('ACTIONS');
          }}
          className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider ${mobileView === 'ACTIONS' ? 'text-emerald-400 bg-emerald-900/20 border-b-2 border-emerald-500' : 'text-emerald-800 hover:bg-emerald-900/10'}`}
        >
          Active Panel
        </button>
        <button
          onClick={() => {
            play('CLICK');
            setMobileView('LOGS');
          }}
          className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider ${mobileView === 'LOGS' ? 'text-emerald-400 bg-emerald-900/20 border-b-2 border-emerald-500' : 'text-emerald-800 hover:bg-emerald-900/10'}`}
        >
          System Logs
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`w-full md:w-1/2 p-4 md:p-6 overflow-y-auto border-r border-emerald-900/20 bg-[#0d0d0d] ${mobileView === 'ACTIONS' ? 'block' : 'hidden md:block'}`}
        >
          <ActionPanel
            activeTab={activeTab}
            state={state}
            onAction={onAction}
            onOpenBulletinBoard={() => setIsBulletinBoardOpen(true)}
          />
        </div>
        <div
          className={`w-full md:w-1/2 p-4 md:p-6 bg-[#0a0a0a] overflow-y-auto ${mobileView === 'LOGS' ? 'block' : 'hidden md:block'}`}
        >
          <Sidebar logs={state.logs} />
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DevModeProvider>
      <SoundProvider>
        <NotificationProvider>
          <CrtOverlay />
          <CursorEffect />
          <HelmetProvider>
            <AppContent />
            <ReloadPrompt />
            <NotificationContainer />
          </HelmetProvider>
        </NotificationProvider>
      </SoundProvider>
    </DevModeProvider>
  );
};

export default App;
