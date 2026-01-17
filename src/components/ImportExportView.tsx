import React, { useState } from 'react';
import { exportGameData, getExportMetadata, importGameData } from '../services/importExportService';
import { GameState } from '../types';

const playClick = () => {
  const audio = new Audio('/sounds/ui_click.mp3');
  audio.volume = 0.3;
  audio.play().catch(() => {});
};

interface ImportExportViewProps {
  state: GameState;
  onImport: (newState: GameState) => void;
}

type StatusType = 'idle' | 'success' | 'error';

const ImportExportView: React.FC<ImportExportViewProps> = ({ state, onImport }) => {
  const [exportString, setExportString] = useState<string>('');
  const [importString, setImportString] = useState<string>('');
  const [copyStatus, setCopyStatus] = useState<StatusType>('idle');
  const [importStatus, setImportStatus] = useState<StatusType>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const handleExport = () => {
    playClick();
    try {
      const exported = exportGameData(state);
      setExportString(exported);
      setStatusMessage('Export code generated successfully!');
      setImportStatus('success');
      setTimeout(() => setImportStatus('idle'), 3000);
    } catch (error) {
      setStatusMessage('Export failed. Please try again.');
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
    }
  };

  const handleCopyToClipboard = async () => {
    playClick();
    try {
      await navigator.clipboard.writeText(exportString);
      setCopyStatus('success');
      setStatusMessage('Copied to clipboard!');
      setTimeout(() => {
        setCopyStatus('idle');
        setStatusMessage('');
      }, 2000);
    } catch {
      setCopyStatus('error');
      setStatusMessage('Failed to copy. Please select and copy manually.');
      setTimeout(() => {
        setCopyStatus('idle');
        setStatusMessage('');
      }, 3000);
    }
  };

  const handleImportClick = () => {
    playClick();
    if (!importString.trim()) {
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmImport = () => {
    playClick();
    setShowConfirmModal(false);

    try {
      const importedState = importGameData(importString);

      if (!importedState) {
        setStatusMessage('Invalid import code. Please check and try again.');
        setImportStatus('error');
        setTimeout(() => {
          setImportStatus('idle');
          setStatusMessage('');
        }, 4000);
        return;
      }

      // Get metadata for logging
      const metadata = getExportMetadata(importString);
      if (metadata) {
        console.log(
          `Import successful! Data from ${new Date(metadata.exportedAt).toLocaleString()}`
        );
      }

      onImport(importedState);
      setStatusMessage('Import successful! Game state has been restored.');
      setImportStatus('success');
      setImportString('');
      setTimeout(() => {
        setImportStatus('idle');
        setStatusMessage('');
      }, 3000);
    } catch (error) {
      setStatusMessage('Import failed. The code may be corrupted or invalid.');
      setImportStatus('error');
      setTimeout(() => {
        setImportStatus('idle');
        setStatusMessage('');
      }, 4000);
    }
  };

  const handleCancelImport = () => {
    playClick();
    setShowConfirmModal(false);
  };

  return (
    <div className="space-y-8">
      <h3 className="text-sm text-emerald-400 uppercase tracking-[0.2em] border-b border-emerald-900/30 pb-2">
        Import / Export Game Data
      </h3>

      {/* Export Section */}
      <div className="space-y-4">
        <h4 className="text-xs text-emerald-600 uppercase tracking-widest">Export Save Data</h4>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Generate an export code for your current game progress. Use this to backup your save or
          transfer it to another device.
        </p>

        <button
          onClick={handleExport}
          className="w-full text-sm font-bold uppercase py-3 border border-emerald-600 bg-black/40 text-emerald-500 hover:bg-emerald-900/40 transition-all"
        >
          [ Generate Export Code ]
        </button>

        {exportString && (
          <div className="space-y-2">
            <div className="relative">
              <textarea
                readOnly
                value={exportString}
                className="w-full h-32 p-3 bg-black/60 border border-emerald-900/50 text-emerald-300 font-mono text-xs resize-none focus:outline-none focus:border-emerald-600"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                {exportString.length} characters
              </p>
            </div>

            <button
              onClick={handleCopyToClipboard}
              className={`w-full text-sm font-bold uppercase py-2 border transition-all ${
                copyStatus === 'success'
                  ? 'border-emerald-400 bg-emerald-900/50 text-emerald-300'
                  : 'border-emerald-700 bg-black/40 text-emerald-500 hover:bg-emerald-900/30'
              }`}
            >
              {copyStatus === 'success' ? '[ ✓ Copied! ]' : '[ Copy to Clipboard ]'}
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-emerald-900/20" />

      {/* Import Section */}
      <div className="space-y-4">
        <h4 className="text-xs text-emerald-600 uppercase tracking-widest">Import Save Data</h4>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Paste an export code below to restore a previously exported save. This will{' '}
          <span className="text-amber-400 font-bold">overwrite your current progress</span>.
        </p>

        <div className="p-3 border border-amber-900/50 bg-amber-950/20">
          <p className="text-xs text-amber-400 uppercase tracking-wider">⚠ Warning</p>
          <p className="text-[10px] text-amber-300/80 mt-1">
            Importing will replace your current save. Make sure to export your current progress
            first if you want to keep it!
          </p>
        </div>

        <textarea
          value={importString}
          onChange={(e) => setImportString(e.target.value)}
          placeholder="Paste export code here..."
          className="w-full h-32 p-3 bg-black/60 border border-emerald-900/50 text-emerald-300 font-mono text-xs resize-none focus:outline-none focus:border-emerald-600 placeholder-zinc-600"
        />

        <button
          onClick={handleImportClick}
          disabled={!importString.trim()}
          className="w-full text-sm font-bold uppercase py-3 border transition-all disabled:opacity-50 disabled:cursor-not-allowed border-amber-600 bg-black/40 text-amber-500 hover:bg-amber-900/40 disabled:hover:bg-black/40"
        >
          [ Import Game Data ]
        </button>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`p-3 border ${
            importStatus === 'success'
              ? 'border-emerald-700 bg-emerald-950/20 text-emerald-300'
              : importStatus === 'error'
                ? 'border-red-700 bg-red-950/20 text-red-300'
                : 'border-zinc-700 bg-black/20 text-zinc-300'
          }`}
        >
          <p className="text-xs uppercase tracking-wider">
            {importStatus === 'success' ? '✓ ' : importStatus === 'error' ? '✗ ' : ''}
            {statusMessage}
          </p>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={handleCancelImport}>
          <div
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg text-amber-400 uppercase tracking-wider mb-4 border-b border-amber-900/30 pb-2">
              Confirm Import
            </h3>
            <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
              This will <span className="text-amber-400 font-bold">permanently overwrite</span>{' '}
              your current game progress with the imported save data. This action cannot be undone.
            </p>
            <p className="text-xs text-zinc-400 mb-6">
              Make sure you have exported your current save if you want to keep it!
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleCancelImport}
                className="flex-1 text-sm font-bold uppercase py-2 border border-zinc-700 bg-black/40 text-zinc-400 hover:bg-zinc-900/40 transition-all"
              >
                [ Cancel ]
              </button>
              <button
                onClick={handleConfirmImport}
                className="flex-1 text-sm font-bold uppercase py-2 border border-amber-600 bg-amber-900/40 text-amber-300 hover:bg-amber-900/60 transition-all"
              >
                [ Confirm Import ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportExportView;
