import { Ball, GameState, PlayerGroup, TurnInfo } from './types';
import { BALL_RADIUS, CUE_START, RACK_APEX } from './constants';

export function createInitialBalls(): Ball[] {
  const balls: Ball[] = [];

  // Cue ball
  balls.push({
    id: 0, number: 0,
    x: CUE_START.x, y: CUE_START.y,
    vx: 0, vy: 0,
    type: 'cue', pocketed: false,
  });

  // Rack positions (triangle, apex forward)
  const R = BALL_RADIUS * 2;
  const rowSpacingX = BALL_RADIUS * Math.sqrt(3); // ~22.5
  const rowSpacingY = BALL_RADIUS * 2;

  const positions: { x: number; y: number }[] = [];
  for (let row = 0; row < 5; row++) {
    const count = row + 1;
    const startY = RACK_APEX.y - (count - 1) * rowSpacingY * 0.5;
    for (let col = 0; col < count; col++) {
      positions.push({
        x: RACK_APEX.x + row * rowSpacingX,
        y: startY + col * rowSpacingY,
      });
    }
  }

  // Ball arrangement in rack:
  // position[0] = apex, position[4] = center (8-ball), corners = one solid + one stripe
  const solidNums = [1, 2, 3, 4, 5, 6, 7];
  const stripeNums = [9, 10, 11, 12, 13, 14, 15];

  // Shuffle solids and stripes separately
  shuffle(solidNums);
  shuffle(stripeNums);

  // Build ordered list: [solid, stripe, 8, ...mixed, corner-solid, corner-stripe]
  // Standard rack: 8 in center (index 4), back corners have one solid and one stripe
  const ballNums: number[] = new Array(15);
  ballNums[4] = 8; // center
  // Apex can be any
  // Back corners (index 10, 14) one of each
  const remaining = [...solidNums, ...stripeNums];
  const usedSolid = solidNums[0];
  const usedStripe = stripeNums[0];
  ballNums[10] = usedSolid;
  ballNums[14] = usedStripe;

  const pool = remaining.filter(n => n !== usedSolid && n !== usedStripe);
  shuffle(pool);

  let poolIdx = 0;
  for (let i = 0; i < 15; i++) {
    if (ballNums[i] !== undefined) continue;
    ballNums[i] = pool[poolIdx++];
  }

  for (let i = 0; i < 15; i++) {
    const num = ballNums[i];
    const pos = positions[i];
    const type = num === 8 ? 'eight' : num <= 7 ? 'solid' : 'stripe';
    balls.push({
      id: num, number: num,
      x: pos.x + (Math.random() - 0.5) * 0.5,
      y: pos.y + (Math.random() - 0.5) * 0.5,
      vx: 0, vy: 0,
      type, pocketed: false,
    });
  }

  return balls;
}

function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export function freshTurnInfo(): TurnInfo {
  return { firstHitId: null, pocketedIds: [], wallHit: false, cuePocketed: false };
}

export interface TurnResult {
  foul: boolean;
  foulReason: string;
  eightBallPocketed: boolean;
  playerWins: boolean;
  continueTurn: boolean;
  assignGroup: PlayerGroup;
}

export function evaluateTurn(
  state: GameState,
  accumulated: TurnInfo,
): TurnResult {
  const { balls, currentPlayer, players, groupAssigned, turnsPlayed } = state;
  const p = players[currentPlayer];

  const result: TurnResult = {
    foul: false, foulReason: '',
    eightBallPocketed: false, playerWins: false,
    continueTurn: false, assignGroup: null,
  };

  const pocketed = accumulated.pocketedIds;
  const eightPocketed = pocketed.includes(8);
  result.eightBallPocketed = eightPocketed;

  // --- Fouls ---
  // 1. Cue ball pocketed
  if (accumulated.cuePocketed) {
    result.foul = true;
    result.foulReason = 'Цагаан бөмбөг халаасанд орлоо (Scratch)';
    if (eightPocketed) { result.playerWins = false; return result; }
    return result;
  }

  // 2. No ball hit
  if (accumulated.firstHitId === null) {
    result.foul = true;
    result.foulReason = 'Жодоо бөмбөгт хүрсэнгүй';
    return result;
  }

  // 3. Wrong group hit first (if groups assigned)
  if (groupAssigned && p.group !== null) {
    const firstBall = balls.find(b => b.id === accumulated.firstHitId);
    if (firstBall) {
      const isPlayerBall = (p.group === 'solid' && firstBall.type === 'solid') ||
                           (p.group === 'stripe' && firstBall.type === 'stripe') ||
                           firstBall.type === 'eight';
      if (!isPlayerBall) {
        result.foul = true;
        result.foulReason = 'Буруу бөмбөгт эхэлж хүрлэа';
        return result;
      }
    }
  }

  // 4. After contact, no ball/wall touched (no cushion hit and no pocket)
  if (!accumulated.wallHit && pocketed.length === 0) {
    result.foul = true;
    result.foulReason = 'Хана мөргүүлсэнгүй';
    return result;
  }

  // --- 8-ball pocketed ---
  if (eightPocketed) {
    // Player must have pocketed all their group balls
    const playerGroup = p.group;
    if (playerGroup) {
      const playerBallsLeft = balls.filter(b =>
        !b.pocketed && b.type === playerGroup
      ).length;
      if (playerBallsLeft > 0) {
        // Pocketed 8 too early → lose
        result.playerWins = false;
        return result;
      }
    }
    // Win!
    result.playerWins = true;
    return result;
  }

  // --- Group assignment (first pocket after break) ---
  if (!groupAssigned && turnsPlayed >= 1) {
    const solidsPocketed = pocketed.filter(id => id >= 1 && id <= 7).length;
    const stripesPocketed = pocketed.filter(id => id >= 9 && id <= 15).length;
    if (solidsPocketed > stripesPocketed) {
      result.assignGroup = 'solid';
    } else if (stripesPocketed > solidsPocketed) {
      result.assignGroup = 'stripe';
    } else if (solidsPocketed > 0) {
      result.assignGroup = 'solid'; // tie: solids
    }
  }

  // --- Continue turn? ---
  const myGroup = result.assignGroup || p.group;
  const myBallsPocketed = pocketed.filter(id => {
    if (myGroup === 'solid') return id >= 1 && id <= 7;
    if (myGroup === 'stripe') return id >= 9 && id <= 15;
    return false;
  });
  result.continueTurn = myBallsPocketed.length > 0;

  return result;
}

export function getPlayerBallsLeft(balls: Ball[], group: PlayerGroup): number {
  if (!group) return 7;
  return balls.filter(b => !b.pocketed && b.type === group).length;
}
