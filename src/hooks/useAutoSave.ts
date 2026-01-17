import React, { useEffect, useRef } from 'react';
import { GameState, TabType } from '../types';

export const useAutoSave = (
  state: GameState,
  saveKey: string,
  activeTab: TabType,
  onSaveStart: () => void,
  onSaveEnd: () => void,
  isRebootingRef: React.MutableRefObject<boolean>
) => {
  const stateRef = useRef(state);
  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const saveGame = () => {
      onSaveStart();
      localStorage.setItem(saveKey, JSON.stringify(stateRef.current));
      localStorage.setItem(`${saveKey}_tab`, activeTabRef.current);
      setTimeout(onSaveEnd, 800);
    };

    const intervalId = setInterval(saveGame, 60000);

    const handleBeforeUnload = () => {
      if (isRebootingRef.current) return;
      localStorage.setItem(saveKey, JSON.stringify(stateRef.current));
      localStorage.setItem(`${saveKey}_tab`, activeTabRef.current);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveKey, onSaveStart, onSaveEnd, isRebootingRef]);
};
