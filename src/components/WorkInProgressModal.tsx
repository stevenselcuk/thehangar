import React from 'react';
import SystemModal from './common/SystemModal';

interface WorkInProgressModalProps {
  onClose: () => void;
}

const WorkInProgressModal: React.FC<WorkInProgressModalProps> = ({ onClose }) => {
  return (
    <SystemModal
      isOpen={true}
      onClose={onClose}
      variant="system"
      title="SYSTEM NOTICE"
      actions={[{ label: 'Initialize', onClick: onClose, variant: 'secondary' }]}
    >
      <div className="space-y-4">
        <p className="text-emerald-500 text-sm uppercase tracking-widest font-bold">
          Active Development In Progress
        </p>
        <p className="text-emerald-600/80 text-xs tracking-wider leading-relaxed">
          This system is currently under heavy construction. Expect frequent updates, visual
          glitches, and potential instability as we optimize the core protocols.
        </p>
      </div>
    </SystemModal>
  );
};

export default WorkInProgressModal;
