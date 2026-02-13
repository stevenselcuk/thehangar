import React, { useState } from 'react';
import { GameState, RotableItem } from '../types.ts';
import ActionButton from './ActionButton.tsx';

interface ComponentInspectionModalProps {
  state: GameState;
  onClose: () => void;
  onAction: (type: string, payload?: Record<string, unknown>) => void;
}

const ComponentInspectionModal: React.FC<ComponentInspectionModalProps> = ({
  state,
  onClose,
  onAction,
}) => {
  const [selectedRotable, setSelectedRotable] = useState<RotableItem | null>(null);

  const rotables =
    (state.activeAircraft?.installedRotables
      .map((rId) => state.rotables.find((r) => r.id === rId))
      .filter(Boolean) as RotableItem[]) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl h-[85vh] bg-zinc-900 border-2 border-amber-900/50 flex flex-col shadow-[0_0_60px_rgba(245,158,11,0.1)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-amber-900/30 bg-black/40">
          <div className="flex items-center gap-3">
            <span className="text-amber-500 font-bold text-lg font-mono">[INSPECTION]</span>
            <div>
              <h2 className="text-xl font-bold text-amber-400 uppercase tracking-widest">
                Component Provenance System
              </h2>
              <p className="text-xs text-amber-700 font-mono">TRACEABILITY_MATRIX_LOADED</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-900/20 text-amber-600 hover:text-amber-400 transition-colors font-mono font-bold"
          >
            [CLOSE]
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* List of Components */}
          <div className="w-1/3 border-r border-amber-900/30 overflow-y-auto bg-black/20">
            <div className="p-3 bg-amber-950/20 border-b border-amber-900/20 text-xs font-bold text-amber-500 uppercase">
              Installed Components
            </div>
            {rotables.length === 0 ? (
              <div className="p-4 text-amber-800 text-xs italic">
                No rotables detected on this aircraft.
              </div>
            ) : (
              rotables.map((rotable) => (
                <div
                  key={rotable.id}
                  onClick={() => setSelectedRotable(rotable)}
                  className={`p-4 border-b border-amber-900/10 cursor-pointer hover:bg-amber-900/10 transition-colors ${selectedRotable?.id === rotable.id ? 'bg-amber-900/20 border-l-4 border-l-amber-500' : ''}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-xs font-bold ${rotable.isUntraceable ? 'text-red-400' : 'text-amber-200'}`}
                    >
                      {rotable.label}
                    </span>
                    {rotable.isUntraceable && (
                      <span className="text-[10px] bg-red-950 text-red-500 px-1 rounded">
                        SUSPECT
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>P/N: {rotable.pn}</span>
                    <span>S/N: {rotable.sn}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Details View */}
          <div className="flex-1 overflow-y-auto bg-[url('/grid_pattern.png')] bg-repeat p-6 relative">
            {selectedRotable ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl text-amber-100 font-bold uppercase tracking-wider mb-1">
                      {selectedRotable.label}
                    </h3>
                    <div className="flex gap-4 text-xs font-mono text-amber-600">
                      <span>
                        P/N: <span className="text-amber-300">{selectedRotable.pn}</span>
                      </span>
                      <span>
                        S/N: <span className="text-amber-300">{selectedRotable.sn}</span>
                      </span>
                      <span>
                        DOM:{' '}
                        <span className="text-amber-300">
                          {new Date(selectedRotable.manufactureDate).getFullYear()}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-500 uppercase">Condition</div>
                    <div
                      className={`text-xl font-bold ${selectedRotable.condition < 50 ? 'text-red-500' : 'text-emerald-500'}`}
                    >
                      {selectedRotable.condition.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4 border-y border-amber-900/30 py-4">
                  <ActionButton
                    label="Research History"
                    onClick={() =>
                      onAction('RESEARCH_COMPONENT_HISTORY', { rotableId: selectedRotable.id })
                    }
                    cost={{ label: 'FOCUS', value: 5 }}
                    description="Dig into the archives. Verify the chain of custody."
                  />
                  {selectedRotable.isUntraceable && (
                    <ActionButton
                      label="Fabricate Paperwork"
                      onClick={() =>
                        onAction('FABRICATE_PAPERWORK', { rotableId: selectedRotable.id })
                      }
                      cost={{ label: 'SUSPICION', value: 10 }}
                      disabled={state.resources.experience < 2000}
                      description={
                        state.resources.experience < 2000
                          ? 'LOCKED: Requires 2000 XP'
                          : "Forge Form 8130-3. Clears 'Untraceable' status but leaves a permanent mark."
                      }
                      className="border-red-800 text-red-400 hover:bg-red-950/30"
                    />
                  )}
                </div>

                {/* History Log */}
                <div>
                  <h4 className="text-sm text-amber-500 font-bold uppercase tracking-widest mb-4 border-b border-amber-900/30 pb-2">
                    Event Log / Chain of Custody
                  </h4>
                  <div className="space-y-0">
                    {selectedRotable.history.length === 0 ? (
                      <div className="text-zinc-500 italic text-sm">No recorded history.</div>
                    ) : (
                      [...selectedRotable.history].reverse().map((entry, idx) => (
                        <div key={idx} className="flex gap-4 relative pb-6 last:pb-0">
                          {/* Timeline Line */}
                          <div className="absolute left-[5.5rem] top-2 bottom-0 w-px bg-amber-900/30" />

                          {/* Date */}
                          <div className="w-20 text-right text-[10px] font-mono text-amber-700 pt-0.5">
                            {new Date(entry.date).toLocaleDateString()}
                          </div>

                          {/* Dot */}
                          <div
                            className={`relative z-10 w-2 h-2 rounded-full mt-1.5 ${
                              entry.event === 'INCIDENT'
                                ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                                : entry.event === 'FALSIFIED'
                                  ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                                  : 'bg-amber-600'
                            }`}
                          />

                          {/* Content */}
                          <div className="flex-1 pb-1">
                            <div className="flex justify-between items-start">
                              <span
                                className={`text-xs font-bold uppercase ${
                                  entry.event === 'INCIDENT'
                                    ? 'text-red-400'
                                    : entry.event === 'FALSIFIED'
                                      ? 'text-purple-400'
                                      : 'text-amber-300'
                                }`}
                              >
                                {entry.event}
                              </span>
                              {(entry.aircraftStart || entry.aircraftEnd) && (
                                <span className="text-[9px] font-mono text-zinc-500 border border-zinc-800 px-1 rounded">
                                  {entry.aircraftStart ? `FROM: ${entry.aircraftStart}` : ''}
                                  {entry.aircraftEnd ? `TO: ${entry.aircraftEnd}` : ''}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-amber-100/80 mt-1 leading-relaxed">
                              {entry.description}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-amber-800/50">
                <span className="text-4xl mb-4">⚠</span>
                <p className="uppercase tracking-widest font-bold">Select a component to inspect</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentInspectionModal;
