import React from 'react';
import { FighterState } from '../types';
import { FightMatchState, InputCommand } from '../fighterEngine';
import { ArrowLeft, RotateCcw, Swords, Flame, Sparkles } from 'lucide-react';

interface FightHUDProps {
  p1: FighterState;
  p2: FighterState;
  match: FightMatchState;
  onCommand: (cmd: InputCommand) => void;
  onRestartMatch: () => void;
  onBackToSelect: () => void;
  onBackToPortal: () => void;
}

export function FightHUD({
  p1,
  p2,
  match,
  onCommand,
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
              <span>Trocar Lutador</span>
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

        {/* Tekken 3 Style Health Bars */}
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

      {/* Bottom Virtual Arcade Controls (Touch & Keyboard Reference) */}
      <footer className="pointer-events-auto w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
        {/* Left: Directional D-Pad (Touch & Keyboard) */}
        <div className="flex flex-col items-center p-2 rounded-2xl bg-stone-950/70 border border-stone-800/80 shadow-xl backdrop-blur-sm">
          <div className="flex justify-center">
            <button
              onPointerDown={() => onCommand('jump')}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-stone-900 hover:bg-stone-800 active:bg-amber-500 active:text-stone-950 border border-stone-700 flex flex-col items-center justify-center font-black text-xs transition-all cursor-pointer shadow"
              title="Pular [Seta Cima / W]"
            >
              <span>▲</span>
              <span className="text-[9px] text-stone-400">Pular</span>
            </button>
          </div>
          <div className="flex gap-2 my-1">
            <button
              onPointerDown={() => onCommand(p1.facing === 1 ? 'move_bwd' : 'move_fwd')}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-stone-900 hover:bg-stone-800 active:bg-amber-500 active:text-stone-950 border border-stone-700 flex flex-col items-center justify-center font-black text-xs transition-all cursor-pointer shadow"
              title="Trás [Seta Esquerda / A]"
            >
              <span>◄</span>
              <span className="text-[9px] text-stone-400">Trás</span>
            </button>
            <button
              onPointerDown={() => onCommand('crouch')}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-stone-900 hover:bg-stone-800 active:bg-amber-500 active:text-stone-950 border border-stone-700 flex flex-col items-center justify-center font-black text-xs transition-all cursor-pointer shadow"
              title="Agachar [Seta Baixo / S]"
            >
              <span>▼</span>
              <span className="text-[9px] text-stone-400">Agachar</span>
            </button>
            <button
              onPointerDown={() => onCommand(p1.facing === 1 ? 'move_fwd' : 'move_bwd')}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-stone-900 hover:bg-stone-800 active:bg-amber-500 active:text-stone-950 border border-stone-700 flex flex-col items-center justify-center font-black text-xs transition-all cursor-pointer shadow"
              title="Frente [Seta Direita / D]"
            >
              <span>►</span>
              <span className="text-[9px] text-stone-400">Frente</span>
            </button>
          </div>
        </div>

        {/* Center: Command Shortcuts Guide */}
        <div className="hidden md:flex flex-col items-center gap-1 text-[11px] font-mono text-stone-400 bg-stone-950/70 p-2.5 rounded-2xl border border-stone-800">
          <div className="flex items-center gap-3 font-semibold text-stone-300">
            <span>◄ + Chute B: <strong className="text-amber-400">Rasteira</strong></span>
            <span>•</span>
            <span>◄ + Chute A: <strong className="text-amber-400">Chute Giratório</strong></span>
            <span>•</span>
            <span>Soco + Chute: <strong className="text-amber-400">Agarrão</strong></span>
          </div>
          <span className="text-stone-500 text-[10px]">Setas para mover • A/S = Socos • Z/X = Chutes</span>
        </div>

        {/* Right: Attack Buttons Grid (2 Punches, 2 Kicks, Special Moves) */}
        <div className="flex flex-col gap-2 p-2 rounded-2xl bg-stone-950/70 border border-stone-800/80 shadow-xl backdrop-blur-sm">
          {/* Main 4 Attack Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onPointerDown={() => onCommand('punch_light')}
              className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 active:scale-95 text-stone-100 font-black text-xs uppercase transition-all cursor-pointer shadow border border-blue-500/40 flex flex-col items-center"
              title="Soco Rápido [A / J]"
            >
              <span>Soco Rápido</span>
              <span className="text-[9px] opacity-80">[A]</span>
            </button>

            <button
              onPointerDown={() => onCommand('punch_heavy')}
              className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-95 text-stone-950 font-black text-xs uppercase transition-all cursor-pointer shadow border border-amber-400/50 flex flex-col items-center"
              title="Soco Forte [S / K]"
            >
              <span>Soco Forte</span>
              <span className="text-[9px] opacity-80">[S]</span>
            </button>

            <button
              onPointerDown={() => onCommand('kick_low')}
              className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 active:scale-95 text-stone-100 font-black text-xs uppercase transition-all cursor-pointer shadow border border-emerald-500/40 flex flex-col items-center"
              title="Chute Baixo [Z / U]"
            >
              <span>Chute Baixo</span>
              <span className="text-[9px] opacity-80">[Z]</span>
            </button>

            <button
              onPointerDown={() => onCommand('kick_high')}
              className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 active:scale-95 text-stone-100 font-black text-xs uppercase transition-all cursor-pointer shadow border border-rose-500/40 flex flex-col items-center"
              title="Chute Alto [X / I]"
            >
              <span>Chute Alto</span>
              <span className="text-[9px] opacity-80">[X]</span>
            </button>
          </div>

          {/* Quick Special Combos: Rasteira, Chute Giratório & Agarrão */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-stone-800">
            <button
              onPointerDown={() => onCommand('sweep')}
              className="px-2 py-1.5 rounded-lg bg-stone-900 hover:bg-amber-500 hover:text-stone-950 text-amber-300 font-bold text-[10px] uppercase transition-all cursor-pointer border border-stone-700/80 active:scale-95 text-center"
              title="Rasteira (Trás + Chute Baixo)"
            >
              Rasteira
            </button>

            <button
              onPointerDown={() => onCommand('spinning_kick')}
              className="px-2 py-1.5 rounded-lg bg-stone-900 hover:bg-rose-500 hover:text-stone-100 text-rose-300 font-bold text-[10px] uppercase transition-all cursor-pointer border border-stone-700/80 active:scale-95 text-center"
              title="Giratório (Trás + Chute Alto)"
            >
              Giratório
            </button>

            <button
              onPointerDown={() => onCommand('grab')}
              className="px-2 py-1.5 rounded-lg bg-stone-900 hover:bg-purple-500 hover:text-stone-100 text-purple-300 font-bold text-[10px] uppercase transition-all cursor-pointer border border-stone-700/80 active:scale-95 text-center"
              title="Agarrão (Perto do Oponente)"
            >
              Agarrão
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
