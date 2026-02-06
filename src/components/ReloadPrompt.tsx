import React from 'react';
// @ts-expect-error virtual module
import { useRegisterSW } from 'virtual:pwa-register/react';

const ReloadPrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      if (r) {
        console.log('SW Registered: ' + r);
      }
    },
    onRegisterError(error: unknown) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] p-4 bg-[#0a0a0a] border border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] flex flex-col gap-2 max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex items-start gap-3">
        <div className="text-emerald-500 text-2xl animate-pulse">!</div>
        <div className="flex-1">
          <h3 className="font-bold text-emerald-400 text-sm uppercase tracking-wider mb-1">
            System Update Available
          </h3>
          <p className="text-emerald-800 text-xs leading-relaxed">
            New protocols received. Reboot required to apply changes.
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-2 justify-end">
        <button
          onClick={close}
          className="px-3 py-1.5 text-[10px] uppercase font-bold text-emerald-700 hover:text-emerald-500 border border-transparent hover:border-emerald-900 transition-colors cursor-pointer"
        >
          Dismiss
        </button>
        <button
          onClick={() => updateServiceWorker(true)}
          className="px-3 py-1.5 text-[10px] uppercase font-bold bg-emerald-900/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500 hover:text-black transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)] cursor-pointer"
        >
          Reboot System
        </button>
      </div>
    </div>
  );
};

export default ReloadPrompt;
