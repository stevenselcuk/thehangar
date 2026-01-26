import React from 'react';

interface EndingScreenProps {
  endingType: 'ALIEN' | 'GOVT' | 'CRAZY' | 'TRY_AGAIN';
  onReset: () => void;
}

const EndingScreen: React.FC<EndingScreenProps> = ({ endingType, onReset }) => {
  const getEndingContent = () => {
    switch (endingType) {
      case 'ALIEN':
        return {
          title: 'THE STARWARD ASCENSION',
          color: 'text-purple-500',
          borderColor: 'border-purple-600',
          description:
            "You weren't crazy. The patterns in the static, the hum of the pylons... it was all real. As you board the craft you helped maintain, you realize your shift is finally over. You are going home, to a place you've never been.",
          bgColor: 'bg-purple-950/20',
        };
      case 'GOVT':
        return {
          title: 'CLEARANCE GRANTED',
          color: 'text-blue-500',
          borderColor: 'border-blue-600',
          description:
            "The Suits approach you, not with handcuffs, but with a dossier. You've passed the test. The things you've seen are a matter of national security, and now, so are you. Welcome to the other side of the fence.",
          bgColor: 'bg-blue-950/20',
        };
      case 'CRAZY':
        return {
          title: 'INSTITUTIONALIZED',
          color: 'text-emerald-500',
          borderColor: 'border-emerald-600',
          description:
            "They say it was stress. Fatigue. The fumes. You spend your days in a white room now. It's quiet. But sometimes, when the AC hums just right, you can still hear the machine calling your name.",
          bgColor: 'bg-emerald-950/20',
        };
      case 'TRY_AGAIN':
      default:
        return {
          title: 'SIMULATION RESET',
          color: 'text-zinc-500',
          borderColor: 'border-zinc-600',
          description: 'The timeline has collapsed. Attempting restoration...',
          bgColor: 'bg-zinc-950/20',
        };
    }
  };

  const content = getEndingContent();

  return (
    <div className="fixed inset-0 z-[3000] bg-black flex items-center justify-center p-8 animate-[fadeIn_2s]">
      <div
        className={`max-w-2xl w-full p-8 border-4 ${content.borderColor} ${content.bgColor} backdrop-blur-md relative`}
      >
        <div
          className={`absolute -top-6 left-1/2 -translate-x-1/2 bg-black px-6 py-2 border-2 ${content.borderColor}`}
        >
          <h1
            className={`text-2xl md:text-4xl font-black uppercase tracking-widest ${content.color} flicker`}
          >
            {content.title}
          </h1>
        </div>

        <div className="mt-8 text-center space-y-8">
          <p
            className={`text-lg md:text-xl font-serif italic leading-relaxed ${content.color} opacity-90`}
          >
            "{content.description}"
          </p>

          <div className="pt-8 border-t border-white/10">
            <button
              onClick={onReset}
              className={`px-8 py-3 bg-black border-2 ${content.borderColor} ${content.color} font-bold uppercase tracking-widest hover:bg-white/10 transition-all`}
            >
              Start New Shift
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndingScreen;
