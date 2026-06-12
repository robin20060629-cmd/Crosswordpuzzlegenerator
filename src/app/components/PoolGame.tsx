import { useEffect, useRef, useCallback, useState } from 'react';
import { GameMode, GameState, AimState, PlayerState, TurnInfo } from './pool/types';
import { CANVAS_W, CANVAS_H, TABLE, MAX_SHOT_POWER } from './pool/constants';
import { stepPhysics, allStopped, shootCueBall, placeCueBall } from './pool/physics';
import { renderFrame } from './pool/renderer';
import { calculateAIShot } from './pool/ai';
import {
  createInitialBalls, freshTurnInfo, evaluateTurn, getPlayerBallsLeft,
} from './pool/gameLogic';
import { getLevelName, xpForLevel, ACHIEVEMENTS } from './pool/types';

interface Props {
  mode: GameMode;
  player1: PlayerState;
  player2: PlayerState;
  onGameEnd: (winner: 0 | 1, p1: PlayerState, p2: PlayerState) => void;
  onExit: () => void;
}

const INIT_TURN_INFO = (): TurnInfo => ({ firstHitId: null, pocketedIds: [], wallHit: false, cuePocketed: false });

export default function PoolGame({ mode, player1, player2, onGameEnd, onExit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // Game state lives in refs so the game loop can read latest without re-render
  const gameRef = useRef<GameState>({
    balls: createInitialBalls(),
    players: [{ ...player1 }, { ...player2 }],
    currentPlayer: Math.random() < 0.5 ? 0 : 1,
    phase: 'aiming',
    groupAssigned: false,
    turnInfo: INIT_TURN_INFO(),
    winner: null,
    foulReason: '',
    turnsPlayed: 0,
    mode,
  });

  const aimRef = useRef<AimState>({
    angle: 0,
    isPulling: false,
    pullStart: null,
    pullDistance: 0,
    power: 0,
    ballInHandPos: null,
  });

  // UI state (triggers re-renders)
  const [uiState, setUiState] = useState({
    currentPlayer: gameRef.current.currentPlayer,
    phase: gameRef.current.phase,
    players: gameRef.current.players,
    groupAssigned: false,
    foulReason: '',
    winner: null as null | 0 | 1,
    message: '',
    turnsPlayed: 0,
  });

  const syncUI = useCallback(() => {
    const g = gameRef.current;
    setUiState({
      currentPlayer: g.currentPlayer,
      phase: g.phase,
      players: [...g.players] as [PlayerState, PlayerState],
      groupAssigned: g.groupAssigned,
      foulReason: g.foulReason,
      winner: g.winner,
      message: '',
      turnsPlayed: g.turnsPlayed,
    });
  }, []);

  // --- Turn evaluation after all balls stop ---
  const evaluateAndNext = useCallback(() => {
    const g = gameRef.current;
    if (g.phase === 'gameOver') return;

    const result = evaluateTurn(g, g.turnInfo);

    if (result.assignGroup && !g.groupAssigned) {
      g.players[g.currentPlayer].group = result.assignGroup;
      g.players[1 - g.currentPlayer].group = result.assignGroup === 'solid' ? 'stripe' : 'solid';
      g.groupAssigned = true;
    }

    if (result.playerWins) {
      const winner = g.currentPlayer;
      g.winner = winner;
      g.phase = 'gameOver';
      // Award XP and coins
      const wp = { ...g.players[winner] };
      wp.wins += 1;
      wp.xp += 100;
      wp.coins += 50;
      while (wp.xp >= xpForLevel(wp.level + 1)) {
        wp.xp -= xpForLevel(wp.level + 1);
        wp.level += 1;
      }
      // Achievements
      if (wp.wins === 1 && !wp.achievements.includes('first_win')) wp.achievements.push('first_win');
      if (wp.wins >= 10 && !wp.achievements.includes('ten_wins')) wp.achievements.push('ten_wins');
      if (wp.wins >= 50 && !wp.achievements.includes('fifty_wins')) wp.achievements.push('fifty_wins');
      if (wp.level >= 10 && !wp.achievements.includes('level_10')) wp.achievements.push('level_10');
      if (wp.level >= 20 && !wp.achievements.includes('level_20')) wp.achievements.push('level_20');
      g.players[winner] = wp;
      syncUI();
      onGameEnd(winner, g.players[0], g.players[1]);
      return;
    }

    if (result.eightBallPocketed && !result.playerWins) {
      g.winner = (1 - g.currentPlayer) as 0 | 1;
      g.phase = 'gameOver';
      syncUI();
      onGameEnd(g.winner, g.players[0], g.players[1]);
      return;
    }

    if (result.foul) {
      g.foulReason = result.foulReason;
      const cue = g.balls.find(b => b.number === 0);
      if (cue) {
        cue.pocketed = false;
        cue.vx = 0; cue.vy = 0;
      }
      // Switch player
      g.currentPlayer = (1 - g.currentPlayer) as 0 | 1;
      g.turnsPlayed += 1;
      g.turnInfo = INIT_TURN_INFO();
      g.phase = 'ballInHand';
      aimRef.current.ballInHandPos = { x: TABLE.centerX, y: TABLE.centerY };
      syncUI();
      return;
    }

    g.foulReason = '';

    if (result.continueTurn) {
      g.turnsPlayed += 1;
      g.turnInfo = INIT_TURN_INFO();
      g.phase = 'aiming';
      // If AI's turn, schedule
      if (g.players[g.currentPlayer].isAI) scheduleAI();
      syncUI();
    } else {
      g.currentPlayer = (1 - g.currentPlayer) as 0 | 1;
      g.turnsPlayed += 1;
      g.turnInfo = INIT_TURN_INFO();
      g.phase = 'aiming';
      if (g.players[g.currentPlayer].isAI) scheduleAI();
      syncUI();
    }
  }, [syncUI, onGameEnd]);

  const scheduleAI = useCallback(() => {
    const g = gameRef.current;
    g.phase = 'aiThinking';
    syncUI();
    setTimeout(() => {
      const cg = gameRef.current;
      if (cg.phase !== 'aiThinking') return;
      const cue = cg.balls.find(b => b.number === 0 && !b.pocketed);
      if (!cue) return;
      const p = cg.players[cg.currentPlayer];
      const allMine = getPlayerBallsLeft(cg.balls, p.group) === 0;
      const shot = calculateAIShot(cg.balls, p.group, allMine);
      cg.turnInfo = INIT_TURN_INFO();
      shootCueBall(cue, shot.angle, shot.power, MAX_SHOT_POWER);
      cg.phase = 'animating';
      syncUI();
    }, 1200 + Math.random() * 600);
  }, [syncUI]);

  // --- Game loop ---
  const gameLoop = useCallback(() => {
    const g = gameRef.current;
    const canvas = canvasRef.current;
    if (!canvas) { rafRef.current = requestAnimationFrame(gameLoop); return; }
    const ctx = canvas.getContext('2d')!;

    if (g.phase === 'animating') {
      const prevActive = new Set(g.balls.filter(b => !b.pocketed).map(b => b.id));
      const { pocketedIds } = stepPhysics(g.balls, g.turnInfo, prevActive);
      g.turnInfo.pocketedIds.push(...pocketedIds);

      if (allStopped(g.balls)) {
        evaluateAndNext();
      }
    }

    const aim = aimRef.current;
    const cue = g.balls.find(b => b.number === 0 && !b.pocketed);

    renderFrame(
      ctx, g.balls,
      aim.angle, aim.isPulling, aim.pullDistance, aim.power,
      g.phase,
      aim.ballInHandPos,
      g.players[0].group,
      g.players[1].group,
      g.currentPlayer,
    );

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [evaluateAndNext]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameLoop]);

  // AI: start if first player is AI
  useEffect(() => {
    const g = gameRef.current;
    if (g.players[g.currentPlayer].isAI) {
      setTimeout(() => scheduleAI(), 800);
    }
  }, [scheduleAI]);

  // --- Mouse handlers ---
  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const g = gameRef.current;
    const aim = aimRef.current;
    const pos = getCanvasPos(e);

    if (g.phase === 'ballInHand') {
      const margin = 15;
      aim.ballInHandPos = {
        x: Math.max(TABLE.left + margin, Math.min(TABLE.right - margin, pos.x)),
        y: Math.max(TABLE.top + margin, Math.min(TABLE.bottom - margin, pos.y)),
      };
      return;
    }

    if (g.phase !== 'aiming' || g.players[g.currentPlayer].isAI) return;

    const cue = g.balls.find(b => b.number === 0 && !b.pocketed);
    if (!cue) return;

    aim.angle = Math.atan2(pos.y - cue.y, pos.x - cue.x) + Math.PI;

    if (aim.isPulling && aim.pullStart) {
      const dx = pos.x - aim.pullStart.x;
      const dy = pos.y - aim.pullStart.y;
      aim.pullDistance = Math.sqrt(dx * dx + dy * dy);
      aim.power = Math.min(1, aim.pullDistance / 120);
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const g = gameRef.current;
    const aim = aimRef.current;
    const pos = getCanvasPos(e);

    if (g.phase === 'ballInHand') {
      placeCueBall(g.balls, pos.x, pos.y);
      aim.ballInHandPos = null;
      g.phase = 'aiming';
      g.turnInfo = INIT_TURN_INFO();
      if (g.players[g.currentPlayer].isAI) scheduleAI();
      syncUI();
      return;
    }

    if (g.phase !== 'aiming' || g.players[g.currentPlayer].isAI) return;
    aim.isPulling = true;
    aim.pullStart = pos;
    aim.pullDistance = 0;
    aim.power = 0;
  }, [scheduleAI, syncUI]);

  const handleMouseUp = useCallback(() => {
    const g = gameRef.current;
    const aim = aimRef.current;
    if (g.phase !== 'aiming' || !aim.isPulling) return;

    const power = aim.power;
    aim.isPulling = false;
    aim.pullStart = null;
    aim.pullDistance = 0;
    aim.power = 0;

    if (power < 0.02) return; // too weak, ignore

    const cue = g.balls.find(b => b.number === 0 && !b.pocketed);
    if (!cue) return;

    g.turnInfo = INIT_TURN_INFO();
    shootCueBall(cue, aim.angle, power, MAX_SHOT_POWER);
    g.phase = 'animating';
    syncUI();
  }, [syncUI]);

  // --- Hint button ---
  const showHint = useCallback(() => {
    const g = gameRef.current;
    if (g.phase !== 'aiming' || g.players[g.currentPlayer].isAI) return;
    const cue = g.balls.find(b => b.number === 0 && !b.pocketed);
    if (!cue) return;
    const p = g.players[g.currentPlayer];
    const allMine = getPlayerBallsLeft(g.balls, p.group) === 0;
    const shot = calculateAIShot(g.balls, p.group, allMine);
    aimRef.current.angle = shot.angle + Math.PI;
  }, []);

  const { currentPlayer, phase, players, groupAssigned, foulReason, winner } = uiState;
  const p1 = players[0];
  const p2 = players[1];
  const isPlayerTurn = !players[currentPlayer].isAI;

  const ballsLeft0 = getPlayerBallsLeft(gameRef.current.balls, p1.group);
  const ballsLeft1 = getPlayerBallsLeft(gameRef.current.balls, p2.group);

  // Ball count display
  const solids = [1,2,3,4,5,6,7];
  const stripes = [9,10,11,12,13,14,15];

  return (
    <div className="flex flex-col items-center w-full h-full min-h-screen bg-[#0a0704]">
      {/* Top HUD */}
      <div className="w-full max-w-[1040px] px-2 pt-3 pb-2 flex items-stretch gap-3">
        {/* Player 1 */}
        <PlayerCard
          player={p1}
          isActive={currentPlayer === 0}
          group={p1.group}
          ballsLeft={ballsLeft0}
          index={0}
        />

        {/* Center info */}
        <div className="flex-1 flex flex-col items-center justify-center gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[#F4B400] font-['Oswald',sans-serif] text-lg tracking-wider">
              8 BALL POOL
            </span>
            <span className="text-xs text-neutral-500 font-['JetBrains_Mono',monospace] uppercase">
              {mode}
            </span>
          </div>

          {foulReason && (
            <div className="bg-red-900/80 border border-red-500/50 text-red-300 text-xs px-3 py-1 rounded text-center">
              ⚠ {foulReason} — Ball in Hand
            </div>
          )}

          {phase === 'aiThinking' && (
            <div className="text-yellow-400/80 text-xs font-['JetBrains_Mono',monospace] animate-pulse">
              🤖 AI боддож байна…
            </div>
          )}

          {phase === 'ballInHand' && (
            <div className="text-cyan-400 text-xs font-['JetBrains_Mono',monospace]">
              🖱 Ball in Hand — цагаан бөмбөгийг байрлуул
            </div>
          )}

          {phase === 'aiming' && isPlayerTurn && !foulReason && (
            <div className="text-green-400/70 text-xs">
              Чиглэл аваад татаж цохи
            </div>
          )}

          {/* Ball group indicators */}
          {groupAssigned && (
            <div className="flex items-center gap-3 mt-0.5">
              <div className="flex items-center gap-1">
                <BallDots type="solid" group={p1.group} highlight={currentPlayer === 0} />
                <span className="text-xs text-neutral-400">{p1.group ? (p1.group === 'solid' ? '●' : '◑') : '?'}</span>
              </div>
              <span className="text-neutral-600 text-xs">vs</span>
              <div className="flex items-center gap-1">
                <BallDots type="stripe" group={p2.group} highlight={currentPlayer === 1} />
                <span className="text-xs text-neutral-400">{p2.group ? (p2.group === 'solid' ? '●' : '◑') : '?'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Player 2 */}
        <PlayerCard
          player={p2}
          isActive={currentPlayer === 1}
          group={p2.group}
          ballsLeft={ballsLeft1}
          index={1}
        />
      </div>

      {/* Canvas */}
      <div className="relative w-full max-w-[1040px] px-2">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full rounded-lg cursor-crosshair select-none"
          style={{ maxHeight: '65vh', objectFit: 'contain' }}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => { aimRef.current.isPulling = false; }}
        />

        {/* Winning overlay */}
        {winner !== null && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/70">
            <div className="text-center p-8">
              <div className="text-6xl mb-3">🏆</div>
              <div className="text-[#F4B400] font-['Oswald',sans-serif] text-4xl mb-2">
                {players[winner].name} ЯЛЛАА!
              </div>
              <div className="text-neutral-400 text-sm mb-6">
                +100 XP · +50 Coin
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    const g = gameRef.current;
                    g.balls = createInitialBalls();
                    g.currentPlayer = Math.random() < 0.5 ? 0 : 1;
                    g.phase = 'aiming';
                    g.groupAssigned = false;
                    g.turnInfo = INIT_TURN_INFO();
                    g.winner = null;
                    g.foulReason = '';
                    g.turnsPlayed = 0;
                    aimRef.current.ballInHandPos = null;
                    if (g.players[g.currentPlayer].isAI) setTimeout(() => scheduleAI(), 800);
                    syncUI();
                  }}
                  className="bg-[#F4B400] text-black px-6 py-2 rounded font-['Oswald',sans-serif] hover:bg-yellow-300 transition-colors"
                >
                  ДАХИН ТОГЛОХ
                </button>
                <button
                  onClick={onExit}
                  className="bg-neutral-700 text-white px-6 py-2 rounded font-['Oswald',sans-serif] hover:bg-neutral-600 transition-colors"
                >
                  ГАРАХ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="w-full max-w-[1040px] px-2 pt-2 pb-3 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={showHint}
            disabled={phase !== 'aiming' || !isPlayerTurn}
            className="bg-neutral-800 border border-neutral-600 text-neutral-300 text-xs px-3 py-1.5 rounded hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-['Inter',sans-serif]"
          >
            💡 Hint
          </button>
          <button
            onClick={onExit}
            className="bg-neutral-800 border border-neutral-600 text-neutral-400 text-xs px-3 py-1.5 rounded hover:bg-neutral-700 transition-colors font-['Inter',sans-serif]"
          >
            ← Гарах
          </button>
        </div>

        {/* Ball tray */}
        <div className="flex items-center gap-4">
          <BallTray balls={gameRef.current.balls} numbers={solids} label="Solid" />
          <div className="w-px h-6 bg-neutral-700" />
          <BallTray balls={gameRef.current.balls} numbers={stripes} label="Stripe" />
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

interface PlayerCardProps {
  player: PlayerState;
  isActive: boolean;
  group: string | null;
  ballsLeft: number;
  index: number;
}

function PlayerCard({ player, isActive, group, ballsLeft, index }: PlayerCardProps) {
  const xpNeeded = xpForLevel(player.level + 1);
  const xpPct = Math.round((player.xp / xpNeeded) * 100);

  return (
    <div className={`
      flex flex-col gap-1 px-3 py-2 rounded-lg border min-w-[160px] transition-all duration-200
      ${isActive
        ? 'border-[#F4B400]/60 bg-[#F4B400]/8 shadow-[0_0_12px_rgba(244,180,0,0.15)]'
        : 'border-neutral-700/50 bg-neutral-900/60'
      }
    `}>
      <div className="flex items-center gap-2">
        {isActive && <span className="text-[#F4B400] text-xs">▶</span>}
        <span className="text-white font-['Oswald',sans-serif] text-sm truncate">{player.name}</span>
        {player.isAI && <span className="text-xs text-purple-400 font-['JetBrains_Mono',monospace]">AI</span>}
      </div>

      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <span className="text-[#F4B400]">Lv {player.level}</span>
        <span className="text-neutral-600">·</span>
        <span className="font-['JetBrains_Mono',monospace]">{getLevelName(player.level)}</span>
      </div>

      {/* XP bar */}
      <div className="h-1 bg-neutral-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#F4B400] to-yellow-300 transition-all duration-500"
          style={{ width: `${xpPct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-[#F4B400] font-['JetBrains_Mono',monospace]">🪙 {player.coins}</span>
        {group && (
          <span className={`px-1.5 py-0.5 rounded text-xs ${
            group === 'solid' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-blue-900/50 text-blue-400'
          }`}>
            {group === 'solid' ? '● Solid' : '◑ Stripe'}
          </span>
        )}
        {group && (
          <span className="text-neutral-400">{ballsLeft} left</span>
        )}
      </div>

      {/* Wins */}
      <div className="text-xs text-neutral-600">
        🏆 {player.wins} wins
      </div>
    </div>
  );
}

function BallDots({ type, group, highlight }: { type: string; group: string | null; highlight: boolean }) {
  return (
    <div className={`w-2 h-2 rounded-full ${
      highlight ? 'opacity-100' : 'opacity-40'
    } ${
      type === 'solid' ? 'bg-yellow-400' : 'bg-blue-400 border border-white/30'
    }`} />
  );
}

interface BallTrayProps {
  balls: { number: number; pocketed: boolean }[];
  numbers: number[];
  label: string;
}

function BallTray({ balls, numbers, label }: BallTrayProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-neutral-600 text-xs mr-1 font-['Inter',sans-serif]">{label}</span>
      {numbers.map(n => {
        const ball = balls.find(b => b.number === n);
        const pocketed = ball?.pocketed ?? false;
        return (
          <div
            key={n}
            className={`w-4 h-4 rounded-full border transition-all duration-300 ${
              pocketed
                ? 'border-neutral-700 bg-neutral-800 opacity-40'
                : 'border-white/20 opacity-100'
            }`}
            style={{
              background: pocketed
                ? undefined
                : n >= 9
                ? `linear-gradient(135deg, #fff 30%, ${getBallColor(n)} 30%, ${getBallColor(n)} 70%, #fff 70%)`
                : getBallColor(n),
            }}
          />
        );
      })}
    </div>
  );
}

function getBallColor(n: number): string {
  const colors: Record<number, string> = {
    1: '#F0C020', 2: '#1A3EAD', 3: '#C62828', 4: '#6A1FAC',
    5: '#E65100', 6: '#1B7A30', 7: '#8B2500',
    9: '#F0C020', 10: '#1A3EAD', 11: '#C62828', 12: '#6A1FAC',
    13: '#E65100', 14: '#1B7A30', 15: '#8B2500',
  };
  return colors[n] || '#888';
}
