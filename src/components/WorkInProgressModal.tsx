import React from 'react';

interface WorkInProgressModalProps {
  onClose: () => void;
}

const WorkInProgressModal: React.FC<WorkInProgressModalProps> = ({ onClose }) => {
  return (
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[150] p-8 bg-black border-4 border-emerald-400 shadow-2xl shadow-emerald-500/20 max-w-md w-full text-center">
      <h2 className="text-3xl font-black text-emerald-300 flicker tracking-tighter mb-4">
        SYSTEM NOTICE
      </h2>
      <div className="space-y-4 mb-8">
        <p className="text-emerald-500 text-sm uppercase tracking-widest font-bold">
          Active Development In Progress
        </p>
        <p className="text-emerald-600/80 text-xs tracking-wider leading-relaxed">
          This system is currently under heavy construction. Expect frequent updates, visual
          glitches, and potential instability as we optimize the core protocols.
        </p>
      </div>

      <button
        onClick={onClose}
        className="px-8 py-3 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/50 hover:border-emerald-400 text-emerald-400 font-bold tracking-widest text-xs uppercase transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black"
      >
        Initialize
      </button>
    </div>
  );
};

export default WorkInProgressModal;
