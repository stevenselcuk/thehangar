import React, { useState } from 'react';
import { useSound } from '../context/SoundContext.tsx';
import { MailMessage } from '../types.ts';

interface MailClientProps {
  messages: MailMessage[];
  onRead: (id: string) => void;
  onClose: () => void;
}

const MailClient: React.FC<MailClientProps> = ({ messages, onRead, onClose }) => {
  const { play } = useSound();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedMessage = messages.find((m) => m.id === selectedId);

  const handleSelect = (msg: MailMessage) => {
    play('CLICK');
    setSelectedId(msg.id);
    if (!msg.read) {
      onRead(msg.id);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border-2 border-emerald-800 bg-black font-mono relative overflow-hidden">
      {/* Header */}
      <div className="bg-emerald-900/30 border-b border-emerald-800 p-2 flex justify-between items-center">
        <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
          <span className="mr-2">█</span> Internal Mail System v4.2
        </div>
        <button
          onClick={() => {
            play('CLICK');
            onClose();
          }}
          className="text-emerald-500 hover:text-emerald-300 px-2 text-xs uppercase font-bold"
        >
          [X] CLOSE
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Message List */}
        <div className="w-1/3 border-r border-emerald-900/50 overflow-y-auto bg-black/80">
          {messages.length === 0 && (
            <div className="p-4 text-[10px] text-emerald-800 italic text-center mt-10">
              Folder Empty
            </div>
          )}
          {messages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => handleSelect(msg)}
              className={`w-full text-left p-3 border-b border-emerald-900/30 transition-colors
                ${selectedId === msg.id ? 'bg-emerald-900/40 text-emerald-200' : 'hover:bg-emerald-900/20 text-emerald-600'}
                ${!msg.read ? 'font-bold decoration-emerald-500' : 'opacity-80'}
              `}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] uppercase tracking-wider truncate mr-2">
                  {!msg.read && <span className="text-emerald-400 mr-1">●</span>}
                  {msg.from}
                </span>
              </div>
              <div className="text-[10px] truncate">{msg.subject}</div>
            </button>
          ))}
        </div>

        {/* Reading Pane */}
        <div className="w-2/3 flex flex-col bg-[#050905]">
          {selectedMessage ? (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-emerald-900/30 bg-emerald-950/10">
                <h3 className="text-sm font-bold text-emerald-400 mb-1">
                  {selectedMessage.subject}
                </h3>
                <div className="text-[10px] text-emerald-700 uppercase">
                  FROM: <span className="text-emerald-500">{selectedMessage.from}</span>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto text-xs text-emerald-300/80 leading-relaxed whitespace-pre-wrap font-light">
                {selectedMessage.body}
              </div>
              <div className="p-2 border-t border-emerald-900/30 bg-black flex justify-end">
                <div className="text-[9px] text-emerald-800 uppercase tracking-widest self-center mr-4">
                  --- END OF MESSAGE ---
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-emerald-900/40 flex-col">
              <div className="text-4xl mb-4 opacity-50">✉</div>
              <div className="text-xs uppercase tracking-widest">Select a message</div>
            </div>
          )}
        </div>
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] opacity-20"></div>
    </div>
  );
};

export default MailClient;
