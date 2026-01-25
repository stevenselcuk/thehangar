import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  className = '',
  delay = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; position: 'top' | 'bottom' }>({
    top: 0,
    left: 0,
    position: 'top',
  });
  const [xAdjustment, setXAdjustment] = useState(0);

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;

    // Default to top, but flip if too close to top edge
    // Threshold: 50px for tooltip height
    const showBelow = rect.top < 50;

    // Center horizontally
    // logic will be handled by CSS transform translate-x-1/2,
    // we just give the center point
    const left = rect.left + rect.width / 2;

    let top;
    if (showBelow) {
      top = rect.bottom + scrollY + 8; // 8px gap
    } else {
      top = rect.top + scrollY - 8;
    }

    setCoords({
      top,
      left,
      position: showBelow ? 'bottom' : 'top',
    });
  };

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      updatePosition();
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
    setXAdjustment(0); // Reset adjustment on close
  };

  // Update position on scroll/resize while visible
  useEffect(() => {
    if (isVisible) {
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible]);

  // Handle edge detection and adjustment
  useLayoutEffect(() => {
    if (isVisible && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const padding = 12; // Safety margin from screen edge
      const windowWidth = window.innerWidth;

      let adjustment = 0;

      // Check left overflow
      if (rect.left < padding) {
        adjustment = padding - rect.left;
      }
      // Check right overflow
      else if (rect.right > windowWidth - padding) {
        adjustment = windowWidth - padding - rect.right;
      }

      if (adjustment !== 0) {
        setXAdjustment((prev) => prev + adjustment);
      }
    }
  }, [isVisible, coords]); // Re-run when visible or coords change

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-block ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {isVisible &&
        content &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`fixed pointer-events-none z-[9999] px-3 py-2 bg-[#050505] border border-emerald-900 rounded-sm shadow-lg text-center whitespace-normal w-max max-w-xs transition-opacity duration-200 animate-in fade-in zoom-in-95`}
            style={{
              top: coords.top,
              left: coords.left,
              transform: `translate(calc(-50% + ${xAdjustment}px), ${coords.position === 'top' ? '-100%' : '0'})`,
            }}
          >
            {typeof content === 'string' ? (
              <p className="text-[10px] text-emerald-700 uppercase tracking-tighter">{content}</p>
            ) : (
              content
            )}
          </div>,
          document.body
        )}
    </>
  );
};
