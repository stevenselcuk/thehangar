import React from 'react';
import { EnvironmentalHazard } from '../types.ts';

interface Props {
  hazards: EnvironmentalHazard[];
}

const HazardBar: React.FC<Props> = ({ hazards }) => {
  if (hazards.length === 0) return null;

  return (
    <div className="bg-red-950/50 border-b border-red-700/30 px-4 py-2 flex items-center space-x-4 animate-pulse">
      <span className="text-xs font-bold uppercase text-red-400 tracking-widest">
        [ HAZARD ACTIVE ]
      </span>
      {hazards.map((hazard) => (
        <div key={hazard.id} className="group relative text-red-300 text-[10px] uppercase">
          {hazard.name}
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 bg-[#050505] border border-red-900 rounded-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 w-64 text-center whitespace-normal">
            <p className="text-sm text-red-400 mb-1">{hazard.name}</p>
            <p className="text-xs text-zinc-400">{hazard.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HazardBar;
