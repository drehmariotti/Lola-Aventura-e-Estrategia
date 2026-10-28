import React from 'react';
import { ArrowLeft, Crosshair, Target, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

interface ShooterGameProps {
  onBackToMenu: () => void;
}

export function ShooterGame({ onBackToMenu }: ShooterGameProps) {
  return (
    <div className="relative w-screen h-screen overflow-y-auto bg-stone-950 text-stone-100 font-sans select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-stone-950 to-stone-900 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6 flex items-center justify-between border-b border-stone-800/80 bg-stone-950/60 backdrop-blur-md">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-cyan-300 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Menu Principal</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Em Desenvolvimento
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto p-6 sm:p-10 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-6 shadow-xl shadow-cyan-500/10">
          <Crosshair className="w-10 h-10" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-stone-100 uppercase">
          Cyber Sector: <span className="text-cyan-400">Orbital Assault</span>
        </h1>
        <p className="mt-3 text-stone-400 text-sm sm:text-base max-w-xl leading-relaxed">
          Subprojeto de tiro espacial e tático com mira livre, hordas cibernéticas, drones de apoio e arsenal de plasma.
        </p>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-10 text-left">
          <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 hover:border-cyan-500/40 transition-all shadow-md">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 mb-3">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-200">Arsenal de Plasma</h3>
            <p className="text-xs text-stone-400 mt-1 leading-relaxed">
              Disparos balísticos, raios laser contínuos, mísseis teleguiados e granadas de pulso eletromagnético.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 hover:border-cyan-500/40 transition-all shadow-md">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-200">Defesa de Setores</h3>
            <p className="text-xs text-stone-400 mt-1 leading-relaxed">
              Sobreviva a ondas crescentes de drones inimigos protegendo os núcleos de energia da estação.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 hover:border-cyan-500/40 transition-all shadow-md">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 mb-3">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-200">Arquitetura Modular</h3>
            <p className="text-xs text-stone-400 mt-1 leading-relaxed">
              Subpasta estruturada em <code className="text-cyan-300 font-mono text-[10px]">/src/games/shooter</code> pronta para início.
            </p>
          </div>
        </div>

        {/* Development Callout */}
        <div className="mt-10 p-6 rounded-2xl bg-stone-900/50 border border-stone-800/80 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-300">Diretório Reservado</p>
              <p className="text-xs text-stone-500">Módulos de projéteis, IA de inimigos e sistema de partículas em preparação.</p>
            </div>
          </div>
          <button
            onClick={onBackToMenu}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-stone-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 cursor-pointer active:scale-95"
          >
            Explorar Outros Jogos
          </button>
        </div>
      </main>
    </div>
  );
}
