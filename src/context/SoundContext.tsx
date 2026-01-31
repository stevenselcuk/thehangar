import React, { createContext, useCallback, useContext, useRef } from 'react';
import { SOUNDS, SoundType } from '../data/sounds.ts';

interface SoundContextType {
  play: (sound: SoundType, volume?: number) => void;
  playUrl: (url: string, volume?: number) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Cache Audio objects to avoid constant recreation
  const audioCache = useRef<Record<string, HTMLAudioElement>>({});

  const playUrl = useCallback((url: string, volume = 0.5) => {
    try {
      let audio = audioCache.current[url];
      if (!audio) {
        audio = new Audio(url);
        audioCache.current[url] = audio;
      }

      // Reset time to allow rapid replay
      audio.currentTime = 0;
      audio.volume = volume;
      audio.play().catch((err) => {
        // Auto-play blocking or load error
        console.warn('Audio play failed:', err);
      });
    } catch (e) {
      console.warn('Audio system error:', e);
    }
  }, []);

  const play = useCallback(
    (sound: SoundType, volume?: number) => {
      playUrl(SOUNDS[sound], volume);
    },
    [playUrl]
  );

  return <SoundContext.Provider value={{ play, playUrl }}>{children}</SoundContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
