/**
 * OnboardingScreen - First-time player experience
 *
 * This is a one-time view shown at Level 0 for players who haven't completed
 * the onboarding sequence. Matches the game's clinical-horror aesthetic.
 *
 * Sequence:
 * 1. NDA signing
 * 2. Offer letter signing
 * 3. ID card printing
 *
 * After completion, sets storyFlags.onboardingComplete = true
 */

import React, { useState } from 'react';
import { GameReducerAction } from '../state/gameReducer.ts';
import { GameState } from '../types.ts';

interface OnboardingScreenProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameReducerAction>;
}

type OnboardingStep = 'NDA' | 'OFFER' | 'ID_CARD' | 'COMPLETE';

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ dispatch }) => {
  const [step, setStep] = useState<OnboardingStep>('NDA');
  const [isTyping, setIsTyping] = useState(false);
  const [signature, setSignature] = useState('');
  const [finalName, setFinalName] = useState('');

  // Generate employee ID once on initial render (lazy initializer is allowed)
  const [employeeId] = useState(() =>
    Math.floor(Math.random() * 999)
      .toString()
      .padStart(3, '0')
  );

  const completeOnboarding = () => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: {
        playerName: finalName || 'Unknown Tech',
        employeeId: `TECH-${employeeId}`,
        flags: {
          storyFlags: { onboardingComplete: true },
        },
      },
    });
  };

  const handleSign = () => {
    if (signature.length < 2) return;
    setIsTyping(true);

    // Capture name if at relevant steps
    if (step === 'NDA' || step === 'ID_CARD') {
      if (signature.length > 2) setFinalName(signature);
    }

    setTimeout(() => {
      setIsTyping(false);
      if (step === 'NDA') setStep('OFFER');
      else if (step === 'OFFER') setStep('ID_CARD');
      else if (step === 'ID_CARD') setStep('COMPLETE');
      setSignature('');
    }, 1500);
  };

  const handleComplete = () => {
    completeOnboarding();
  };

  // NDA Screen
  if (step === 'NDA') {
    return (
      <div className="fixed inset-0 z-[3000] bg-black flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-black border-2 border-emerald-800 p-6 space-y-6">
          <div className="border-b border-emerald-800 pb-4">
            <h1 className="text-emerald-400 text-xl font-bold uppercase tracking-widest">
              [REDACTED] AEROSPACE
            </h1>
            <p className="text-emerald-600 text-xs mt-1">FORM NDA-7B • CONFIDENTIALITY AGREEMENT</p>
          </div>

          <div className="space-y-4 text-emerald-500 text-sm leading-relaxed max-h-64 overflow-y-auto">
            <p>
              By signing below, you acknowledge that all information, procedures, anomalies,
              manifestations, temporal disturbances, and "incidents" witnessed during your
              employment are considered CLASSIFIED.
            </p>
            <p>
              You agree to not discuss, document, photograph, or remember details pertaining to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-emerald-600">
              <li>Unscheduled aircraft arrivals (especially those without registration)</li>
              <li>Personnel in charcoal grey suits</li>
              <li>Components marked with symbols not found in any maintenance manual</li>
              <li>The door behind the component cage</li>
              <li>The sounds from Storage 4C</li>
            </ul>
            <p className="text-emerald-700 text-xs italic">
              Violation of this agreement may result in termination, reassignment, or [REDACTED].
            </p>
          </div>

          <div className="border-t border-emerald-800 pt-4 space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-emerald-600 text-sm w-24">SIGN HERE:</label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Type your name..."
                disabled={isTyping}
                className="flex-1 bg-black border border-emerald-700 text-emerald-400 px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={handleSign}
              disabled={signature.length < 2 || isTyping}
              className={`w-full py-3 font-bold uppercase tracking-widest transition-all ${
                signature.length >= 2 && !isTyping
                  ? 'bg-emerald-900 text-emerald-300 border border-emerald-600 hover:bg-emerald-800'
                  : 'bg-zinc-900 text-zinc-600 border border-zinc-700 cursor-not-allowed'
              }`}
            >
              {isTyping ? '[ PROCESSING... ]' : '[ ACKNOWLEDGE & SIGN ]'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Offer Letter Screen
  if (step === 'OFFER') {
    return (
      <div className="fixed inset-0 z-[3000] bg-black flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-black border-2 border-emerald-800 p-6 space-y-6">
          <div className="border-b border-emerald-800 pb-4">
            <h1 className="text-emerald-400 text-xl font-bold uppercase tracking-widest">
              OFFER OF EMPLOYMENT
            </h1>
            <p className="text-emerald-600 text-xs mt-1">
              FORM HR-12 • NIGHT SHIFT MAINTENANCE TECHNICIAN
            </p>
          </div>

          <div className="space-y-4 text-emerald-500 text-sm leading-relaxed">
            <p>Dear Candidate,</p>
            <p>
              We are pleased to offer you a position as{' '}
              <span className="text-emerald-300 font-bold">Night Shift Maintenance Technician</span>{' '}
              at [REDACTED] Aerospace Facility.
            </p>
            <div className="bg-emerald-950/30 border border-emerald-800 p-4 space-y-2">
              <p>
                <span className="text-emerald-600">Position:</span> AMT III - Line Maintenance
              </p>
              <p>
                <span className="text-emerald-600">Shift:</span> 2200-0600 (Graveyard)
              </p>
              <p>
                <span className="text-emerald-600">Start Date:</span> Immediately
              </p>
              <p>
                <span className="text-emerald-600">Compensation:</span> [CLASSIFIED]
              </p>
            </div>
            <p className="text-emerald-700 text-xs italic">
              Note: Position includes mandatory Human Factors training and periodic psychological
              evaluations. This is standard procedure. Do not be alarmed.
            </p>
          </div>

          <div className="border-t border-emerald-800 pt-4 space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-emerald-600 text-sm w-24">ACCEPT:</label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Type your name to accept..."
                disabled={isTyping}
                className="flex-1 bg-black border border-emerald-700 text-emerald-400 px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={handleSign}
              disabled={signature.length < 2 || isTyping}
              className={`w-full py-3 font-bold uppercase tracking-widest transition-all ${
                signature.length >= 2 && !isTyping
                  ? 'bg-emerald-900 text-emerald-300 border border-emerald-600 hover:bg-emerald-800'
                  : 'bg-zinc-900 text-zinc-600 border border-zinc-700 cursor-not-allowed'
              }`}
            >
              {isTyping ? '[ PROCESSING... ]' : '[ ACCEPT OFFER ]'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ID Card Generation & Complete Screen (Merged)
  if (step === 'ID_CARD' || step === 'COMPLETE') {
    const isComplete = step === 'COMPLETE';

    return (
      <div className="fixed inset-0 z-[3000] bg-black flex flex-col items-center justify-center p-4">
        <div
          className={`max-w-4xl w-full flex flex-col md:flex-row gap-8 items-center justify-center transition-all duration-1000 ${isComplete ? 'opacity-100' : 'opacity-100'}`}
        >
          {/* Left Side: Employee ID Card Preview */}
          <div
            className={`w-full md:w-1/2 space-y-4 transition-all duration-700 transform ${isComplete ? 'scale-[1.02] shadow-[0_0_40px_rgba(16,185,129,0.1)]' : ''}`}
          >
            <div className="text-center md:text-left space-y-1 mb-6">
              <h1 className="text-emerald-400 text-2xl font-bold uppercase tracking-widest flex items-center justify-center md:justify-start gap-3">
                {isComplete ? (
                  <span className="text-emerald-500">■ CREDENTIALS ISSUED</span>
                ) : (
                  <>
                    <span className="w-3 h-3 bg-emerald-500 animate-pulse"></span>
                    ID CARD GENERATION
                  </>
                )}
              </h1>
              <p className="text-emerald-600 text-xs font-mono tracking-widest">
                {isComplete ? 'STATUS: ACTIVE • PROTOCOL 7 APPLIED' : 'PLEASE WAIT • DO NOT MOVE'}
              </p>
            </div>

            <div
              className={`relative bg-[#080808] p-6 transition-all duration-500 ${isComplete ? 'border-2 border-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]' : 'border-2 border-emerald-800'}`}
            >
              {/* Background Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

              <div className="relative flex gap-6 z-10 items-center">
                {/* ID Photo */}
                <div className="relative w-24 h-32 bg-black border border-emerald-700 flex flex-col items-center justify-center overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-emerald-950/30"></div>
                  <span className="text-5xl opacity-80 mix-blend-screen drop-shadow-[0_0_10px_rgba(16,185,129,0.4)] relative z-10">
                    👤
                  </span>
                  {!isComplete && isTyping && (
                    <div className="absolute inset-0 bg-emerald-400/20 mix-blend-overlay animate-pulse z-20"></div>
                  )}
                </div>

                {/* ID Details */}
                <div className="flex-1 space-y-4 font-mono w-full">
                  <div>
                    <p className="text-emerald-700 text-[10px] uppercase tracking-widest mb-1">
                      Employee Name
                    </p>
                    <p className="text-emerald-300 font-bold text-xl tracking-wider bg-emerald-950/40 px-3 py-1 border-l-2 border-emerald-500 shadow-sm">
                      TECH-{employeeId}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-emerald-700 text-[10px] uppercase tracking-widest mb-1">
                        Clearance
                      </p>
                      <p className="text-emerald-400 font-bold bg-black border border-emerald-900/50 px-2 py-1 text-center">
                        LEVEL 0
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-700 text-[10px] uppercase tracking-widest mb-1">
                        Dept
                      </p>
                      <p className="text-emerald-400 font-bold bg-black border border-emerald-900/50 px-2 py-1 text-center">
                        MAINT
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-emerald-700 text-[10px] uppercase tracking-widest mb-1">
                      Assignment
                    </p>
                    <p className="text-emerald-400 font-bold bg-emerald-900/20 px-3 py-1 border-b border-emerald-800">
                      HANGAR BAY 4
                    </p>
                  </div>
                </div>
              </div>

              {/* Watermark */}
              {isComplete && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] border-4 border-emerald-500/20 text-emerald-500/20 font-black text-5xl p-2 tracking-[0.2em] pointer-events-none z-20 mix-blend-overlay">
                  AUTHORIZED
                </div>
              )}

              {/* Barcode Section */}
              <div className="mt-6 border-t pl-0 border-emerald-900/60 pt-4 relative z-10 flex flex-col items-center">
                <div className="flex gap-[2px] justify-center h-10 w-full opacity-70 px-4">
                  {[...Array(32)].map((_, i) => (
                    <div
                      key={i}
                      className={`bg-emerald-500 ${i % 3 === 0 || i % 7 === 0 ? 'h-full' : 'h-3/4 self-end'}`}
                      style={{
                        width: `${((i * 7) % 4) + 1}px`,
                        opacity: ((i * 11) % 5) / 10 + 0.5,
                      }}
                    />
                  ))}
                </div>
                <p className="text-emerald-700 text-[8px] tracking-[0.3em] font-mono mt-2 text-center w-full">
                  {isComplete && (finalName || signature)
                    ? `AUTH-${btoa(finalName || signature)
                        .substring(0, 8)
                        .toUpperCase()}`
                    : 'BARCODE: [PENDING]'}{' '}
                  • VALID INDEFINITELY
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Interactive Panel */}
          <div className="w-full md:w-1/2 flex flex-col justify-center min-h-[350px]">
            {!isComplete ? (
              <div className="space-y-6 bg-[#0a0a0a] border border-emerald-900 p-8 relative">
                {/* Decorative UI elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-900 via-emerald-600 to-emerald-900 opacity-20"></div>

                <div className="space-y-2 border-b border-emerald-900/50 pb-4">
                  <p className="text-emerald-400 text-sm font-mono flex items-center gap-2">
                    <span className="text-emerald-600">✓</span> Biometric scan complete.
                  </p>
                  <p className="text-emerald-600 text-xs font-mono animate-pulse">
                    &gt; Awaiting final manual authorization...
                  </p>
                </div>

                <div className="space-y-6 pt-2">
                  <div className="space-y-3">
                    <label className="text-emerald-500 text-xs font-bold tracking-widest flex items-center gap-2">
                      <span className="text-emerald-600">►</span> CONFIRM INITIALS
                    </label>
                    <input
                      type="text"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value.toUpperCase().slice(0, 4))}
                      placeholder="_ _ _"
                      disabled={isTyping}
                      className="w-full bg-[#050505] border-b-2 border-emerald-800 text-emerald-400 text-3xl tracking-[0.5em] py-3 text-center focus:outline-none focus:border-emerald-400 transition-colors font-mono placeholder-emerald-900/50"
                    />
                  </div>

                  <button
                    onClick={handleSign}
                    disabled={signature.length < 2 || isTyping}
                    className={`w-full py-4 mt-4 font-bold uppercase tracking-widest transition-all text-sm flex items-center justify-center gap-3 relative border-2 ${
                      signature.length >= 2 && !isTyping
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600 hover:bg-emerald-900 hover:text-emerald-100 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-black text-emerald-900/50 border-emerald-900/30 cursor-not-allowed'
                    }`}
                  >
                    {isTyping ? (
                      <span className="flex items-center gap-2 flicker text-emerald-400">
                        PROCESSING CREDENTIALS...
                      </span>
                    ) : (
                      <span>[ PRINT ID CARD ]</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-6">
                  <div className="border-l-4 border-emerald-500 pl-5 py-2">
                    <h2 className="text-emerald-400 text-3xl font-black uppercase tracking-widest flicker">
                      ORIENTATION COMPLETE
                    </h2>
                    <p className="text-emerald-600 text-xs font-mono tracking-widest mt-2 uppercase">
                      New Personnel Logged • System Updated
                    </p>
                  </div>

                  <div className="space-y-4 text-sm font-mono bg-[#050505] border border-emerald-900/40 p-6 relative">
                    <div className="absolute top-0 right-0 p-2 text-emerald-900/30 text-xs">
                      SYS.MSG.01
                    </div>
                    <div className="flex items-start gap-3 text-emerald-500">
                      <span className="text-emerald-600">✓</span>
                      <p>Your paperwork has been processed.</p>
                    </div>
                    <div className="flex items-start gap-3 text-emerald-500">
                      <span className="text-emerald-600">✓</span>
                      <p>Your ID card has been issued.</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-emerald-900/40">
                      <p className="text-emerald-400 font-bold bg-emerald-900/20 p-3 border-l-2 border-emerald-500 flex items-center gap-3">
                        <span className="animate-pulse flex-shrink-0 text-lg">⚠</span>
                        REPORT TO HANGAR BAY 4 IMMEDIATELY.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 border border-emerald-900/30 bg-black relative">
                    <div className="absolute -top-2 left-4 px-2 bg-black text-emerald-800 text-[9px] uppercase tracking-widest">
                      Protocol Reminder
                    </div>
                    <p className="text-emerald-700 text-xs tracking-widest uppercase text-center font-mono leading-relaxed mt-1">
                      "If you see something, say nothing.
                      <br />
                      If you hear something, you didn't."
                    </p>
                  </div>

                  <button
                    onClick={handleComplete}
                    className="w-full px-8 py-5 bg-emerald-950 text-emerald-300 border border-emerald-500 font-black text-lg uppercase tracking-[0.2em] hover:bg-emerald-900 transition-all glow-pulse-border relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-emerald-500/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative z-10">[ BEGIN SHIFT ]</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default OnboardingScreen;
