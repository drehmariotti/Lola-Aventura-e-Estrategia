import React, { useState } from 'react';
import {
  Gamepad2,
  Compass,
  Car,
  Swords,
  Crosshair,
  Play,
  Sparkles,
  Trophy,
  Flame,
  Zap,
  Shield,
  Layers,
  ChevronRight,
  Star,
  Info,
} from 'lucide-react';

export type GameKey = 'lola' | 'racing' | 'fighting' | 'shooter';

interface GameInfo {
  id: GameKey;
  title: string;
  subtitle: string;
  genre: string;
  status: 'available' | 'coming_soon';
  description: string;
  tags: string[];
  features: string[];
  icon: React.ReactNode;
  accentColor: string;
  badgeColor: string;
  buttonBg: string;
}

interface PortalHomeProps {
  onSelectGame: (gameId: GameKey) => void;
}

const GAMES: GameInfo[] = [
  {
    id: 'lola',
    title: 'Lola Aventureira',
    subtitle: 'O Mistério das Ruínas Ancestrais',
    genre: 'Aventura & Puzzle 3D em Turnos',
    status: 'available',
    description:
      'Explore 10 templos esquecidos repletos de perigos mortais, serpentes que dão o bote, pisos frágeis que viram abismos e relíquias raras de ouro inspirados no estilo Lara Croft GO.',
    tags: ['3D Isométrico', '10 Capítulos', 'Puzzles Estratégicos', 'Relíquias Ocultas'],
    features: ['10 Fases Exclusivas', 'Pisos Rachados & Armadilhas', 'Movimentação Tática'],
    icon: <Compass className="w-8 h-8 text-amber-400" />,
    accentColor: 'from-amber-500/20 via-yellow-500/10 to-stone-900',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    buttonBg: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold',
  },
  {
    id: 'racing',
    title: 'Turbo Velocity',
    subtitle: 'Apex Racing & Drift',
    genre: 'Corrida & Alta Velocidade Arcade',
    status: 'coming_soon',
    description:
      'Derrapagens em alta velocidade por circuitos noturnos, túneis iluminados e estradas litorâneas com turbo nitro acumulado e física responsiva.',
    tags: ['Drift Arcade', 'Física de Nitro', 'Time Attack', 'Subpasta Pronta'],
    features: ['Circuitos Urbanos', 'Personalização de Carros', 'Ranking de Melhores Tempos'],
    icon: <Car className="w-8 h-8 text-rose-400" />,
    accentColor: 'from-red-500/20 via-orange-500/10 to-stone-900',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    buttonBg: 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700',
  },
  {
    id: 'fighting',
    title: 'Shadow Impact',
    subtitle: 'Brawler Arena',
    genre: 'Luta & Combate de Artes Marciais',
    status: 'coming_soon',
    description:
      'Duelos frenéticos em arenas místicas e dojos cibernéticos com combos em cadeia, quebras de guarda, esquivas precisas e ataques especiais.',
    tags: ['Combos Dinâmicos', 'Parry & Counter', 'Super Golpes', 'Subpasta Pronta'],
    features: ['Lutadores Únicos', 'Barras de Especial', 'Arenas Destrutíveis'],
    icon: <Swords className="w-8 h-8 text-purple-400" />,
    accentColor: 'from-purple-500/20 via-fuchsia-500/10 to-stone-900',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    buttonBg: 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700',
  },
  {
    id: 'shooter',
    title: 'Cyber Sector',
    subtitle: 'Orbital Assault',
    genre: 'Tiro Tático & Sci-Fi Shooter',
    status: 'coming_soon',
    description:
      'Batalhas intensas contra enxames de drones e naves cibernéticas em estações orbitais abandonadas com projéteis de plasma e armas de energia.',
    tags: ['Tiro Espacial', 'Arsenal Tecnológico', 'Hordas de Drones', 'Subpasta Pronta'],
    features: ['Armas de Plasma', 'Defesa de Setor', 'Drones Auxiliares'],
    icon: <Crosshair className="w-8 h-8 text-cyan-400" />,
    accentColor: 'from-cyan-500/20 via-blue-500/10 to-stone-900',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    buttonBg: 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700',
  },
];

export function PortalHome({ onSelectGame }: PortalHomeProps) {
  const [filter, setFilter] = useState<'all' | 'available' | 'coming_soon'>('all');

  const filteredGames = GAMES.filter((g) => {
    if (filter === 'all') return true;
    return g.status === filter;
  });

  return (
    <div className="min-h-screen w-full bg-stone-950 text-stone-100 flex flex-col font-sans select-none">
      {/* Ambient Lighting Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation Topbar */}
      <header className="relative z-20 border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-500/20">
              <Gamepad2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-wider text-stone-100 uppercase">
                Portal de Jogos
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-semibold text-amber-400/90 tracking-normal px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Hub de Projetos
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>1 Jogável</span>
              <span className="text-stone-600">|</span>
              <span className="text-stone-400">3 Em Breve</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-10">
        {/* Hero Spotlight: Lola Aventureira */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-900 border border-amber-500/30 p-6 sm:p-10 shadow-2xl">
          <div className="relative z-10 max-w-2xl flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Jogo em Destaque & 100% Jogável</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-stone-100 tracking-tight leading-tight">
              Lola Aventureira: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">
                O Mistério das Ruínas
              </span>
            </h1>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
              Assuma o papel de Lola em uma expedição arqueológica através de 10 capítulos 3D em turnos.
              Desvie de botes mortais de serpentes, atravesse pisos quebradiços que caem no abismo e desvende os enigmas do templo sagrado.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-stone-950/70 border border-stone-800 text-stone-300 font-medium">
                ★ 10 Fases Completas
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-950/70 border border-stone-800 text-stone-300 font-medium">
                ★ Gráficos 3D Isométricos
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-950/70 border border-stone-800 text-stone-300 font-medium">
                ★ Controles por Mouse, Toque & Teclado
              </span>
            </div>

            <div className="pt-3 flex items-center gap-4">
              <button
                onClick={() => onSelectGame('lola')}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/25 transition-all cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-stone-950" />
                <span>JOGAR AGORA</span>
              </button>
            </div>
          </div>

          {/* Decorative Background Icon */}
          <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none hidden md:block">
            <Compass className="w-96 h-96 text-amber-400" />
          </div>
        </section>

        {/* Filter Bar & Section Header */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-5">
          <div>
            <h2 className="text-2xl font-black text-stone-100 tracking-tight flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-amber-400" />
              <span>Catálogo de Jogos</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              Escolha um dos 4 projetos da nossa plataforma de jogos
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-900 border border-stone-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-amber-500 text-stone-950 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Todos (4)
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filter === 'available'
                  ? 'bg-amber-500 text-stone-950 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Jogáveis (1)
            </button>
            <button
              onClick={() => setFilter('coming_soon')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filter === 'coming_soon'
                  ? 'bg-amber-500 text-stone-950 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Em Breve (3)
            </button>
          </div>
        </section>

        {/* 4 Games Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGames.map((game) => {
            const isAvailable = game.status === 'available';

            return (
              <div
                key={game.id}
                className={`relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-b ${game.accentColor} border ${
                  isAvailable ? 'border-amber-500/50 shadow-xl shadow-amber-500/5' : 'border-stone-800'
                } p-6 sm:p-7 transition-all hover:border-stone-600`}
              >
                <div>
                  {/* Top Card Info */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-stone-900/90 border border-stone-700/80 flex items-center justify-center shadow-md">
                      {game.icon}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${game.badgeColor}`}
                    >
                      {isAvailable ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Jogar Agora
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          Em Breve
                        </>
                      )}
                    </span>
                  </div>

                  {/* Title & Category */}
                  <div className="mb-3">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-stone-400">
                      {game.genre}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight mt-0.5">
                      {game.title}
                    </h3>
                    <p className="text-xs font-semibold text-amber-400/90">{game.subtitle}</p>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-stone-400 leading-relaxed mb-4">
                    {game.description}
                  </p>

                  {/* Feature Highlights */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {game.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] sm:text-[11px] font-medium px-2.5 py-1 rounded-md bg-stone-900/80 border border-stone-800 text-stone-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-stone-500 font-mono">
                    /src/games/{game.id}
                  </span>

                  <button
                    onClick={() => onSelectGame(game.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 ${game.buttonBg}`}
                  >
                    {isAvailable ? (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Jogar Lola</span>
                      </>
                    ) : (
                      <>
                        <Info className="w-3.5 h-3.5" />
                        <span>Ver Projeto</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-stone-800/80 bg-stone-950 py-6 text-center text-xs text-stone-500">
        <p className="font-medium text-stone-400">
          Portal de Jogos • Lola Aventureira, Corrida, Luta e Tiro
        </p>
        <p className="text-[11px] text-stone-600 mt-1">
          Subdiretórios organizados em <code className="text-stone-400">/src/games/</code> prontos para expansão contínua.
        </p>
      </footer>
    </div>
  );
}
