import React from 'react';
import { GameState } from '../types';
import ActionButton from './ActionButton';

interface PetInteractionProps {
  state: GameState;
  onAction: (type: string, payload?: Record<string, unknown>) => void;
}

const PetInteraction: React.FC<PetInteractionProps> = ({ state, onAction }) => {
  const { pet, resources, inventory } = state;

  const hasTuna = (resources.canned_tuna || 0) > 0;
  // Check for laser pointer in inventory (it's a tool, so it's a boolean in inventory)

  const hasLaser = inventory.laser_pointer;

  // Determine border color based on trust
  const borderColor =
    pet.trust > 80 ? 'border-emerald-600' : pet.trust > 40 ? 'border-amber-600' : 'border-red-800';
  const bgColor =
    pet.trust > 80 ? 'bg-emerald-950/10' : pet.trust > 40 ? 'bg-amber-950/10' : 'bg-red-950/10';

  return (
    <div
      className={`p-4 border-2 ${borderColor} ${bgColor} mb-6 relative shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-all`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h4
          className={`text-xs uppercase tracking-[0.2em] font-bold flex items-center gap-2 ${pet.trust > 40 ? 'text-amber-500' : 'text-red-500'}`}
        >
          <span className="text-lg filter drop-shadow-[0_0_2px_rgba(245,158,11,0.5)]">🐈</span>
          {pet.name}
          <div className="flex items-center ml-2 space-x-1 opacity-70">
            <div className="h-1.5 w-16 bg-black/50 border border-current rounded-sm overflow-hidden">
              <div
                className={`h-full ${pet.trust > 80 ? 'bg-emerald-500' : pet.trust > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${pet.trust}%` }}
              />
            </div>
            <span className="text-[9px] font-mono">{pet.trust.toFixed(0)}%</span>
          </div>
        </h4>
        <div className="flex flex-col items-end">
          <span
            className={`text-[9px] font-mono uppercase tracking-tight ${pet.flags.isSleeping ? 'text-zinc-500' : 'text-emerald-400 animate-pulse'}`}
          >
            STATUS: {pet.flags.isSleeping ? 'SLEEPING' : 'ACTIVE'}
          </span>
          {pet.hunger > 50 && (
            <span className="text-[8px] text-red-400 font-bold animate-pulse">HUNGRY</span>
          )}
        </div>
      </div>

      {/* Status Description */}
      <div className="text-[10px] text-zinc-400 mb-4 font-serif italic border-l-2 border-zinc-700 pl-3 py-1 bg-black/20">
        "
        {pet.flags.isSleeping
          ? `${pet.name} is curled up on a pile of rags, twitching slightly.`
          : pet.flags.isStaringAtNothing
            ? `${pet.name} is staring intensely at an empty corner of the room. The air feels colder there.`
            : `${pet.name} is watching you work with unblinking eyes.`}
        "
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <ActionButton
          label="Pet"
          onClick={() => onAction('PET_CAT')}
          disabled={pet.flags.isSleeping}
          cooldown={pet.cooldowns.pet}
          description="Restore Sanity. Build Trust."
          className="border-amber-700 hover:bg-amber-900/20 text-amber-500"
        />

        {hasTuna ? (
          <ActionButton
            label={`Feed Tuna (${resources.canned_tuna})`}
            onClick={() => onAction('FEED_CAT', { itemId: 'canned_tuna' })}
            disabled={pet.flags.isSleeping || pet.hunger < 20}
            description="Greatly increases Trust."
            cost={{ label: 'HUNGER', value: pet.hunger }}
            className="border-emerald-700 hover:bg-emerald-900/20 text-emerald-500"
          />
        ) : (
          <div className="opacity-40 text-[9px] uppercase text-center border border-dashed border-zinc-700 p-2 flex flex-col items-center justify-center h-full bg-black/20 text-zinc-500">
            <span>No Food Available</span>
            <span className="text-[8px] mt-1">(Buy at Canteen)</span>
          </div>
        )}

        {hasLaser && (
          <ActionButton
            label="Laser Pointer"
            onClick={() => onAction('PLAY_WITH_CAT', { itemId: 'laser_pointer' })}
            disabled={pet.flags.isSleeping}
            description="Play. +Focus."
            className="border-red-700 hover:bg-red-900/20 text-red-500"
          />
        )}
      </div>
    </div>
  );
};

export default PetInteraction;
