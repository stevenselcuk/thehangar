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

const formatDuration = (ms: number) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  return `${hours}h ${minutes}m ${seconds}s`;
};

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
      Field Competencies
    </h3>
    <div className="grid grid-cols-2 gap-8">
      <div>
        <h4 className="text-sm text-emerald-400 mb-4 uppercase tracking-[0.2em]">
          Industrial Operations
        </h4>
        <div className="space-y-4">
          {skillsData.mechanic.map((skill) => (
            <SkillNode key={skill.id} skill={skill} state={state} onAction={onAction} />
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm text-purple-400 mb-4 uppercase tracking-[0.2em]">
          Anomaly Observation
        </h4>
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
    <div className="space-y-12 pb-12">
      {/* SECTION 1: IDENTITY HERO */}
      <div className="flex flex-col md:flex-row gap-8 items-start border-b border-emerald-900/30 pb-8">
        {/* Photo ID Card */}
        <div className="w-full md:w-64 flex-shrink-0">
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
          </div>
        </div>

        {/* Identity Details */}
        <div className="flex-grow space-y-6 w-full">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl text-emerald-400 font-bold uppercase tracking-widest mb-1">
                [REDACTED]
              </h3>
              <p className="text-emerald-600 font-mono text-sm">
                770-M-9M-MRO // NIGHT SHIFT MECHANIC
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-zinc-500 mb-1">SECURITY CLEARANCE</p>
              <p
                className={`text-lg font-bold font-mono ${clearanceLevel > 1 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}
              >
                {getClearanceText(clearanceLevel)}
              </p>
            </div>
          </div>

          <div className="bg-black/20 border border-emerald-900/50 p-6 rounded-sm">
            <h4 className="text-xs text-emerald-700 uppercase tracking-widest mb-4 border-b border-emerald-900/30 pb-2">
              HR REMARKS & STATUS
            </h4>
            <div className="text-sm text-emerald-300 space-y-2 font-mono">
              {state.flags.onPerformanceImprovementPlan && (
                <p className="text-amber-400 bg-amber-900/20 p-2 border-l-2 border-amber-500">
                  [REPRIMAND] Subject is currently on a mandatory Performance Improvement Plan.
                </p>
              )}
              {state.flags.suspicionEvent60Triggered && (
                <p className="text-zinc-400 bg-zinc-900/40 p-2 border-l-2 border-zinc-600">
                  [NOTE] Subject's logs show multiple discrepancies. File flagged for internal
                  review.
                </p>
              )}
              {!state.flags.onPerformanceImprovementPlan &&
                !state.flags.suspicionEvent60Triggered && (
                  <p className="text-zinc-500 italic">
                    -- No active disciplinary remarks on file. --
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: CAREER STATISTICS */}
      <div className="space-y-6">
        <h4 className="text-sm text-emerald-500 uppercase tracking-[0.2em] border-b border-emerald-900/30 pb-2">
          Career Performance Metrics
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatDisplay
            label="Logbook Hours"
            value={`${Math.floor(resources.technicalLogbookHours)}H`}
          />
          <StatDisplay label="Jobs Completed" value={stats.jobsCompleted} />
          <StatDisplay label="SRFs Filed" value={stats.srfsFiled} />
          <StatDisplay label="Events Resolved" value={stats.eventsResolved} />
          <StatDisplay label="NDT Scans" value={stats.ndtScansPerformed} />
          <StatDisplay label="Anomalies" value={stats.anomaliesAnalyzed} />
          <StatDisplay label="Rotables Rep." value={stats.rotablesRepaired} />

          {/* New Time Stats */}
          <StatDisplay label="Shift Cycles" value={state.time?.shiftCycle || 1} />
          <StatDisplay label="Time Played" value={formatDuration(state.time?.totalPlayTime || 0)} />

          <div className="p-4 border border-emerald-900/50 bg-black/30">
            <p className="text-xs text-emerald-700 uppercase tracking-widest mb-1">
              Shift Progress
            </p>
            <div className="flex items-end gap-2">
              <p className="text-xl font-bold text-emerald-300">
                {Math.floor(((state.time?.shiftTime || 0) / (8 * 60 * 60 * 1000)) * 100)}%
              </p>
              <div className="flex-grow h-2 bg-emerald-950 mb-1.5 overflow-hidden">
                <div
                  className="h-full bg-emerald-500/50"
                  style={{
                    width: `${Math.min(100, ((state.time?.shiftTime || 0) / (8 * 60 * 60 * 1000)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: CERTIFICATIONS & TRAINING */}
      <div className="space-y-6">
        <h4 className="text-sm text-emerald-500 uppercase tracking-[0.2em] border-b border-emerald-900/30 pb-2">
          Licensing & Qualifications
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* FAA COLUMN */}
          <div className="space-y-4">
            <h5 className="text-xs text-emerald-700 font-bold uppercase tracking-widest bg-emerald-900/10 p-2 border-l-2 border-emerald-600">
              FAA 14 CFR Part 65
            </h5>
            <div className="space-y-2">
              <CheckListItem
                label="1800 Logbook Hours"
                checked={resources.technicalLogbookHours >= 1800}
                details={`${Math.floor(resources.technicalLogbookHours)} / 1800 Required`}
              />
              <CheckListItem label="A&P Written Exam" checked={inventory.apWrittenPassed} />
              <CheckListItem label="A&P Practical Exam" checked={inventory.apPracticalPassed} />
              <CheckListItem label="A&P License Issued" checked={inventory.hasAPLicense} />
              <CheckListItem label="Avionics Certification" checked={inventory.hasAvionicsCert} />
            </div>
          </div>

          {/* MANDATORY TRAINING COLUMN */}
          <div className="space-y-4">
            <h5 className="text-xs text-emerald-700 font-bold uppercase tracking-widest bg-emerald-900/10 p-2 border-l-2 border-emerald-600">
              Mandatory Company Training
            </h5>
            <div className="space-y-2">
              <CheckListItem label="Human Factors (Initial)" checked={inventory.hasHfInitial} />
              <CheckListItem
                label="Human Factors (Recurrent)"
                checked={inventory.hasHfRecurrent}
                details={inventory.hasHfInitial ? 'Due in...' : 'Requires Initial'}
              />
              <CheckListItem label="Fuel Tank Safety (FTS)" checked={inventory.hasFts} />
              <CheckListItem label="Hidden Damage Insp. (HDI)" checked={inventory.hasHdi} />
            </div>
          </div>

          {/* EASA COLUMN */}
          <div className="space-y-4">
            <h5 className="text-xs text-emerald-700 font-bold uppercase tracking-widest bg-emerald-900/10 p-2 border-l-2 border-emerald-600">
              EASA Part-66 (B1.1)
            </h5>
            <div className="space-y-2">
              <CheckListItem
                label="2400 Logbook Hours"
                checked={resources.technicalLogbookHours >= 2400}
                details={`${Math.floor(resources.technicalLogbookHours)} / 2400 Required`}
              />
              <div className="bg-black/20 p-3 border border-emerald-900/30">
                <p className="text-[10px] text-emerald-500 mb-2 uppercase tracking-wider flex justify-between">
                  <span>Modules Passed</span>
                  <span className="text-white">
                    {proficiency.easaModulesPassed.length} /{' '}
                    {trainingData.easaLicense.modules.length}
                  </span>
                </p>
                <div className="grid grid-cols-4 gap-1">
                  {trainingData.easaLicense.modules.map((mod) => (
                    <div
                      key={mod.id}
                      title={mod.name}
                      className={`p-1.5 text-center border text-[9px] font-mono transition-colors ${proficiency.easaModulesPassed.includes(mod.id) ? 'bg-emerald-800 border-emerald-500 text-emerald-100 shadow-[0_0_5px_rgba(16,185,129,0.4)]' : 'bg-zinc-950 border-zinc-800 text-zinc-700'}`}
                    >
                      {mod.name.split(':')[0]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: BELONGINGS */}
      <div className="space-y-6">
        <h4 className="text-sm text-emerald-500 uppercase tracking-[0.2em] border-b border-emerald-900/30 pb-2">
          Tools & Equipment
        </h4>
        <div className="p-6 border border-emerald-900/50 bg-black/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Filter inventory for tools (excluding licenses/certs/upgrades) */}
            {Object.entries(inventory)
              .filter(([key, hasItem]) => {
                if (!hasItem) return false;
                // Exclude non-physical items or specialized flags
                const excluded = [
                  'hasAPLicense',
                  'apWrittenPassed',
                  'apPracticalPassed',
                  'hasAvionicsCert',
                  'isToolboxWithPlayer', // Status flag, not item itself? Or maybe show it?
                  'pcAssembled',
                  'pcGpuUpgrade',
                  'pcHddUpgrade',
                  'hasTruckLockbox',
                  'hasHfInitial',
                  'hasHfRecurrent',
                  'hasFts',
                  'hasHdi',
                  'hasNdtLevel1',
                  'hasNdtLevel2',
                  'hasNdtLevel3',
                  'ndtCerts',
                  'hasEasaB1_1',
                  'hasEasaB2',
                  'hasEasaC',
                  'typeRating737',
                  'typeRatingA330',
                  'mixedTouchUpPaint', // Handle separately if needed
                ];
                return !excluded.includes(key);
              })
              .map(([key]) => (
                <div
                  key={key}
                  className="flex flex-col p-3 border border-emerald-900/30 bg-black/40 text-center hover:bg-emerald-900/20 transition-colors"
                >
                  <span className="text-[10px] text-emerald-500 uppercase font-bold">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-xs text-emerald-700 uppercase">[ EQUIP ]</span>
                </div>
              ))}
          </div>
        </div>

        <h4 className="text-sm text-emerald-500 uppercase tracking-[0.2em] border-b border-emerald-900/30 pb-2">
          Personal Effects
        </h4>
        <div className="p-6 border border-emerald-900/50 bg-black/20">
          {Object.entries(state.personalInventory).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(state.personalInventory).map(([key, count]) => (
                <div
                  key={key}
                  className="flex flex-col p-3 border border-emerald-900/30 bg-black/40 text-center hover:bg-emerald-900/20 transition-colors"
                >
                  <span className="text-[10px] text-emerald-600 uppercase mb-1">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xl font-bold text-emerald-300">x{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-zinc-600 uppercase tracking-widest">
                No personal items registered to this locker.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

type ModalSection = 'FILE' | 'MATRIX' | 'IMPORT_EXPORT' | 'ABOUT' | 'HOW_TO' | 'CONTACT';

interface AboutModalProps {
  state: GameState;
  onAction: (t: string, p?: Record<string, unknown>) => void;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ state, onClose, onAction }) => {
  const BUILD_NUMBER = 'Build Number {_build_41}';

  const [activeSection, setActiveSection] = useState<ModalSection>('FILE');

  const handleSectionClick = (section: ModalSection) => {
    playClick();
    setActiveSection(section);
  };

  const handleImport = (newState: GameState) => {
    playClick();
    onAction('IMPORT_STATE', { state: newState });
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

        {/* Sidebar */}
        <div className="w-1/4 bg-black/20 border-r border-emerald-900/50 p-6 flex flex-col space-y-2">
          {/* Dashboard Section */}
          <h3 className="text-sm text-emerald-600 uppercase tracking-[0.2em] border-b border-emerald-900/30 pb-4 mb-2">
            Dashboard
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
            Field Competencies{' '}
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

          {/* Info Section */}
          <h3 className="text-sm text-emerald-600 uppercase tracking-[0.2em] border-b border-emerald-900/30 pb-4 mb-2 mt-6">
            Information
          </h3>
          <button
            onClick={() => handleSectionClick('ABOUT')}
            className={`w-full text-left px-4 py-2 text-sm uppercase transition-all rounded-sm ${activeSection === 'ABOUT' ? 'bg-emerald-800 text-white shadow-lg' : 'hover:bg-emerald-950/50 text-emerald-400'}`}
          >
            About
          </button>
          <button
            onClick={() => handleSectionClick('HOW_TO')}
            className={`w-full text-left px-4 py-2 text-sm uppercase transition-all rounded-sm ${activeSection === 'HOW_TO' ? 'bg-emerald-800 text-white shadow-lg' : 'hover:bg-emerald-950/50 text-emerald-400'}`}
          >
            How to Play
          </button>
          <button
            onClick={() => handleSectionClick('CONTACT')}
            className={`w-full text-left px-4 py-2 text-sm uppercase transition-all rounded-sm ${activeSection === 'CONTACT' ? 'bg-emerald-800 text-white shadow-lg' : 'hover:bg-emerald-950/50 text-emerald-400'}`}
          >
            Contact
          </button>
        </div>

        {/* Content */}
        <div className="w-3/4 p-8 overflow-y-auto">
          {activeSection === 'FILE' && (
            <div className="animate-[story-reveal_1s_ease-out]">
              <PlayerProfileView state={state} />
            </div>
          )}
          {activeSection === 'MATRIX' && (
            <div className="animate-[story-reveal_1s_ease-out]">
              <ProficiencyMatrixView state={state} onAction={onAction} />
            </div>
          )}
          {activeSection === 'IMPORT_EXPORT' && (
            <div className="animate-[story-reveal_1s_ease-out]">
              <ImportExportView state={state} onImport={handleImport} />
            </div>
          )}

          {activeSection === 'ABOUT' && (
            <div className="space-y-6 text-emerald-300 animate-[story-reveal_1s_ease-out]">
              <h1 className="text-2xl font-bold text-emerald-400 border-b border-emerald-800 pb-2">
                THE HANGAR
                <p className="text-xs uppercase text-emerald-600 tracking-widest">
                  {BUILD_NUMBER.replace(/\{_build_(\d+)\}/, '$1')}
                </p>
              </h1>
              <p className="text-sm leading-relaxed">
                THE HANGAR is a text-based incremental RPG of industrial dread and eldritch mystery.
                You are a night-shift aircraft mechanic at a remote international airport. What
                begins as a mundane routine of repairs and paperwork slowly unravels into a
                terrifying conspiracy surrounding the disappearance of flight MH370 and the strange,
                untraceable components that have started appearing in your bay.
              </p>
              <p className="text-sm leading-relaxed">
                This game saves your progress automatically in your browser's local storage. There
                is no server, and no data is collected.
              </p>
              <div className="pt-4 border-t border-emerald-900/50">
                <h2 className="text-xs uppercase text-emerald-600 tracking-widest">Credits</h2>
                <p className="text-sm mt-2">Me. Steve.</p>
              </div>
            </div>
          )}
          {activeSection === 'HOW_TO' && (
            <div className="space-y-6 text-emerald-300 animate-[story-reveal_1s_ease-out]">
              <h1 className="text-2xl font-bold text-emerald-400 border-b border-emerald-800 pb-2">
                How to Play
              </h1>
              <div>
                <h2 className="text-lg font-semibold text-emerald-400 mb-2">The Goal</h2>
                <p className="text-sm leading-relaxed">
                  Survive your shift, maintain your sanity, and uncover the truth without drawing
                  too much attention. Every action has consequences.
                </p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-emerald-400 mb-2">Core Stats</h2>
                <ul className="space-y-3 text-sm list-disc list-inside">
                  <li>
                    <strong className="text-emerald-400">Sanity:</strong> Your mental stability.
                    Drops when you witness strange events. If it reaches zero, you lose.
                  </li>
                  <li>
                    <strong className="text-red-400">Suspicion:</strong> How much attention you've
                    drawn from management and other forces. If it reaches 100, you are... removed.
                  </li>
                  <li>
                    <strong className="text-blue-400">Focus:</strong> Your ability to perform tasks.
                    Consumed by most actions, but regenerates over time. Keep it high to be
                    effective.
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-emerald-400 mb-2">Gameplay Loop</h2>
                <ul className="space-y-3 text-sm list-disc list-inside">
                  <li>
                    Take on jobs and assignments from the{' '}
                    <strong className="text-emerald-400">APRON</strong> and{' '}
                    <strong className="text-emerald-400">HANGAR</strong> to earn Credits and
                    Experience (XP).
                  </li>
                  <li>Use resources like Alclad and Rivets to complete jobs.</li>
                  <li>
                    Manage your tools in the <strong className="text-emerald-400">TOOLROOM</strong>.
                    Broken tools are useless and the Master gets angry.
                  </li>
                  <li>
                    Visit the <strong className="text-emerald-400">CANTEEN</strong> and{' '}
                    <strong className="text-emerald-400">TERMINAL</strong> to manage your Sanity and
                    Focus.
                  </li>
                  <li>
                    Use the <strong className="text-emerald-400">OFFICE</strong> to manage your
                    career, study for licenses, and investigate leads.
                  </li>
                  <li>
                    Spend Skill Points in the{' '}
                    <strong className="text-emerald-400">FIELD COMPETENCIES</strong> (click your
                    Level/XP bar in the header) to unlock new abilities.
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-emerald-400 mb-2">The Mystery</h2>
                <p className="text-sm leading-relaxed">
                  Pay attention to the logs, radio chatter, and emails. The truth is hidden in the
                  details. Some choices will open new paths, while others will lead to a dead end.
                  Good luck.
                </p>
              </div>
            </div>
          )}
          {activeSection === 'CONTACT' && (
            <div className="space-y-6 text-emerald-300 animate-[story-reveal_1s_ease-out]">
              <h1 className="text-2xl font-bold text-emerald-400 border-b border-emerald-800 pb-2">
                Contact
              </h1>
              <div>
                <h2 className="text-lg font-semibold text-emerald-400 mb-2">
                  Feedback & Inquiries
                </h2>
                <p className="text-sm leading-relaxed">
                  For feedback, bug reports, or any other inquiries, you can reach out via email:
                </p>
                <a
                  href="mailto:steven@tabbythecat.com"
                  className="text-lg text-amber-400 font-mono my-2 inline-block hover:underline"
                >
                  steven@tabbythecat.com
                </a>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-emerald-400 mb-2">Public Repository</h2>
                <p className="text-sm leading-relaxed mb-4">
                  The Hangar is open source. Issue or feature request? Go to the GitHub repo. PR's
                  welcome.
                </p>
                <a
                  href="https://github.com/stevenselcuk/thehangar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 border border-emerald-700 bg-emerald-950/20 text-emerald-300 uppercase text-sm font-bold tracking-widest hover:bg-emerald-900/40 hover:border-emerald-500 transition-all"
                >
                  Go GitHub Repo
                </a>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-emerald-400 mb-2">Developer Profile</h2>
                <p className="text-sm leading-relaxed mb-4">
                  Check out the developer's other projects on GitHub.
                </p>
                <a
                  href="https://github.com/stevenselcuk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 border border-emerald-700 bg-emerald-950/20 text-emerald-300 uppercase text-sm font-bold tracking-widest hover:bg-emerald-900/40 hover:border-emerald-500 transition-all"
                >
                  Visit GitHub Profile
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
