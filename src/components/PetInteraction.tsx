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

  return (
    <div className="p-4 border border-amber-900/40 bg-black/40 mt-6 relative overflow-hidden group">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs text-amber-600 uppercase tracking-widest font-bold flex items-center gap-2">
          <span className="text-xl">🐈</span>
          {pet.name}
          <span className="text-[9px] opacity-70 border border-amber-900/50 px-1 rounded">
            Trust: {pet.trust}%
          </span>
        </h4>
        <span
          className={`text-[9px] uppercase ${pet.flags.isSleeping ? 'text-zinc-500' : 'text-emerald-500'}`}
        >
          {pet.flags.isSleeping ? 'ASLEEP' : 'ACTIVE'}
        </span>
      </div>

      {/* Status */}
      <p className="text-[10px] text-zinc-400 italic mb-4 border-l-2 border-amber-900/30 pl-2">
        {pet.flags.isSleeping
          ? `${pet.name} is curled up on a pile of rags.`
          : pet.flags.isStaringAtNothing
            ? `${pet.name} is staring intensely at an empty corner.`
            : `${pet.name} is watching you work.`}
      </p>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <ActionButton
          label="Pet"
          onClick={() => onAction('PET_CAT')}
          disabled={pet.flags.isSleeping}
          cooldown={pet.cooldowns.pet}
          description="Restore Sanity. Build Trust."
          className="hover:border-amber-500/50"
        />

        {hasTuna ? (
          <ActionButton
            label={`Feed Tuna (${resources.canned_tuna})`}
            onClick={() => onAction('FEED_CAT', { itemId: 'canned_tuna' })}
            disabled={pet.flags.isSleeping || pet.hunger < 20}
            description="Greatly increases Trust."
            cost={{ label: 'HUNGER', value: pet.hunger }}
            className="hover:border-emerald-500/50"
          />
        ) : (
          <div className="opacity-30 text-[9px] uppercase text-center border border-dashed border-zinc-700 p-2 flex items-center justify-center">
            No Food (Buy at Canteen)
          </div>
        )}

        {hasLaser && (
          <ActionButton
            label="Laser Pointer"
            onClick={() => onAction('PLAY_WITH_CAT', { itemId: 'laser_pointer' })}
            disabled={pet.flags.isSleeping}
            description="Play. +Focus."
            className="hover:border-red-500/50"
          />
        )}
      </div>
    </div>
  );
};

export default PetInteraction;
