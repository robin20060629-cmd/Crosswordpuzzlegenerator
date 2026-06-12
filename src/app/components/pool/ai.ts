import { Ball } from './types';
import { BALL_RADIUS, POCKETS, TABLE } from './constants';

interface Shot {
  angle: number;
  power: number;
}

export function calculateAIShot(
  balls: Ball[],
  playerGroup: 'solid' | 'stripe' | null,
  allTheirBallsPocketed: boolean,
): Shot {
  const cue = balls.find(b => b.number === 0 && !b.pocketed);
  if (!cue) return randomShot();

  // Determine targets
  let targets: Ball[];
  if (allTheirBallsPocketed || playerGroup === null) {
    const eight = balls.find(b => b.number === 8 && !b.pocketed);
    targets = eight ? [eight] : [];
  } else {
    targets = balls.filter(b => !b.pocketed && b.type === playerGroup);
    if (targets.length === 0) {
      const eight = balls.find(b => b.number === 8 && !b.pocketed);
      targets = eight ? [eight] : [];
    }
  }

  if (targets.length === 0) return randomShot();

  let bestShot: Shot & { score: number } | null = null;

  for (const target of targets) {
    for (const pocket of POCKETS) {
      // Direction from target to pocket
      const toPocketDx = pocket.x - target.x;
      const toPocketDy = pocket.y - target.y;
      const toPocketDist = Math.sqrt(toPocketDx ** 2 + toPocketDy ** 2);
      if (toPocketDist === 0) continue;

      const toPocketNx = toPocketDx / toPocketDist;
      const toPocketNy = toPocketDy / toPocketDist;

      // Ghost ball position: where cue ball center needs to be at impact
      const ghostX = target.x - toPocketNx * BALL_RADIUS * 2;
      const ghostY = target.y - toPocketNy * BALL_RADIUS * 2;

      // Is ghost ball inside table?
      const margin = BALL_RADIUS + 2;
      if (ghostX < TABLE.left + margin || ghostX > TABLE.right - margin ||
          ghostY < TABLE.top + margin || ghostY > TABLE.bottom - margin) continue;

      // Angle from cue to ghost
      const dxGhost = ghostX - cue.x;
      const dyGhost = ghostY - cue.y;
      const distGhost = Math.sqrt(dxGhost ** 2 + dyGhost ** 2);
      if (distGhost < BALL_RADIUS) continue;

      const shotAngle = Math.atan2(dyGhost, dxGhost);

      // Check if path is clear (no other balls blocking cue→ghost or target→pocket)
      const cuePath = isPathClear(balls, cue, ghostX, ghostY, [target.id]);
      const targetPath = isPathClear(balls, target, pocket.x, pocket.y, [0]);

      if (!cuePath || !targetPath) continue;

      // Score: prefer shorter cue distance, closer pocket
      const score = 1000 / (distGhost + 1) + 500 / (toPocketDist + 1);

      if (!bestShot || score > bestShot.score) {
        const dist = Math.sqrt((cue.x - target.x) ** 2 + (cue.y - target.y) ** 2);
        const power = Math.min(0.85, 0.35 + dist / 1200);
        bestShot = { angle: shotAngle, power, score };
      }
    }
  }

  if (!bestShot) {
    // Fallback: just aim at nearest target
    const target = nearestBall(cue, targets);
    const angle = Math.atan2(target.y - cue.y, target.x - cue.x);
    return { angle: angle + (Math.random() - 0.5) * 0.2, power: 0.5 };
  }

  // Add AI inaccuracy
  bestShot.angle += (Math.random() - 0.5) * 0.10;
  bestShot.power = Math.max(0.25, Math.min(0.9, bestShot.power + (Math.random() - 0.5) * 0.15));
  return bestShot;
}

function isPathClear(balls: Ball[], from: Ball, toX: number, toY: number, ignoreIds: number[]): boolean {
  const dx = toX - from.x;
  const dy = toY - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return true;
  const nx = dx / len;
  const ny = dy / len;

  for (const ball of balls) {
    if (ball.pocketed || ball.id === from.id || ignoreIds.includes(ball.id)) continue;
    const toBall = { x: ball.x - from.x, y: ball.y - from.y };
    const proj = toBall.x * nx + toBall.y * ny;
    if (proj < 0 || proj > len) continue;
    const perpDist = Math.abs(toBall.x * ny - toBall.y * nx);
    if (perpDist < BALL_RADIUS * 1.9) return false;
  }
  return true;
}

function nearestBall(cue: Ball, balls: Ball[]): Ball {
  let nearest = balls[0];
  let minDist = Infinity;
  for (const b of balls) {
    const d = Math.sqrt((b.x - cue.x) ** 2 + (b.y - cue.y) ** 2);
    if (d < minDist) { minDist = d; nearest = b; }
  }
  return nearest;
}

function randomShot(): Shot {
  return { angle: Math.random() * Math.PI * 2, power: 0.4 + Math.random() * 0.3 };
}
