import React from 'react';
import { trainingData } from '../data/training.ts';
import { GameState } from '../types.ts';
import ActionButton from './ActionButton.tsx';

const Section: React.FC<{ title: string; children: React.ReactNode; borderColor?: string }> = ({
  title,
  children,
  borderColor = 'border-emerald-900/60',
}) => (
  <div className={`p-5 border ${borderColor} bg-black/40`}>
    <h4
      className={`text-[10px] text-emerald-500 uppercase mb-4 font-bold tracking-widest border-l-2 ${borderColor.replace('900/60', '600')} pl-3`}
    >
      {title}
    </h4>
    <div className="space-y-3">{children}</div>
  </div>
);

const ProgressBar: React.FC<{ value: number; max: number; label: string }> = ({
  value,
  max,
  label,
}) => {
  const progress = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-[9px] uppercase mb-1">
        <span className="text-emerald-700">{label}</span>
        <span className="text-blue-400">
          {Math.floor(value)} / {max} Hours
        </span>
      </div>
      <div className="w-full h-1.5 bg-emerald-950/50 border border-emerald-900/30">
        <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

const TrainingTab: React.FC<{
  state: GameState;
  onAction: (t: string, p?: Record<string, unknown>) => void;
}> = ({ state, onAction }) => {
  const inv = state.inventory;
  const res = state.resources;
  const prof = state.proficiency;

  return (
    <div className="space-y-8">
      <h3 className="text-xs text-emerald-700 mb-4 uppercase tracking-[0.2em] border-b border-emerald-900/30 pb-2">
        Training Department
      </h3>

      <Section title="Mandatory & Recurrent Training">
        {trainingData.mandatoryCourses.map((course) => {
          const hasCert = inv[course.inventoryFlag as keyof typeof inv];
          const hasPrereq = !course.prereq || inv[course.prereq as keyof typeof inv];
          return (
            !hasCert && (
              <ActionButton
                key={course.id}
                label={`Take: ${course.label}`}
                onClick={() => onAction('TAKE_MANDATORY_COURSE', course)}
                description={course.description}
                cost={{ label: 'CR', value: course.costCredits }}
                disabled={res.credits < course.costCredits || !hasPrereq}
              />
            )
          );
        })}
        {inv.hasHfInitial && !inv.hasHfRecurrent && (
          <p className="text-[9px] text-amber-500 uppercase italic border border-amber-900/20 p-3 bg-amber-950/5 text-center">
            [ WARNING: Human Factors Recurrent Training is due. ]
          </p>
        )}
      </Section>

      <Section title="FAA Licensing">
        <ProgressBar
          value={res.technicalLogbookHours}
          max={trainingData.faaLicense.logbookRequirement}
          label="18-Month Experience Requirement"
        />

        {!inv.apWrittenPassed ? (
          <ActionButton
            label={trainingData.faaLicense.written.label}
            onClick={() => onAction('TAKE_AP_WRITTEN')}
            description={trainingData.faaLicense.written.description}
            cost={{ label: 'CR', value: trainingData.faaLicense.written.costCredits }}
            disabled={
              res.technicalLogbookHours < trainingData.faaLicense.logbookRequirement ||
              !inv.hasHfInitial ||
              res.credits < trainingData.faaLicense.written.costCredits
            }
          />
        ) : !inv.apPracticalPassed ? (
          <ActionButton
            label={trainingData.faaLicense.practical.label}
            onClick={() => onAction('TAKE_AP_EXAM', trainingData.faaLicense.practical)}
            description={trainingData.faaLicense.practical.description}
            cost={{ label: 'CR', value: trainingData.faaLicense.practical.costCredits }}
            disabled={
              !inv.apWrittenPassed || res.credits < trainingData.faaLicense.practical.costCredits
            }
          />
        ) : !inv.hasAPLicense ? (
          <ActionButton
            label={trainingData.faaLicense.license.label}
            onClick={() => onAction('TAKE_AP_EXAM', trainingData.faaLicense.license)}
            description={trainingData.faaLicense.license.description}
          />
        ) : (
          <div className="text-[10px] text-emerald-400 uppercase italic border border-emerald-900/20 p-3 bg-emerald-950/20 text-center">
            [ FAA Airframe & Powerplant License Certified ]
          </div>
        )}

        {inv.hasAPLicense && !inv.hasAvionicsCert && (
          <ActionButton
            label={trainingData.faaLicense.avionics.label}
            onClick={() => onAction('TAKE_AVIONICS_EXAM')}
            description={trainingData.faaLicense.avionics.description}
            cost={{ label: 'CR', value: trainingData.faaLicense.avionics.costCredits }}
            disabled={res.credits < trainingData.faaLicense.avionics.costCredits}
          />
        )}
      </Section>

      <Section title="NDT Certification">
        {trainingData.ndtCerts.levels.map((level) => {
          const hasCert = inv[level.id as keyof typeof inv];
          const hasPrereq = !level.prereq || inv[level.prereq as keyof typeof inv];
          return (
            !hasCert && (
              <ActionButton
                key={level.id}
                label={`Certify: ${level.label}`}
                onClick={() => onAction('TAKE_NDT_EXAM', level)}
                description={level.description}
                cost={{ label: 'CR', value: level.costCredits }}
                disabled={!hasPrereq || res.credits < level.costCredits}
              />
            )
          );
        })}
        {inv.hasNdtLevel1 && (
          <div className="pt-4 border-t border-emerald-900/30">
            <h5 className="text-[9px] text-emerald-600 uppercase mb-3 font-bold tracking-widest">
              Sub-Task Qualifications
            </h5>
            <div className="grid grid-cols-2 gap-2">
              {trainingData.ndtCerts.subtasks.map((task) => {
                const hasCert = inv.ndtCerts.includes(
                  task.id as 'eddy' | 'hfec' | 'tap' | 'borescope' | 'dye'
                );
                return (
                  !hasCert && (
                    <ActionButton
                      key={task.id}
                      label={task.label}
                      onClick={() => onAction('TAKE_NDT_SUBTASK_EXAM', task)}
                      cost={{ label: 'CR', value: task.costCredits }}
                      disabled={res.credits < task.costCredits}
                      className="mb-0 text-xs"
                    />
                  )
                );
              })}
            </div>
          </div>
        )}
      </Section>

      <Section title="EASA Part-66 Licensing">
        <ProgressBar
          value={res.technicalLogbookHours}
          max={trainingData.easaLicense.logbookB1}
          label="B1.1 Experience Requirement"
        />
        <div className="my-4">
          <h5 className="text-[9px] text-emerald-600 uppercase mb-3 font-bold tracking-widest">
            Licensing Modules ({prof.easaModulesPassed.length} /{' '}
            {trainingData.easaLicense.modules.length} Passed)
          </h5>
          <div className="grid grid-cols-6 gap-2">
            {trainingData.easaLicense.modules.map((mod) => {
              const isPassed = prof.easaModulesPassed.includes(mod.id);
              return (
                <div
                  key={mod.id}
                  className={`p-2 text-center border text-xs font-mono ${isPassed ? 'bg-emerald-800 border-emerald-600 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-500'}`}
                >
                  {mod.name.split(':')[0]}
                </div>
              );
            })}
          </div>
        </div>
        {!inv.hasEasaB1_1 ? (
          <>
            <ActionButton
              label="Sit Next EASA Module Exam"
              onClick={() => onAction('START_EASA_MODULE')}
              description={`Take the exam for the next required module. Cost is per attempt.`}
              cost={{ label: 'CR', value: trainingData.easaLicense.examCost.costCredits }}
              disabled={res.credits < trainingData.easaLicense.examCost.costCredits}
            />
            <ActionButton
              label="Certify for EASA B1.1 License"
              onClick={() => onAction('CERTIFY_EASA_LICENSE')}
              description={`Requires all ${trainingData.easaLicense.modules.length} modules passed and ${trainingData.easaLicense.logbookB1} logbook hours.`}
              disabled={
                prof.easaModulesPassed.length < trainingData.easaLicense.modules.length ||
                res.technicalLogbookHours < trainingData.easaLicense.logbookB1
              }
            />
          </>
        ) : (
          <div className="text-[10px] text-emerald-400 uppercase italic border border-emerald-900/20 p-3 bg-emerald-950/20 text-center">
            [ EASA B1.1 License Certified ]
          </div>
        )}
      </Section>

      <Section title="Aircraft Type Ratings">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h5 className="text-[10px] text-emerald-400 uppercase mb-3 font-bold tracking-widest">
              Boeing 737
            </h5>
            {trainingData.typeRatings['737'].map(
              (rating) =>
                inv.typeRating737 < rating.id && (
                  <ActionButton
                    key={rating.id}
                    label={rating.label}
                    onClick={() => onAction('TAKE_TYPE_RATING', { family: '737', ...rating })}
                    cost={{ label: 'CR', value: rating.costCredits }}
                    disabled={
                      res.credits < rating.costCredits ||
                      (rating.prereq ? !inv[rating.prereq as keyof typeof inv] : false) ||
                      (rating.prereqLevel ? inv.typeRating737 < rating.prereqLevel : false)
                    }
                  />
                )
            )}
          </div>
          <div>
            <h5 className="text-[10px] text-emerald-400 uppercase mb-3 font-bold tracking-widest">
              Airbus A330
            </h5>
            {trainingData.typeRatings['A330'].map(
              (rating) =>
                inv.typeRatingA330 < rating.id && (
                  <ActionButton
                    key={rating.id}
                    label={rating.label}
                    onClick={() => onAction('TAKE_TYPE_RATING', { family: 'A330', ...rating })}
                    cost={{ label: 'CR', value: rating.costCredits }}
                    disabled={
                      res.credits < rating.costCredits ||
                      (rating.prereq ? !inv[rating.prereq as keyof typeof inv] : false) ||
                      (rating.prereqLevel ? inv.typeRatingA330 < rating.prereqLevel : false)
                    }
                  />
                )
            )}
          </div>
        </div>
      </Section>
    </div>
  );
};

export default TrainingTab;
