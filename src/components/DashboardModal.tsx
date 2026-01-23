import React, { useState } from 'react';
import { Skill, skillsData } from '../data/skills.ts';
import { trainingData } from '../data/training.ts';
import { GameState } from '../types.ts';
import ImportExportView from './ImportExportView';

const playClick = () => {
  const audio = new Audio('/sounds/ui_click.mp3');
  audio.volume = 0.3;
  audio.play().catch(() => {});
};

type DashboardSection = 'MATRIX' | 'CERTS' | 'STATS' | 'FILE' | 'IMPORT_EXPORT';

// --- SUB-COMPONENTS FOR EACH VIEW ---

// --- SUB-COMPONENTS FOR EACH VIEW ---

const SkillNode: React.FC<{
  skill: Skill;
  state: GameState;
  onAction: (t: string, p?: Record<string, unknown>) => void;
}> = ({ skill, state, onAction }) => {
  const isUnlocked = state.proficiency.unlocked.includes(skill.id);
  const canUnlock =
    state.proficiency.skillPoints > 0 &&
    (!skill.prereq || state.proficiency.unlocked.includes(skill.prereq));
  const isPrereqMet = !skill.prereq || state.proficiency.unlocked.includes(skill.prereq);

  const handleClick = () => {
    if (!isUnlocked && canUnlock) {
      playClick();
      onAction('UNLOCK_SKILL', { id: skill.id });
    }
  };

  let buttonClass = 'border-emerald-900 bg-black/40 text-emerald-800';
  if (isUnlocked) {
    buttonClass =
      'border-emerald-400 bg-emerald-900/50 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.4)]';
  } else if (canUnlock) {
    buttonClass =
      'border-emerald-600 bg-black/40 text-emerald-500 hover:bg-emerald-900/40 animate-pulse';
  } else if (!isPrereqMet) {
    buttonClass = 'border-zinc-800 bg-black/20 text-zinc-700 opacity-50 cursor-not-allowed';
  }

  return (
    <div className={`p-4 border ${buttonClass} transition-all duration-300`}>
      <h5 className="font-bold uppercase tracking-wider text-sm">{skill.name}</h5>
      <p className="text-[10px] mt-2 leading-relaxed opacity-80">{skill.description}</p>
      <button
        onClick={handleClick}
        disabled={isUnlocked || !canUnlock}
        className="mt-4 w-full text-xs font-bold uppercase py-2 border transition-all disabled:opacity-50"
      >
        {isUnlocked ? '[ ACQUIRED ]' : canUnlock ? '[ UNLOCK (1 SP) ]' : '[ LOCKED ]'}
      </button>
    </div>
  );
};

const ProficiencyMatrixView: React.FC<{
  state: GameState;
  onAction: (t: string, p?: Record<string, unknown>) => void;
}> = ({ state, onAction }) => (
  <div className="space-y-8">
    <h3 className="text-sm text-emerald-400 uppercase tracking-[0.2em] border-b border-emerald-900/30 pb-2">
      Proficiency Matrix
    </h3>
    <div className="grid grid-cols-2 gap-8">
      <div>
        <h4 className="text-sm text-emerald-400 mb-4 uppercase tracking-[0.2em]">Mechanic</h4>
        <div className="space-y-4">
          {skillsData.mechanic.map((skill) => (
            <SkillNode key={skill.id} skill={skill} state={state} onAction={onAction} />
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm text-purple-400 mb-4 uppercase tracking-[0.2em]">Watcher</h4>
        <div className="space-y-4">
          {skillsData.watcher.map((skill) => (
            <SkillNode key={skill.id} skill={skill} state={state} onAction={onAction} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const CheckListItem: React.FC<{ label: string; checked: boolean; details?: string }> = ({
  label,
  checked,
  details,
}) => (
  <div
    className={`p-3 border transition-all ${checked ? 'border-emerald-700 bg-emerald-950/20 text-emerald-300' : 'border-zinc-800 bg-black/20 text-zinc-500'}`}
  >
    <div className="flex items-center">
      <div
        className={`w-4 h-4 mr-3 border-2 ${checked ? 'bg-emerald-500 border-emerald-400' : 'border-zinc-600'}`}
      />
      <span className="text-sm uppercase tracking-wider">{label}</span>
    </div>
    {details && <p className="text-xs text-zinc-400 mt-1 pl-7">{details}</p>}
  </div>
);

const StatDisplay: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="p-4 border border-emerald-900/50 bg-black/30">
    <p className="text-xs text-emerald-700 uppercase tracking-widest">{label}</p>
    <p className="text-2xl font-bold text-emerald-300 mt-1">{value}</p>
  </div>
);

const PlayerProfileView: React.FC<{ state: GameState }> = ({ state }) => {
  const { sanity, resources, inventory, proficiency, stats } = state;
  const { clearanceLevel } = state.hfStats;

  let photoFilter = 'grayscale(1) brightness(0.7) contrast(1.3)';
  if (sanity < 50) photoFilter += ' blur(0.5px) opacity(0.9)';
  if (sanity < 20) photoFilter += ' blur(1.5px) contrast(2)';

  const getClearanceText = (level: number) => {
    switch (level) {
      case 1:
        return 'LEVEL 1 (General)';
      case 2:
        return 'LEVEL 2 (Restricted)';
      case 3:
        return 'LEVEL 3 (Classified)';
      case 4:
        return 'LEVEL 4 (Redacted)';
      default:
        return 'LEVEL 0 (Revoked)';
    }
  };

  return (
    <div className="space-y-8 h-full">
      <div className="flex justify-between items-end border-b border-emerald-900/30 pb-2">
        <h3 className="text-sm text-emerald-400 uppercase tracking-[0.2em]">You: 770-M-9M-MRO</h3>
        <div className="flex space-x-4 text-xs text-emerald-600 font-mono">
          <span>LOG_HOURS: {Math.floor(resources.technicalLogbookHours)}</span>
          <span>JOBS: {stats.jobsCompleted}</span>
          <span>CLR: {clearanceLevel}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMN 1: ID & PROFILE */}
        <div className="space-y-6">
          <div className="w-full bg-zinc-300 p-4 rounded-lg shadow-2xl space-y-4">
            <div className="w-full aspect-[4/5] relative border-4 border-zinc-400 bg-zinc-500 overflow-hidden">
              <img
                src="/images/photo.png"
                alt="Employee ID"
                style={{ filter: photoFilter }}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 w-full bg-red-900/80 p-1 text-center">
                <span className="text-[10px] text-white font-bold tracking-widest">
                  OFFICIAL ID
                </span>
              </div>
            </div>
            <div className="text-zinc-800 font-mono space-y-2">
              <div className="border-b-2 border-red-700 pb-1 mb-2">
                <h3 className="text-[10px] text-red-800 font-bold uppercase">
                  PROPERTY OF [REDACTED] AEROSPACE
                </h3>
              </div>
              <div>
                <p className="text-[9px] uppercase text-zinc-500">NAME</p>
                <p className="text-sm font-bold tracking-wider">[REDACTED]</p>
              </div>
              <div>
                <p className="text-[9px] uppercase text-zinc-500">TITLE</p>
                <p className="text-xs font-semibold">Mechanic, Night Shift</p>
              </div>
              <div>
                <p className="text-[9px] uppercase text-zinc-500">CLEARANCE</p>
                <p
                  className={`text-xs font-bold ${clearanceLevel > 1 ? 'text-red-700 animate-pulse' : ''}`}
                >
                  {getClearanceText(clearanceLevel)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs text-emerald-600 uppercase tracking-widest mb-2">Remarks</h4>
            <div className="p-3 border border-emerald-900/50 bg-black/20 text-xs text-emerald-300 space-y-2 font-mono">
              {state.flags.onPerformanceImprovementPlan && (
                <p className="text-amber-400">
                  [REPRIMAND] Subject is currently on a mandatory Performance Improvement Plan.
                </p>
              )}
              {state.flags.suspicionEvent60Triggered && (
                <p className="text-zinc-400">
                  [NOTE] Subject's logs show multiple discrepancies. File flagged for internal
                  review.
                </p>
              )}
              {!state.flags.onPerformanceImprovementPlan &&
                !state.flags.suspicionEvent60Triggered && (
                  <p className="text-zinc-500">-- No active remarks on file. --</p>
                )}
            </div>
          </div>
        </div>

        {/* COLUMN 2: CERTIFICATIONS */}
        <div className="space-y-6 lg:col-span-1 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
          <h4 className="text-xs text-emerald-500 uppercase tracking-[0.2em] border-b border-emerald-900/30 pb-1">
            Certifications & Training
          </h4>
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-[10px] text-emerald-700 uppercase tracking-widest">
                FAA Licensing
              </h4>
              <CheckListItem
                label="1800 Logbook Hours"
                checked={resources.technicalLogbookHours >= 1800}
                details={`${Math.floor(resources.technicalLogbookHours)} / 1800`}
              />
              <CheckListItem label="A&P Written Exam" checked={inventory.apWrittenPassed} />
              <CheckListItem label="A&P Practical Exam" checked={inventory.apPracticalPassed} />
              <CheckListItem label="A&P License Issued" checked={inventory.hasAPLicense} />
              <CheckListItem label="Avionics Certification" checked={inventory.hasAvionicsCert} />
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] text-emerald-700 uppercase tracking-widest">
                Mandatory Training
              </h4>
              <CheckListItem label="Human Factors (Initial)" checked={inventory.hasHfInitial} />
              <CheckListItem
                label="Human Factors (Recurrent)"
                checked={inventory.hasHfRecurrent}
                details={inventory.hasHfInitial ? 'Due in...' : 'Requires Initial'}
              />
              <CheckListItem label="Fuel Tank Safety (FTS)" checked={inventory.hasFts} />
              <CheckListItem label="Hidden Damage Insp. (HDI)" checked={inventory.hasHdi} />
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] text-emerald-700 uppercase tracking-widest">
                EASA Part-66
              </h4>
              <CheckListItem
                label="2400 Logbook Hours (B1.1)"
                checked={resources.technicalLogbookHours >= 2400}
                details={`${Math.floor(resources.technicalLogbookHours)} / 2400`}
              />
              <div className="bg-black/20 p-2 border border-emerald-900/30">
                <p className="text-[10px] text-emerald-500 mb-1 uppercase tracking-wider">
                  Modules Passed: {proficiency.easaModulesPassed.length}/
                  {trainingData.easaLicense.modules.length}
                </p>
                <div className="grid grid-cols-6 gap-1">
                  {trainingData.easaLicense.modules.map((mod) => (
                    <div
                      key={mod.id}
                      title={mod.name}
                      className={`p-1 text-center border text-[9px] font-mono ${proficiency.easaModulesPassed.includes(mod.id) ? 'bg-emerald-800 border-emerald-600 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-600'}`}
                    >
                      {mod.name.split(':')[0]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3: STATS & BELONGINGS */}
        <div className="space-y-8 lg:col-span-1">
          <div>
            <h4 className="text-xs text-emerald-500 uppercase tracking-[0.2em] border-b border-emerald-900/30 pb-2 mb-4">
              Career Statistics
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <StatDisplay label="Jobs Completed" value={stats.jobsCompleted} />
              <StatDisplay label="SRFs Filed" value={stats.srfsFiled} />
              <StatDisplay label="Events Resolved" value={stats.eventsResolved} />
              <StatDisplay label="NDT Scans" value={stats.ndtScansPerformed} />
              <StatDisplay label="Anomalies" value={stats.anomaliesAnalyzed} />
              <StatDisplay label="Rotables Rep." value={stats.rotablesRepaired} />
            </div>
            <div className="mt-2">
              <StatDisplay
                label="Logbook Hours"
                value={`${Math.floor(resources.technicalLogbookHours)}h`}
              />
            </div>
          </div>

          <div>
            <h4 className="text-xs text-emerald-500 uppercase tracking-[0.2em] border-b border-emerald-900/30 pb-2 mb-4">
              Personal Belongings
            </h4>
            <div className="p-4 border border-emerald-900/50 bg-black/20 min-h-[100px]">
              {Object.entries(state.personalInventory).length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(state.personalInventory).map(([key, count]) => (
                    <div
                      key={key}
                      className="flex justify-between text-xs text-emerald-300 border-b border-emerald-900/30 pb-1"
                    >
                      <span className="uppercase">{key.replace(/_/g, ' ')}</span>
                      <span className="font-bold">x{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic text-center mt-4">
                  No personal items registered.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN MODAL COMPONENT ---

const DashboardModal: React.FC<{
  state: GameState;
  onAction: (t: string, p?: Record<string, unknown>) => void;
  onClose: () => void;
}> = ({ state, onAction, onClose }) => {
  const [activeSection, setActiveSection] = useState<DashboardSection>('FILE');

  const handleSectionClick = (section: DashboardSection) => {
    playClick();
    setActiveSection(section);
  };

  const handleImport = (newState: GameState) => {
    playClick();
    onAction('IMPORT_STATE', { state: newState });
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'MATRIX':
        return <ProficiencyMatrixView state={state} onAction={onAction} />;
      case 'IMPORT_EXPORT':
        return <ImportExportView state={state} onImport={handleImport} />;
      case 'FILE':
        return <PlayerProfileView state={state} />;
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content !p-0 flex h-[80vh] w-[95%] max-w-[1200px]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xs uppercase px-3 py-1 border border-red-800 text-red-500 hover:bg-red-900 transition-all z-10"
        >
          [ CLOSE ]
        </button>
        <div className="w-1/4 bg-black/20 border-r border-emerald-900/50 p-6 flex flex-col space-y-2">
          <h3 className="text-sm text-emerald-600 uppercase tracking-[0.2em] border-b border-emerald-900/30 pb-4 mb-2">
            Player Dashboard
          </h3>
          <button
            onClick={() => handleSectionClick('FILE')}
            className={`w-full text-left px-4 py-2 text-sm uppercase transition-all rounded-sm ${activeSection === 'FILE' ? 'bg-emerald-800 text-white shadow-lg' : 'hover:bg-emerald-950/50 text-emerald-400'}`}
          >
            You
          </button>
          <button
            onClick={() => handleSectionClick('MATRIX')}
            className={`w-full text-left px-4 py-2 text-sm uppercase transition-all rounded-sm ${activeSection === 'MATRIX' ? 'bg-emerald-800 text-white shadow-lg' : 'hover:bg-emerald-950/50 text-emerald-400'}`}
          >
            Proficiency Matrix{' '}
            <span
              className={`ml-2 text-xs px-2 py-0.5 rounded-full ${state.proficiency.skillPoints > 0 ? 'bg-amber-400 text-black' : 'bg-emerald-900 text-emerald-400'}`}
            >
              {state.proficiency.skillPoints}
            </span>
          </button>
          <button
            onClick={() => handleSectionClick('IMPORT_EXPORT')}
            className={`w-full text-left px-4 py-2 text-sm uppercase transition-all rounded-sm ${activeSection === 'IMPORT_EXPORT' ? 'bg-emerald-800 text-white shadow-lg' : 'hover:bg-emerald-950/50 text-emerald-400'}`}
          >
            Import / Export
          </button>
        </div>
        <div className="w-3/4 p-8 overflow-y-auto">
          <div className="animate-[story-reveal_1s_ease-out]">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardModal;
