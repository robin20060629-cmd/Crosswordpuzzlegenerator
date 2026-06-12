export type BallType = 'cue' | 'solid' | 'stripe' | 'eight';
export type PlayerGroup = 'solid' | 'stripe' | null;
export type GamePhase = 'aiming' | 'animating' | 'ballInHand' | 'aiThinking' | 'gameOver';
export type GameMode = 'training' | 'classic' | 'invite';

export interface Ball {
  id: number;
  number: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: BallType;
  pocketed: boolean;
}

export interface PlayerState {
  name: string;
  group: PlayerGroup;
  isAI: boolean;
  coins: number;
  xp: number;
  level: number;
  wins: number;
  achievements: string[];
}

export interface TurnInfo {
  firstHitId: number | null;
  pocketedIds: number[];
  wallHit: boolean;
  cuePocketed: boolean;
}

export interface GameState {
  balls: Ball[];
  players: [PlayerState, PlayerState];
  currentPlayer: 0 | 1;
  phase: GamePhase;
  groupAssigned: boolean;
  turnInfo: TurnInfo;
  winner: null | 0 | 1;
  foulReason: string;
  turnsPlayed: number;
  mode: GameMode;
}

export interface AimState {
  angle: number;
  isPulling: boolean;
  pullStart: { x: number; y: number } | null;
  pullDistance: number;
  power: number;
  ballInHandPos: { x: number; y: number } | null;
}

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_win', icon: '🏆', title: 'First Win', desc: 'Анхны ялалт' },
  { id: 'ten_wins', icon: '⭐', title: '10 Wins', desc: '10 удаа ялна' },
  { id: 'fifty_wins', icon: '🔥', title: '50 Wins', desc: '50 удаа ялна' },
  { id: 'pool_master', icon: '👑', title: 'Pool Master', desc: 'Мэргэжлийн тоглогч' },
  { id: 'level_10', icon: '10', title: 'Level 10', desc: 'Skilled хүрнэ' },
  { id: 'level_20', icon: '20', title: 'Level 20', desc: 'Professional болно' },
];

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Beginner', 5: 'Amateur', 10: 'Skilled', 20: 'Pro', 30: 'Master', 50: 'Legend',
};

export function getLevelName(level: number): string {
  const keys = Object.keys(LEVEL_NAMES).map(Number).sort((a, b) => b - a);
  for (const k of keys) {
    if (level >= k) return LEVEL_NAMES[k];
  }
  return 'Beginner';
}

export function xpForLevel(level: number): number {
  return level * 100;
}
