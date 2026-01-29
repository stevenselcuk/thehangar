import React from 'react';
import { Notification, NotificationVariant } from '../../context/NotificationContext';

interface Props {
  notification: Notification;
  onClose: (id: string) => void;
}

const SystemNotification: React.FC<Props> = ({ notification, onClose }) => {
  const { id, title, message, variant = 'default', actions = [], isExiting } = notification;

  const getVariantStyles = (v: NotificationVariant) => {
    switch (v) {
      case 'danger':
      case 'hazard':
        return {
          border: 'border-red-500',
          bg: 'bg-red-950/95',
          text: 'text-red-500',
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
          subText: 'text-red-300',
        };
      case 'warning':
        return {
          border: 'border-amber-500',
          bg: 'bg-amber-950/95',
          text: 'text-amber-500',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
          subText: 'text-amber-300',
        };
      case 'success':
      case 'levelup':
        return {
          border: 'border-cyan-400',
          bg: 'bg-cyan-950/95',
          text: 'text-cyan-300',
          glow: 'shadow-[0_0_20px_rgba(34,211,238,0.4)]',
          subText: 'text-cyan-400/80',
        };
      case 'system':
        return {
          border: 'border-emerald-400',
          bg: 'bg-black/95',
          text: 'text-emerald-300',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
          subText: 'text-emerald-500',
        };
      case 'info':
      case 'default':
      default:
        return {
          border: 'border-emerald-600',
          bg: 'bg-[#0a0a0a]/95',
          text: 'text-emerald-500',
          glow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]',
          subText: 'text-emerald-600/80',
        };
    }
  };

  const styles = getVariantStyles(variant);

  // Transition classes
  const transitionClass = isExiting ? 'translate-x-[120%] opacity-0' : 'translate-x-0 opacity-100';

  return (
    <div
      className={`
        relative w-full max-w-[380px] md:w-[380px] pointer-events-auto
        transition-all duration-300 ease-in-out transform
        ${transitionClass}
        mb-3 last:mb-0
      `}
      role="alert"
    >
      <div
        className={`
          relative overflow-hidden
          border-l-4 ${styles.border} 
          ${styles.bg} 
          ${styles.glow}
          p-4 shadow-xl backdrop-blur-md
        `}
      >
        {/* Scanline effect */}
        <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay"></div>

        {/* Close Button */}
        <button
          onClick={() => onClose(id)}
          className={`absolute top-2 right-2 p-1 opacity-50 hover:opacity-100 transition-opacity ${styles.text}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex flex-col">
          <h3 className={`text-sm font-black tracking-widest uppercase mb-1 ${styles.text}`}>
            {title}
          </h3>

          <div className={`text-xs font-semibold tracking-wide ${styles.subText}`}>{message}</div>

          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.onClick}
                  className={`
                    px-3 py-1 border text-[10px] uppercase font-bold tracking-wider transition-all
                    hover:bg-opacity-20 bg-transparent
                    ${
                      action.variant === 'danger'
                        ? 'border-red-500 text-red-400 hover:bg-red-500'
                        : `border-${styles.border.split('-')[1]}-500 text-${styles.text.split('-')[1]}-400 hover:bg-${styles.text.split('-')[1]}-500`
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemNotification;
