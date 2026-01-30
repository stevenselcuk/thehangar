import React from 'react';
import SystemModal from './common/SystemModal';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  imagePath: string;
  title?: string;
  description?: string;
}

const PhotoModal: React.FC<PhotoModalProps> = ({
  isOpen,
  onClose,
  imagePath,
  title = 'EVIDENCE RECOVERED',
  description = 'ARCHIVE RETRIEVAL SUCCESSFUL',
}) => {
  return (
    <SystemModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant="warning"
      isBlocking={true}
      actions={[{ label: 'STORE IN ARCHIVES', onClick: onClose, variant: 'secondary' }]}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative border border-amber-900/40 p-2 bg-black/60 shadow-[0_0_15px_rgba(0,0,0,0.7)] backdrop-blur-sm">
          <img
            src={imagePath}
            alt="Recovered Artifact"
            className="max-w-full max-h-[60vh] object-contain filter sepia-[0.6] contrast-[1.2] brightness-[0.9] opacity-90"
          />
          {/* Scanline overlay for image */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%] mix-blend-overlay"></div>
          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)] z-20 pointer-events-none"></div>
        </div>
        <div className="w-full border-t border-amber-900/30 pt-3">
          <p className="text-amber-500/70 text-[10px] uppercase tracking-[0.2em] font-mono text-center leading-relaxed">
            {description}
          </p>
          <p className="text-amber-900/40 text-[8px] uppercase tracking-widest font-mono text-center mt-2 animate-pulse">
            -- CLASSIFIED MATERIAL - DO NOT DISTRIBUTE --
          </p>
        </div>
      </div>
    </SystemModal>
  );
};

export default PhotoModal;
