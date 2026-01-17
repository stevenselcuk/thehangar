import React, { useState, useEffect, useRef } from 'react';

interface Props {
  toolLabel: string;
  fatigue: number;
  onComplete: (result: 'perfect' | 'good' | 'fail') => void;
}

const CalibrationMinigame: React.FC<Props> = ({ toolLabel, fatigue, onComplete }) => {
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const gameLoopRef = useRef<number | null>(null);

  useEffect(() => {
    const speed = 2.5 + (fatigue / 100) * 3.5; // Base speed + fatigue modifier
    const loop = () => {
      setPosition((prev) => {
        let nextPos = prev + direction * speed;
        if (nextPos > 100 || nextPos < 0) {
          setDirection((d) => -d);
          nextPos = Math.max(0, Math.min(100, nextPos));
        }
        return nextPos;
      });
      gameLoopRef.current = requestAnimationFrame(loop);
    };
    gameLoopRef.current = requestAnimationFrame(loop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [direction, fatigue]);

  const handleClick = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    // Target zones: Perfect: 45-55, Good: 35-45 and 55-65
    if (position >= 45 && position <= 55) {
      onComplete('perfect');
    } else if (position >= 35 && position <= 65) {
      onComplete('good');
    } else {
      onComplete('fail');
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClick}>
      <div className="modal-content w-[600px] text-center" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg text-emerald-400 uppercase tracking-widest mb-2">
          Calibrating: {toolLabel}
        </h3>
        <p className="text-xs text-emerald-700 mb-8">
          Click to stop the oscillator in the target zone.
        </p>

        <div
          className="w-full h-12 bg-black/40 border border-emerald-900 relative my-4"
          onClick={handleClick}
        >
          {/* Fail Zones */}
          <div className="absolute top-0 left-0 h-full w-full bg-red-900/20" />
          {/* Good Zone */}
          <div className="absolute top-0 left-[35%] h-full w-[30%] bg-amber-800/30" />
          {/* Perfect Zone */}
          <div className="absolute top-0 left-[45%] h-full w-[10%] bg-emerald-700/40" />

          {/* Moving Bar */}
          <div
            className="absolute top-0 h-full w-1.5 bg-white shadow-[0_0_15px_white]"
            style={{ left: `calc(${position}% - 3px)` }}
          />
        </div>

        <div className="flex justify-between px-1 text-xs mt-2 text-emerald-800">
          <span>[ FAIL ]</span>
          <span className="text-amber-600">[ GOOD ]</span>
          <span className="text-emerald-500">[ PERFECT ]</span>
          <span className="text-amber-600">[ GOOD ]</span>
          <span>[ FAIL ]</span>
        </div>
      </div>
    </div>
  );
};

export default CalibrationMinigame;
