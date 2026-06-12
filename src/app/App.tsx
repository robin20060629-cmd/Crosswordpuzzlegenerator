import { useState } from 'react';
import MainMenu from './components/MainMenu';
import PoolGame from './components/PoolGame';
import { GameMode, PlayerState } from './components/pool/types';

const DEFAULT_PLAYER: PlayerState = {
  name: 'Тоглогч',
  group: null,
  isAI: false,
  coins: 500,
  xp: 30,
  level: 1,
  wins: 0,
  achievements: [],
};

type Screen = 'menu' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [player, setPlayer] = useState<PlayerState>({ ...DEFAULT_PLAYER });
  const [gameConfig, setGameConfig] = useState<{
    mode: GameMode;
    p1: PlayerState;
    p2: PlayerState;
  } | null>(null);

  const handleStart = (mode: GameMode, p1: PlayerState, p2: PlayerState) => {
    setGameConfig({ mode, p1, p2 });
    setScreen('game');
  };

  const handleGameEnd = (winner: 0 | 1, p1: PlayerState, p2: PlayerState) => {
    // Persist player 1 stats
    setPlayer(p1);
  };

  const handleExit = () => {
    if (gameConfig) {
      // Save any updated player stats
      setPlayer(prev => ({
        ...prev,
        ...gameConfig.p1,
      }));
    }
    setScreen('menu');
    setGameConfig(null);
  };

  return (
    <div className="w-full min-h-screen bg-[#0a0704]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {screen === 'menu' && (
        <MainMenu player={player} onStart={handleStart} />
      )}
      {screen === 'game' && gameConfig && (
        <PoolGame
          mode={gameConfig.mode}
          player1={gameConfig.p1}
          player2={gameConfig.p2}
          onGameEnd={handleGameEnd}
          onExit={handleExit}
        />
      )}
    </div>
  );
}
