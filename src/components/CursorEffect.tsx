import React, { useEffect, useRef } from 'react';

const CursorEffect: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        // Update CSS variables for performance
        cursorRef.current.style.setProperty('--x', `${e.clientX}px`);
        cursorRef.current.style.setProperty('--y', `${e.clientY}px`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{
        zIndex: 0,
        background: `radial-gradient(
          800px circle at var(--x, 50%) var(--y, 50%), 
          rgba(16, 185, 129, 0.02), 
          transparent 50%
        )`,
      }}
    >
      <div
        className="absolute w-full h-full"
        style={{
          background: `radial-gradient(
              150px circle at var(--x, 50%) var(--y, 50%),
              rgba(52, 211, 153, 0.04),
              transparent 60%
            )`,
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
};

export default CursorEffect;
