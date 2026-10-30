import React from 'react';
import { CHARACTERS } from '../characters';
import { FighterId } from '../types';
import { ArrowLeft, Swords } from 'lucide-react';

interface CharacterSelectProps {
  onSelectCharacter: (playerChar: FighterId) => void;
  onBackToMenu: () => void;
}

export function CharacterSelect({ onSelectCharacter, onBackToMenu }: CharacterSelectProps) {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 text-stone-100 font-sans select-none flex flex-col justify-between p-4 sm:p-8">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-purple-950/20 to-stone-900 pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-between">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 text-stone-300 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Menu de Jogos</span>
        </button>

        <span className="text-xs font-mono font-bold tracking-widest uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
          Jogo de Luta 3D
        </span>
      </header>

      {/* Center Selection: Only 2 Simple Buttons */}
      <main className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-100 uppercase">
            ESCOLHA SEU <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-purple-400">PERSONAGEM</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-2">
            Selecione quem você deseja controlar no combate
          </p>
        </div>

        {/* 2 Simple Selection Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
          {/* Button 1: Marcus (Homem Negro) */}
          <button
            onClick={() => onSelectCharacter('marcus')}
            className="group relative flex flex-col items-center justify-center gap-4 p-8 rounded-3xl bg-gradient-to-b from-stone-900/90 to-stone-950 border-2 border-amber-500/50 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-200 cursor-pointer active:scale-95 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center font-black text-4xl text-amber-300 shadow-lg group-hover:scale-105 transition-transform">
              M
            </div>

            <div>
              <h2 className="text-2xl font-black text-stone-100 uppercase tracking-wide group-hover:text-amber-400 transition-colors">
                Marcus
              </h2>
              <span className="text-xs font-bold text-amber-400/90 block mt-1">
                Homem Negro
              </span>
            </div>

            <div className="mt-2 px-6 py-2.5 rounded-xl bg-amber-400 group-hover:bg-amber-300 text-stone-950 font-black text-xs uppercase tracking-wider shadow-md transition-colors">
              Jogar com Marcus
            </div>
          </button>

          {/* Button 2: Elena (Mulher Morena) */}
          <button
            onClick={() => onSelectCharacter('elena')}
            className="group relative flex flex-col items-center justify-center gap-4 p-8 rounded-3xl bg-gradient-to-b from-stone-900/90 to-stone-950 border-2 border-purple-500/50 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-200 cursor-pointer active:scale-95 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center font-black text-4xl text-purple-300 shadow-lg group-hover:scale-105 transition-transform">
              E
            </div>

            <div>
              <h2 className="text-2xl font-black text-stone-100 uppercase tracking-wide group-hover:text-purple-400 transition-colors">
                Elena
              </h2>
              <span className="text-xs font-bold text-purple-400/90 block mt-1">
                Mulher Morena
              </span>
            </div>

            <div className="mt-2 px-6 py-2.5 rounded-xl bg-purple-500 group-hover:bg-purple-400 text-stone-100 font-black text-xs uppercase tracking-wider shadow-md transition-colors">
              Jogar com Elena
            </div>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center text-xs text-stone-500">
        Inspirado em clássicos de luta arcade como Tekken 3 e Mortal Kombat
      </footer>
    </div>
  );
}
