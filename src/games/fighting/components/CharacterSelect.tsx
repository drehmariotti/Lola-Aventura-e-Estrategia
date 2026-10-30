import React, { useState } from 'react';
import { CHARACTERS } from '../characters';
import { FighterId } from '../types';
import { ArrowLeft, Swords, Shield, Zap, Sparkles, Check } from 'lucide-react';

interface CharacterSelectProps {
  onSelectCharacter: (playerChar: FighterId) => void;
  onBackToMenu: () => void;
}

export function CharacterSelect({ onSelectCharacter, onBackToMenu }: CharacterSelectProps) {
  const [selectedId, setSelectedId] = useState<FighterId>('marcus');

  const charList = Object.values(CHARACTERS);
  const selectedChar = CHARACTERS[selectedId];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 text-stone-100 font-sans select-none flex flex-col justify-between">
      {/* Background FX */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-purple-950/20 to-stone-900 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 p-4 sm:p-6 flex items-center justify-between border-b border-stone-800/80 bg-stone-950/70 backdrop-blur-md">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-stone-300 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Menu de Jogos</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            Tekken Style 3D Arcade
          </span>
        </div>
      </header>

      {/* Center Character Selection Grid */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 flex flex-col items-center justify-center gap-6 sm:gap-8">
        <div className="text-center">
          <span className="text-xs font-black tracking-widest text-amber-400 uppercase">FIGHTER SELECTION</span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-100 uppercase mt-1">
            ESCOLHA SEU <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-purple-400">LUTADOR</span>
          </h1>
        </div>

        {/* 2 Fighter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 w-full max-w-3xl">
          {charList.map((char) => {
            const isSelected = selectedId === char.id;
            const isMarcus = char.id === 'marcus';

            return (
              <div
                key={char.id}
                onClick={() => setSelectedId(char.id)}
                className={`group relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between cursor-pointer transition-all duration-300 border-2 ${
                  isSelected
                    ? isMarcus
                      ? 'border-amber-400 bg-gradient-to-b from-amber-950/50 via-stone-900 to-stone-900 shadow-2xl shadow-amber-500/20 scale-[1.02]'
                      : 'border-purple-400 bg-gradient-to-b from-purple-950/50 via-stone-900 to-stone-900 shadow-2xl shadow-purple-500/20 scale-[1.02]'
                    : 'border-stone-800 bg-stone-900/60 hover:border-stone-700 opacity-80 hover:opacity-100'
                }`}
              >
                {/* Selection Badge */}
                {isSelected && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 text-xs font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>SELECIONADO</span>
                  </div>
                )}

                {/* Avatar & Ident */}
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg ${
                        isMarcus
                          ? 'border-amber-400 bg-gradient-to-br from-amber-600/30 to-red-600/30 text-amber-300'
                          : 'border-purple-400 bg-gradient-to-br from-purple-600/30 to-pink-600/30 text-purple-300'
                      }`}
                    >
                      {char.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                        {char.style}
                      </span>
                      <h2 className="text-2xl font-black text-stone-100 leading-tight">
                        {char.name}
                      </h2>
                      <span
                        className={`text-xs font-semibold ${
                          isMarcus ? 'text-amber-400' : 'text-purple-400'
                        }`}
                      >
                        "{char.nickname}"
                      </span>
                    </div>
                  </div>

                  {/* Character Description / Bio */}
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-6 bg-stone-950/50 p-3 rounded-xl border border-stone-800/80">
                    {char.bio}
                  </p>

                  {/* Stats Bars */}
                  <div className="flex flex-col gap-2.5 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold text-stone-400 mb-1">
                        <span>Força (Poder)</span>
                        <span className="text-stone-200">{char.stats.power}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-950 overflow-hidden border border-stone-800">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full"
                          style={{ width: `${char.stats.power}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-stone-400 mb-1">
                        <span>Velocidade</span>
                        <span className="text-stone-200">{char.stats.speed}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-950 overflow-hidden border border-stone-800">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                          style={{ width: `${char.stats.speed}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-stone-400 mb-1">
                        <span>Alcance</span>
                        <span className="text-stone-200">{char.stats.reach}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-950 overflow-hidden border border-stone-800">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
                          style={{ width: `${char.stats.reach}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Choose Action */}
                <div className="mt-6 pt-4 border-t border-stone-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-stone-500 uppercase">
                    {char.gender === 'male' ? 'Homem Negro' : 'Mulher Morena'}
                  </span>
                  <button
                    onClick={() => onSelectCharacter(char.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 ${
                      isSelected
                        ? isMarcus
                          ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-amber-500/30'
                          : 'bg-purple-500 hover:bg-purple-400 text-stone-100 shadow-purple-500/30'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    Lutar com {char.name.split(' ')[0]}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Start Fight Action */}
        <div className="pt-2">
          <button
            onClick={() => onSelectCharacter(selectedId)}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-base sm:text-lg tracking-wider uppercase shadow-2xl shadow-amber-500/30 transition-all cursor-pointer active:scale-95"
          >
            <Swords className="w-5 h-5" />
            <span>INICIAR COMBATE</span>
          </button>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 p-3 sm:p-4 text-center text-xs text-stone-500 border-t border-stone-800/60 bg-stone-950">
        Comandos: Setas para mover/pular/agachar • A/S/Z/X para socos e chutes • Trás + Chute Baixo (Rasteira) • Trás + Chute Alto (Giratório) • Soco + Chute (Agarrão)
      </footer>
    </div>
  );
}
