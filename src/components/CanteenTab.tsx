import React from 'react';
import { vendingData } from '../data/vending.ts';
import { GameState } from '../types.ts';
import ActionButton from './ActionButton.tsx';

import { locationTriggers } from '../data/locationTriggers';

const CanteenTab: React.FC<{
  state: GameState;
  onAction: (t: string, p?: Record<string, unknown>) => void;
}> = ({ state, onAction }) => {
  React.useEffect(() => {
    // 30% chance to check for triggers on mount to avoid spam
    if (Math.random() > 0.3) return;

    const relevantTriggers = locationTriggers.filter((t) => t.location === 'CANTEEN');
    const trigger = relevantTriggers.find((t) => Math.random() < t.chance);

    if (trigger) {
      onAction('LOG_FLAVOR', { text: trigger.text });
    }
  }, [onAction]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-emerald-900/30 pb-2">
        <h3 className="text-xs text-emerald-700 uppercase tracking-widest">Employee Canteen</h3>
        <div className="text-[10px] font-bold text-emerald-400 bg-emerald-950/30 px-2 py-1 border border-emerald-900">
          CREDITS: ${Math.floor(state.resources.credits)}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Janitor Section */}
        {state.flags.janitorPresent && (
          <div className="p-6 border-2 border-purple-900/70 bg-purple-950/10 animate-pulse">
            <h4 className="text-[11px] text-purple-400 uppercase mb-4 font-bold tracking-widest">
              You are not alone.
            </h4>
            <p className="text-[10px] text-purple-300/80 mb-4">
              The old Janitor is here. He moves with a slow, deliberate rhythm, mopping the same
              spot over and over. He hasn't looked at you yet, but you can feel his presence like a
              cold spot in the air.
            </p>
            <ActionButton
              label="Make Eye Contact with the Janitor"
              onClick={() => onAction('JANITOR_INTERACTION')}
              description="A silent acknowledgment. Unpredictable consequences."
              className="border-purple-600 text-purple-300"
            />
          </div>
        )}

        {/* Vending Section */}
        <div className="p-6 border-2 border-emerald-900 bg-black/40 relative overflow-hidden shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
          <div className="absolute top-0 right-4 h-full w-px bg-emerald-900/10" />
          <h4 className="text-[11px] text-emerald-500 uppercase mb-6 font-bold tracking-widest border-l-4 border-emerald-600 pl-3">
            VENDING UNIT: X4-MODULAR
          </h4>

          <div className="grid grid-cols-1 gap-3">
            {vendingData.map((item) => {
              const currentPrice = state.vendingPrices[item.id] || item.cost;
              return (
                <ActionButton
                  key={item.id}
                  label={item.label}
                  onClick={() => onAction('BUY_VENDING', item)}
                  cost={{ label: 'CR', value: currentPrice }}
                  description={item.description}
                  className="h-auto py-2 text-xs"
                  disabled={state.resources.credits < currentPrice && item.cost > 0}
                />
              );
            })}
          </div>
          <div className="mt-4 text-[7px] text-emerald-900 uppercase font-mono tracking-tighter text-right">
            // MANAGEMENT RESERVES THE RIGHT TO FLUCTUATE PRICING BASED ON DEMAND
          </div>
        </div>

        {/* Downtime Area */}
        <div className="p-6 border border-emerald-900/40 bg-zinc-950/20">
          <h4 className="text-[11px] text-emerald-800 uppercase mb-6 font-bold tracking-widest">
            Downtime Area
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <ActionButton
              label="Sleep on Table"
              onStart={() => onAction('START_NAP_VISUAL', { duration: 2000 })}
              onClick={() => onAction('NAP_TABLE')}
              cooldown={2000}
              description="A deep, dangerous slumber on the grime-slicked tables. The vending machine's hum is your only comfort. +40 Focus, +25 Sanity, +45 Risk."
              className="h-20"
            />
            <ActionButton
              label="Read Old Magazine"
              onClick={() => onAction('READ_MAGAZINE')}
              cooldown={4000}
              description="Kill time with a 4-year-old 'Safety First' issue. +15 Focus, -10 Sanity."
              className="h-20"
            />
            <ActionButton
              label="Talk to 'The Regular'"
              onClick={() => onAction('TALK_TO_REGULAR')}
              cost={{ label: 'FOCUS', value: 10 }}
              description="An old pilot sits in the corner, nursing a coffee. He looks like he's seen a ghost."
              className="h-20"
            />
            <ActionButton
              label="Rummage in Lost & Found"
              onClick={() => onAction('RUMMAGE_LOST_FOUND')}
              cost={{ label: 'FOCUS', value: 5 }}
              description="A dusty box of forgotten items. Mostly junk, but maybe..."
              className="h-20"
            />
          </div>

          <p className="mt-6 text-[9px] text-emerald-900 uppercase italic leading-relaxed border-t border-emerald-900/10 pt-4">
            The fluorescent lights hum with a high-pitched frequency that makes your sinus cavity
            ache. The air smells of stale coffee, copper, and a faint hint of ozone from the nearby
            avionics test bench. In the corner, an old shadow-board is empty, its silhouette of a
            10mm wrench looking like a accusing finger.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CanteenTab;
