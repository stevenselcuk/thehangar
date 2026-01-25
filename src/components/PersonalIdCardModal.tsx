import React from 'react';
import { GameState } from '../types.ts';

const PersonalIdCardModal: React.FC<{ state: GameState; onClose: () => void }> = ({
  state,
  onClose,
}) => {
  const { sanity } = state.resources;
  const { clearanceLevel } = state.hfStats;

  let photoFilter = 'grayscale(1) brightness(0.7) contrast(1.3)';
  if (sanity < 50) {
    photoFilter += ' blur(0.5px) opacity(0.9)';
  }
  if (sanity < 20) {
    photoFilter += ' blur(1.5px) contrast(2)';
  }

  const getClearanceText = (level: number) => {
    switch (level) {
      case 1:
        return 'LEVEL 1 (General)';
      case 2:
        return 'LEVEL 2 (Restricted)';
      case 3:
        return 'LEVEL 3 (Classified)';
      case 4:
        return 'LEVEL 4 (Redacted)';
      default:
        return 'LEVEL 0 (Revoked)';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content !p-8 !max-w-xl !border-zinc-700 bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full bg-zinc-300 p-6 rounded-lg shadow-2xl flex space-x-6">
          {/* Photo */}
          <div className="flex-shrink-0">
            <div className="w-32 h-40 relative border-4 border-zinc-400 bg-zinc-500">
              <img
                src="/images/photo.png"
                alt="Employee ID photo"
                style={{ filter: photoFilter }}
                className="w-full h-full object-cover"
              />
              {sanity < 20 && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-4xl text-white font-black flicker">?</div>
                </div>
              )}
            </div>
          </div>
          {/* Details */}
          <div className="flex-grow text-zinc-800 font-mono">
            <div className="border-b-2 border-red-700 pb-1 mb-3">
              <h3 className="text-xs text-red-800 font-bold">PROPERTY OF WALKER & MORLEY</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase text-zinc-500">NAME</p>
                <p className="text-lg font-bold tracking-wider">[REDACTED]</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-zinc-500">EMPLOYEE ID</p>
                <p className="text-lg font-bold tracking-wider">770-M-9M-MRO</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-zinc-500">TITLE</p>
                <p className="text-sm font-semibold">Mechanic, Night Shift</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-zinc-500">CLEARANCE</p>
                <p
                  className={`text-sm font-bold ${clearanceLevel > 1 ? 'text-red-700 animate-pulse' : ''}`}
                >
                  {getClearanceText(clearanceLevel)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalIdCardModal;
