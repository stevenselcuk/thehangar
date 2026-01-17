import React, { memo, useRef, useState } from 'react';

export interface ActionButtonProps {
  label: string;
  onClick: () => void;
  cooldown?: number;
  disabled?: boolean;
  cost?: { label: string; value: number };
  description?: string;
  className?: string;
}

const playClick = () => {
  const audio = new Audio('/sounds/ui_click.mp3');
  audio.volume = 0.3;
  audio.play().catch(() => {});
};

const ActionButtonComponent: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  cooldown = 0,
  disabled = false,
  cost,
  description,
  className = '',
}) => {
  const [progress, setProgress] = useState(100);
  const [active, setActive] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('top');
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // If the button's top is too close to the viewport top, show the tooltip below.
      // The threshold (80px) is an estimate for tooltip height plus margin.
      if (rect.top < 80) {
        setTooltipPosition('bottom');
      } else {
        setTooltipPosition('top');
      }
    }
  };

  const handleClick = () => {
    if (disabled || active) return;
    playClick();
    if (cooldown > 0) {
      setActive(true);
      setProgress(0);
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(100, (elapsed / cooldown) * 100);
        setProgress(p);
        if (p >= 100) {
          clearInterval(interval);
          setActive(false);
          onClick();
        }
      }, 50);
    } else {
      onClick();
    }
  };

  const costDescription = cost ? `[COST: ${cost.value} ${cost.label}] ` : '';
  const fullDescription = description || '';

  return (
    <div
      ref={buttonRef}
      onMouseEnter={handleMouseEnter}
      className={`group relative mb-4 ${className}`}
    >
      <button
        onClick={handleClick}
        disabled={disabled || active}
        className={`w-full relative h-12 border border-emerald-900 bg-transparent transition-all overflow-hidden 
          ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:border-emerald-400 hover:bg-emerald-950/20 active:translate-y-0.5'}
        `}
      >
        <div
          className="absolute left-0 top-0 h-full bg-emerald-900/40 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
        <span className="relative z-10 font-bold uppercase tracking-widest text-sm">
          {active ? '...' : label}
        </span>
      </button>
      {(costDescription || fullDescription) && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 px-3 py-2 bg-[#050505] border border-emerald-900 rounded-sm shadow-lg 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 
                       w-64 text-center whitespace-normal 
                       ${tooltipPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
        >
          <p className="text-[10px] text-emerald-700 uppercase tracking-tighter">
            {cost && <span className="text-amber-500 font-bold">{costDescription}</span>}
            {fullDescription}
          </p>
        </div>
      )}
    </div>
  );
};

// Memoize to prevent re-render when props haven't meaningfully changed
// Most ActionButtons remain static except for disabled state changes
export default memo(ActionButtonComponent, (prevProps, nextProps) => {
  return (
    prevProps.label === nextProps.label &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.cooldown === nextProps.cooldown &&
    prevProps.cost?.value === nextProps.cost?.value &&
    prevProps.cost?.label === nextProps.cost?.label &&
    prevProps.description === nextProps.description &&
    prevProps.className === nextProps.className
    // Note: onClick is intentionally not compared as it's typically a stable reference
  );
});
