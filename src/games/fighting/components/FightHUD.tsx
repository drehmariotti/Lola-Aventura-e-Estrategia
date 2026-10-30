import React from 'react';
import { FighterState } from '../types';
import { FightMatchState } from '../fighterEngine';
import { ArrowLeft, RotateCcw, Swords, Keyboard } from 'lucide-react';

interface FightHUDProps {
  p1: FighterState;
  p2: FighterState;
  match: FightMatchState;
  onRestartMatch: () => void;
  onBackToSelect: () => void;
  onBackToPortal: () => void;
}

export function FightHUD({
  p1,
  p2,
  match,
  onRestartMatch,
  onBackToSelect,
  onBackToPortal,
}: FightHUDProps) {
  const p1HpPercent = Math.max(0, (p1.health / p1.maxHealth) * 100);
  const p2HpPercent = Math.max(0, (p2.health / p2.maxHealth) * 100);

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-5 select-none font-sans overflow-hidden">
      {/* Top Bar: Lifebars, Rounds & Timer */}
      <header className="pointer-events-auto w-full max-w-5xl mx-auto flex flex-col gap-2">
        {/* Navigation & Controls header */}
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToPortal}
              className="px-2.5 py-1.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-700/80 text-stone-300 transition-all cursor-pointer shadow flex items-center gap-1.5"
              title="Voltar ao Menu Principal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Menu Principal</span>
            </button>
            <button
              onClick={onBackToSelect}
              className="px-2.5 py-1.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-700/80 text-amber-400 transition-all cursor-pointer shadow flex items-center gap-1.5"
              title="Trocar Lutador"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Trocar Personagem</span>
            </button>
          </div>

          <button
            onClick={onRestartMatch}
            className="px-2.5 py-1.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-700/80 text-stone-300 transition-all cursor-pointer shadow flex items-center gap-1.5"
            title="Reiniciar Luta"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
        </div>

        {/* Tekken Style Health Bars */}
        <div className="flex items-center justify-between gap-3 sm:gap-6 bg-stone-950/70 p-2 sm:p-3 rounded-2xl border border-stone-800/80 shadow-2xl backdrop-blur-sm">
          {/* Player 1 Health Bar (Left) */}
          <div className="flex-1 flex flex-col items-start gap-1">
            <div className="w-full flex items-center justify-between text-xs font-black">
              <span className="text-amber-400 tracking-wider uppercase text-sm sm:text-base">
                {p1.def.name}
              </span>
              <div className="flex items-center gap-1">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full border border-amber-500/80 ${
                      i < p1.roundsWon ? 'bg-amber-400 shadow-sm shadow-amber-400' : 'bg-stone-900'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Health Bar Meter */}
            <div className="w-full h-4 sm:h-5 rounded-md bg-stone-900 border border-stone-700/80 overflow-hidden flex justify-end">
              <div
                className="h-full bg-gradient-to-l from-amber-400 via-yellow-400 to-red-500 transition-all duration-150"
                style={{ width: `${p1HpPercent}%` }}
              />
            </div>
          </div>

          {/* Center Round Timer */}
          <div className="w-14 sm:w-16 h-12 sm:h-14 rounded-2xl bg-gradient-to-b from-stone-800 to-stone-900 border-2 border-amber-500/60 flex items-center justify-center font-black text-2xl sm:text-3xl text-amber-300 shadow-xl shadow-amber-500/10">
            {Math.ceil(match.roundTimer)}
          </div>

          {/* Player 2 Health Bar (Right - CPU) */}
          <div className="flex-1 flex flex-col items-end gap-1">
            <div className="w-full flex items-center justify-between text-xs font-black">
              <div className="flex items-center gap-1">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full border border-purple-500/80 ${
                      i < p2.roundsWon ? 'bg-purple-400 shadow-sm shadow-purple-400' : 'bg-stone-900'
                    }`}
                  />
                ))}
              </div>
              <span className="text-purple-400 tracking-wider uppercase text-sm sm:text-base">
                {p2.def.name}
              </span>
            </div>

            {/* Health Bar Meter */}
            <div className="w-full h-4 sm:h-5 rounded-md bg-stone-900 border border-stone-700/80 overflow-hidden flex justify-start">
              <div
                className="h-full bg-gradient-to-r from-purple-400 via-fuchsia-400 to-red-500 transition-all duration-150"
                style={{ width: `${p2HpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Combo Counter Notification */}
        {p1.comboCount > 1 && (
          <div className="self-start text-xs sm:text-sm font-black italic tracking-wider text-amber-400 animate-bounce">
            ★ {p1.comboCount} HITS COMBO!
          </div>
        )}
      </header>

      {/* Center Announcer Banners */}
      <div className="flex flex-col items-center justify-center pointer-events-none">
        {match.bannerText && (
          <div className="flex flex-col items-center text-center animate-in zoom-in-75 duration-200">
            <h2 className="text-5xl sm:text-7xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 drop-shadow-[0_5px_15px_rgba(245,158,11,0.5)]">
              {match.bannerText}
            </h2>
            {match.bannerSubtext && (
              <p className="text-2xl sm:text-4xl font-black italic tracking-wider text-rose-500 mt-2 drop-shadow-[0_3px_10px_rgba(244,63,94,0.6)]">
                {match.bannerSubtext}
              </p>
            )}
          </div>
        )}

        {/* Match Over Modal */}
        {match.matchOver && (
          <div className="pointer-events-auto mt-6 bg-stone-950/90 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 text-center max-w-md w-full shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 mb-4 shadow-lg shadow-amber-500/25">
              <Swords className="w-8 h-8" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black uppercase text-amber-300">
              {match.winner === p1.id ? 'VITÓRIA SUPREMA!' : 'DERROTA!'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
              {match.winner === p1.id
                ? `Você dominou a arena de combate com ${p1.def.name}!`
                : `${p2.def.name} conquistou a vitória neste duelo.`}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={onRestartMatch}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
              >
                Lutar Novamente
              </button>
              <button
                onClick={onBackToSelect}
                className="flex-1 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border border-stone-700 active:scale-95"
              >
                Trocar Personagem
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Corner Note: Keyboard Controls Legend */}
      <footer className="pointer-events-auto w-full flex justify-end">
        <div className="max-w-xs sm:max-w-sm rounded-2xl bg-stone-950/85 border border-stone-800/90 p-3 sm:p-3.5 shadow-2xl backdrop-blur-md text-[11px] font-sans text-stone-300 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-black tracking-wider uppercase text-[11px] pb-1 border-b border-stone-800">
            <Keyboard className="w-3.5 h-3.5" />
            <span>Controles do Teclado</span>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] sm:text-[11px]">
            <div>
              <span className="text-stone-500">Mover:</span> <span className="text-stone-100 font-bold">◄ / ►</span>
            </div>
            <div>
              <span className="text-stone-500">Pular:</span> <span className="text-stone-100 font-bold">▲</span>
            </div>
            <div>
              <span className="text-stone-500">Agachar:</span> <span className="text-stone-100 font-bold">▼</span>
            </div>
            <div>
              <span className="text-stone-500">Soco Rápido:</span> <span className="text-amber-300 font-bold">[A]</span>
            </div>
            <div>
              <span className="text-stone-500">Soco Forte:</span> <span className="text-amber-300 font-bold">[S]</span>
            </div>
            <div>
              <span className="text-stone-500">Chute Baixo:</span> <span className="text-emerald-300 font-bold">[Z]</span>
            </div>
            <div>
              <span className="text-stone-500">Chute Alto:</span> <span className="text-emerald-300 font-bold">[X]</span>
            </div>
          </div>

          <div className="pt-1 border-t border-stone-800/80 flex flex-col gap-0.5 text-[10px]">
            <div>
              <span className="text-amber-400 font-bold">Rasteira:</span> <span className="text-stone-200">Trás + [Z]</span>
            </div>
            <div>
              <span className="text-rose-400 font-bold">Chute Giratório:</span> <span className="text-stone-200">Trás + [X]</span>
            </div>
            <div>
              <span className="text-purple-400 font-bold">Agarrão:</span> <span className="text-stone-200">[A] + [Z] ou [C]</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
