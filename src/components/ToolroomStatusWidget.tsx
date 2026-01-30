import React, { useEffect, useState } from 'react';
import { GameState } from '../types.ts';

interface ToolroomStatusWidgetProps {
  state: GameState;
}

const ToolroomStatusWidget: React.FC<ToolroomStatusWidgetProps> = ({ state }) => {
  const { status, nextStatusChange, unavailableTools } = state.toolroom;
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const remaining = Math.max(0, nextStatusChange - Date.now());
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [nextStatusChange]);

  const getStatusColor = () => {
    switch (status) {
      case 'OPEN':
        return 'text-emerald-500 border-emerald-800 bg-emerald-950/20';
      case 'CLOSED':
        return 'text-red-500 border-red-800 bg-red-950/20';
      case 'AUDIT':
        return 'text-amber-500 border-amber-800 bg-amber-950/20';
      case 'LUNCH':
        return 'text-yellow-400 border-yellow-800 bg-yellow-950/20';
      default:
        return 'text-zinc-500';
    }
  };

  const getStatusText = () => {
    if (status === 'OPEN') return '[OPEN]';
    if (status === 'CLOSED') return '[CLOSED]';
    if (status === 'AUDIT') return '[AUDIT]';
    return '[LUNCH]';
  };

  return (
    <div
      className={`p-4 border-l-4 ${getStatusColor().replace('text-', 'border-').split(' ')[1]} bg-black/40 mb-4 transition-all duration-500`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div
            className={`text-xl font-bold font-mono ${getStatusColor()
              .split(' ')
              .filter((c) => c.startsWith('text'))
              .join(' ')}`}
          >
            {getStatusText()}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest">
              Master Toolroom
            </span>
            <span className="text-[9px] text-zinc-400 font-mono">
              NEXT CHANGE IN: <span className="text-zinc-300">{timeLeft}</span>
            </span>
          </div>
        </div>
      </div>

      {status === 'OPEN' && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[9px] text-zinc-400 uppercase tracking-wider">Checked Out Tools</p>
            <span className="text-[9px] text-zinc-600 font-mono">
              {unavailableTools.length} ITEMS
            </span>
          </div>
          {unavailableTools.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {unavailableTools.map((t) => (
                <span
                  key={t}
                  className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 text-[8px] font-mono border border-zinc-700 rounded-sm"
                >
                  {t.toUpperCase()}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[9px] text-emerald-800/80 italic">All tools accounted for.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolroomStatusWidget;
