import React from 'react';
import { X, Trophy, Star, CheckCircle2, Lock } from 'lucide-react';
import { LEVELS } from '../game/levels';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevelIndex: number;
  onSelectLevel: (index: number) => void;
  levelRecords: Record<number, { turns: number; completed: boolean; stars: number }>;
  relicsFound: Record<string, boolean>;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  currentLevelIndex,
  onSelectLevel,
  levelRecords,
  relicsFound,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl p-6 text-stone-200">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-300">Seleção de Capítulos</h2>
              <p className="text-xs text-stone-400">10 Fases da Aventura de Lola nas Ruínas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto pr-1">
          {LEVELS.map((lvl, idx) => {
            const isCurrent = idx === currentLevelIndex;
            const record = levelRecords[idx];
            const isCompleted = record?.completed;
            const stars = record?.stars || 0;
            const relic = lvl.relics?.[0];
            const hasRelic = relic ? relicsFound[relic.id] : false;

            return (
              <button
                key={lvl.id}
                onClick={() => {
                  onSelectLevel(idx);
                  onClose();
                }}
                className={`flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-stone-950/60 border-stone-800 hover:border-stone-600 hover:bg-stone-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wide">
                    Capítulo {lvl.id}
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= stars ? 'fill-amber-400 text-amber-400' : 'text-stone-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-1">
                  <h4 className="text-sm font-bold text-stone-100">{lvl.title.split(':')[1]?.trim() || lvl.title}</h4>
                  <p className="text-[11px] text-stone-400 line-clamp-1">{lvl.subtitle}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-stone-500">Meta: {lvl.parTurns} turnos</span>
                  {relic && (
                    <span className={`font-semibold ${hasRelic ? 'text-amber-400' : 'text-stone-600'}`}>
                      {hasRelic ? '★ Relíquia Obtida' : '○ Relíquia Oculta'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
