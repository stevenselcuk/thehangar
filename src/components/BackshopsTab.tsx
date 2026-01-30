import React from 'react';
import { GameState } from '../types.ts';
import ActionButton from './ActionButton.tsx';

import { locationTriggers } from '../data/locationTriggers';

const BackshopsTab: React.FC<{
  state: GameState;
  onAction: (t: string, p?: Record<string, unknown>) => void;
}> = ({ state, onAction }) => {
  React.useEffect(() => {
    if (Math.random() > 0.3) return;
    const relevantTriggers = locationTriggers.filter((t) => t.location === 'BACKSHOPS');
    const trigger = relevantTriggers.find((t) => Math.random() < t.chance);
    if (trigger) onAction('LOG_FLAVOR', { text: trigger.text });
  }, [onAction]);

  const hasBrokenIdg = state.rotables.some((r) => r.pn === 'IDG-757-A' && r.isRedTagged);
  const hasBrokenHpValve = state.rotables.some((r) => r.pn === 'PRV-ENG-HP1' && r.isRedTagged);
  const hasBrokenAdirs = state.rotables.some((r) => r.pn === 'ADIRS-HG2030' && r.isRedTagged);
  const hasBrokenGalley = state.rotables.some((r) => r.pn === 'BREW-MASTER' && r.isRedTagged);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-zinc-700/30 pb-2">
        <h3 className="text-xs text-zinc-400 uppercase tracking-widest">
          Backshops - Component Overhaul
        </h3>
      </div>
      <p className="text-[10px] text-zinc-500 italic">
        The air here is cold and still, thick with the smell of hydraulic fluid and ozone. The only
        sounds are the hum of a distant transformer and the scuttling of unseen things in the walls.
        Every camera seems to follow you. Nobody works here at night.
      </p>

      {/* Special Projects Section */}
      <div className="p-5 border-2 border-red-900/60 bg-black/40">
        <h4 className="text-[10px] text-red-500 uppercase mb-4 font-bold tracking-widest border-l-2 border-red-600 pl-3">
          Special Projects & Analysis
        </h4>
        <div className="space-y-3">
          <ActionButton
            label="Deconstruct Flight Data Recorder"
            onClick={() => onAction('DECONSTRUCT_FDR')}
            description="EXTREME RISK. Pry open a recovered FDR using a Kardex Fragment as a decryption key. The data within is likely corrupted and dangerous to your mental state."
            disabled={state.resources.kardexFragments < 1}
            className="border-purple-700 text-purple-400"
          />
          <ActionButton
            label="X-Ray Weld Seams"
            onClick={() => onAction('XRAY_WELDS')}
            cost={{ label: 'FOCUS', value: 50 }}
            description="HIGH RISK. Use the industrial X-Ray machine to inspect decommissioned fuselage sections. Sometimes, you find things that shouldn't be there."
            cooldown={60000}
            className="border-amber-800 text-amber-500"
          />
          <ActionButton
            label="Clean 'Containment' ULD"
            onClick={() => onAction('CLEAN_ULD')}
            cost={{ label: 'FOCUS', value: 40 }}
            description="HIGH RISK. A ULD from a 'special' flight needs to be decontaminated. The manifest is redacted. The pay is good, but the risk is unknown."
            cooldown={90000}
          />
        </div>
      </div>

      {/* Hydraulic Shop */}
      <div className="p-5 border border-blue-900/60 bg-blue-950/10">
        <h4 className="text-[10px] text-blue-400 uppercase mb-4 font-bold tracking-widest border-l-2 border-blue-500 pl-3">
          Hydraulic Shop
        </h4>
        <ActionButton
          label="Overhaul IDG"
          onClick={() => onAction('OVERHAUL_IDG')}
          cost={{ label: 'FOCUS', value: 80 }}
          description="Requires a red-tagged IDG and significant resources. A complex, high-reward job."
          disabled={!hasBrokenIdg}
          cooldown={120000}
        />
      </div>

      {/* Pneumatic Shop */}
      <div className="p-5 border border-amber-900/60 bg-amber-950/10">
        <h4 className="text-[10px] text-amber-400 uppercase mb-4 font-bold tracking-widest border-l-2 border-amber-500 pl-3">
          Pneumatic Shop
        </h4>
        <ActionButton
          label="Repair HP Shutoff Valve"
          onClick={() => onAction('REPAIR_HP_VALVE')}
          cost={{ label: 'FOCUS', value: 60 }}
          description="Requires a red-tagged HP Shutoff Valve. Precision work."
          disabled={!hasBrokenHpValve}
          cooldown={90000}
        />
      </div>

      {/* Avionics Shop */}
      <div className="p-5 border border-purple-900/60 bg-purple-950/10">
        <h4 className="text-[10px] text-purple-400 uppercase mb-4 font-bold tracking-widest border-l-2 border-purple-500 pl-3">
          Avionics Shop
        </h4>
        <ActionButton
          label="Reconfigure ADIRS"
          onClick={() => onAction('RECONFIGURE_ADIRS')}
          cost={{ label: 'FOCUS', value: 90 }}
          description="Requires a red-tagged ADIRS. Delicate and dangerous work."
          disabled={!hasBrokenAdirs}
          cooldown={150000}
        />
      </div>

      {/* Battery and Harness Shop */}
      <div className="p-5 border border-zinc-700/60 bg-zinc-950/20">
        <h4 className="text-[10px] text-zinc-400 uppercase mb-4 font-bold tracking-widest border-l-2 border-zinc-500 pl-3">
          Battery and Harness
        </h4>
        <ActionButton
          label="Renew Burnt Databus"
          onClick={() => onAction('RENEW_DATABUS')}
          cost={{ label: 'FOCUS', value: 40 }}
          description="A tedious but necessary task. Consumes Steel Wire."
          cooldown={60000}
        />
      </div>

      {/* Equipment and Furnishing */}
      <div className="p-5 border border-emerald-900/40 bg-black/20">
        <h4 className="text-[10px] text-emerald-600 uppercase mb-4 font-bold tracking-widest border-l-2 border-emerald-700 pl-3">
          Equipment & Furnishing
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <ActionButton
            label="Wash Seat Cushions"
            onClick={() => onAction('WASH_CUSHIONS')}
            cost={{ label: 'FOCUS', value: 10 }}
            description="Mind-numbing work. A chance to clear your head."
            cooldown={30000}
          />
          <ActionButton
            label="Repair Galley Unit"
            onClick={() => onAction('REPAIR_GALLEY_UNIT')}
            cost={{ label: 'FOCUS', value: 50 }}
            description="Requires a red-tagged Galley Coffee Maker."
            disabled={!hasBrokenGalley}
            cooldown={75000}
          />
        </div>
      </div>
    </div>
  );
};

export default BackshopsTab;
