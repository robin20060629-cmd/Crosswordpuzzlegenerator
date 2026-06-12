import { Ball, TurnInfo } from './types';
import {
  BALL_RADIUS, FRICTION, MIN_SPEED, CUSHION_RESTITUTION,
  TABLE, POCKETS,
} from './constants';

export function stepPhysics(
  balls: Ball[],
  turnInfo: TurnInfo,
  prevActive: Set<number>
): { pocketedIds: number[]; newlyActive: Set<number> } {
  const pocketedIds: number[] = [];

  for (const ball of balls) {
    if (ball.pocketed) continue;
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.vx *= FRICTION;
    ball.vy *= FRICTION;
    if (Math.abs(ball.vx) < MIN_SPEED) ball.vx = 0;
    if (Math.abs(ball.vy) < MIN_SPEED) ball.vy = 0;
  }

  // Cushion collisions
  for (const ball of balls) {
    if (ball.pocketed) continue;
    let hitWall = false;
    if (ball.x - BALL_RADIUS < TABLE.left) {
      ball.x = TABLE.left + BALL_RADIUS;
      ball.vx = Math.abs(ball.vx) * CUSHION_RESTITUTION;
      hitWall = true;
    } else if (ball.x + BALL_RADIUS > TABLE.right) {
      ball.x = TABLE.right - BALL_RADIUS;
      ball.vx = -Math.abs(ball.vx) * CUSHION_RESTITUTION;
      hitWall = true;
    }
    if (ball.y - BALL_RADIUS < TABLE.top) {
      ball.y = TABLE.top + BALL_RADIUS;
      ball.vy = Math.abs(ball.vy) * CUSHION_RESTITUTION;
      hitWall = true;
    } else if (ball.y + BALL_RADIUS > TABLE.bottom) {
      ball.y = TABLE.bottom - BALL_RADIUS;
      ball.vy = -Math.abs(ball.vy) * CUSHION_RESTITUTION;
      hitWall = true;
    }
    if (hitWall) turnInfo.wallHit = true;
  }

  // Ball-ball collisions
  const active = balls.filter(b => !b.pocketed);
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const b1 = active[i];
      const b2 = active[j];
      const dx = b2.x - b1.x;
      const dy = b2.y - b1.y;
      const distSq = dx * dx + dy * dy;
      const minDist = BALL_RADIUS * 2;
      if (distSq >= minDist * minDist || distSq === 0) continue;

      const dist = Math.sqrt(distSq);
      const nx = dx / dist;
      const ny = dy / dist;
      const dvx = b1.vx - b2.vx;
      const dvy = b1.vy - b2.vy;
      const dot = dvx * nx + dvy * ny;
      if (dot <= 0) continue;

      // Record first hit by cue ball
      if (b1.number === 0 && turnInfo.firstHitId === null) {
        turnInfo.firstHitId = b2.id;
      }
      if (b2.number === 0 && turnInfo.firstHitId === null) {
        turnInfo.firstHitId = b1.id;
      }

      b1.vx -= dot * nx;
      b1.vy -= dot * ny;
      b2.vx += dot * nx;
      b2.vy += dot * ny;

      const overlap = minDist - dist;
      b1.x -= nx * overlap * 0.5;
      b1.y -= ny * overlap * 0.5;
      b2.x += nx * overlap * 0.5;
      b2.y += ny * overlap * 0.5;
    }
  }

  // Pocket detection
  for (const ball of balls) {
    if (ball.pocketed) continue;
    for (const pocket of POCKETS) {
      const dx = ball.x - pocket.x;
      const dy = ball.y - pocket.y;
      if (Math.sqrt(dx * dx + dy * dy) < pocket.r + BALL_RADIUS * 0.4) {
        ball.pocketed = true;
        ball.vx = 0;
        ball.vy = 0;
        pocketedIds.push(ball.id);
        if (ball.number === 0) turnInfo.cuePocketed = true;
        break;
      }
    }
  }

  const newlyActive = new Set(active.map(b => b.id));
  return { pocketedIds, newlyActive };
}

export function allStopped(balls: Ball[]): boolean {
  return balls.every(b => b.pocketed || (b.vx === 0 && b.vy === 0));
}

export function shootCueBall(cue: Ball, angle: number, power: number, maxSpeed: number): void {
  cue.vx = Math.cos(angle) * power * maxSpeed;
  cue.vy = Math.sin(angle) * power * maxSpeed;
}

export function placeCueBall(balls: Ball[], x: number, y: number): void {
  const cue = balls.find(b => b.number === 0);
  if (!cue) return;
  // Clamp to play area
  const margin = BALL_RADIUS + 2;
  cue.x = Math.max(TABLE.left + margin, Math.min(TABLE.right - margin, x));
  cue.y = Math.max(TABLE.top + margin, Math.min(TABLE.bottom - margin, y));
  cue.pocketed = false;
  cue.vx = 0;
  cue.vy = 0;
}
