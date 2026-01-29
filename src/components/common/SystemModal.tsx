import React, { useEffect, useState } from 'react';

/**
 * Variants control the color scheme and urgency of the modal.
 * - default/info: Standard green system colors.
 * - warning: Amber/Orange for cautions.
 * - danger/hazard: Red for critical alerts.
 * - success/levelup: Cyan/Green for positive feedback.
 * - system: Special styling for system level notices.
 */
export type SystemModalVariant =
  | 'default'
  | 'info'
  | 'warning'
  | 'danger'
  | 'hazard'
  | 'success'
  | 'levelup'
  | 'system';

export interface SystemModalAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface SystemModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  variant?: SystemModalVariant;
  /**
   * If true, renders a backdrop and blocks interaction with the rest of the app.
   * If false, renders as an overlay (toast/notification style) that allows interaction behind it (unless pointer-events-auto is needed).
   * Default: true
   */
  isBlocking?: boolean;
  /**
   * Position of the modal. CENTER is default for blocking modals.
   * TOP is common for warnings/toasts.
   */
  position?: 'center' | 'top';
  children?: React.ReactNode;
  actions?: SystemModalAction[];
  /**
   * Auto-close duration in ms. If 0, does not auto-close.
   */
  autoCloseDuration?: number;
  /**
   * Optional sub-message or footer text
   */
  footerText?: string;
  className?: string;
}

const SystemModal: React.FC<SystemModalProps> = ({
  isOpen,
  onClose,
  title,
  variant = 'default',
  isBlocking = true,
  position = 'center',
  children,
  actions = [],
  autoCloseDuration = 0,
  footerText,
  className = '',
}) => {
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && autoCloseDuration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDuration, onClose]);

  if (!visible && !isOpen) return null;

  // --- STYLES ---

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
      case 'hazard':
        return {
          border: 'border-red-500',
          bg: 'bg-red-950/90',
          text: 'text-red-500',
          glow: 'shadow-[0_0_30px_rgba(239,68,68,0.2)]',
          subText: 'text-red-400',
        };
      case 'warning':
        return {
          border: 'border-amber-500',
          bg: 'bg-amber-950/90',
          text: 'text-amber-500',
          glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]',
          subText: 'text-amber-400',
        };
      case 'success':
      case 'levelup':
        return {
          border: 'border-cyan-400',
          bg: 'bg-cyan-950/90',
          text: 'text-cyan-300',
          glow: 'shadow-[0_0_30px_rgba(34,211,238,0.3)]',
          subText: 'text-cyan-400',
        };
      case 'system':
        return {
          border: 'border-emerald-400',
          bg: 'bg-black',
          text: 'text-emerald-300',
          glow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
          subText: 'text-emerald-500',
        };
      case 'info':
      case 'default':
      default:
        return {
          border: 'border-emerald-600',
          bg: 'bg-black/95',
          text: 'text-emerald-500',
          glow: 'shadow-[0_0_30px_rgba(16,185,129,0.1)]',
          subText: 'text-emerald-600/80',
        };
    }
  };

  const styles = getVariantStyles();

  // Position classes
  const positionClasses =
    position === 'center'
      ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
      : 'top-20 left-1/2 -translate-x-1/2';

  // Backdrop
  const backdrop = isBlocking ? (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
    />
  ) : null;

  return (
    <>
      {backdrop}
      <div
        className={`
          fixed z-[150] transition-all duration-300 transform 
          ${positionClasses} 
          ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          ${isBlocking ? '' : 'pointer-events-none'} 
          ${className}
        `}
      >
        <div
          className={`
          relative overflow-hidden 
          min-w-[300px] max-w-md w-full 
          border-4 ${styles.border} 
          ${styles.bg} 
          ${styles.glow}
          p-8 text-center
          backdrop-blur-md
          pointer-events-auto
        `}
        >
          {/* Scanline effect overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"></div>

          {title && (
            <h2
              className={`text-2xl font-black tracking-tighter uppercase mb-4 flicker ${styles.text}`}
            >
              {title}
            </h2>
          )}

          <div className={`text-sm font-bold uppercase tracking-wider ${styles.subText} mb-6`}>
            {children}
          </div>

          {actions.length > 0 && (
            <div className="flex justify-center gap-4 mt-6">
              {actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.onClick}
                  className={`
                    px-6 py-2 border font-bold uppercase tracking-widest text-xs transition-all duration-200
                    active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
                    ${
                      action.variant === 'danger'
                        ? 'border-red-500 text-red-500 hover:bg-red-900/50 focus:ring-red-500'
                        : `border-${styles.border.split('-')[1]}-500 text-${styles.text.split('-')[1]}-400 hover:bg-${styles.bg.split('-')[1]}-900/50 focus:ring-${styles.border.split('-')[1]}-500`
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {footerText && (
            <div
              className={`mt-4 text-[10px] uppercase tracking-[0.2em] opacity-60 ${styles.subText}`}
            >
              {footerText}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SystemModal;
