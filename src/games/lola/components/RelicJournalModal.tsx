import React from 'react';
import { X, Gem, CheckCircle, Lock } from 'lucide-react';
import { LEVELS } from '../game/levels';

interface RelicJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  relicsFound: Record<string, boolean>;
}

export const RelicJournalModal: React.FC<RelicJournalModalProps> = ({
  isOpen,
  onClose,
  relicsFound,
}) => {
  if (!isOpen) return null;

  const allRelics = LEVELS.flatMap((lvl) => lvl.relics || []);
  const collectedCount = allRelics.filter((r) => relicsFound[r.id]).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl p-6 text-stone-200">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <Gem className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-300">Diário Arqueológico de Relíquias</h2>
              <p className="text-xs text-stone-400">
                Coleção sagrada de Lola: {collectedCount} de {allRelics.length} encontradas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {allRelics.map((relic) => {
            const isFound = Boolean(relicsFound[relic.id]);

            return (
              <div
                key={relic.id}
                className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-all ${
                  isFound
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                    : 'bg-stone-950/50 border-stone-800/80 opacity-60'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
                    isFound
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-stone-800/60 text-stone-600 border border-stone-800'
                  }`}
                >
                  {isFound ? relic.icon : <Lock className="w-4 h-4" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-stone-200">
                      {isFound ? relic.name : 'Relíquia Desconhecida'}
                    </h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-800 text-amber-400">
                      Capítulo {relic.chapter}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">
                    {isFound ? relic.description : 'Explore as bifurcações da fase para descobrir esta relíquia.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer transition-all shadow-md active:scale-95"
          >
            Fechar Diário
          </button>
        </div>
      </div>
    </div>
  );
};
