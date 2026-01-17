import React, { memo } from 'react';
import { LogMessage } from '../types';

interface Props {
  logs: LogMessage[];
}

const SidebarComponent: React.FC<Props> = ({ logs }) => {
  const getLogStyles = (type: LogMessage['type']) => {
    switch (type) {
      case 'info':
        return {
          container: 'border-emerald-900 text-emerald-400',
          prefix: '[ OK ]',
          animation: '',
        };
      case 'warning':
        return {
          container: 'border-amber-700 text-amber-500 log-warning bg-amber-950/5',
          prefix: '[ !! ]',
          animation: '',
        };
      case 'error':
        return {
          container: 'border-red-900 text-red-600 font-bold bg-red-950/10',
          prefix: '[ CRIT ]',
          animation: 'vibrate',
        };
      case 'vibration':
        return {
          container: 'border-purple-900 text-purple-400 bg-purple-950/10',
          prefix: '[ ??? ]',
          animation: 'vibrate',
        };
      case 'story':
        return {
          container: 'border-emerald-500 text-emerald-100 log-story',
          prefix: '[ LOG ]',
          animation: 'animate-pulse',
        };
      case 'levelup':
        return {
          container: 'border-blue-500 text-blue-300 bg-blue-950/20 flicker',
          prefix: '[ LVL ]',
          animation: 'animate-pulse',
        };
      default:
        return {
          container: 'border-emerald-900 text-emerald-300',
          prefix: '[ MSG ]',
          animation: '',
        };
    }
  };

  return (
    <div className="h-full flex flex-col space-y-3 overflow-y-auto pr-2 font-light text-sm">
      {logs.map((log, idx) => {
        const styles = getLogStyles(log.type);
        // Calculate fade for older messages (only if there are many)
        const opacity = idx > 15 ? Math.max(0.1, 1 - idx * 0.05) : 1;

        return (
          <div
            key={log.id}
            className={`log-entry border-l-2 pl-3 py-2 rounded-r-sm transition-all duration-300 ${styles.container} ${styles.animation}`}
            style={{ opacity }}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-[9px] font-bold tracking-tighter opacity-80">
                {styles.prefix}
              </span>
              <span className="opacity-40 text-[9px] font-mono">
                {new Date(log.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>
            <div className="leading-relaxed tracking-tight break-words">{log.text}</div>
            {log.type === 'vibration' && (
              <div className="absolute inset-0 bg-purple-500/5 pointer-events-none mix-blend-overlay" />
            )}
          </div>
        );
      })}
      <div className="h-24 shrink-0 pointer-events-none" />{' '}
      {/* Spacer at bottom for better scrolling */}
    </div>
  );
};

// Memoize to prevent re-render when logs haven't changed
// Compare by length and first/last log IDs for quick shallow check
export default memo(SidebarComponent, (prevProps, nextProps) => {
  // If lengths differ, definitely changed
  if (prevProps.logs.length !== nextProps.logs.length) return false;

  // If empty, no change
  if (prevProps.logs.length === 0) return true;

  // Check first and last log IDs for quick comparison
  const prevFirst = prevProps.logs[0]?.id;
  const nextFirst = nextProps.logs[0]?.id;
  const prevLast = prevProps.logs[prevProps.logs.length - 1]?.id;
  const nextLast = nextProps.logs[nextProps.logs.length - 1]?.id;

  // Return true to skip re-render if IDs match
  return prevFirst === nextFirst && prevLast === nextLast;
});
