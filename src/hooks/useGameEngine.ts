import React, { useCallback, useEffect, useRef } from 'react';
import { GameState, TabType } from '../types.ts';

const TARGET_FPS = 15;
const FRAME_TIME = 1000 / TARGET_FPS;

export const useGameEngine = (
  state: GameState,
  dispatch: React.Dispatch<{ type: string; payload?: Record<string, unknown> }>,
  activeTab: TabType
) => {
  const isDeadRef = useRef(false);

  useEffect(() => {
    isDeadRef.current = state.resources.sanity <= 0 || state.resources.suspicion >= 100;
  }, [state.resources.sanity, state.resources.suspicion]);

  const activeTabRef = useRef<TabType>(activeTab);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const triggerEvent = useCallback(
    (type: string, id?: string) => {
      dispatch({ type: 'TRIGGER_EVENT', payload: { type, id } });
    },
    [dispatch]
  );

  useEffect(() => {
    let lastTick = Date.now();
    let accumulator = 0;
    let animationFrameId: number;

    const tick = () => {
      if (isDeadRef.current) {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        return;
      }

      const now = Date.now();
      const delta = now - lastTick;
      lastTick = now;
      accumulator += delta;

      if (accumulator >= FRAME_TIME) {
        dispatch({
          type: 'TICK',
          payload: {
            delta: accumulator,
            triggerEvent: triggerEvent,
            activeTab: activeTabRef.current,
          },
        });
        accumulator = 0;
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [dispatch, triggerEvent]);

  return { isDeadRef };
};
