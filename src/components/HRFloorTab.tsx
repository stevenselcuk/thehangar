import React from 'react';
import { GameState } from '../types.ts';
import ActionButton from './ActionButton.tsx';

const HRFloorTab: React.FC<{
  state: GameState;
  onAction: (t: string, p?: Record<string, unknown>) => void;
}> = ({ state, onAction }) => {
  const isChemicallyEnhanced = state.flags.venomSurgeActive;
  const chemTimer = Math.ceil(state.hfStats.venomSurgeTimer / 1000);
  const reviewTimer = Math.ceil(state.hfStats.performanceReviewCooldown / 1000);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xs text-red-700 uppercase tracking-[0.2em] border-b border-red-900/30 pb-2 w-full">
          Human Resources - Floor 3
        </h3>
        {state.flags.onPerformanceImprovementPlan && (
          <div className="ml-4 text-[9px] uppercase font-black text-amber-500 animate-pulse tracking-widest whitespace-nowrap p-2 border border-amber-700 bg-amber-950/20">
            [ ON PERFORMANCE IMPROVEMENT PLAN ]
          </div>
        )}
      </div>

      {/* Biometric Compliance Section */}
      <div className="p-5 border-2 border-red-900/60 bg-black/40">
        <h4 className="text-[10px] text-red-500 uppercase mb-4 font-bold tracking-widest border-l-2 border-red-600 pl-3">
          Biometric Compliance Station
        </h4>

        {isChemicallyEnhanced && (
          <div className="p-3 mb-4 border border-amber-600 bg-amber-950/20 text-amber-400 text-[10px] text-center font-bold animate-pulse">
            WARNING: Anomalous Biomarkers Detected. Compliance Test Unsafe for {chemTimer}s.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <ActionButton
            label="Submit to Biometric Screening"
            onClick={() => onAction('GIVE_URINE_SAMPLE')}
            cost={{ label: 'FOCUS', value: 5 }}
            description="Provide a sample to demonstrate compliance and reduce suspicion."
            cooldown={300000}
            className={
              isChemicallyEnhanced
                ? 'border-amber-500 text-amber-400'
                : 'border-red-800 text-red-400'
            }
          />
          <ActionButton
            label="Forge Biometric Sample"
            onClick={() => onAction('FORGE_SAMPLE')}
            cost={{ label: 'CR', value: 750 }}
            description="A very expensive, high-risk option to guarantee a pass. Comes with its own paper trail."
            disabled={state.resources.credits < 750}
            className="border-purple-700 text-purple-400"
          />
        </div>
        <p className="mt-3 text-[8px] text-red-900 uppercase italic">
          The silence in this white room is absolute. A single, wall-mounted terminal glows with a
          compliance checklist. Your name is already on it.
        </p>
      </div>

      {/* Personnel Records Section */}
      <div className="p-5 border border-purple-900/60 bg-black/40">
        <h4 className="text-[10px] text-purple-400 uppercase mb-4 font-bold tracking-widest border-l-2 border-purple-600 pl-3">
          Personnel Records
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <ActionButton
            label="View Personal ID"
            onClick={() => onAction('SHOW_ID_CARD')}
            description="Review your corporate identification. Your face feels... unfamiliar."
          />
          <ActionButton
            label="Access Archives Terminal"
            onClick={() => onAction('OPEN_ARCHIVE_TERMINAL')}
            description="Log into the HR archives terminal. Unauthorized queries will be flagged."
            className="border-purple-700 text-purple-400"
          />
        </div>
      </div>

      {/* Policy & Records Section */}
      <div className="p-5 border border-zinc-700/60 bg-black/20">
        <h4 className="text-[10px] text-zinc-500 uppercase mb-4 font-bold tracking-widest border-l-2 border-zinc-600 pl-3">
          Policy & Records
        </h4>
        <div className="grid grid-cols-1 gap-3">
          <ActionButton
            label="Consult Policy Archive"
            onClick={() => onAction('REVIEW_COMPLIANCE')}
            cost={{ label: 'FOCUS', value: 15 }}
            description="A mind-numbing task. Read corporate policy to slightly reduce suspicion at the cost of your will to live. You might find a loophole."
          />
          <div className="p-3 border border-zinc-800 bg-black/30">
            <h5 className="text-[9px] text-zinc-400 mb-2 uppercase tracking-wider">
              File an Incident Report
            </h5>
            <div className="grid grid-cols-2 gap-3">
              <ActionButton
                label="Report Mundane Infraction"
                onClick={() => onAction('REPORT_MUNDANE')}
                cost={{ label: 'FOCUS', value: 10 }}
                description="Report a minor safety violation to appear diligent. Slightly reduces suspicion."
                className="mb-0 text-xs"
              />
              <ActionButton
                label="Report Anomalous Event"
                onClick={() => onAction('REPORT_ANOMALOUS')}
                cost={{ label: 'SANITY', value: 20 }}
                description="HIGH RISK. Detail an unexplainable event. Temporarily halts sanity loss but draws extreme suspicion."
                className="mb-0 text-xs border-red-700 text-red-500"
                disabled={state.resources.sanity < 20}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Personnel Actions Section */}
      <div className="p-5 border border-amber-900/60 bg-black/20">
        <h4 className="text-[10px] text-amber-500 uppercase mb-4 font-bold tracking-widest border-l-2 border-amber-600 pl-3">
          Personnel Actions
        </h4>
        <div className="grid grid-cols-1 gap-3">
          <ActionButton
            label={
              reviewTimer > 0
                ? `Review available in ${reviewTimer}s`
                : 'Submit to Weekly Performance Review'
            }
            onClick={() => onAction('PERFORMANCE_REVIEW')}
            cost={{ label: 'FOCUS', value: 20 }}
            disabled={reviewTimer > 0}
            cooldown={600000} // 10 minutes
            description="Your weekly performance is evaluated. Good work may be rewarded. Poor performance will be noted and disciplined."
          />
          <ActionButton
            label="Request Unpaid Leave"
            onClick={() => onAction('REQUEST_LEAVE')}
            cost={{ label: 'CR', value: 300 }}
            disabled={state.resources.credits < 300}
            cooldown={1800000} // 30 minutes
            description="Take a significant break from your shift. Recovers a large amount of Sanity and reduces Fatigue at a high cost."
          />
        </div>
      </div>
    </div>
  );
};

export default HRFloorTab;
