import React, { useState } from 'react';
import { useSound } from '../context/SoundContext.tsx';
import { itemsData } from '../data/items.ts';
import { Skill, skillsData } from '../data/skills.ts';
import { GameState } from '../types.ts';
import ImportExportView from './ImportExportView.tsx';

// ================= CONSTANTS & HELPERS =================
const formatDuration = (ms: number) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  return `${hours}h ${minutes}m ${seconds}s`;
};

const AvatarDisplay: React.FC = () => {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`w-16 h-20 bg-zinc-400 border border-zinc-500 overflow-hidden relative grayscale contrast-125 ${hasError ? 'flex items-center justify-center' : ''}`}
    >
      {!hasError ? (
        <img
          src="/images/ID_photo.png"
          className="w-full h-full object-cover opacity-80"
          alt="SUBJECT"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="text-[10px] text-zinc-700 font-bold">NO IMG</span>
      )}
    </div>
  );
};

// ================= SKILL TECH TREE NODE =================
const SkillNode: React.FC<{
  skill: Skill;
  state: GameState;
  onAction: (t: string, p?: Record<string, unknown>) => void;
}> = ({ skill, state, onAction }) => {
  const { play } = useSound();
  const isUnlocked = state.proficiency.unlocked.includes(skill.id);
  const isPrereqMet = !skill.prereq || state.proficiency.unlocked.includes(skill.prereq);
  const canUnlock = state.proficiency.skillPoints > 0 && !isUnlocked && isPrereqMet;

  const handleClick = () => {
    if (canUnlock) {
      play('CLICK');
      onAction('UNLOCK_SKILL', { id: skill.id });
    }
  };

  let containerClass = 'relative group p-4 border transition-all duration-300 ';
  let textClass = '';

  if (isUnlocked) {
    containerClass += 'border-emerald-500 bg-emerald-900/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
    textClass = 'text-emerald-300';
  } else if (canUnlock) {
    containerClass +=
      'border-amber-500 bg-amber-900/10 hover:bg-amber-900/30 cursor-pointer animate-pulse-slow';
    textClass = 'text-amber-400';
  } else {
    containerClass += 'border-zinc-800 bg-black/40 opacity-50 grayscale';
    textClass = 'text-zinc-500';
  }

  return (
    <div onClick={canUnlock ? handleClick : undefined} className={containerClass}>
      {/* Connector Line Logic (Visual only, ideally SVG lines for real tree) */}
      {skill.prereq && (
        <div className="absolute -top-4 left-1/2 w-0.5 h-4 bg-zinc-800 -translate-x-1/2"></div>
      )}

      <div className="flex justify-between items-start mb-2">
        <h5 className={`font-bold uppercase tracking-widest text-xs ${textClass}`}>{skill.name}</h5>
        {isUnlocked && <span className="text-[9px] text-emerald-500">[ ACTIVE ]</span>}
        {canUnlock && <span className="text-[9px] text-amber-500 blink">[ 1 SP ]</span>}
        {!isUnlocked && !canUnlock && <span className="text-[9px] text-zinc-600">[ LOCKED ]</span>}
      </div>

      <p className="text-[10px] leading-relaxed opacity-80 font-mono text-zinc-400">
        {skill.description}
      </p>
    </div>
  );
};

// ================= MATRIX VIEW (TECH TREE) =================
const ProficiencyMatrixView: React.FC<{
  state: GameState;
  onAction: (t: string, p?: Record<string, unknown>) => void;
}> = ({ state, onAction }) => (
  <div className="space-y-8 h-full overflow-y-auto pr-2">
    <div className="flex justify-between items-end border-b border-emerald-900/50 pb-2">
      <h3 className="text-sm text-emerald-400 uppercase tracking-[0.2em]">Competency Matrix</h3>
      <div className="text-[10px] uppercase text-emerald-700">
        AVAILABLE POINTS ::{' '}
        <span
          className={`text-lg font-bold ${state.proficiency.skillPoints > 0 ? 'text-amber-400 animate-pulse' : 'text-emerald-500'}`}
        >
          {state.proficiency.skillPoints}
        </span>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Mechanic Tree */}
      <div className="relative">
        <h4 className="text-xs text-emerald-600 mb-6 uppercase tracking-widest border-l-2 border-emerald-600 pl-3">
          Ops // Industrial
        </h4>
        <div className="space-y-6 relative border-l border-dashed border-emerald-900/30 ml-4 pl-8">
          {/* Simple linear rendering for now, but styled as nodes */}
          {skillsData.mechanic.map((skill) => (
            <SkillNode key={skill.id} skill={skill} state={state} onAction={onAction} />
          ))}
        </div>
      </div>

      {/* Watcher Tree */}
      <div className="relative">
        <h4 className="text-xs text-purple-500 mb-6 uppercase tracking-widest border-l-2 border-purple-900 pl-3">
          Ops // Analysis
        </h4>
        <div className="space-y-6 relative border-l border-dashed border-purple-900/30 ml-4 pl-8">
          {skillsData.watcher.map((skill) => (
            <SkillNode key={skill.id} skill={skill} state={state} onAction={onAction} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ================= STAT DISPLAY COMPONENT =================
const StatDisplay: React.FC<{ label: string; value: string | number; sub?: string }> = ({
  label,
  value,
  sub,
}) => (
  <div className="p-3 border border-emerald-900/30 bg-black/40 flex flex-col justify-between group hover:bg-emerald-900/10 transition-colors">
    <p className="text-[9px] text-emerald-700 uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">
      {label}
    </p>
    <div>
      <p className="text-xl font-bold text-emerald-200 font-mono leading-none">{value}</p>
      {sub && <p className="text-[9px] text-emerald-800 mt-1 font-mono">{sub}</p>}
    </div>
  </div>
);

// ================= PLAYER PROFILE (PERSONNEL FILE) =================
const PlayerProfileView: React.FC<{ state: GameState }> = ({ state }) => {
  const { sanity, resources, inventory, stats } = state;
  const { clearanceLevel } = state.hfStats;

  const getClearanceBadge = (level: number) => {
    const colors = {
      1: 'border-emerald-700 text-emerald-500',
      2: 'border-amber-700 text-amber-500',
      3: 'border-red-700 text-red-500',
      4: 'border-black text-white bg-red-600',
      0: 'border-zinc-700 text-zinc-600 decoration-line-through',
    };
    const label =
      level === 4
        ? 'TOP SECRET'
        : level === 3
          ? 'SECRET'
          : level === 2
            ? 'CONFIDENTIAL'
            : level === 1
              ? 'UNCLASSIFIED'
              : 'REVOKED';
    const style = colors[level as keyof typeof colors] || colors[1];

    return (
      <div
        className={`border-2 ${style} px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase inline-block`}
      >
        {label} // LVL {level}
      </div>
    );
  };

  const downloadJournal = () => {
    const journalText = (state.journal || [])
      .map(
        (log) =>
          `[${new Date(log.timestamp).toLocaleString()}] ${log.type.toUpperCase()}: ${log.text}`
      )
      .join('\n');

    const blob = new Blob([journalText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal_${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10 font-mono text-sm max-h-full overflow-y-auto pr-2 pb-10">
      {/* HEADER DOSSIER */}
      <div className="flex flex-col md:flex-row gap-6 pb-8 border-b border-emerald-900/50">
        {/* ID CARD VISUALIZATION */}
        <div className="flex-shrink-0 w-full md:w-56">
          <div className="bg-zinc-200 p-3 rounded shadow-lg transform -rotate-1 border border-zinc-400 relative">
            <div className="absolute top-2 right-2 w-3 h-3 rounded-full border border-zinc-400 bg-emerald-500/20"></div>
            <div className="flex space-x-3 mb-4">
              <AvatarDisplay />
              <div className="space-y-1">
                <h2 className="text-black font-bold text-xs leading-none uppercase">
                  {state.playerName}
                </h2>
                <p className="text-[8px] text-zinc-600 uppercase leading-none">
                  Mechanic // Night Shift
                </p>
                <p className="text-[8px] text-zinc-600 uppercase leading-none mt-1">
                  ID: {state.employeeId}
                </p>
              </div>
            </div>
            <div className="h-4 bg-black w-full mb-1"></div>
            <div className="flex justify-between items-end">
              <div className="text-[6px] text-zinc-500 uppercase leading-tight">
                Prop. of [REDACTED] Aerospace.
                <br />
                Return to Security if found.
              </div>
              <div className="text-xs font-bold text-red-900 border-2 border-red-900 px-1 transform -rotate-6 opacity-70">
                VALID
              </div>
            </div>
          </div>
        </div>

        {/* TEXT DETAILS */}
        <div className="flex-grow space-y-4 pt-2">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl text-emerald-400 font-bold uppercase tracking-widest mb-1 font-sans">
                Personnel File
              </h1>
              <p className="text-emerald-700 text-xs uppercase tracking-wider">
                Subject: {state.employeeId}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">{getClearanceBadge(clearanceLevel)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 bg-black/40 p-4 border border-emerald-900/30">
            <div>
              <p className="text-[9px] text-emerald-800 uppercase">Current Assignment</p>
              <p className="text-emerald-300">Hangar Bay 4 (Night Shift)</p>
            </div>
            <div>
              <p className="text-[9px] text-emerald-800 uppercase">Tenure</p>
              <p className="text-emerald-300">{formatDuration(state.time.totalPlayTime)} Logged</p>
            </div>
            <div>
              <p className="text-[9px] text-emerald-800 uppercase">Psych Eval</p>
              <p className={`${sanity < 40 ? 'text-red-500 animate-pulse' : 'text-emerald-300'}`}>
                {sanity > 80 ? 'STABLE' : sanity > 40 ? 'COMPROMISED' : 'CRITICAL'} // {sanity}%
              </p>
            </div>
            <div>
              <p className="text-[9px] text-emerald-800 uppercase">Security Flag</p>
              <p className="text-emerald-300">
                LEVEL {Math.floor(state.resources.suspicion / 20)} THREAT
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* METRICS GRID */}
      <div>
        <h4 className="text-xs text-emerald-600 uppercase tracking-widest mb-4 border-b border-emerald-900/30 pb-2">
          Performance Metrics
        </h4>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          <StatDisplay
            label="Logbook Hours"
            value={Math.floor(resources.technicalLogbookHours)}
            sub="FAA Req: 1800"
          />
          <StatDisplay label="Jobs Closed" value={stats.jobsCompleted} />
          <StatDisplay label="SRFs Filed" value={stats.srfsFiled} />
          <StatDisplay label="Anomalies" value={stats.anomaliesAnalyzed} />
          <StatDisplay label="NDT Scans" value={stats.ndtScansPerformed} />
          <StatDisplay label="Rotables" value={stats.rotablesRepaired} />
          <StatDisplay label="Shift Cycles" value={state.time?.shiftCycle || 1} />
        </div>
      </div>

      {/* AFFILIATIONS */}
      <div>
        <h4 className="text-xs text-emerald-600 uppercase tracking-widest mb-4 border-b border-emerald-900/30 pb-2">
          Faction Alignment
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <StatDisplay
            label="Syndicate"
            value={`${state.resources.syndicateReputation}%`}
            sub={
              state.resources.syndicateReputation > 50
                ? 'COMPROMISED'
                : state.resources.syndicateReputation > 20
                  ? 'CONTACT'
                  : 'UNKNOWN'
            }
          />
          <StatDisplay
            label="The Union"
            value={`${state.resources.unionReputation}%`}
            sub={
              state.resources.unionReputation > 50
                ? 'MEMBER CODE'
                : state.resources.unionReputation > 20
                  ? 'SYMPATHIZER'
                  : 'IGNORANT'
            }
          />
        </div>
      </div>

      {/* PERSONAL EFFECTS */}
      <div>
        <h4 className="text-xs text-emerald-600 uppercase tracking-widest mb-4 border-b border-emerald-900/30 pb-2">
          Personal Effects
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {itemsData.carried.map((item) => {
            // Determine if player has item
            let hasItem = false;
            let quantity = 0;

            // Check inventory (boolean)
            if (state.inventory[item.id as keyof typeof state.inventory]) {
              hasItem = true;
              quantity = 1;
            }
            // Check personal inventory (count)
            else if ((state.personalInventory[item.id] || 0) > 0) {
              hasItem = true;
              quantity = state.personalInventory[item.id];
            }
            // Special mappings
            else if (
              item.id === 'cigarettes' &&
              (state.personalInventory['winston_pack'] || 0) > 0
            ) {
              hasItem = true;
              quantity = state.personalInventory['winston_pack'];
            } else if (item.id === 'wallet') {
              // Always show wallet for now, or check a flag if we want it to be losable
              hasItem = true;
              quantity = 1;
            }

            if (!hasItem) return null;

            return (
              <div
                key={item.id}
                className="bg-emerald-900/10 border border-emerald-900/30 p-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="text-[10px] text-emerald-500 font-bold uppercase">
                      {item.label}
                    </h5>
                    {quantity > 1 && (
                      <span className="text-[9px] text-emerald-400">x{quantity}</span>
                    )}
                  </div>
                  <p className="text-[9px] text-emerald-400/80 leading-relaxed italic">
                    {sanity < 50 ? item.description.unsettled : item.description.normal}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-emerald-900/20 flex justify-between items-center">
                  <span className="text-[8px] text-emerald-800 uppercase tracking-wider">
                    P/N: {item.pn}
                  </span>
                  {item.id === 'flashlight' && (
                    <span className="text-[8px] text-amber-500 animate-pulse">BATTERY LOW</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* UTILITY FLASHLIGHT (Explicit check if not in itemsData or needed separately) */}
          {/* Note: Flashlight is in itemsData.shop but maybe not in itemsData.carried? Check itemsData structure. */}
          {/* Step 17 shows flashlight is in itemsData.shop, NOT carried. I need to check itemsData.shop too or just manually add it if I want it here. */}
          {/* Checking itemsData.shop for 'flashlight' */}
          {itemsData.shop
            .filter((i) => i.id === 'flashlight' && state.inventory.flashlight)
            .map((item) => (
              <div
                key={item.id}
                className="bg-emerald-900/10 border border-emerald-900/30 p-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="text-[10px] text-emerald-500 font-bold uppercase">
                      {item.label}
                    </h5>
                  </div>
                  <p className="text-[9px] text-emerald-400/80 leading-relaxed italic">
                    {sanity < 50 ? item.description.unsettled : item.description.normal}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-emerald-900/20 flex justify-between items-center">
                  <span className="text-[8px] text-emerald-800 uppercase tracking-wider">
                    P/N: {item.pn}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* CERTIFICATIONS */}
      <div>
        <h4 className="text-xs text-emerald-600 uppercase tracking-widest mb-4 border-b border-emerald-900/30 pb-2">
          Qualifications & Licenses
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-900/10 border border-emerald-900/30 p-3">
            <h5 className="text-[10px] text-emerald-500 font-bold uppercase mb-3">FAA Ratings</h5>
            <ul className="space-y-1 text-xs text-emerald-400/80">
              <li className="flex justify-between">
                <span>Airframe & Powerplant (A&P)</span>{' '}
                <span>{inventory.hasAPLicense ? '[ ACTIVE ]' : '[ PENDING ]'}</span>
              </li>
              <li className="flex justify-between">
                <span>Avionics Certification</span>{' '}
                <span>{inventory.hasAvionicsCert ? '[ ACTIVE ]' : '[ --- ]'}</span>
              </li>
              <li className="flex justify-between">
                <span>Written Exam</span>{' '}
                <span>{inventory.apWrittenPassed ? '[ PASS ]' : '[ --- ]'}</span>
              </li>
            </ul>
          </div>
          <div className="bg-emerald-900/10 border border-emerald-900/30 p-3">
            <h5 className="text-[10px] text-emerald-500 font-bold uppercase mb-3">
              Company Mandates
            </h5>
            <ul className="space-y-1 text-xs text-emerald-400/80">
              <li className="flex justify-between">
                <span>Human Factors (Initial)</span>{' '}
                <span>{inventory.hasHfInitial ? '[ COMPLETED ]' : '[ REQUIRED ]'}</span>
              </li>
              <li className="flex justify-between">
                <span>FTS (Fuel Tank Safety)</span>{' '}
                <span>{inventory.hasFts ? '[ COMPLETED ]' : '[ REQUIRED ]'}</span>
              </li>
              <li className="flex justify-between">
                <span>EWIS (Wiring)</span>{' '}
                <span>{inventory.hasHdi ? '[ COMPLETED ]' : '[ REQUIRED ]'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* COLLECTED EVIDENCE & ARTIFACTS */}
      <div>
        <h4 className="text-xs text-emerald-600 uppercase tracking-widest mb-4 border-b border-emerald-900/30 pb-2">
          Collected Evidence
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {resources.hardwareBolts > 0 && (
            <StatDisplay label="Hardware Bolts" value={resources.hardwareBolts} />
          )}
          {resources.threadlocker > 0 && (
            <StatDisplay label="Threadlocker" value={resources.threadlocker} />
          )}
          {resources.cableTools > 0 && (
            <StatDisplay label="Cable Tools" value={resources.cableTools} />
          )}
          {resources.fdrData > 0 && <StatDisplay label="FDR Data" value={resources.fdrData} />}
          {resources.fqpu > 0 && <StatDisplay label="FQPU Units" value={resources.fqpu} />}
          {resources.pressureTransducer > 0 && (
            <StatDisplay label="Pressure Transducers" value={resources.pressureTransducer} />
          )}
          {resources.aimsData > 0 && (
            <StatDisplay label="AIMS Data Logs" value={resources.aimsData} />
          )}
          {resources.ram > 0 && <StatDisplay label="RAM Modules" value={resources.ram} />}
          {resources.smokeDetector > 0 && (
            <StatDisplay label="Smoke Detectors" value={resources.smokeDetector} />
          )}
          {/* Also display some existing but hidden resources if they are relevant */}
          {resources.bioFilament > 0 && (
            <StatDisplay label="Bio-Filament" value={resources.bioFilament} />
          )}
          {resources.crystallineResonators > 0 && (
            <StatDisplay label="Crystalline Resonators" value={resources.crystallineResonators} />
          )}
          {resources.kardexFragments > 0 && (
            <StatDisplay label="Kardex Fragments" value={resources.kardexFragments} />
          )}
        </div>
      </div>
      {/* ADMINISTRATIVE ACTIONS */}
      {/* ADMINISTRATIVE ACTIONS */}
      <div>
        <h4 className="text-xs text-emerald-600 uppercase tracking-widest mb-4 border-b border-emerald-900/30 pb-2">
          Administrative Actions
        </h4>
        <div className="flex justify-start">
          <button
            onClick={downloadJournal}
            className="text-xs font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-300 border border-emerald-800 hover:border-emerald-500 px-6 py-3 bg-black/40 transition-all flex items-center gap-2 group shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <span>[ DOWNLOAD SERVICE RECORD ]</span>
            <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ================= MAIN MODAL COMPONENT =================
type ModalSection = 'FILE' | 'MATRIX' | 'IMPORT_EXPORT' | 'ABOUT' | 'HOW_TO';

interface AboutModalProps {
  state: GameState;
  onAction: (t: string, p?: Record<string, unknown>) => void;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ state, onClose, onAction }) => {
  const { play } = useSound();
  const [activeSection, setActiveSection] = useState<ModalSection>('FILE');
  const BUILD_NUMBER = 'Build v.{_build_81}';

  const handleSectionClick = (section: ModalSection) => {
    play('CLICK');
    setActiveSection(section);
  };

  const menuItems: { id: ModalSection; label: string }[] = [
    { id: 'FILE', label: 'PERS. FILE' },
    { id: 'MATRIX', label: 'COMPETENCY' },
    { id: 'IMPORT_EXPORT', label: 'SYS. MIGRATION' },
    { id: 'HOW_TO', label: 'MANUAL' },
    { id: 'ABOUT', label: 'CREDITS' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content !p-0 flex flex-col md:flex-row h-[85vh] w-[95%] max-w-[1100px] border-2 border-emerald-900 bg-[#050905] shadow-[0_0_50px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-0 right-0 m-4 z-50 text-emerald-600 hover:text-emerald-400 font-bold uppercase text-xs tracking-widest border border-emerald-900/50 px-3 py-1 bg-black hover:bg-emerald-900/20 transition-all hidden md:block"
        >
          [ CLOSE TERMINAL ]
        </button>

        {/* SIDEBAR (Top Nav on Mobile) */}
        <div className="w-full md:w-64 bg-black/60 border-b md:border-b-0 md:border-r border-emerald-900/50 flex flex-col shrink-0">
          <div className="p-4 md:p-6 border-b border-emerald-900/30 bg-emerald-950/20 flex justify-between items-center md:block">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-emerald-500 tracking-tighter">
                RAS-TERM
              </h2>
              <p className="text-[9px] text-emerald-800 uppercase tracking-[0.3em]">
                Personnel Admin
              </p>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="md:hidden text-emerald-600 hover:text-emerald-400 font-bold text-xs border border-emerald-900/50 px-2 py-1 bg-black"
            >
              [X]
            </button>
          </div>

          <nav className="flex overflow-x-auto md:flex-col md:overflow-visible p-1 md:p-4 space-x-1 md:space-x-0 md:space-y-1 scrollbar-hide">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSectionClick(item.id)}
                className={`whitespace-nowrap px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all md:text-left flex-shrink-0 md:flex-shrink md:w-full border-b-2 md:border-b-0 md:border-l-2 ${
                  activeSection === item.id
                    ? 'bg-emerald-900/30 text-emerald-300 border-emerald-500'
                    : 'text-emerald-700 border-transparent hover:bg-emerald-900/10 hover:text-emerald-500'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:block p-4 border-t border-emerald-900/30 text-center mt-auto">
            <p className="text-[9px] text-emerald-800 font-mono">
              {BUILD_NUMBER.replace(/\{_build_(\d+)\}/, '$1')}
            </p>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-grow p-4 md:p-8 overflow-hidden relative">
          {/* CRT Scanline Overlay Effect (CSS only) */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 bg-[length:100%_2px,3px_100%]"></div>

          <div className="h-full relative z-20">
            {activeSection === 'FILE' && <PlayerProfileView state={state} />}
            {activeSection === 'MATRIX' && (
              <ProficiencyMatrixView state={state} onAction={onAction} />
            )}
            {activeSection === 'IMPORT_EXPORT' && (
              <ImportExportView
                state={state}
                onImport={(s) => {
                  onAction('IMPORT_STATE', { state: s });
                  onClose();
                }}
              />
            )}

            {activeSection === 'HOW_TO' && (
              <div className="space-y-6 text-emerald-400 font-mono text-xs max-h-full overflow-y-auto pr-2">
                <h1 className="text-xl text-emerald-300 font-bold border-b border-emerald-800 pb-2 mb-4">
                  Field Manual
                </h1>
                <p className="leading-relaxed opacity-90">
                  Welcome to the Night Shift. Your primary objective is to maintain aircraft
                  airworthiness while managing your own physical and mental resources.
                </p>

                <div className="space-y-4">
                  <div className="border-l-2 border-emerald-700 pl-4">
                    <h3 className="font-bold text-emerald-200">RESOURCES</h3>
                    <ul className="list-disc list-inside mt-2 space-y-1 opacity-80">
                      <li>
                        <span className="text-amber-400">SANITY</span>: Mental stability. Depletes
                        upon witnessing anomalies. Zero events are fatal.
                      </li>
                      <li>
                        <span className="text-red-400">SUSPICION</span>: Management oversight.
                        Increases with illicit actions. 100% results in termination.
                      </li>
                      <li>
                        <span className="text-blue-400">FOCUS</span>: Action points. Regenerates
                        over time. Required for complex tasks.
                      </li>
                    </ul>
                  </div>

                  <div className="border-l-2 border-emerald-700 pl-4">
                    <h3 className="font-bold text-emerald-200">PROTOCOL</h3>
                    <p className="mt-2 opacity-80">
                      1. Accept jobs from Hanger/Apron tabs.
                      <br />
                      2. Utilize Backshops for component repair.
                      <br />
                      3. Log hours to qualify for Licensing exams.
                      <br />
                      4. Report anomalies immediately. (Or don't. We watch regardless.)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'ABOUT' && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 font-mono">
                <h1 className="text-4xl font-bold text-emerald-500 tracking-tighter shimmer-text">
                  THE HANGAR
                </h1>
                <p className="text-emerald-700 text-xs w-2/3 leading-relaxed">
                  An incremental narrative experiment dealing with industrial isolation, cosmic
                  horror, and the crushing weight of bureaucratic aviation maintenance.
                </p>
                <div className="border-t border-b border-emerald-900/50 py-4 w-1/2">
                  <p className="text-[10px] text-emerald-600 uppercase tracking-widest">
                    Created by Steven Selcuk
                  </p>
                </div>
                <a
                  href="https://github.com/stevenselcuk/thehangar"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-400 hover:text-emerald-200 underline decoration-emerald-800 hover:decoration-emerald-400 underline-offset-4 transition-all"
                >
                  github.com/stevenselcuk/thehangar
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
