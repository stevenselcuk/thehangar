import React, { useState } from 'react';

const AboutModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const BUILD_NUMBER = 'Build Number {_build_27}';

  const [activeSection, setActiveSection] = useState<'ABOUT' | 'HOW_TO' | 'CONTACT'>('ABOUT');

  const playClick = () => {
    const audio = new Audio('/sounds/ui_click.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const handleSectionClick = (section: 'ABOUT' | 'HOW_TO' | 'CONTACT') => {
    playClick();
    setActiveSection(section);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content !p-0 flex h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xs uppercase px-3 py-1 border border-red-800 text-red-500 hover:bg-red-900 transition-all z-10"
        >
          [ CLOSE ]
        </button>

        {/* Sidebar */}
        <div className="w-1/4 bg-black/20 border-r border-emerald-900/50 p-6 flex flex-col space-y-2">
          <h3 className="text-sm text-emerald-600 uppercase tracking-[0.2em] border-b border-emerald-900/30 pb-4 mb-2">
            Information
          </h3>
          <button
            onClick={() => handleSectionClick('ABOUT')}
            className={`w-full text-left px-4 py-2 text-sm uppercase transition-all rounded-sm ${activeSection === 'ABOUT' ? 'bg-emerald-800 text-white shadow-lg' : 'hover:bg-emerald-950/50 text-emerald-400'}`}
          >
            About
          </button>
          <button
            onClick={() => handleSectionClick('HOW_TO')}
            className={`w-full text-left px-4 py-2 text-sm uppercase transition-all rounded-sm ${activeSection === 'HOW_TO' ? 'bg-emerald-800 text-white shadow-lg' : 'hover:bg-emerald-950/50 text-emerald-400'}`}
          >
            How to Play
          </button>
          <button
            onClick={() => handleSectionClick('CONTACT')}
            className={`w-full text-left px-4 py-2 text-sm uppercase transition-all rounded-sm ${activeSection === 'CONTACT' ? 'bg-emerald-800 text-white shadow-lg' : 'hover:bg-emerald-950/50 text-emerald-400'}`}
          >
            Contact
          </button>
        </div>

        {/* Content */}
        <div className="w-3/4 p-8 overflow-y-auto">
          {activeSection === 'ABOUT' && (
            <div className="space-y-6 text-emerald-300 animate-[story-reveal_1s_ease-out]">
              <h1 className="text-2xl font-bold text-emerald-400 border-b border-emerald-800 pb-2">
                THE HANGAR
                <p className="text-xs uppercase text-emerald-600 tracking-widest">
                  {BUILD_NUMBER.replace(/\{_build_(\d+)\}/, '$1')}
                </p>
              </h1>
              <p className="text-sm leading-relaxed">
                THE HANGAR is a text-based incremental RPG of industrial dread and eldritch mystery.
                You are a night-shift aircraft mechanic at a remote international airport. What
                begins as a mundane routine of repairs and paperwork slowly unravels into a
                terrifying conspiracy surrounding the disappearance of flight MH370 and the strange,
                untraceable components that have started appearing in your bay.
              </p>
              <p className="text-sm leading-relaxed">
                This game saves your progress automatically in your browser's local storage. There
                is no server, and no data is collected.
              </p>
              <div className="pt-4 border-t border-emerald-900/50">
                <h2 className="text-xs uppercase text-emerald-600 tracking-widest">Credits</h2>
                <p className="text-sm mt-2">Me. Steve.</p>
              </div>
            </div>
          )}
          {activeSection === 'HOW_TO' && (
            <div className="space-y-6 text-emerald-300 animate-[story-reveal_1s_ease-out]">
              <h1 className="text-2xl font-bold text-emerald-400 border-b border-emerald-800 pb-2">
                How to Play
              </h1>
              <div>
                <h2 className="text-lg font-semibold text-emerald-400 mb-2">The Goal</h2>
                <p className="text-sm leading-relaxed">
                  Survive your shift, maintain your sanity, and uncover the truth without drawing
                  too much attention. Every action has consequences.
                </p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-emerald-400 mb-2">Core Stats</h2>
                <ul className="space-y-3 text-sm list-disc list-inside">
                  <li>
                    <strong className="text-emerald-400">Sanity:</strong> Your mental stability.
                    Drops when you witness strange events. If it reaches zero, you lose.
                  </li>
                  <li>
                    <strong className="text-red-400">Suspicion:</strong> How much attention you've
                    drawn from management and other forces. If it reaches 100, you are... removed.
                  </li>
                  <li>
                    <strong className="text-blue-400">Focus:</strong> Your ability to perform tasks.
                    Consumed by most actions, but regenerates over time. Keep it high to be
                    effective.
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-emerald-400 mb-2">Gameplay Loop</h2>
                <ul className="space-y-3 text-sm list-disc list-inside">
                  <li>
                    Take on jobs and assignments from the{' '}
                    <strong className="text-emerald-400">APRON</strong> and{' '}
                    <strong className="text-emerald-400">HANGAR</strong> to earn Credits and
                    Experience (XP).
                  </li>
                  <li>Use resources like Alclad and Rivets to complete jobs.</li>
                  <li>
                    Manage your tools in the <strong className="text-emerald-400">TOOLROOM</strong>.
                    Broken tools are useless and the Master gets angry.
                  </li>
                  <li>
                    Visit the <strong className="text-emerald-400">CANTEEN</strong> and{' '}
                    <strong className="text-emerald-400">TERMINAL</strong> to manage your Sanity and
                    Focus.
                  </li>
                  <li>
                    Use the <strong className="text-emerald-400">OFFICE</strong> to manage your
                    career, study for licenses, and investigate leads.
                  </li>
                  <li>
                    Spend Skill Points in the{' '}
                    <strong className="text-emerald-400">PROFICIENCY MATRIX</strong> (click your
                    Level/XP bar in the header) to unlock new abilities.
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-emerald-400 mb-2">The Mystery</h2>
                <p className="text-sm leading-relaxed">
                  Pay attention to the logs, radio chatter, and emails. The truth is hidden in the
                  details. Some choices will open new paths, while others will lead to a dead end.
                  Good luck.
                </p>
              </div>
            </div>
          )}
          {activeSection === 'CONTACT' && (
            <div className="space-y-6 text-emerald-300 animate-[story-reveal_1s_ease-out]">
              <h1 className="text-2xl font-bold text-emerald-400 border-b border-emerald-800 pb-2">
                Contact
              </h1>
              <div>
                <h2 className="text-lg font-semibold text-emerald-400 mb-2">
                  Feedback & Inquiries
                </h2>
                <p className="text-sm leading-relaxed">
                  For feedback, bug reports, or any other inquiries, you can reach out via email:
                </p>
                <a
                  href="mailto:steven@tabbythecat.com"
                  className="text-lg text-amber-400 font-mono my-2 inline-block hover:underline"
                >
                  steven@tabbythecat.com
                </a>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-emerald-400 mb-2">Public Repository</h2>
                <p className="text-sm leading-relaxed mb-4">
                  The Hangar is open source. Issue or feature request? Go to the GitHub repo. PR's
                  welcome.
                </p>
                <a
                  href="https://github.com/stevenselcuk/thehangar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 border border-emerald-700 bg-emerald-950/20 text-emerald-300 uppercase text-sm font-bold tracking-widest hover:bg-emerald-900/40 hover:border-emerald-500 transition-all"
                >
                  Go GitHub Repo
                </a>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-emerald-400 mb-2">Developer Profile</h2>
                <p className="text-sm leading-relaxed mb-4">
                  Check out the developer's other projects on GitHub.
                </p>
                <a
                  href="https://github.com/stevenselcuk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 border border-emerald-700 bg-emerald-950/20 text-emerald-300 uppercase text-sm font-bold tracking-widest hover:bg-emerald-900/40 hover:border-emerald-500 transition-all"
                >
                  Visit GitHub Profile
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
