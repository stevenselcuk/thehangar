import React, { createContext, ReactNode, useEffect, useState } from 'react';

// Extend Window interface for dev mode
declare global {
  interface Window {
    enableDevMode?: () => void;
  }
}

interface DevModeContextType {
  isDevModeActive: boolean;
  openDevMode: () => void;
  closeDevMode: () => void;
}

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

// Export context for use in hooks
export { DevModeContext };

interface DevModeProviderProps {
  children: ReactNode;
}

export const DevModeProvider: React.FC<DevModeProviderProps> = ({ children }) => {
  const [isDevModeActive, setIsDevModeActive] = useState(false);

  const openDevMode = () => {
    setIsDevModeActive(true);
  };

  const closeDevMode = () => {
    setIsDevModeActive(false);
  };

  useEffect(() => {
    // Expose dev mode activation to window object for console access
    window.enableDevMode = () => {
      console.log(
        '%c🔧 DEV MODE ACTIVATED 🔧',
        'background: #10b981; color: #000; font-size: 20px; font-weight: bold; padding: 10px;'
      );
      console.log(
        '%cYou can now manipulate game state through the Dev Mode dashboard.',
        'color: #10b981; font-size: 14px;'
      );
      openDevMode();
    };

    // Log availability message on mount
    console.log(
      '%c🎮 THE HANGAR - Dev Build',
      'color: #10b981; font-size: 16px; font-weight: bold;'
    );
    console.log(
      '%cType window.enableDevMode() to activate developer tools',
      'color: #6ee7b7; font-size: 12px;'
    );

    return () => {
      delete window.enableDevMode;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Shift + Command + P
      if (event.shiftKey && event.metaKey && (event.key === 'p' || event.key === 'P')) {
        event.preventDefault(); // Prevent default browser action (like print or command palette)
        // Toggle: If active, close it; if inactive, open it.
        // But wait, window.enableDevMode() only opens it.
        // User asked to trigger window.enableDevMode(), which sets it to true.
        // Let's stick to calling window.enableDevMode() or internal openDevMode().
        // Better yet, let's toggle if already open.
        setIsDevModeActive((prev) => {
          if (!prev) {
            console.log('🔧 Dev Mode Shortcut Triggered');
            return true;
          }
          return false; // Toggle off if already on
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value = {
    isDevModeActive,
    openDevMode,
    closeDevMode,
  };

  return <DevModeContext.Provider value={value}>{children}</DevModeContext.Provider>;
};
