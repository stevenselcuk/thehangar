import React, { useEffect, useState } from 'react';
import { LocationCheckResult } from '../logic/locationRequirements';

interface Props {
  checkResult: LocationCheckResult;
}

const LocationWarningOverlay: React.FC<Props> = ({ checkResult }) => {
  const [visible, setVisible] = useState(false);

  // Use a stringified key to detect actual value changes, not just reference changes
  const checkKey = JSON.stringify({
    satisfied: checkResult.satisfied,
    missingRequired: checkResult.missingRequired.map((r) => r.key),
    missingSoft: checkResult.missingSoft.map((r) => r.key),
  });

  useEffect(() => {
    let hideTimer: NodeJS.Timeout;

    // Check local logic inside effect to avoid immediate state thrashing
    const hasIssues = !checkResult.satisfied || checkResult.missingSoft.length > 0;

    if (hasIssues) {
      // Use setTimeout to avoid synchronous set-state-in-effect warning
      // and ensure we don't block the paint
      const showTimer = setTimeout(() => setVisible(true), 0);

      // Auto-hide after 5 seconds if only soft requirements
      if (checkResult.satisfied) {
        hideTimer = setTimeout(() => setVisible(false), 5000);
      }

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    } else {
      const hideTimer = setTimeout(() => setVisible(false), 0);
      return () => clearTimeout(hideTimer);
    }
  }, [checkKey, checkResult.satisfied, checkResult.missingSoft.length]);

  if (!visible) return null;

  // Use different styles for Hard (Blocking) vs Soft (Warning) requirements
  const isBlocking = !checkResult.satisfied;

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-[90] pointer-events-none transition-all duration-300 ${isBlocking ? 'scale-100 opacity-100' : 'scale-95 opacity-90'}`}
    >
      <div
        className={`flex flex-col items-center px-8 py-4 border-2 shadow-2xl backdrop-blur-sm ${
          isBlocking
            ? 'bg-red-950/90 border-red-500 animate-pulse'
            : 'bg-amber-950/80 border-amber-500'
        }`}
      >
        <h3
          className={`text-xl font-black uppercase tracking-widest mb-2 ${
            isBlocking ? 'text-red-500 flicker' : 'text-amber-500'
          }`}
        >
          {isBlocking ? 'HAZARD: UNSAFE CONDITIONS' : 'CAUTION: ADVISORY'}
        </h3>

        {/* Missing Required Items */}
        {checkResult.missingRequired.map((req) => (
          <div key={req.key} className="text-center mb-1">
            <p className="text-red-400 font-bold uppercase tracking-wider text-sm">
              MISSING: {req.label}
            </p>
            <p className="text-red-300/70 text-[10px] uppercase tracking-widest">{req.reason}</p>
          </div>
        ))}

        {/* Missing Soft Requirements */}
        {checkResult.missingSoft.map((req) => (
          <div key={req.key} className="text-center mb-1">
            <p className="text-amber-400 font-bold uppercase tracking-wider text-xs">
              MISSING: {req.label}
            </p>
            <p className="text-amber-300/70 text-[10px] uppercase tracking-widest">
              Risk: {req.penalty}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationWarningOverlay;
