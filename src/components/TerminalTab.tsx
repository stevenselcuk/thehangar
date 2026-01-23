import React from 'react';
import { GameState } from '../types.ts';
import ActionButton from './ActionButton.tsx';

const TerminalTab: React.FC<{
  state: GameState;
  onAction: (t: string, p?: Record<string, unknown>) => void;
}> = ({ onAction }) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-emerald-900/30 pb-2">
        <h3 className="text-xs text-emerald-700 uppercase tracking-widest">Passenger Terminal B</h3>
      </div>

      <div className="p-6 border border-emerald-900/40 bg-zinc-950/20">
        <h4 className="text-[11px] text-emerald-800 uppercase mb-6 font-bold tracking-widest">
          Public Access Zone
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <ActionButton
            label="Watch Departure Boards"
            onClick={() => onAction('WATCH_BOARDS')}
            cost={{ label: 'FOCUS', value: 5 }}
            description="The flickering green text is a river of souls, all flowing away from this place."
          />
          <ActionButton
            label="Go to Restroom"
            onClick={() => onAction('GO_TERMINAL_RESTROOM')}
            cooldown={30000}
            description="Splash some cold water on your face. Try not to look in the mirror for too long."
          />
          <ActionButton
            label="Eat Terminal Burger"
            onClick={() => onAction('EAT_TERMINAL_BURGER')}
            description="It's grey but filling. Recovers Focus and Sanity."
          />
          <ActionButton
            label="Small Talk (Personnel)"
            onClick={() => onAction('SMALL_TALK_PERSONNEL')}
            cost={{ label: 'FOCUS', value: 5 }}
            description="Chat with gate agents or flight crews. They see things, too."
          />
          <ActionButton
            label="Offer Assistance to Passenger"
            onClick={() => onAction('OFFER_ASSISTANCE')}
            cost={{ label: 'FOCUS', value: 10 }}
            description="HIGH RISK. A lost-looking passenger is staring at the departure board. Helping them is a risk, but they might have seen something."
            className="border-amber-800 text-amber-500"
          />
          <ActionButton
            label="Use Payphone"
            onClick={() => onAction('USE_PAYPHONE')}
            cost={{ label: 'CR', value: 5 }}
            cooldown={45000}
            description="An old, dusty payphone. Who would you even call? Maybe just listening to the dial tone will help."
          />
          <ActionButton
            label="Check 'Delayed' Gate"
            onClick={() => onAction('CHECK_DELAYED_GATE')}
            cost={{ label: 'SANITY', value: 25 }}
            description="HIGH RISK. Go to gate B13, where flight MH370 is still listed as 'Delayed'. It's always cold there."
            className="border-purple-800 text-purple-500"
          />
          <ActionButton
            label="Inspect Broken Vending Machine"
            onClick={() => onAction('INSPECT_VENDING_MACHINE')}
            cost={{ label: 'FOCUS', value: 10 }}
            description="An old, unplugged vending machine sits near the restrooms. Check the coin return."
          />
        </div>
        <div className="mt-6 border-t border-emerald-900/30 pt-4">
          <ActionButton
            label="Sleep at Gate"
            onClick={() => onAction('SLEEP_AT_GATE')}
            cooldown={2000}
            onStart={() => onAction('START_NAP_VISUAL', { duration: 2000 })}
            description="Find an empty row of seats and drift off. Restores Focus and Sanity, but increases Suspicion."
            className="border-amber-800 text-amber-500"
          />
        </div>

        <p className="mt-6 text-[9px] text-emerald-900 uppercase italic leading-relaxed border-t border-emerald-900/10 pt-4">
          The terminal is a ghost town at this hour. The only sounds are the hum of the floor
          polishers and the distant, automated announcements for flights that will never depart.
        </p>
      </div>
    </div>
  );
};

export default TerminalTab;
