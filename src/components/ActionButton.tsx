import React, { memo, useEffect, useState } from 'react';
import { Tooltip } from './common/Tooltip';

export interface ActionButtonProps {
  label: string;
  onClick: () => void;
  onStart?: () => void;
  cooldown?: number;
  disabled?: boolean;
  cost?: { label: string; value: number };
  description?: string;
  className?: string;
  sanity?: number; // Added sanity prop
}

const playClick = () => {
  const audio = new Audio('/sounds/ui_click.mp3');
  audio.volume = 0.3;
  audio.play().catch(() => {});
};

// Haunted Label Hook
const useHauntedLabel = (originalLabel: string, sanity: number = 100) => {
  const [glitchLabel, setGlitchLabel] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered || sanity >= 40) {
      return;
    }

    const interval = setInterval(() => {
      // 30% chance per check while hovering
      if (Math.random() < 0.3) {
        const creepyLabels = [
          'FEED IT',
          'RUN',
          "DON'T",
          'SUBMIT',
          'IT SEES',
          'NO HOPE',
          'DIE',
          'ESCAPE',
        ];
        const randomLabel = creepyLabels[Math.floor(Math.random() * creepyLabels.length)];
        setGlitchLabel(randomLabel);

        // Revert back quickly
        setTimeout(() => setGlitchLabel(null), 150);
      }
    }, 500);

    return () => {
      clearInterval(interval);
      setGlitchLabel(null);
    };
  }, [isHovered, sanity]);

  // Derived state: if high sanity, always show original. Else show glitch if active, or original.
  const displayLabel = sanity >= 40 || !glitchLabel ? originalLabel : glitchLabel;

  return { displayLabel, setIsHovered };
};

// -- Exponential Backoff & Spam Prevention --
interface SpamState {
  tier: number;
  rapidClicks: number;
  lastClickTime: number;
  lockedUntil: number;
}
const spamRegistry: Record<string, SpamState> = {};

const SPAM_THRESHOLD_MS = 2000;
const CLICKS_TO_ESCALATE = 5;
const TIER_DURATIONS = [0, 16000, 32000, 64000];
const MAX_TIER = TIER_DURATIONS.length - 1;
const RESET_IDLE_TIME = 60000;

const ActionButtonComponent: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  onStart,
  cooldown = 0,
  disabled = false,
  cost,
  description,
  className = '',
  sanity = 100, // Default to 100 if not provided
}) => {
  const [active, setActive] = useState(false);
  const { displayLabel, setIsHovered } = useHauntedLabel(label, sanity);
  const [isSpamLocked, setIsSpamLocked] = useState(() => {
    const state = spamRegistry[label];
    return state && state.lockedUntil > Date.now();
  });
  const [spamLockRemaining, setSpamLockRemaining] = useState(() => {
    const state = spamRegistry[label];
    return state && state.lockedUntil > Date.now()
      ? Math.ceil((state.lockedUntil - Date.now()) / 1000)
      : 0;
  });

  // Countdown interval when locked
  useEffect(() => {
    let interval: number;
    if (isSpamLocked) {
      interval = setInterval(() => {
        const state = spamRegistry[label];
        if (state && state.lockedUntil > Date.now()) {
          setSpamLockRemaining(Math.ceil((state.lockedUntil - Date.now()) / 1000));
        } else {
          setIsSpamLocked(false);
          setSpamLockRemaining(0);
          clearInterval(interval);
        }
      }, 500) as unknown as number;
    }
    return () => clearInterval(interval);
  }, [isSpamLocked, label]);

  const handleClick = () => {
    if (disabled || active || isSpamLocked) return;

    const now = Date.now();
    const state = spamRegistry[label] || {
      tier: 0,
      rapidClicks: 0,
      lastClickTime: 0,
      lockedUntil: 0,
    };

    if (state.lockedUntil > now) {
      setIsSpamLocked(true);
      setSpamLockRemaining(Math.ceil((state.lockedUntil - Date.now()) / 1000));
      return;
    }

    if (now - Math.max(state.lastClickTime, state.lockedUntil) > RESET_IDLE_TIME) {
      state.tier = 0;
      state.rapidClicks = 0;
    }

    if (now - Math.max(state.lastClickTime, state.lockedUntil) < SPAM_THRESHOLD_MS) {
      state.rapidClicks++;
      if (state.rapidClicks >= CLICKS_TO_ESCALATE) {
        state.tier++;
        if (state.tier > MAX_TIER) {
          window.dispatchEvent(new CustomEvent('action-spam-penalty'));
          state.tier = 0;
          state.rapidClicks = 0;
          state.lockedUntil = 0;

          state.lastClickTime = now;
          spamRegistry[label] = state;
          return;
        } else {
          state.lockedUntil = now + TIER_DURATIONS[state.tier];
          state.rapidClicks = 0;
          setIsSpamLocked(true);
          setSpamLockRemaining(Math.ceil((state.lockedUntil - Date.now()) / 1000));

          state.lastClickTime = now;
          spamRegistry[label] = state;
          return;
        }
      }
    } else {
      state.rapidClicks = 1;
    }

    state.lastClickTime = now;
    spamRegistry[label] = state;

    playClick();

    if (cooldown > 0) {
      if (onStart) onStart();
      setActive(true);

      // Use setTimeout to trigger completion, while CSS handles the visual animation
      setTimeout(() => {
        setActive(false);
        onClick();
      }, cooldown);
    } else {
      onClick();
    }
  };

  const costDescription = cost ? `[COST: ${cost.value} ${cost.label}] ` : '';
  const fullDescription = description || '';
  const tooltipContent =
    costDescription || fullDescription ? (
      <p className="text-[10px] text-emerald-700 uppercase tracking-tighter">
        {cost && <span className="text-amber-500 font-bold">{costDescription}</span>}
        {fullDescription}
      </p>
    ) : null;

  const buttonContent = (
    <div className={`group relative mb-4 ${className}`}>
      <button
        onClick={handleClick}
        disabled={disabled || active || isSpamLocked}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-full relative h-12 border border-emerald-900 bg-transparent overflow-hidden 
            ${disabled || isSpamLocked ? 'opacity-30 cursor-not-allowed' : 'hover:border-emerald-400 hover:bg-emerald-950/20 active:translate-y-0.5'}
          `}
      >
        <div
          className="absolute left-0 top-0 h-full bg-emerald-900/40"
          style={{
            width: active ? '100%' : '0%',
            transition: active ? `width ${cooldown}ms linear` : 'none',
          }}
        />
        <span
          className={`relative z-10 font-bold uppercase tracking-widest text-sm ${displayLabel !== label || isSpamLocked ? 'text-red-500 flicker' : ''}`}
        >
          {isSpamLocked ? `LOCKED: ${spamLockRemaining}s` : active ? '...' : displayLabel}
        </span>
      </button>
    </div>
  );

  if (tooltipContent) {
    return (
      <Tooltip content={tooltipContent} className="block w-full">
        {buttonContent}
      </Tooltip>
    );
  }

  return buttonContent;
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
    prevProps.className === nextProps.className &&
    prevProps.sanity === nextProps.sanity
    // Note: onClick and onStart are intentionally not compared
  );
});
