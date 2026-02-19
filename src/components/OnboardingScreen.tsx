import React, { useEffect, useRef, useState } from 'react';
import { GameReducerAction } from '../state/gameReducer.ts';
import { GameState } from '../types.ts';

// Sound assets
const SOUNDS = {
  KEYPRESS: '/sounds/terminal_keypress.mp3',
  CLICK: '/sounds/ui_click.mp3',
  GLITCH: '/sounds/digital_glitch.mp3',
  PRINT: '/sounds/action_generic.mp3', // Using generic action for print sound
  COMPLETE: '/sounds/level_up.mp3',
  MAIN_THEME: '/sounds/main_theme.mp3',
};

const playSound = (soundPath: string, volume = 0.5) => {
  try {
    const audio = new Audio(soundPath);
    audio.volume = volume;
    audio.play().catch((e) => console.warn('Audio play failed:', e));
  } catch (err) {
    console.warn('Audio init failed:', err);
  }
};

const DecipherText: React.FC<{
  text: string;
  className?: string;
  onComplete?: () => void;
  speed?: number;
}> = ({ text, className = '', onComplete, speed = 50 }) => {
  const [displayed, setDisplayed] = useState('');
  const iteration = useRef(0);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayed(() => {
        let result = '';
        for (let i = 0; i < text.length; i++) {
          if (i < iteration.current) {
            result += text[i];
          } else {
            result += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        return result;
      });

      if (iteration.current >= text.length) {
        clearInterval(interval);
        if (onCompleteRef.current) onCompleteRef.current();
      }

      iteration.current += 1 / 3;
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span className={className}>{displayed}</span>;
};

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

  // Narrative states
  const [idCardProcessing, setIdCardProcessing] = useState(false);
  const [idCardPrinted, setIdCardPrinted] = useState(false);
  const [orientationLines, setOrientationLines] = useState<number>(0);

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
          <div
            className={`relative bg-zinc-900 border-2 ${idCardPrinted ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-emerald-900'} p-6 space-y-4 transition-all duration-1000`}
          >
            {/* Processing Overlay */}
            {idCardProcessing && (
              <div className="absolute inset-0 bg-black/90 z-10 flex flex-col items-center justify-center text-emerald-500 font-mono text-xs">
                <div className="space-y-1">
                  <p className="animate-pulse">[ PROCESSING BIOMETRICS ]</p>
                  <p className="animate-pulse delay-75">[ ENCODING RETINAL DATA ]</p>
                  <p className="animate-pulse delay-150">[ ASSIGNING CLEARANCE ]</p>
                </div>
                <div className="w-48 h-1 bg-emerald-900 mt-4 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 animate-[log-slide-in_2s_ease-out_infinite]"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}

            <div
              className={`flex gap-4 ${idCardProcessing ? 'opacity-20 blur-sm' : 'opacity-100'} transition-all duration-500`}
            >
              <div className="w-20 h-24 bg-emerald-950 border border-emerald-700 flex items-center justify-center overflow-hidden relative">
                <span className="text-4xl relative z-10">👤</span>
                {idCardPrinted && (
                  <div className="absolute inset-0 bg-emerald-500/20 animate-pulse" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-emerald-600 text-[10px] uppercase">Employee Name</p>
                  <p className="text-emerald-400 font-bold tracking-wider">
                    {finalName || 'UNKNOWN'}
                  </p>
                </div>
                <div>
                  <p className="text-emerald-600 text-[10px] uppercase">ID Number</p>
                  <p className="text-emerald-400 font-bold">TECH-{employeeId}</p>
                </div>
                <div>
                  <p className="text-emerald-600 text-[10px] uppercase">Assignment</p>
                  <p className="text-emerald-400 font-bold">HANGAR BAY 4</p>
                </div>
              </div>
            </div>

            <div
              className={`border-t border-emerald-800 pt-3 ${idCardProcessing ? 'opacity-20 blur-sm' : 'opacity-100'}`}
            >
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
            {!idCardPrinted ? (
              <>
                <div className="flex items-center justify-center gap-2">
                  <label className="text-emerald-600 text-sm">CONFIRM:</label>
                  <input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Your initials here..."
                    disabled={isTyping || idCardProcessing}
                    className="bg-black border border-emerald-700 text-emerald-400 px-3 py-2 w-48 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={() => {
                    if (signature.length < 2) return;
                    playSound(SOUNDS.CLICK);
                    setIsTyping(true);
                    setIdCardProcessing(true);
                    playSound(SOUNDS.PRINT);

                    setTimeout(() => {
                      setIdCardProcessing(false);
                      setIdCardPrinted(true);
                      playSound(SOUNDS.GLITCH);
                      setIsTyping(false);
                    }, 3000);
                  }}
                  disabled={signature.length < 2 || isTyping || idCardProcessing}
                  className={`w-full py-3 font-bold uppercase tracking-widest transition-all ${
                    signature.length >= 2 && !isTyping && !idCardProcessing
                      ? 'bg-emerald-900 text-emerald-300 border border-emerald-600 hover:bg-emerald-800 flicker'
                      : 'bg-zinc-900 text-zinc-600 border border-zinc-700 cursor-not-allowed'
                  }`}
                >
                  {idCardProcessing ? '[ PROCESSING... ]' : '[ PRINT ID CARD ]'}
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  playSound(SOUNDS.CLICK);
                  setStep('COMPLETE');
                }}
                className="w-full py-3 font-bold uppercase tracking-widest animate-pulse bg-emerald-600 text-black border border-emerald-400 hover:bg-emerald-500"
              >
                [ COLLECT ID CARD ]
              </button>
            )}
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
            <DecipherText
              text="ORIENTATION COMPLETE"
              onComplete={() => {
                setOrientationLines((prev) => Math.max(prev, 1));
                playSound(SOUNDS.MAIN_THEME, 0.3);
              }}
            />
          </h1>
          <div
            className={`h-px bg-emerald-700 w-32 mx-auto transition-all duration-1000 ${orientationLines >= 1 ? 'opacity-100 width-32' : 'opacity-0 width-0'}`}
          />
        </div>

        <div className="space-y-6 text-emerald-500 min-h-[120px]">
          {orientationLines >= 1 && (
            <p className="animate-[log-slide-in_0.5s_ease-out_forwards]">
              <DecipherText
                text="Subject processing complete."
                onComplete={() =>
                  setTimeout(() => setOrientationLines((prev) => Math.max(prev, 2)), 500)
                }
              />
            </p>
          )}
          {orientationLines >= 2 && (
            <p className="animate-[log-slide-in_0.5s_ease-out_forwards]">
              <DecipherText
                text="clearance_level: 0 (ASSIGNED)"
                className="font-mono text-emerald-400"
                onComplete={() =>
                  setTimeout(() => setOrientationLines((prev) => Math.max(prev, 3)), 500)
                }
              />
            </p>
          )}
          {orientationLines >= 3 && (
            <div className="animate-[log-slide-in_0.5s_ease-out_forwards] border border-emerald-800 bg-emerald-950/30 p-4 transform scale-110">
              <p className="text-emerald-300 font-bold text-lg flicker">REPORT TO HANGAR BAY 4</p>
              <p className="text-emerald-600 text-xs mt-2">IMMEDIATELY</p>
            </div>
          )}
        </div>

        {orientationLines >= 3 && (
          <div className="animate-[log-slide-in_1s_ease-out_forwards] space-y-8">
            <p className="text-emerald-700 text-xs italic opacity-70">
              Remember: The things you see are not real. The things you hear are not listening.
            </p>

            <button
              onClick={() => {
                playSound(SOUNDS.COMPLETE);
                handleComplete();
              }}
              className="px-8 py-4 bg-emerald-900 text-emerald-300 border-2 border-emerald-600 font-bold uppercase tracking-widest hover:bg-emerald-800 transition-all glow-pulse-border hover:scale-105"
            >
              [ BEGIN SHIFT ]
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingScreen;
