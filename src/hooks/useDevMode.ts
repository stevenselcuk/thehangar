import { useContext } from 'react';
import { DevModeContext } from '../context/DevModeContext';

export const useDevMode = () => {
  const context = useContext(DevModeContext);
  if (!context) {
    throw new Error('useDevMode must be used within a DevModeProvider');
  }
  return context;
};
