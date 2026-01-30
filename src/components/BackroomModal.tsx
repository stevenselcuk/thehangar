import React from 'react';
import { itemsData } from '../data/items.ts';
import { GameState } from '../types.ts';
import ActionButton from './ActionButton.tsx';

interface BackroomModalProps {
  state: GameState;
  onAction: (type: string, payload?: Record<string, unknown>) => void;
  onClose: () => void;
}

const BackroomModal: React.FC<BackroomModalProps> = ({ state, onAction, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-zinc-900 border-2 border-emerald-900/50 flex flex-col shadow-[0_0_50px_rgba(16,185,129,0.05)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-emerald-900/30 bg-black/40">
          <div>
            <h2 className="text-xl font-bold text-emerald-400 uppercase tracking-widest">
              [BACKROOM]
            </h2>
            <p className="text-xs text-emerald-800 font-mono">
              LOCATION_ID: BR-001 // ACCESS: RESTRICTED
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-700 hover:text-emerald-400 font-bold font-mono transition-colors"
          >
            [LEAVE_AREA]
          </button>
        </div>

        {/* Room Description / Atmosphere */}
        <div className="p-6 bg-black/20 border-b border-emerald-900/10">
          <p className="text-emerald-100/80 text-sm font-serif italic mb-4 leading-relaxed">
            The air here is stagnant, thick with the smell of ozone and stale coffee. Dust motes
            dance in the flickering light of a single fluorescent bulb. In the corner, an ancient
            vending machine hums with a low, menacing vibration.
          </p>
          <div className="flex gap-4 text-[10px] font-mono text-emerald-800 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-900 animate-pulse"></span>
              Temp: 24°C
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-900"></span>
              Hum: 88%
            </span>
          </div>
        </div>

        {/* Content / Interactions */}
        <div className="p-4 flex-1 overflow-y-auto max-h-[50vh]">
          <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 border-b border-emerald-900/30 pb-1">
            Room Interactions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vending Machine Section */}
            <div className="space-y-3">
              <div className="p-2 border border-emerald-900/30 bg-emerald-950/5">
                <h4 className="text-[10px] font-bold text-emerald-500 uppercase mb-2">
                  Vending Unit #442
                </h4>
                <div className="space-y-2">
                  {itemsData.consumables.map((item) => (
                    <ActionButton
                      key={item.id}
                      label={`Buy ${item.label}`}
                      onClick={() => onAction('BUY_VENDING_ITEM', { item: item })}
                      cost={{ label: 'CR', value: item.cost }}
                      disabled={state.resources.credits < item.cost}
                      className="text-xs py-1"
                    />
                  ))}
                  <ActionButton
                    label="Kick Machine"
                    onClick={() => onAction('KICK_VENDING_MACHINE')}
                    cost={{ label: 'FOCUS', value: 5 }}
                    description="Percussive maintenance."
                    className="border-red-900/30 hover:bg-red-900/10 text-red-400"
                  />
                </div>
              </div>
            </div>

            {/* Other Room Objects (Flavor/Future Use) */}
            <div className="space-y-3">
              <div className="p-3 border border-emerald-900/30 bg-black/40">
                <h4 className="text-[10px] font-bold text-emerald-500 uppercase mb-2">
                  Notice Board
                </h4>
                <p className="text-[10px] text-zinc-500 italic mb-2">
                  "CLEAN YOUR OWN MESS. THE JANITOR IS NOT YOUR MOTHER."
                </p>
                <p className="text-[10px] text-zinc-600 font-mono">- MGMT</p>
              </div>

              <div className="p-3 border border-emerald-900/30 bg-black/40 opacity-70">
                <h4 className="text-[10px] font-bold text-emerald-700 uppercase mb-2">
                  Stacked Boxes
                </h4>
                <p className="text-[10px] text-zinc-600">
                  Labeled "OBSOLETE" and "DO NOT OPEN". They seem to be sealed with heavy-duty tape.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-emerald-900/30 bg-black/60 text-[10px] text-zinc-600 flex justify-between">
          <span>CREDITS: {state.resources.credits.toFixed(2)}</span>
          <span className="animate-pulse text-emerald-900">SURVEILLANCE ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default BackroomModal;
