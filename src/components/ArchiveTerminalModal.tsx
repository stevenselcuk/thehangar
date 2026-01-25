import React, { useEffect, useRef, useState } from 'react';
import { GameState } from '../types.ts';

const playKeypress = () => {
  const audio = new Audio('/sounds/terminal_keypress.mp3');
  audio.volume = 0.4;
  audio.play().catch(() => {});
};

const playEnter = () => {
  const audio = new Audio('/sounds/terminal_enter.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {});
};

const ArchiveTerminalModal: React.FC<{
  state: GameState;
  onAction: (t: string, p?: Record<string, unknown>) => void;
  onClose: () => void;
}> = ({ state, onAction, onClose }) => {
  const [input, setInput] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [state.archiveTerminal.output]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    playKeypress();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const command = input.trim().toLowerCase();
    if (command === 'exit' || command === '/quit') {
      onClose();
      return;
    }
    playEnter();
    onAction('ARCHIVE_ACTION', { command: input });
    setInput('');
  };

  const renderLine = (line: string, index: number) => {
    const isPrompt = line.startsWith('>');
    const isError = line.startsWith('ERR:');
    const isRedacted = /\[REDACTED\]/g;

    if (isError) {
      return (
        <p key={index} className="text-red-500">
          {line}
        </p>
      );
    }
    if (isPrompt) {
      return (
        <p key={index}>
          <span className="text-emerald-800">{'>'}</span> {line.substring(1)}
        </p>
      );
    }

    const parts = line.split(isRedacted);
    const matches = line.match(isRedacted);

    return (
      <p key={index}>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {matches && i < matches.length && (
              <span className="bg-emerald-400 text-emerald-400">{matches[i]}</span>
            )}
          </React.Fragment>
        ))}
      </p>
    );
  };

  return (
    <div className="modal-overlay" onClick={() => inputRef.current?.focus()}>
      <div
        className={`modal-content !p-4 !max-w-5xl h-[90vh] flex flex-col terminal border-emerald-800/40 ${state.archiveTerminal.securityAlertTimer > 0 ? 'security-alert' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-grow overflow-y-auto text-sm" ref={outputRef}>
          <pre className="whitespace-pre-wrap font-mono">
            <div className="text-emerald-600 mb-6 font-bold leading-none tracking-tighter select-none opacity-80">
              {`
▄▄▄▄  ▄▄▄  ▄▄▄▄   ▄▄▄▄   ▄▄▄      ▄▄▄   ▄▄▄  ▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄   
▀███  ███  ███▀ ▄██▀▀██▄ ███      ███ ▄███▀ ███▀▀▀▀▀ ███▀▀███▄ 
 ███  ███  ███  ███  ███ ███      ███████   ███▄▄    ███▄▄███▀ 
 ███▄▄███▄▄███  ███▀▀███ ███      ███▀███▄  ███      ███▀▀██▄  
  ▀████▀████▀   ███  ███ ████████ ███  ▀███ ▀███████ ███  ▀███ 
                                                               
                                                               
                                                               
▄▄▄      ▄▄▄   ▄▄▄▄▄   ▄▄▄▄▄▄▄   ▄▄▄       ▄▄▄▄▄▄▄ ▄▄▄   ▄▄▄   
████▄  ▄████ ▄███████▄ ███▀▀███▄ ███      ███▀▀▀▀▀ ███   ███   
███▀████▀███ ███   ███ ███▄▄███▀ ███      ███▄▄    ▀███▄███▀   
███  ▀▀  ███ ███▄▄▄███ ███▀▀██▄  ███      ███        ▀███▀     
███      ███  ▀█████▀  ███  ▀███ ████████ ▀███████    ███      
`}
            </div>
            {state.archiveTerminal.output.map(renderLine)}
          </pre>
        </div>
        <form
          onSubmit={handleFormSubmit}
          className="flex items-center mt-2 border-t border-emerald-900/50 pt-2"
        >
          <span className="text-emerald-800">{'>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            className="ml-2 bg-transparent border-none text-emerald-400 outline-none font-mono"
            autoComplete="off"
            style={{ width: `${input.length}ch` }}
          />
          <div className="w-2 h-4 bg-emerald-400 blinking-cursor" />
          <div className="flex-grow" />
        </form>
      </div>
    </div>
  );
};

export default ArchiveTerminalModal;
