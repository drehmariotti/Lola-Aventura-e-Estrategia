import React from 'react';
import { Compass, Car, Swords, Crosshair, Play, Gamepad2 } from 'lucide-react';

export type GameKey = 'lola' | 'racing' | 'fighting' | 'shooter';

interface PortalHomeProps {
  onSelectGame: (gameId: GameKey) => void;
}

interface GameButton {
  id: GameKey;
  title: string;
  icon: React.ReactNode;
  bgGradient: string;
  borderColor: string;
  hoverBorder: string;
  hoverGlow: string;
  iconColor: string;
  textColor: string;
  badge?: string;
}

const GAMES: GameButton[] = [
  {
    id: 'lola',
    title: 'Lola Aventureira',
    icon: <Compass className="w-12 h-12 sm:w-16 sm:h-16 stroke-[1.8]" />,
    bgGradient: 'from-amber-950/40 via-stone-900 to-stone-900',
    borderColor: 'border-amber-500/40',
    hoverBorder: 'hover:border-amber-400 hover:shadow-amber-500/25',
    hoverGlow: 'group-hover:bg-amber-500/20',
    iconColor: 'text-amber-400 group-hover:scale-110 transition-transform duration-300',
    textColor: 'text-amber-400 group-hover:text-amber-300',
  },
  {
    id: 'racing',
    title: 'Corrida',
    icon: <Car className="w-12 h-12 sm:w-16 sm:h-16 stroke-[1.8]" />,
    bgGradient: 'from-red-950/40 via-stone-900 to-stone-900',
    borderColor: 'border-red-500/40',
    hoverBorder: 'hover:border-red-400 hover:shadow-red-500/25',
    hoverGlow: 'group-hover:bg-red-500/20',
    iconColor: 'text-red-400 group-hover:scale-110 transition-transform duration-300',
    textColor: 'text-red-400 group-hover:text-red-300',
  },
  {
    id: 'fighting',
    title: 'Luta',
    icon: <Swords className="w-12 h-12 sm:w-16 sm:h-16 stroke-[1.8]" />,
    bgGradient: 'from-purple-950/40 via-stone-900 to-stone-900',
    borderColor: 'border-purple-500/40',
    hoverBorder: 'hover:border-purple-400 hover:shadow-purple-500/25',
    hoverGlow: 'group-hover:bg-purple-500/20',
    iconColor: 'text-purple-400 group-hover:scale-110 transition-transform duration-300',
    textColor: 'text-purple-400 group-hover:text-purple-300',
  },
  {
    id: 'shooter',
    title: 'Tiro',
    icon: <Crosshair className="w-12 h-12 sm:w-16 sm:h-16 stroke-[1.8]" />,
    bgGradient: 'from-cyan-950/40 via-stone-900 to-stone-900',
    borderColor: 'border-cyan-500/40',
    hoverBorder: 'hover:border-cyan-400 hover:shadow-cyan-500/25',
    hoverGlow: 'group-hover:bg-cyan-500/20',
    iconColor: 'text-cyan-400 group-hover:scale-110 transition-transform duration-300',
    textColor: 'text-cyan-400 group-hover:text-cyan-300',
  },
];

export function PortalHome({ onSelectGame }: PortalHomeProps) {
  return (
    <div className="min-h-screen w-full bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-4 sm:p-8 font-sans select-none relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex flex-col items-center text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-stone-300 text-xs sm:text-sm font-semibold mb-3 shadow-md">
          <Gamepad2 className="w-4 h-4 text-amber-400" />
          <span className="tracking-wide uppercase">Selecione um Jogo</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-100">
          PORTAL DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">JOGOS</span>
        </h1>
      </header>

      {/* Direct Square Buttons Grid */}
      <main className="relative z-10 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            className={`group relative aspect-square w-full rounded-3xl bg-gradient-to-b ${game.bgGradient} border ${game.borderColor} ${game.hoverBorder} flex flex-col items-center justify-center gap-3 sm:gap-4 p-4 shadow-xl transition-all duration-200 hover:-translate-y-1.5 hover:shadow-2xl active:scale-95 cursor-pointer`}
            title={`Iniciar ${game.title}`}
          >
            {/* Center Icon Frame */}
            <div
              className={`p-4 sm:p-5 rounded-2xl bg-stone-950/70 border border-stone-800/90 ${game.hoverGlow} transition-colors duration-300 shadow-inner`}
            >
              <div className={game.iconColor}>{game.icon}</div>
            </div>

            {/* Title */}
            <span
              className={`text-sm sm:text-base md:text-lg font-black tracking-wide text-center uppercase ${game.textColor}`}
            >
              {game.title}
            </span>

            {/* Quick Launch Tag */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950/60 border border-stone-800 text-[10px] sm:text-xs font-bold text-stone-400 group-hover:text-stone-200 group-hover:border-stone-700 transition-all">
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>JOGAR</span>
            </div>
          </button>
        ))}
      </main>
    </div>
  );
}
