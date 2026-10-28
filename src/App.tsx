import React, { useState, useEffect } from 'react';
import { PortalHome, GameKey } from './components/PortalHome';
import { LolaGameApp } from './games/lola/LolaGameApp';
import { RacingGame } from './games/racing';
import { FightingGame } from './games/fighting';
import { ShooterGame } from './games/shooter';

export default function App() {
  const [activeGame, setActiveGame] = useState<GameKey | null>(null);

  // Sync hash for easy refresh retention
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as GameKey;
      if (['lola', 'racing', 'fighting', 'shooter'].includes(hash)) {
        setActiveGame(hash);
      } else if (!hash) {
        setActiveGame(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectGame = (game: GameKey) => {
    window.location.hash = game;
    setActiveGame(game);
  };

  const handleBackToMenu = () => {
    window.location.hash = '';
    setActiveGame(null);
  };

  // Render active game or portal home page
  switch (activeGame) {
    case 'lola':
      return <LolaGameApp onBackToMenu={handleBackToMenu} />;
    case 'racing':
      return <RacingGame onBackToMenu={handleBackToMenu} />;
    case 'fighting':
      return <FightingGame onBackToMenu={handleBackToMenu} />;
    case 'shooter':
      return <ShooterGame onBackToMenu={handleBackToMenu} />;
    default:
      return <PortalHome onSelectGame={handleSelectGame} />;
  }
}
