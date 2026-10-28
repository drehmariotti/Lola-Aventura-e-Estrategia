import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/gameState';
import { LEVELS } from './game/levels';
import { ThreeGameView } from './game/threeScene';
import { ControlOverlay } from './components/ControlOverlay';
import { InstructionsModal } from './components/InstructionsModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { RelicJournalModal } from './components/RelicJournalModal';
import { Direction, NodePoint } from './game/types';

const STORAGE_KEY_RECORDS = 'relic_hunter_go_records_v1';
const STORAGE_KEY_RELICS = 'relic_hunter_go_relics_v1';

export interface LolaGameAppProps {
  onBackToMenu?: () => void;
}

export function LolaGameApp({ onBackToMenu }: LolaGameAppProps) {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<ThreeGameView | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // App State
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [turnCount, setTurnCount] = useState(0);
  const [isDead, setIsDead] = useState(false);
  const [deathReason, setDeathReason] = useState('');
  const [hasWon, setHasWon] = useState(false);
  const [playerFacing, setPlayerFacing] = useState<Direction>('east');
  const [validMoves, setValidMoves] = useState<NodePoint[]>([]);

  // Modals
  const [showInstructions, setShowInstructions] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showRelicJournal, setShowRelicJournal] = useState(false);

  // Persistent records & relics
  const [levelRecords, setLevelRecords] = useState<
    Record<number, { turns: number; completed: boolean; stars: number }>
  >(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [relicsFound, setRelicsFound] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RELICS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const syncStateFromEngine = useCallback(() => {
    if (!engineRef.current) return;
    const eng = engineRef.current;
    setTurnCount(eng.turnCount);
    setIsDead(eng.isPlayerDead);
    setDeathReason(eng.deathReason);
    setHasWon(eng.hasWon);
    setPlayerFacing(eng.playerFacing);
    setValidMoves(eng.getValidMoves());

    // Check newly collected relics
    eng.relics.forEach((r) => {
      if (r.collected) {
        setRelicsFound((prev) => {
          if (prev[r.id]) return prev;
          const next = { ...prev, [r.id]: true };
          try {
            localStorage.setItem(STORAGE_KEY_RELICS, JSON.stringify(next));
          } catch {}
          return next;
        });
      }
    });

    // If level won, save record
    if (eng.hasWon) {
      const lvl = eng.currentLevel;
      const stars = eng.turnCount <= lvl.parTurns ? 3 : eng.turnCount <= lvl.parTurns + 3 ? 2 : 1;
      setLevelRecords((prev) => {
        const old = prev[currentLevelIndex];
        const bestTurns = old ? Math.min(old.turns, eng.turnCount) : eng.turnCount;
        const bestStars = old ? Math.max(old.stars, stars) : stars;
        const next = {
          ...prev,
          [currentLevelIndex]: { turns: bestTurns, completed: true, stars: bestStars },
        };
        try {
          localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  }, [currentLevelIndex]);

  // Handle moving to a specific node
  const handleNodeClick = useCallback(
    (targetNodeId: string) => {
      if (!engineRef.current || !viewRef.current) return;
      const moved = engineRef.current.movePlayer(targetNodeId);
      if (moved) {
        viewRef.current.updateEntities(engineRef.current);
        syncStateFromEngine();
      }
    },
    [syncStateFromEngine]
  );

  // Handle directional move (from keyboard or D-pad)
  const handleMoveDirection = useCallback(
    (dir: Direction) => {
      if (!engineRef.current) return;
      const eng = engineRef.current;
      const currNode = eng.getNode(eng.playerNodeId);
      if (!currNode) return;

      const candidates = eng.getValidMoves();
      if (candidates.length === 0) return;

      // Find the candidate with the best directional alignment score
      let target: NodePoint | undefined;
      let bestScore = 0.25;

      candidates.forEach((cand) => {
        const dx = cand.x - currNode.x;
        const dz = cand.z - currNode.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 0.001) return;
        const ux = dx / dist;
        const uz = dz / dist;

        let score = 0;
        if (dir === 'east') score = ux;
        else if (dir === 'west') score = -ux;
        else if (dir === 'south') score = uz;
        else if (dir === 'north') score = -uz;

        if (score > bestScore) {
          bestScore = score;
          target = cand;
        }
      });

      if (target) {
        handleNodeClick(target.id);
      }
    },
    [handleNodeClick]
  );

  // Restart level
  const handleRestart = useCallback(() => {
    if (!engineRef.current || !viewRef.current) return;
    const level = LEVELS[currentLevelIndex];
    engineRef.current.initLevel(level);
    viewRef.current.loadLevel(engineRef.current);
    syncStateFromEngine();
  }, [currentLevelIndex, syncStateFromEngine]);

  // Next level
  const handleNextLevel = useCallback(() => {
    const nextIdx = (currentLevelIndex + 1) % LEVELS.length;
    setCurrentLevelIndex(nextIdx);
  }, [currentLevelIndex]);

  // Select level
  const handleSelectLevel = useCallback((index: number) => {
    setCurrentLevelIndex(index);
  }, []);

  // Initialize Three.js scene once
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const level = LEVELS[currentLevelIndex];
    const engine = new GameEngine(level);
    engineRef.current = engine;

    const view = new ThreeGameView(canvasMountRef.current, (nodeId) => {
      handleNodeClick(nodeId);
    });
    viewRef.current = view;

    view.loadLevel(engine);
    syncStateFromEngine();

    return () => {
      view.dispose();
      viewRef.current = null;
    };
  }, []);

  // Switch level when currentLevelIndex changes
  useEffect(() => {
    if (!viewRef.current) return;
    const level = LEVELS[currentLevelIndex];
    const engine = new GameEngine(level);
    engineRef.current = engine;

    viewRef.current.loadLevel(engine);
    syncStateFromEngine();
  }, [currentLevelIndex, syncStateFromEngine]);

  // Keyboard navigation & Shortcuts (Robust arrow keys & WASD support)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent repeated moves when holding down a key
      if (e.repeat) return;

      // Ignore if user is interacting with an input or textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') return;

      const key = e.key;
      const code = e.code;
      const keyCode = e.keyCode;

      const isUp =
        key === 'ArrowUp' ||
        key === 'Up' ||
        code === 'ArrowUp' ||
        keyCode === 38 ||
        key === 'w' ||
        key === 'W' ||
        code === 'KeyW' ||
        code === 'Numpad8';

      const isDown =
        key === 'ArrowDown' ||
        key === 'Down' ||
        code === 'ArrowDown' ||
        keyCode === 40 ||
        key === 's' ||
        key === 'S' ||
        code === 'KeyS' ||
        code === 'Numpad2';

      const isLeft =
        key === 'ArrowLeft' ||
        key === 'Left' ||
        code === 'ArrowLeft' ||
        keyCode === 37 ||
        key === 'a' ||
        key === 'A' ||
        code === 'KeyA' ||
        code === 'Numpad4';

      const isRight =
        key === 'ArrowRight' ||
        key === 'Right' ||
        code === 'ArrowRight' ||
        keyCode === 39 ||
        key === 'd' ||
        key === 'D' ||
        code === 'KeyD' ||
        code === 'Numpad6';

      const isRestart = key === 'r' || key === 'R' || code === 'KeyR';
      const isEscape = key === 'Escape' || code === 'Escape' || keyCode === 27;

      // Prevent scrolling when using navigation keys
      if (isUp || isDown || isLeft || isRight || key === ' ') {
        e.preventDefault();
      }

      if (isEscape) {
        setShowInstructions(false);
        setShowLevelSelect(false);
        setShowRelicJournal(false);
        return;
      }

      // If any modal is open, don't move the character
      if (showInstructions || showLevelSelect || showRelicJournal) {
        return;
      }

      if (isUp) {
        handleMoveDirection('north');
      } else if (isDown) {
        handleMoveDirection('south');
      } else if (isLeft) {
        handleMoveDirection('west');
      } else if (isRight) {
        handleMoveDirection('east');
      } else if (isRestart) {
        handleRestart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial window focus so keyboard arrow keys immediately respond without needing prior click
    window.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleMoveDirection, handleRestart, showInstructions, showLevelSelect, showRelicJournal]);

  // Touch Swipe navigation on canvas
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      const minSwipeDistance = 35;

      if (Math.hypot(dx, dy) > minSwipeDistance) {
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0) handleMoveDirection('east');
          else handleMoveDirection('west');
        } else {
          if (dy > 0) handleMoveDirection('south');
          else handleMoveDirection('north');
        }
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleMoveDirection]);

  const level = LEVELS[currentLevelIndex];
  const allRelics = LEVELS.flatMap((lvl) => lvl.relics || []);
  const relicsCount = allRelics.filter((r) => relicsFound[r.id]).length;

  return (
    <div
      tabIndex={0}
      autoFocus
      onClick={() => window.focus()}
      className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans select-none outline-none"
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full cursor-pointer" />

      {/* Ergonomic HUD & Control Overlay with Back to Menu support */}
      <ControlOverlay
        currentLevel={level}
        turnCount={turnCount}
        parTurns={level.parTurns}
        onRestart={handleRestart}
        onOpenInstructions={() => setShowInstructions(true)}
        onOpenLevelSelect={() => setShowLevelSelect(true)}
        onOpenRelicJournal={() => setShowRelicJournal(true)}
        onMoveDirection={handleMoveDirection}
        validMoves={validMoves}
        playerFacing={playerFacing}
        isDead={isDead}
        deathReason={deathReason}
        hasWon={hasWon}
        onNextLevel={handleNextLevel}
        relicsCount={relicsCount}
        totalRelics={allRelics.length}
        onBackToMenu={onBackToMenu}
      />

      {/* Modals */}
      <InstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />

      <LevelSelectModal
        isOpen={showLevelSelect}
        onClose={() => setShowLevelSelect(false)}
        currentLevelIndex={currentLevelIndex}
        onSelectLevel={handleSelectLevel}
        levelRecords={levelRecords}
        relicsFound={relicsFound}
      />

      <RelicJournalModal
        isOpen={showRelicJournal}
        onClose={() => setShowRelicJournal(false)}
        relicsFound={relicsFound}
      />
    </div>
  );
}
