import React from 'react';
import {
  COMPANY_NEWS,
  CONSPIRACY_THEORIES,
  DEPLOYMENTS,
  MECHANIC_OF_THE_MONTH,
  SUITS_INTEL,
  TEAM_ROSTERS,
} from '../data/bulletinBoardData.ts';
import { GameState } from '../types.ts';

interface BulletinBoardModalProps {
  state: GameState;
  onClose: () => void;
}

const BulletinBoardModal: React.FC<BulletinBoardModalProps> = ({ state, onClose }) => {
  const { activeIndices, mechanicOfTheMonthIndex } = state.bulletinBoard;
  const mechanic = MECHANIC_OF_THE_MONTH[mechanicOfTheMonthIndex];

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl bg-[#050905] border-2 border-emerald-900 shadow-[0_0_50px_rgba(16,185,129,0.1)] relative flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 bg-[length:100%_2px,3px_100%]"></div>

        {/* Header */}
        <div className="p-4 border-b border-emerald-900/50 flex justify-between items-center bg-emerald-950/20 relative z-20">
          <div>
            <h2 className="text-xl font-bold text-emerald-500 uppercase tracking-widest leading-none">
              RAS-NET // BULLETIN
            </h2>
            <p className="text-[10px] text-emerald-800 uppercase tracking-[0.3em] mt-1">
              Internal Communications Relay
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-600 hover:text-emerald-400 font-bold text-xs uppercase tracking-widest border border-emerald-900/50 px-3 py-1 bg-black hover:bg-emerald-900/20 transition-all"
          >
            [ CLOSE RELAY ]
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-20 scrollbar-hide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Mechanic of the Month - Digital File Style */}
            <div className="lg:col-span-3 border border-emerald-900/60 bg-emerald-950/10 p-4 relative">
              <div className="absolute top-0 left-0 bg-emerald-900/40 text-emerald-300 text-[9px] px-2 py-0.5 uppercase tracking-widest font-bold">
                Featured Personnel Record
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-start mt-4">
                <div className="w-24 h-28 bg-emerald-900/20 border border-emerald-800 flex items-center justify-center shrink-0 p-1">
                  <div className="w-full h-full bg-black/60 flex items-center justify-center grayscale contrast-125 border border-emerald-900/30">
                    <span className="text-xs text-emerald-700 font-mono">NO IMG</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="border-b border-emerald-900/30 pb-2">
                    <h3 className="text-lg font-bold text-emerald-400 uppercase tracking-widest leading-none">
                      {mechanic.name}
                    </h3>
                    <span className="text-[10px] text-emerald-700 font-mono uppercase">
                      ID: {mechanic.year}-REC // COMMENDATION
                    </span>
                  </div>

                  <p className="text-xs text-emerald-200/80 italic font-mono border-l-2 border-emerald-800/50 pl-3 py-1">
                    "{mechanic.quote}"
                  </p>

                  <div className="text-[10px] text-emerald-500 font-mono leading-relaxed bg-black/40 p-3 border border-emerald-900/30">
                    <span className="text-emerald-800 uppercase mr-2">BIO_LOG:</span>
                    {mechanic.bio}
                  </div>
                </div>
              </div>
            </div>

            {/* Columns */}
            <div className="space-y-6">
              <BulletinSection
                title="Shift Rosters"
                code="HR-01"
                items={activeIndices.teamRosters.map((i) => TEAM_ROSTERS[i])}
              />
              <BulletinSection
                title="Deployment Log"
                code="OPS-44"
                items={activeIndices.deployments.map((i) => DEPLOYMENTS[i])}
              />
            </div>

            <div className="space-y-6">
              <BulletinSection
                title="Corporate Memos"
                code="ADM-99"
                items={activeIndices.companyNews.map((i) => COMPANY_NEWS[i])}
              />
              <div className="p-4 border border-red-900/40 bg-red-950/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                </div>
                <h4 className="text-[9px] text-red-500 font-bold uppercase tracking-widest mb-2">
                  Safety Alert
                </h4>
                <p className="text-xs font-mono text-red-400">
                  DAYS SINCE LAST INCIDENT:{' '}
                  <span className="text-red-500 font-bold text-lg">0</span>
                </p>
                <p className="text-[8px] text-red-900/60 mt-2 uppercase tracking-tight">
                  Reporting anomalies is mandatory. Reporting anomalies is punishable.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <BulletinSection
                title="Surveillance"
                code="SEC-00 [REDACTED]"
                items={activeIndices.suitsIntel.map((i) => SUITS_INTEL[i])}
                redacted
              />
              <BulletinSection
                title="Local Chatter"
                code="VOX-POP"
                items={activeIndices.conspiracyTheories.map((i) => CONSPIRACY_THEORIES[i])}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BulletinSection: React.FC<{
  title: string;
  items: string[];
  code: string;
  redacted?: boolean;
}> = ({ title, items, code, redacted }) => {
  return (
    <div className="p-4 border border-emerald-900/30 bg-black/20 hover:bg-emerald-900/5 transition-colors">
      <div className="flex justify-between items-end mb-3 border-b border-emerald-900/20 pb-1">
        <h4 className="text-xs text-emerald-500 font-bold uppercase tracking-widest">{title}</h4>
        <span className="text-[8px] text-emerald-800 font-mono">{code}</span>
      </div>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="text-[10px] text-emerald-400/90 font-mono leading-tight flex gap-2"
          >
            <span className="text-emerald-800 shrink-0">{'>'}</span>
            <span
              className={
                redacted ? 'blur-[2px] hover:blur-none transition-all duration-300 cursor-help' : ''
              }
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BulletinBoardModal;
