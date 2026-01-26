import React, { useState } from 'react';
import { useSound } from '../context/SoundContext.tsx';
import {
  exportGameData,
  getExportMetadata,
  importGameData,
} from '../services/importExportService.ts';
import { GameState } from '../types.ts';

interface ImportExportViewProps {
  state: GameState;
  onImport: (newState: GameState) => void;
}

type StatusType = 'idle' | 'success' | 'error';

const ImportExportView: React.FC<ImportExportViewProps> = ({ state, onImport }) => {
  const { play } = useSound();
  const [exportString, setExportString] = useState<string>('');
  const [importString, setImportString] = useState<string>('');
  const [copyStatus, setCopyStatus] = useState<StatusType>('idle');
  const [importStatus, setImportStatus] = useState<StatusType>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const handleExport = () => {
    play('CLICK');
    try {
      const exported = exportGameData(state);
      setExportString(exported);
      setStatusMessage('>> Export sequence complete. Data serialized.');
      setImportStatus('success');
      // setTimeout(() => setImportStatus('idle'), 3000);
    } catch {
      setStatusMessage('>> ERROR: Serialization failed. Check integrity.');
      setImportStatus('error');
    }
  };

  const handleCopyToClipboard = async () => {
    play('CLICK');
    try {
      await navigator.clipboard.writeText(exportString);
      setCopyStatus('success');
      setStatusMessage('>> DATA COPIED TO BUFFER.');
      setTimeout(() => {
        setCopyStatus('idle');
      }, 2000);
    } catch {
      setCopyStatus('error');
      setStatusMessage('>> ERROR: Buffer write failed. Manual copy required.');
    }
  };

  const handleImportClick = () => {
    play('CLICK');
    if (!importString.trim()) {
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmImport = () => {
    play('CLICK');
    setShowConfirmModal(false);

    try {
      const importedState = importGameData(importString);

      if (!importedState) {
        setStatusMessage('>> ERROR: Invalid checksum. Data corrupted.');
        setImportStatus('error');
        return;
      }

      // Get metadata for logging
      const metadata = getExportMetadata(importString);
      if (metadata) {
        console.log(
          `[SYSTEM] Restore point identified: ${new Date(metadata.exportedAt).toLocaleString()}`
        );
      }

      onImport(importedState);
      setStatusMessage('>> SYSTEM RESTORE SUCCESSFUL. REBOOTING...');
      setImportStatus('success');
      setImportString('');
    } catch {
      setStatusMessage('>> FATAL ERROR: Parse exception. Aborting.');
      setImportStatus('error');
    }
  };

  const handleCancelImport = () => {
    play('CLICK');
    setShowConfirmModal(false);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="border-b border-emerald-900/50 pb-2 mb-6">
        <h3 className="text-sm text-emerald-500 uppercase tracking-[0.2em] font-bold">
          [//] DATA MIGRATION PROTOCOLS
        </h3>
      </div>

      {/* Status Output Console */}
      <div className="bg-black border border-emerald-900/50 p-4 h-24 mb-6 overflow-y-auto font-mono text-[10px]">
        {statusMessage ? (
          <p
            className={`${
              importStatus === 'error'
                ? 'text-red-500'
                : importStatus === 'success'
                  ? 'text-emerald-400'
                  : 'text-emerald-600'
            }`}
          >
            {statusMessage}
            <span className="animate-pulse">_</span>
          </p>
        ) : (
          <p className="text-emerald-800 italic">&gt;&gt; Awaiting command input...</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Export Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs text-emerald-600 uppercase tracking-widest bg-emerald-900/20 px-2 py-1">
              &gt; EXPORT_DATA
            </h4>
          </div>

          <button
            onClick={handleExport}
            className="w-full text-left px-4 py-3 border border-emerald-700 bg-black hover:bg-emerald-900/30 text-emerald-500 hover:text-emerald-400 transition-all uppercase font-bold tracking-wider group"
          >
            <span className="mr-2 group-hover:text-emerald-300">&gt; EXECUTE DUMP</span>
          </button>

          {exportString && (
            <div className="space-y-2 animate-[fadeIn_0.3s_ease-out]">
              <div className="relative group">
                <textarea
                  readOnly
                  value={exportString}
                  className="w-full h-32 p-3 bg-black border border-emerald-900/50 text-emerald-500/70 font-mono text-[10px] resize-none focus:outline-none focus:border-emerald-500 selection:bg-emerald-900 selection:text-white"
                />
                <div className="absolute top-0 right-0 p-1 text-[8px] text-emerald-800 bg-black border-l border-b border-emerald-900/50">
                  {exportString.length} BYTES
                </div>
              </div>

              <button
                onClick={handleCopyToClipboard}
                className={`w-full text-center py-2 border text-[10px] uppercase tracking-widest transition-all ${
                  copyStatus === 'success'
                    ? 'border-emerald-500 bg-emerald-900/50 text-emerald-300'
                    : 'border-emerald-800 bg-black text-emerald-600 hover:border-emerald-600 hover:text-emerald-400'
                }`}
              >
                {copyStatus === 'success' ? '[ BUFFER COPIED ]' : '[ COPY TO BUFFER ]'}
              </button>
            </div>
          )}
        </div>

        {/* Import Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs text-amber-700/80 uppercase tracking-widest bg-amber-900/10 px-2 py-1">
              &gt; IMPORT_DATA
            </h4>
          </div>

          <div className="relative">
            <textarea
              value={importString}
              onChange={(e) => setImportString(e.target.value)}
              placeholder="// PASTE HEX DUMP HERE..."
              className="w-full h-32 p-3 bg-black border border-amber-900/30 text-amber-500/80 font-mono text-[10px] resize-none focus:outline-none focus:border-amber-600 placeholder-amber-900/30 selection:bg-amber-900 selection:text-white"
            />
          </div>

          <button
            onClick={handleImportClick}
            disabled={!importString.trim()}
            className="w-full text-left px-4 py-3 border border-amber-900/50 bg-black hover:bg-amber-900/20 text-amber-700 hover:text-amber-500 transition-all uppercase font-bold tracking-wider disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            <span className="mr-2 group-hover:text-amber-400">&gt; INITIATE RESTORE</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={handleCancelImport}
        >
          <div
            className="w-[400px] border-2 border-red-900 bg-black p-1 shadow-[0_0_50px_rgba(127,29,29,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-red-950/20 p-6">
              <h3 className="text-lg text-red-500 uppercase tracking-widest font-bold mb-4 flex items-center">
                <span className="animate-pulse mr-2">⚠</span> CRITICAL WARNING
              </h3>

              <div className="space-y-4 text-xs font-mono text-red-400/80 leading-relaxed border-t border-b border-red-900/30 py-4 mb-6">
                <p>OVERWRITE SEQUENCE INITIATED.</p>
                <p>CURRENT SESSION DATA WILL BE PERMANENTLY ERASED.</p>
                <p>ARE YOU SURE YOU WISH TO PROCEED?</p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleCancelImport}
                  className="flex-1 py-3 border border-red-900/50 text-red-700 hover:bg-red-950/30 hover:text-red-500 uppercase tracking-widest transition-all"
                >
                  [ ABORT ]
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="flex-1 py-3 border border-red-600 bg-red-900/20 text-red-500 hover:bg-red-900/50 hover:text-red-200 uppercase tracking-widest font-bold transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                >
                  [ PROCEED ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportExportView;
