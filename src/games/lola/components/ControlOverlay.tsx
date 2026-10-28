import React from 'react';
import {
  RotateCcw,
  BookOpen,
  Gem,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Skull,
  Play,
  Trophy,
  Home,
} from 'lucide-react';
import { Direction, LevelData, NodePoint } from '../game/types';

interface ControlOverlayProps {
  currentLevel: LevelData;
  turnCount: number;
  parTurns: number;
  onRestart: () => void;
  onOpenInstructions: () => void;
  onOpenLevelSelect: () => void;
  onOpenRelicJournal: () => void;
  onMoveDirection: (dir: Direction) => void;
  validMoves: NodePoint[];
  playerFacing: Direction;
  isDead: boolean;
  deathReason: string;
  hasWon: boolean;
  onNextLevel: () => void;
  relicsCount: number;
  totalRelics: number;
  onBackToMenu?: () => void;
}

export const ControlOverlay: React.FC<ControlOverlayProps> = ({
  currentLevel,
  turnCount,
  parTurns,
  onRestart,
  onOpenInstructions,
  onOpenLevelSelect,
  onOpenRelicJournal,
  onMoveDirection,
  isDead,
  deathReason,
  hasWon,
  onNextLevel,
  relicsCount,
  totalRelics,
  onBackToMenu,
}) => {
  // Calculate stars and check if it's the grand finale
  const earnedStars = turnCount <= parTurns ? 3 : turnCount <= parTurns + 3 ? 2 : 1;
  const isFinalLevel = currentLevel.id === 10;

  // Clean phase name without prefix or subtitle
  const phaseName = currentLevel.title.includes(':')
    ? currentLevel.title.split(':')[1].trim()
    : currentLevel.title;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="pointer-events-auto w-full p-3 sm:p-4 flex items-center justify-between bg-gradient-to-b from-stone-950/90 via-stone-950/30 to-transparent">
        {/* Top Left: Back to Portal button + Phase Number */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onBackToMenu && (
            <button
              onClick={onBackToMenu}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-900/90 hover:bg-amber-500 hover:text-stone-950 text-amber-300 border border-stone-700/90 text-xs shadow-md transition-all cursor-pointer font-semibold"
              title="Voltar ao Menu Principal de Jogos"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Menu de Jogos</span>
            </button>
          )}
          <button
            onClick={onOpenLevelSelect}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900/85 hover:bg-stone-800 border border-stone-700/80 shadow-md transition-all cursor-pointer"
            title="Escolher Fase"
          >
            <span className="text-xs font-bold text-amber-400">
              Fase {currentLevel.id}: {phaseName}
            </span>
          </button>
        </div>

        {/* Top Right: Relic Journal only (Guia do Explorador removed) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRelicJournal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-900/85 hover:bg-stone-800 border border-stone-700/80 text-amber-300 text-xs shadow-md transition-all cursor-pointer"
            title="Diário de Relíquias"
          >
            <Gem className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-semibold">
              {relicsCount}/{totalRelics}
            </span>
          </button>
        </div>
      </header>

      {/* Center Modals: Defeat or Victory */}
      <div className="pointer-events-auto flex items-center justify-center p-4">
        {/* Defeat Card */}
        {isDead && (
          <div className="max-w-md w-full bg-stone-900/95 border border-rose-500/70 rounded-2xl shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400 mb-3">
              <Skull className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-rose-400">Emboscada nas Ruínas</h3>
            <p className="text-xs text-stone-300 mt-2 leading-relaxed bg-stone-950/60 p-3 rounded-xl border border-stone-800">
              {deathReason}
            </p>
            <div className="mt-5 flex justify-center">
              <button
                onClick={onRestart}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold text-xs rounded-xl border border-stone-600 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reiniciar [R]</span>
              </button>
            </div>
          </div>
        )}

        {/* Victory Card */}
        {hasWon && (
          <div className={`max-w-md w-full bg-stone-900/95 border ${isFinalLevel ? 'border-amber-400/90 shadow-amber-500/20' : 'border-amber-500/70'} rounded-2xl shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-200`}>
            {isFinalLevel ? (
              <>
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-amber-600/30 via-yellow-500/20 to-amber-400/40 border border-amber-400/80 flex items-center justify-center text-amber-300 mb-3 shadow-lg shadow-amber-500/25 animate-pulse">
                  <Trophy className="w-7 h-7 text-amber-400 drop-shadow" />
                </div>
                <h3 className="text-xl font-extrabold text-amber-300 tracking-wide">
                  Vitória Suprema!
                </h3>
                <p className="text-sm font-medium text-amber-100/95 mt-2.5 leading-relaxed bg-amber-950/50 p-3.5 rounded-xl border border-amber-500/40 shadow-inner">
                  Você conseguiu resolver os mistérios e escapar dos perigos da cidade perdida. Parabéns!
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400 mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-amber-400">Ruína Conquistada!</h3>
                <p className="text-xs text-stone-300 mt-1">
                  A exploradora desvendou todos os mistérios deste templo.
                </p>
              </>
            )}

            <div className="mt-4 p-3 bg-stone-950/70 rounded-xl border border-stone-800/80 flex items-center justify-around text-xs">
              <div>
                <span className="text-[10px] uppercase text-stone-500 block">Movimentos</span>
                <span className="font-bold text-stone-200 text-sm">
                  {turnCount} <span className="text-stone-500 text-xs">/ meta: {parTurns}</span>
                </span>
              </div>
              <div className="h-6 w-px bg-stone-800" />
              <div>
                <span className="text-[10px] uppercase text-stone-500 block">Desempenho</span>
                <div className="flex items-center gap-1 mt-0.5 justify-center">
                  {[1, 2, 3].map((s) => (
                    <span
                      key={s}
                      className={`text-sm ${
                        s <= earnedStars ? 'text-amber-400' : 'text-stone-600'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2.5 justify-center">
              <button
                onClick={onRestart}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-600 cursor-pointer transition-all active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Repetir</span>
              </button>
              <button
                onClick={onNextLevel}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all active:scale-95"
              >
                {isFinalLevel ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reiniciar Aventura</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-stone-950" />
                    <span>Próximo Capítulo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Compact Control Dock */}
      <footer className="pointer-events-auto w-full pb-3 px-3 flex justify-center">
        <div className="bg-stone-900/90 backdrop-blur-md border border-stone-700/70 rounded-xl shadow-xl px-2.5 py-1.5 flex items-center gap-2.5 text-stone-200">
          {/* Action buttons: Reiniciar and Estratégia side-by-side */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onRestart}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-200 transition-all active:scale-95 cursor-pointer"
              title="Reiniciar nível (R)"
            >
              <RotateCcw className="w-3 h-3 text-stone-300" />
              <span>Reiniciar <span className="text-[9px] text-stone-400 hidden sm:inline">[R]</span></span>
            </button>

            <button
              onClick={onOpenInstructions}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-200 hover:text-emerald-300 transition-all active:scale-95 cursor-pointer"
              title="Estratégia & Dicas"
            >
              <BookOpen className="w-3 h-3 text-emerald-400" />
              <span>Estratégia</span>
            </button>
          </div>

          {/* Vertical divider */}
          <div className="h-5 w-px bg-stone-700/60" />

          {/* Compact Directional D-Pad */}
          <div className="flex items-center justify-center gap-1 bg-stone-950/70 p-1 rounded-lg border border-stone-800/80">
            <button
              onClick={() => onMoveDirection('west')}
              className="p-1 rounded bg-stone-800 hover:bg-stone-700 active:bg-amber-600 text-stone-200 hover:text-amber-400 transition-colors cursor-pointer"
              title="Mover para Esquerda (A / Seta Esquerda)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => onMoveDirection('north')}
                className="p-1 rounded bg-stone-800 hover:bg-stone-700 active:bg-amber-600 text-stone-200 hover:text-amber-400 transition-colors cursor-pointer"
                title="Mover para Cima (W / Seta Cima)"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onMoveDirection('south')}
                className="p-1 rounded bg-stone-800 hover:bg-stone-700 active:bg-amber-600 text-stone-200 hover:text-amber-400 transition-colors cursor-pointer"
                title="Mover para Baixo (S / Seta Baixo)"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => onMoveDirection('east')}
              className="p-1 rounded bg-stone-800 hover:bg-stone-700 active:bg-amber-600 text-stone-200 hover:text-amber-400 transition-colors cursor-pointer"
              title="Mover para Direita (D / Seta Direita)"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
