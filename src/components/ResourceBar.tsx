import React, { memo, useRef, useState } from 'react';
import { resourceTooltips } from '../data/tooltips.ts';
import { getXpForNextLevel } from '../logic/levels';
import { GameFlags, Inventory, ResourceState } from '../types';

interface Props {
  resources: ResourceState;
  inventory: Inventory;
  hfStats: {
    fatigue: number;
    noiseExposure: number;
    socialStress: number;
    trainingProgress: number;
    temperature: number;
    lightingLevel: number;
    compliancePressureTimer: number;
  };
  flags: GameFlags;
}

const SmartTooltip: React.FC<{ text: string; children: React.ReactNode }> = ({
  text,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ left: '50%', transform: 'translateX(-50%)' });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (!tooltipRef.current || !wrapperRef.current) return;

    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const tooltipWidth = 192; // w-48 is 12rem = 192px
    const padding = 10;
    const windowWidth = window.innerWidth;

    let leftOffset = 0;

    // Check left edge
    const projectedLeft = wrapperRect.left + wrapperRect.width / 2 - tooltipWidth / 2;
    if (projectedLeft < padding) {
      leftOffset = padding - projectedLeft;
    }

    // Check right edge
    const projectedRight = wrapperRect.left + wrapperRect.width / 2 + tooltipWidth / 2;
    if (projectedRight > windowWidth - padding) {
      leftOffset = windowWidth - padding - projectedRight;
    }

    setPosition({
      left: '50%',
      transform: `translateX(calc(-50% + ${leftOffset}px))`,
    });
  };

  return (
    <div
      ref={wrapperRef}
      className="relative group"
      onMouseEnter={() => {
        calculatePosition();
        setIsVisible(true);
      }}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <div
        ref={tooltipRef}
        style={position}
        className={`absolute bottom-full mb-2 px-3 py-2 bg-[#050505] border border-emerald-900 rounded-sm shadow-lg transition-opacity duration-200 pointer-events-none z-[60] w-48 text-center whitespace-normal ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="text-[10px] text-emerald-700 uppercase tracking-tighter">{text}</p>
      </div>
    </div>
  );
};

const ResourceBarComponent: React.FC<Props> = ({
  resources,
  hfStats,
  inventory: _inventory,
  flags,
}) => {
  const formatNum = (n: number) => Math.floor(n).toString().padStart(3, '0');
  const xpForNextLevel = getXpForNextLevel(resources.level);
  const xpProgress = (resources.experience / xpForNextLevel) * 100;
  const isHighSuspicion = resources.suspicion > 70;

  return (
    <div className="bg-[#080808] border-b border-emerald-900 flex flex-col divide-y divide-emerald-900/10">
      {/* Vitals Row */}
      <div className="px-4 py-3 flex items-center justify-between bg-[#0a0a0a]">
        <div className="flex space-x-12">
          {/* Sanity */}
          <div className="flex flex-col space-y-1 w-48">
            <div className="flex justify-between items-center px-1">
              <span className="text-emerald-700 text-[7px] font-bold uppercase tracking-widest">
                Sanity
              </span>
              <span
                className={`${flags.isAfraid ? 'text-purple-400 animate-pulse' : 'text-emerald-400'} text-[8px] font-mono`}
              >
                {Math.floor(resources.sanity)}% {flags.isAfraid && '[ TERRIFIED ]'}
              </span>
            </div>
            <div className="h-1.5 bg-emerald-950/30 border border-emerald-900/50">
              <div
                className={`h-full ${flags.isAfraid ? 'bg-purple-600' : 'bg-emerald-500'} shadow-[0_0_12px_rgba(16,185,129,0.7)] transition-all`}
                style={{ width: `${resources.sanity}%` }}
              />
            </div>
          </div>

          {/* Suspicion */}
          <div className="flex flex-col space-y-1 w-48">
            <div className="flex justify-between items-center px-1">
              <span
                className={`text-red-900 text-[7px] font-bold uppercase tracking-widest ${isHighSuspicion ? 'animate-pulse' : ''}`}
              >
                Suspicion
              </span>
              <span
                className={`text-red-600 text-[8px] font-mono ${isHighSuspicion ? 'animate-pulse font-black' : ''}`}
              >
                {Math.floor(resources.suspicion)}%
              </span>
            </div>
            <div className="h-1.5 bg-red-950/20 border border-red-900/30">
              <div
                className={`h-full bg-red-800 shadow-[0_0_10px_rgba(220,38,38,0.5)] transition-all ${isHighSuspicion ? 'animate-pulse' : ''}`}
                style={{ width: `${resources.suspicion}%` }}
              />
            </div>
          </div>

          {/* Focus */}
          <div className="flex flex-col space-y-1 w-48">
            <div className="flex justify-between items-center px-1">
              <span className="text-blue-900 text-[7px] font-bold uppercase tracking-widest">
                Focus
              </span>
              <span className="text-blue-400 text-[8px] font-mono">
                {Math.floor(resources.focus)}%
              </span>
            </div>
            <div className="h-1.5 bg-blue-950/20 border border-blue-900/30">
              <div
                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] transition-all"
                style={{ width: `${resources.focus}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-6 items-center border-l border-emerald-900/30 pl-6">
          {flags.migraineActive && (
            <div className="text-[9px] uppercase font-black text-red-500 animate-pulse tracking-widest">
              [ MIGRAINE ]
            </div>
          )}
          {hfStats.compliancePressureTimer > 0 && (
            <div className="text-[9px] uppercase font-bold text-amber-500 animate-pulse tracking-widest">
              [ UNDER OBSERVATION ]
            </div>
          )}
          {resources.kardexFragments > 0 && (
            <SmartTooltip text={resourceTooltips.kardexFragments}>
              <div className="flex items-center space-x-2">
                <span className="text-[7px] text-purple-700 uppercase animate-pulse">K-FRAGS:</span>
                <span className="text-[7px] text-purple-300 font-bold px-1 bg-purple-900/30 border border-purple-400/20">
                  {resources.kardexFragments}
                </span>
              </div>
            </SmartTooltip>
          )}
        </div>
      </div>

      {/* XP and Materials Row */}
      <div className="relative">
        {/* XP Bar Background */}
        <div
          className="absolute top-0 left-0 h-full bg-emerald-950/20 transition-all"
          style={{ width: `${xpProgress}%` }}
        />
        <div className="px-4 py-2 flex items-center flex-wrap gap-x-6 bg-[#050505]/80 text-[9px] font-mono relative">
          <SmartTooltip
            text={`Next Level: ${Math.floor(resources.experience)} / ${xpForNextLevel} XP`}
          >
            <div className="flex items-center space-x-2 border-r border-emerald-900/30 pr-4">
              <span className="text-emerald-500 font-bold uppercase text-[10px]">
                LVL {resources.level}
              </span>
            </div>
          </SmartTooltip>

          <SmartTooltip text={resourceTooltips.credits}>
            <div className="flex items-center space-x-2">
              <span className="text-emerald-950 font-bold uppercase">CR:</span>
              <span className="text-emerald-400">${formatNum(resources.credits)}</span>
            </div>
          </SmartTooltip>

          <SmartTooltip text={resourceTooltips.technicalLogbookHours}>
            <div className="flex items-center space-x-2">
              <span className="text-emerald-950 font-bold uppercase">LOG:</span>
              <span className="text-blue-400">{formatNum(resources.technicalLogbookHours)}h</span>
            </div>
          </SmartTooltip>

          <SmartTooltip text={resourceTooltips.alclad}>
            <div className="flex items-center space-x-2">
              <span className="text-emerald-950 font-bold">AL:</span>
              <span className="text-emerald-500">{formatNum(resources.alclad)}</span>
            </div>
          </SmartTooltip>

          <SmartTooltip text={resourceTooltips.rivets}>
            <div className="flex items-center space-x-2">
              <span className="text-emerald-950 font-bold">RIV:</span>
              <span className="text-emerald-600">{formatNum(resources.rivets)}</span>
            </div>
          </SmartTooltip>

          {resources.crystallineResonators > 0 && (
            <SmartTooltip text={resourceTooltips.crystallineResonators}>
              <div className="flex items-center space-x-2">
                <span className="text-blue-900 font-bold">C-RES:</span>
                <span className="text-blue-400">{formatNum(resources.crystallineResonators)}</span>
              </div>
            </SmartTooltip>
          )}

          {resources.bioFilament > 0 && (
            <SmartTooltip text={resourceTooltips.bioFilament}>
              <div className="flex items-center space-x-2">
                <span className="text-purple-900 font-bold">B-FIL:</span>
                <span className="text-purple-400">{formatNum(resources.bioFilament)}</span>
              </div>
            </SmartTooltip>
          )}

          <div className="ml-auto flex items-center space-x-4 border-l border-emerald-900/20 pl-4">
            <SmartTooltip text={resourceTooltips.fatigue}>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-950 uppercase font-bold text-[7px]">Fatigue:</span>
                <span className="text-amber-700">{Math.round(hfStats.fatigue)}%</span>
              </div>
            </SmartTooltip>

            <SmartTooltip text={resourceTooltips.noiseExposure}>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-950 uppercase font-bold text-[7px]">Noise:</span>
                <span className="text-amber-700">{Math.round(hfStats.noiseExposure)}%</span>
              </div>
            </SmartTooltip>

            <SmartTooltip text={resourceTooltips.socialStress}>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-950 uppercase font-bold text-[7px]">Stress:</span>
                <span className="text-amber-700">{Math.round(hfStats.socialStress)}%</span>
              </div>
            </SmartTooltip>

            <SmartTooltip text={resourceTooltips.temperature}>
              <div className="flex items-center space-x-2 border-l border-emerald-900/20 pl-4">
                <span className="text-emerald-950 uppercase font-bold text-[7px]">Temp:</span>
                <span className="text-emerald-700">{hfStats.temperature.toFixed(1)}°C</span>
              </div>
            </SmartTooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoized export with custom comparison function
// Only re-render when displayed values actually change
export default memo(ResourceBarComponent, (prevProps, nextProps) => {
  // Check core vitals that are always displayed
  const resourcesUnchanged =
    prevProps.resources.sanity === nextProps.resources.sanity &&
    prevProps.resources.suspicion === nextProps.resources.suspicion &&
    prevProps.resources.focus === nextProps.resources.focus &&
    prevProps.resources.experience === nextProps.resources.experience &&
    prevProps.resources.level === nextProps.resources.level &&
    prevProps.resources.credits === nextProps.resources.credits &&
    prevProps.resources.alclad === nextProps.resources.alclad &&
    prevProps.resources.rivets === nextProps.resources.rivets &&
    prevProps.resources.technicalLogbookHours === nextProps.resources.technicalLogbookHours;

  // Check optional displayed resources
  const optionalResourcesUnchanged =
    prevProps.resources.kardexFragments === nextProps.resources.kardexFragments &&
    prevProps.resources.crystallineResonators === nextProps.resources.crystallineResonators &&
    prevProps.resources.bioFilament === nextProps.resources.bioFilament;

  // Check hfStats that are displayed
  const hfStatsUnchanged =
    prevProps.hfStats.fatigue === nextProps.hfStats.fatigue &&
    prevProps.hfStats.noiseExposure === nextProps.hfStats.noiseExposure &&
    prevProps.hfStats.socialStress === nextProps.hfStats.socialStress &&
    prevProps.hfStats.temperature === nextProps.hfStats.temperature &&
    prevProps.hfStats.compliancePressureTimer === nextProps.hfStats.compliancePressureTimer;

  // Check flags that affect display
  const flagsUnchanged =
    prevProps.flags.isAfraid === nextProps.flags.isAfraid &&
    prevProps.flags.migraineActive === nextProps.flags.migraineActive;

  // Return true to skip re-render if nothing changed
  return resourcesUnchanged && optionalResourcesUnchanged && hfStatsUnchanged && flagsUnchanged;
});
