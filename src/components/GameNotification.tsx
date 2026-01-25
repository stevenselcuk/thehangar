import React, { useEffect, useState } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'hazard' | 'levelup';

interface Props {
  type: NotificationType;
  title: string;
  message?: string;
  visible: boolean;
  onClose?: () => void;
  duration?: number;
}

const GameNotification: React.FC<Props> = ({
  type,
  title,
  message,
  visible,
  onClose,
  duration = 4000,
}) => {
  const [isVisible, setIsVisible] = useState(visible);

  // Sync internal state with prop
  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  // Auto-hide timer
  useEffect(() => {
    if (isVisible && onClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  // Style configurations based on type
  const getStyles = () => {
    switch (type) {
      case 'levelup':
        return {
          container: 'bg-black border-4 border-emerald-400 shadow-2xl shadow-emerald-500/20',
          title: 'text-emerald-300 flicker',
          message: 'text-emerald-500',
        };
      case 'hazard':
        return {
          container:
            'bg-red-950/90 border-2 border-red-500 shadow-2xl animate-pulse backdrop-blur-sm',
          title: 'text-red-500 flicker',
          message: 'text-red-300/70',
        };
      case 'warning':
        return {
          container: 'bg-amber-950/80 border-2 border-amber-500 shadow-xl backdrop-blur-sm',
          title: 'text-amber-500',
          message: 'text-amber-300/70',
        };
      case 'success':
        return {
          container: 'bg-emerald-950/80 border-2 border-emerald-500 shadow-xl',
          title: 'text-emerald-400',
          message: 'text-emerald-300/80',
        };
      case 'info':
      default:
        return {
          container: 'bg-[#050505] border border-emerald-900 shadow-lg',
          title: 'text-emerald-600',
          message: 'text-emerald-800',
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] p-8 text-center transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'} ${styles.container}`}
    >
      <h2 className={`text-4xl font-black tracking-tighter uppercase ${styles.title}`}>{title}</h2>
      {message && (
        <p className={`mt-2 text-xs uppercase tracking-[0.3em] font-bold ${styles.message}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default GameNotification;
