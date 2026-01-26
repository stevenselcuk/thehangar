import React, { useState } from 'react';
import { Skill, skillsData } from '../data/skills.ts';
import { trainingData } from '../data/training.ts';
import { GameState } from '../types.ts';

const playClick = () => {
  const audio = new Audio('/sounds/ui_click.mp3');
  audio.volume = 0.3;
  audio.play().catch(() => {});
};

type DashboardSection = 'MATRIX' | 'CERTS' | 'STATS' | 'FILE';

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

const CheckListItem: React.FC<{
  label: string;
  checked: boolean;
  details?: string;
  action?: { label: string; onClick: () => void; disabled: boolean; cost?: string };
}> = ({ label, checked, details, action }) => (
  <div
    className={`p-3 border transition-all flex flex-col gap-2 ${checked ? 'border-emerald-700 bg-emerald-950/20 text-emerald-300' : 'border-zinc-800 bg-black/20 text-zinc-500'}`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div
          className={`w-4 h-4 mr-3 border-2 flex-shrink-0 ${checked ? 'bg-emerald-500 border-emerald-400' : 'border-zinc-600'}`}
        />
        <span className="text-sm uppercase tracking-wider">{label}</span>
      </div>
      {action && !checked && (
        <button
          onClick={action.onClick}
          disabled={action.disabled}
          className="text-[10px] uppercase px-2 py-1 border border-emerald-900 bg-emerald-950/40 hover:bg-emerald-900 text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-zinc-600"
        >
          {action.label}
        </button>
      )}
    </div>
    {(details || (action?.cost && !checked)) && (
      <div className="pl-7 text-xs flex gap-4">
        {details && <span className="text-zinc-400">{details}</span>}
        {action?.cost && !checked && <span className="text-amber-700">{action.cost}</span>}
      </div>
    )}
  </div>
);

const CertificationsView: React.FC<{
  state: GameState;
  onAction: (t: string, p?: Record<string, unknown>) => void;
}> = ({ state, onAction }) => {
  const { inventory, resources, proficiency } = state;
  return (
    <div className="space-y-6">
      <h3 className="text-sm text-emerald-400 uppercase tracking-[0.2em] border-b border-emerald-900/30 pb-2">
        Certifications & Licenses
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-xs text-emerald-600 uppercase tracking-widest">FAA Licensing</h4>
          <CheckListItem
            label="1800 Logbook Hours"
            checked={resources.technicalLogbookHours >= 1800}
            details={`${Math.floor(resources.technicalLogbookHours)} / 1800`}
          />
          <CheckListItem
            label="A&P Written Exam"
            checked={inventory.apWrittenPassed}
            action={{
              label: 'Take Exam',
              onClick: () => onAction('TAKE_AP_EXAM', { id: 'apWritten' }),
              disabled: resources.technicalLogbookHours < 1800 || resources.credits < 250,
              cost: '250 CR | 100 Focus',
            }}
          />
          <CheckListItem
            label="A&P Practical Exam"
            checked={inventory.apPracticalPassed}
            action={{
              label: 'Schedule Practical',
              onClick: () => onAction('TAKE_AP_EXAM', { id: 'apPractical' }),
              disabled: !inventory.apWrittenPassed || resources.credits < 500,
              cost: '500 CR | 200 Focus',
            }}
          />
          <CheckListItem
            label="A&P License Issued"
            checked={inventory.hasAPLicense}
            action={{
              label: 'Claim License',
              onClick: () => onAction('TAKE_AP_EXAM', { id: 'hasAPLicense' }),
              disabled: !inventory.apPracticalPassed,
              cost: 'Free',
            }}
          />
          <CheckListItem
            label="Avionics Certification"
            checked={inventory.hasAvionicsCert}
            action={{
              label: 'Take Cert Exam',
              onClick: () => onAction('TAKE_AVIONICS_EXAM'),
              disabled: !inventory.hasAPLicense || resources.credits < 400,
              cost: '400 CR | 150 Focus',
            }}
          />
        </div>
        <div className="space-y-4">
          <h4 className="text-xs text-emerald-600 uppercase tracking-widest">Mandatory Training</h4>
          <CheckListItem
            label="Human Factors (Initial)"
            checked={inventory.hasHfInitial}
            action={{
              label: 'Enroll',
              onClick: () => onAction('TAKE_MANDATORY_COURSE', { id: 'hfInitial' }),
              disabled: resources.credits < 200,
              cost: '200 CR',
            }}
          />
          <CheckListItem
            label="Human Factors (Recurrent)"
            checked={inventory.hasHfRecurrent}
            details={inventory.hasHfInitial ? 'Recurrent Due' : 'Requires Initial'}
            action={{
              label: 'Renew',
              onClick: () => onAction('TAKE_MANDATORY_COURSE', { id: 'hfRecurrent' }),
              disabled: !inventory.hasHfInitial || resources.credits < 100,
              cost: '100 CR',
            }}
          />
          <CheckListItem
            label="Fuel Tank Safety (FTS)"
            checked={inventory.hasFts}
            action={{
              label: 'Enroll',
              onClick: () => onAction('TAKE_MANDATORY_COURSE', { id: 'fts' }),
              disabled: !inventory.hasHfInitial || resources.credits < 150,
              cost: '150 CR',
            }}
          />
          <CheckListItem
            label="Hidden Damage Insp. (HDI)"
            checked={inventory.hasHdi}
            action={{
              label: 'Enroll',
              onClick: () => onAction('TAKE_MANDATORY_COURSE', { id: 'hdi' }),
              disabled: !inventory.hasFts || resources.credits < 300,
              cost: '300 CR',
            }}
          />
        </div>
        <div className="space-y-4">
          <h4 className="text-xs text-emerald-600 uppercase tracking-widest">NDT Certifications</h4>
          <CheckListItem
            label="NDT Level I"
            checked={inventory.hasNdtLevel1}
            action={{
              label: 'Exam',
              onClick: () => onAction('TAKE_NDT_EXAM', { id: 'hasNdtLevel1' }),
              disabled: resources.credits < 500,
              cost: '500 CR',
            }}
          />
          <CheckListItem
            label="NDT Level II"
            checked={inventory.hasNdtLevel2}
            action={{
              label: 'Exam',
              onClick: () => onAction('TAKE_NDT_EXAM', { id: 'hasNdtLevel2' }),
              disabled: !inventory.hasNdtLevel1 || resources.credits < 1000,
              cost: '1000 CR',
            }}
          />
          <CheckListItem
            label="NDT Level III"
            checked={inventory.hasNdtLevel3}
            action={{
              label: 'Exam',
              onClick: () => onAction('TAKE_NDT_EXAM', { id: 'hasNdtLevel3' }),
              disabled: !inventory.hasNdtLevel2 || resources.credits < 2500,
              cost: '2500 CR',
            }}
          />
        </div>
        <div className="space-y-4">
          <h4 className="text-xs text-emerald-600 uppercase tracking-widest">Type Ratings</h4>
          <p className="text-sm text-emerald-300 flex justify-between items-center">
            <span>
              Boeing 737: <span className="font-bold">Level {inventory.typeRating737}</span>
            </span>
            <button
              onClick={() =>
                onAction('TAKE_TYPE_RATING', { family: '737', id: inventory.typeRating737 + 1 })
              }
              disabled={inventory.typeRating737 >= 3 || resources.credits < 300} // Simplified check
              className="text-[10px] border border-emerald-900 px-2 py-1 text-emerald-500 hover:bg-emerald-900/30 disabled:opacity-30"
            >
              UPGRADE
            </button>
          </p>
          <p className="text-sm text-emerald-300 flex justify-between items-center">
            <span>
              Airbus A330: <span className="font-bold">Level {inventory.typeRatingA330}</span>
            </span>
            <button
              onClick={() =>
                onAction('TAKE_TYPE_RATING', { family: 'A330', id: inventory.typeRatingA330 + 1 })
              }
              disabled={inventory.typeRatingA330 >= 3 || resources.credits < 400} // Simplified check
              className="text-[10px] border border-emerald-900 px-2 py-1 text-emerald-500 hover:bg-emerald-900/30 disabled:opacity-30"
            >
              UPGRADE
            </button>
          </p>
        </div>
      </div>
      <div className="space-y-4 pt-4 border-t border-emerald-900/20">
        <h4 className="text-xs text-emerald-600 uppercase tracking-widest">EASA Part-66</h4>
        <CheckListItem
          label="2400 Logbook Hours (B1.1)"
          checked={resources.technicalLogbookHours >= 2400}
          details={`${Math.floor(resources.technicalLogbookHours)} / 2400`}
        />
        <p className="text-sm text-emerald-300">
          Modules Passed: {proficiency.easaModulesPassed.length}/
          {trainingData.easaLicense.modules.length}
        </p>
        <div className="grid grid-cols-9 gap-1">
          {trainingData.easaLicense.modules.map((mod) => (
            <div
              key={mod.id}
              title={mod.name}
              className={`p-2 text-center border text-xs font-mono ${proficiency.easaModulesPassed.includes(mod.id) ? 'bg-emerald-800 border-emerald-600 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-500'}`}
            >
              {mod.name.split(':')[0]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatDisplay: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="p-4 border border-emerald-900/50 bg-black/30">
    <p className="text-xs text-emerald-700 uppercase tracking-widest">{label}</p>
    <p className="text-2xl font-bold text-emerald-300 mt-1">{value}</p>
  </div>
);

const StatsView: React.FC<{ state: GameState }> = ({ state }) => {
  const { stats, resources } = state;
  return (
    <div className="space-y-6">
      <h3 className="text-sm text-emerald-400 uppercase tracking-[0.2em] border-b border-emerald-900/30 pb-2">
        Career Logbook & Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatDisplay
          label="Logbook Hours"
          value={`${Math.floor(resources.technicalLogbookHours)}h`}
        />
        <StatDisplay label="Jobs Completed" value={stats.jobsCompleted} />
        <StatDisplay label="SRFs Filed" value={stats.srfsFiled} />
        <StatDisplay label="Events Resolved" value={stats.eventsResolved} />
        <StatDisplay label="NDT Scans" value={stats.ndtScansPerformed} />
        <StatDisplay label="Anomalies Analyzed" value={stats.anomaliesAnalyzed} />
        <StatDisplay label="Rotables Repaired" value={stats.rotablesRepaired} />
        <StatDisplay label="Rotables Scavenged" value={stats.rotablesScavenged} />
      </div>
    </div>
  );
};

const PersonnelFileView: React.FC<{ state: GameState }> = ({ state }) => {
  const { sanity } = state.resources;
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
    <div className="space-y-6">
      <h3 className="text-sm text-emerald-400 uppercase tracking-[0.2em] border-b border-emerald-900/30 pb-2">
        Personnel File: 770-M-9M-MRO
      </h3>
      <div className="w-full bg-zinc-300 p-6 rounded-lg shadow-2xl flex space-x-6">
        <div className="flex-shrink-0 w-32 h-40 relative border-4 border-zinc-400 bg-zinc-500">
          <img
            src="/images/photo.png"
            alt="Employee ID"
            style={{ filter: photoFilter }}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-grow text-zinc-800 font-mono">
          <div className="border-b-2 border-red-700 pb-1 mb-3">
            <h3 className="text-xs text-red-800 font-bold">PROPERTY OF [REDACTED] AEROSPACE</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase text-zinc-500">NAME</p>
              <p className="text-lg font-bold tracking-wider">[REDACTED]</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-zinc-500">TITLE</p>
              <p className="text-sm font-semibold">Mechanic, Night Shift</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-zinc-500">CLEARANCE</p>
              <p
                className={`text-sm font-bold ${clearanceLevel > 1 ? 'text-red-700 animate-pulse' : ''}`}
              >
                {getClearanceText(clearanceLevel)}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-xs text-emerald-600 uppercase tracking-widest mt-4">
          Record & Remarks
        </h4>
        <div className="mt-2 p-4 border border-emerald-900/50 bg-black/20 text-sm text-emerald-300 space-y-2">
          {state.flags.onPerformanceImprovementPlan && (
            <p className="text-amber-400">
              [REPRIMAND] Subject is currently on a mandatory Performance Improvement Plan.
            </p>
          )}
          {state.flags.suspicionEvent60Triggered && (
            <p className="text-zinc-400">
              [NOTE] Subject's logs show multiple discrepancies. File flagged for internal review.
            </p>
          )}
          {!state.flags.onPerformanceImprovementPlan && !state.flags.suspicionEvent60Triggered && (
            <p className="text-zinc-500">-- No active remarks on file. --</p>
          )}
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
  const [activeSection, setActiveSection] = useState<DashboardSection>('MATRIX');

  const handleSectionClick = (section: DashboardSection) => {
    playClick();
    setActiveSection(section);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'MATRIX':
        return <ProficiencyMatrixView state={state} onAction={onAction} />;
      case 'CERTS':
        return <CertificationsView state={state} onAction={onAction} />;
      case 'STATS':
        return <StatsView state={state} />;
      case 'FILE':
        return <PersonnelFileView state={state} />;
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
            onClick={() => handleSectionClick('CERTS')}
            className={`w-full text-left px-4 py-2 text-sm uppercase transition-all rounded-sm ${activeSection === 'CERTS' ? 'bg-emerald-800 text-white shadow-lg' : 'hover:bg-emerald-950/50 text-emerald-400'}`}
          >
            Certifications
          </button>
          <button
            onClick={() => handleSectionClick('STATS')}
            className={`w-full text-left px-4 py-2 text-sm uppercase transition-all rounded-sm ${activeSection === 'STATS' ? 'bg-emerald-800 text-white shadow-lg' : 'hover:bg-emerald-950/50 text-emerald-400'}`}
          >
            Career Stats
          </button>
          <button
            onClick={() => handleSectionClick('FILE')}
            className={`w-full text-left px-4 py-2 text-sm uppercase transition-all rounded-sm ${activeSection === 'FILE' ? 'bg-emerald-800 text-white shadow-lg' : 'hover:bg-emerald-950/50 text-emerald-400'}`}
          >
            Personnel File
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
