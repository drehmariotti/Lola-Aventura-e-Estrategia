import React from 'react';
import { X, BookOpen, Footprints, ShieldAlert, Bug, Flame, Compass } from 'lucide-react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl p-6 text-stone-200">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-300">Estratégia & Dicas das Ruínas</h2>
              <p className="text-xs text-stone-400">Manual de sobrevivência de Lola Aventureira</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 text-xs leading-relaxed">
          <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80 flex gap-3">
            <Footprints className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-stone-200">Movimentação em Turnos</h4>
              <p className="text-stone-400 mt-1">
                A cada passo que você dá, o mundo ao seu redor reage. Você pode se mover clicando nos círculos de pedra, usando o D-pad inferior ou as <strong>setas direcionais / WASD</strong> do teclado.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80 flex gap-3">
            <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-stone-200">Serpentes Guardiãs</h4>
              <p className="text-stone-400 mt-1">
                As serpentes não se movem, mas vigiam a direção para onde estão olhando. Se você entrar pela frente, receberá um bote fatal! Contorne pelo flanco ou pelas costas para eliminá-las com segurança.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80 flex gap-3">
            <Bug className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-stone-200">Aranhas Patrulheiras</h4>
              <p className="text-stone-400 mt-1">
                As aranhas caminham em linha reta alternando ida e volta a cada passo seu. Calcule o intervalo da patrulha para cruzar quando elas estiverem longe!
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80 flex gap-3">
            <Flame className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-stone-200">Pisos Rachados & Buracos Profundos</h4>
              <p className="text-stone-400 mt-1">
                Placas com fissuras rachadas suportam apenas um único passo. Ao sair delas, desabam transformando-se em abismos escuros intransponíveis.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer transition-all shadow-md active:scale-95"
          >
            Entendido, Continuar
          </button>
        </div>
      </div>
    </div>
  );
};
