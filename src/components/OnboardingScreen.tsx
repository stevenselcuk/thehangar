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

  // ID Card Printing Screen
  if (step === 'ID_CARD') {
    return (
      <div className="fixed inset-0 z-[3000] bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-emerald-400 text-xl font-bold uppercase tracking-widest">
              ID CARD GENERATION
            </h1>
            <p className="text-emerald-600 text-xs">PLEASE WAIT • DO NOT MOVE</p>
          </div>

          {/* ID Card Preview */}
          <div className="bg-zinc-900 border-2 border-emerald-700 p-6 space-y-4">
            <div className="flex gap-4">
              <div className="w-20 h-24 bg-emerald-950 border border-emerald-700 flex items-center justify-center">
                <span className="text-4xl">👤</span>
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-emerald-600 text-[10px] uppercase">Employee Name</p>
                  <p className="text-emerald-400 font-bold">TECH-{employeeId}</p>
                </div>
                <div>
                  <p className="text-emerald-600 text-[10px] uppercase">Clearance</p>
                  <p className="text-emerald-400 font-bold">LEVEL 0</p>
                </div>
                <div>
                  <p className="text-emerald-600 text-[10px] uppercase">Assignment</p>
                  <p className="text-emerald-400 font-bold">HANGAR BAY 4</p>
                </div>
              </div>
            </div>
            <div className="border-t border-emerald-800 pt-3">
              <div className="flex gap-2">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="flex-1 h-6 bg-emerald-950 border border-emerald-800" />
                ))}
              </div>
              <p className="text-emerald-700 text-[8px] mt-2 text-center">
                BARCODE: [REDACTED] • VALID INDEFINITELY
              </p>
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <label className="text-emerald-600 text-sm">CONFIRM:</label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Your initials here..."
                disabled={isTyping}
                className="bg-black border border-emerald-700 text-emerald-400 px-3 py-2 w-48 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={handleSign}
              disabled={signature.length < 2 || isTyping}
              className={`w-full py-3 font-bold uppercase tracking-widest transition-all ${
                signature.length >= 2 && !isTyping
                  ? 'bg-emerald-900 text-emerald-300 border border-emerald-600 hover:bg-emerald-800 flicker'
                  : 'bg-zinc-900 text-zinc-600 border border-zinc-700 cursor-not-allowed'
              }`}
            >
              {isTyping ? '[ PRINTING... ]' : '[ PRINT ID CARD ]'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Complete Screen
  return (
    <div className="fixed inset-0 z-[3000] bg-black flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-emerald-400 text-3xl font-bold uppercase tracking-widest flicker">
            ORIENTATION COMPLETE
          </h1>
          <div className="h-px bg-emerald-700 w-32 mx-auto" />
        </div>

        <div className="space-y-4 text-emerald-500">
          <p>Your paperwork has been processed.</p>
          <p>Your ID card has been issued.</p>
          <p className="text-emerald-400 font-bold">Report to Hangar Bay 4 immediately.</p>
        </div>

        <p className="text-emerald-700 text-xs italic">
          "Remember: If you see something, say nothing. If you hear something, you didn't."
        </p>

        <button
          onClick={handleComplete}
          className="px-8 py-4 bg-emerald-900 text-emerald-300 border-2 border-emerald-600 font-bold uppercase tracking-widest hover:bg-emerald-800 transition-all glow-pulse-border"
        >
          [ BEGIN SHIFT ]
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
