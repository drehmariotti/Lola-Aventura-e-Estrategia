import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CharacterSelect } from './components/CharacterSelect';
import { FightHUD } from './components/FightHUD';
import { FightingThreeScene } from './threeScene';
import { FighterEngine, InputCommand } from './fighterEngine';
import { CHARACTERS } from './characters';
import { FighterId, FighterState } from './types';

interface FightingGameProps {
  onBackToMenu: () => void;
}

export function FightingGame({ onBackToMenu }: FightingGameProps) {
  const [gameMode, setGameMode] = useState<'select' | 'fighting'>('select');
  const [playerCharId, setPlayerCharId] = useState<FighterId>('marcus');

  const canvasMountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<FightingThreeScene | null>(null);
  const engineRef = useRef<FighterEngine | null>(null);

  // Active keyboard keys state
  const activeKeysRef = useRef<Set<string>>(new Set());

  // React state copies for HUD re-renders
  const [p1State, setP1State] = useState<FighterState>(() => {
    const def = CHARACTERS.marcus;
    return {
      id: def.id,
      def,
      isPlayer: true,
      x: -2.2,
      y: 0,
      z: 0,
      facing: 1,
      health: 100,
      maxHealth: 100,
      roundsWon: 0,
      animState: 'idle',
      animTimer: 0,
      animDuration: 0,
      isGrounded: true,
      velocityY: 0,
      isBlocking: false,
      isInvulnerable: false,
      hasHitThisAttack: false,
      comboCount: 0,
      lastHitTime: 0,
    };
  });

  const [p2State, setP2State] = useState<FighterState>(() => {
    const def = CHARACTERS.elena;
    return {
      id: def.id,
      def,
      isPlayer: false,
      x: 2.2,
      y: 0,
      z: 0,
      facing: -1,
      health: 100,
      maxHealth: 100,
      roundsWon: 0,
      animState: 'idle',
      animTimer: 0,
      animDuration: 0,
      isGrounded: true,
      velocityY: 0,
      isBlocking: false,
      isInvulnerable: false,
      hasHitThisAttack: false,
      comboCount: 0,
      lastHitTime: 0,
    };
  });

  const [matchState, setMatchState] = useState({
    round: 1,
    maxRounds: 3,
    roundTimer: 60,
    matchOver: false,
    winner: null as FighterId | 'draw' | null,
    bannerText: 'ROUND 1' as string | null,
    bannerSubtext: 'FIGHT!' as string | null,
    bannerTimer: 2.0,
  });

  const handleStartFight = (selectedPlayerChar: FighterId) => {
    setPlayerCharId(selectedPlayerChar);
    setGameMode('fighting');
  };

  const handleCommand = useCallback((cmd: InputCommand) => {
    if (!engineRef.current) return;
    engineRef.current.handlePlayerInput(cmd);
  }, []);

  const handleRestartMatch = useCallback(() => {
    if (!engineRef.current || !sceneRef.current) return;
    const opponentCharId: FighterId = playerCharId === 'marcus' ? 'elena' : 'marcus';
    const engine = new FighterEngine(playerCharId, opponentCharId);
    engine.onHitEffect = (x, y, z, isHeavy) => {
      sceneRef.current?.spawnHitSparks(x, y, z, isHeavy);
    };
    engineRef.current = engine;
    sceneRef.current.initFighters(CHARACTERS[playerCharId], CHARACTERS[opponentCharId]);
  }, [playerCharId]);

  // Mount 3D Scene when in 'fighting' mode
  useEffect(() => {
    if (gameMode !== 'fighting' || !canvasMountRef.current) return;

    const opponentCharId: FighterId = playerCharId === 'marcus' ? 'elena' : 'marcus';
    const engine = new FighterEngine(playerCharId, opponentCharId);
    engineRef.current = engine;

    const scene = new FightingThreeScene(canvasMountRef.current);
    sceneRef.current = scene;
    scene.initFighters(CHARACTERS[playerCharId], CHARACTERS[opponentCharId]);

    engine.onHitEffect = (x, y, z, isHeavy) => {
      scene.spawnHitSparks(x, y, z, isHeavy);
    };

    let animId = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      engine.update(delta, activeKeysRef.current);
      scene.update(engine.p1, engine.p2);

      // Sync state to React
      setP1State({ ...engine.p1 });
      setP2State({ ...engine.p2 });
      setMatchState({ ...engine.match });
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      scene.dispose();
      sceneRef.current = null;
      engineRef.current = null;
    };
  }, [gameMode, playerCharId]);

  // Keyboard controls handler
  useEffect(() => {
    if (gameMode !== 'fighting') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const code = e.code.toLowerCase();

      // Prevent scroll on arrows or space
      if (
        key === 'arrowup' ||
        key === 'arrowdown' ||
        key === 'arrowleft' ||
        key === 'arrowright' ||
        key === ' '
      ) {
        e.preventDefault();
      }

      activeKeysRef.current.add(key);
      activeKeysRef.current.add(code);

      if (!engineRef.current) return;
      const eng = engineRef.current;
      const p1 = eng.p1;

      // Check whether player is holding "backward" (away from opponent)
      const isHoldingBack =
        (p1.facing === 1 && (key === 'arrowleft' || code === 'keya')) ||
        (p1.facing === -1 && (key === 'arrowright' || code === 'keyd'));

      // Check Grab combination: punch + kick pressed together or key 'c' / 'g'
      const isPunchKey = key === 'a' || code === 'keyj' || key === 's' || code === 'keyk';
      const isKickKey = key === 'z' || code === 'keyu' || key === 'x' || code === 'keyi';

      if (key === 'c' || key === 'g' || (isPunchKey && activeKeysRef.current.has('z')) || (isKickKey && activeKeysRef.current.has('a'))) {
        // "Ao apertar chute e soco perto do oponente deve ser possível agarra-lo para jogar no chão."
        eng.handlePlayerInput('grab');
        return;
      }

      // Attack inputs:
      if (key === 'z' || code === 'keyu') {
        // Chute Baixo (Left Kick)
        if (isHoldingBack) {
          // "Ao apertar para trás e chute baixo o personagem deve dar uma rasteira capaz de derrubar o oponente."
          eng.handlePlayerInput('sweep');
        } else {
          eng.handlePlayerInput('kick_low');
        }
      } else if (key === 'x' || code === 'keyi') {
        // Chute Alto (Right Kick)
        if (isHoldingBack) {
          // "Ao apertar para trás e chute alto ele deve dar um chute giratório."
          eng.handlePlayerInput('spinning_kick');
        } else {
          eng.handlePlayerInput('kick_high');
        }
      } else if (key === 'a' || code === 'keyj') {
        // Soco Rápido (Left Punch)
        eng.handlePlayerInput('punch_light');
      } else if (key === 's' || code === 'keyk') {
        // Soco Forte (Right Punch)
        eng.handlePlayerInput('punch_heavy');
      } else if (key === 'arrowup' || code === 'keyw') {
        eng.handlePlayerInput('jump');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const code = e.code.toLowerCase();
      activeKeysRef.current.delete(key);
      activeKeysRef.current.delete(code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      activeKeysRef.current.clear();
    };
  }, [gameMode]);

  if (gameMode === 'select') {
    return (
      <CharacterSelect
        onSelectCharacter={handleStartFight}
        onBackToMenu={onBackToMenu}
      />
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans select-none outline-none">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full" />

      {/* Fight HUD Overlay */}
      <FightHUD
        p1={p1State}
        p2={p2State}
        match={matchState}
        onCommand={handleCommand}
        onRestartMatch={handleRestartMatch}
        onBackToSelect={() => setGameMode('select')}
        onBackToPortal={onBackToMenu}
      />
    </div>
  );
}
