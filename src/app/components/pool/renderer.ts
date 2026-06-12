import { Ball } from './types';
import {
  BALL_RADIUS, TABLE, POCKETS, BALL_COLORS, CANVAS_W, CANVAS_H,
} from './constants';

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  balls: Ball[],
  aimAngle: number,
  isPulling: boolean,
  pullDistance: number,
  power: number,
  phase: string,
  ballInHandPos: { x: number; y: number } | null,
  player1Group: string | null,
  player2Group: string | null,
  currentPlayer: number,
) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawBackground(ctx);
  drawTable(ctx);
  drawPockets(ctx);
  drawMarkings(ctx);

  const cue = balls.find(b => b.number === 0 && !b.pocketed);
  if (cue && phase === 'aiming') {
    drawAimLine(ctx, cue, aimAngle, balls);
    drawCueStick(ctx, cue, aimAngle, isPulling, pullDistance);
  }

  // Draw balls (non-cue first so cue is on top)
  for (const ball of balls) {
    if (!ball.pocketed && ball.number !== 0) drawBall(ctx, ball);
  }
  if (cue) drawBall(ctx, cue);

  if (ballInHandPos) {
    ctx.beginPath();
    ctx.arc(ballInHandPos.x, ballInHandPos.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);
    // Label
    ctx.fillStyle = 'white';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Place', ballInHandPos.x, ballInHandPos.y);
  }

  if (isPulling && phase === 'aiming') {
    drawPowerMeter(ctx, power);
  }
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const bg = ctx.createRadialGradient(CANVAS_W / 2, CANVAS_H / 2, 50, CANVAS_W / 2, CANVAS_H / 2, CANVAS_W * 0.7);
  bg.addColorStop(0, '#1e1208');
  bg.addColorStop(1, '#0a0704');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

function drawTable(ctx: CanvasRenderingContext2D) {
  const borderX = TABLE.left - 44;
  const borderY = TABLE.top - 44;
  const borderW = TABLE.width + 88;
  const borderH = TABLE.height + 88;

  // Outer shadow
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 30;
  ctx.fillStyle = '#3D2010';
  ctx.beginPath();
  (ctx as any).roundRect(borderX, borderY, borderW, borderH, 10);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Wood frame gradient
  const woodGrad = ctx.createLinearGradient(borderX, borderY, borderX + borderW, borderY + borderH);
  woodGrad.addColorStop(0, '#7A4928');
  woodGrad.addColorStop(0.3, '#5C3318');
  woodGrad.addColorStop(0.7, '#4A2810');
  woodGrad.addColorStop(1, '#6B3C22');
  ctx.fillStyle = woodGrad;
  ctx.beginPath();
  (ctx as any).roundRect(borderX, borderY, borderW, borderH, 10);
  ctx.fill();

  // Wood grain
  ctx.save();
  ctx.beginPath();
  (ctx as any).roundRect(borderX, borderY, borderW, borderH, 10);
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 30; i++) {
    const xi = borderX + (i / 30) * borderW;
    ctx.beginPath();
    ctx.moveTo(xi, borderY);
    ctx.bezierCurveTo(xi + 5, borderY + borderH * 0.3, xi - 3, borderY + borderH * 0.7, xi + 2, borderY + borderH);
    ctx.stroke();
  }
  ctx.restore();

  // Inner gold bead
  ctx.strokeStyle = '#B8860B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  (ctx as any).roundRect(TABLE.left - 22, TABLE.top - 22, TABLE.width + 44, TABLE.height + 44, 4);
  ctx.stroke();

  // Cushion rails (trapezoid shapes)
  const cushionColor = '#0A5C3E';
  const cushionHighlight = '#0E7050';
  const c = 22; // cushion depth

  // Top cushion (2 segments)
  const topMidGap = 34;
  const cx = TABLE.centerX;
  drawCushionSegment(ctx, [
    [TABLE.left + 15, TABLE.top], [cx - topMidGap, TABLE.top],
    [cx - topMidGap - 5, TABLE.top - c], [TABLE.left + 20, TABLE.top - c],
  ], cushionColor, cushionHighlight);
  drawCushionSegment(ctx, [
    [cx + topMidGap, TABLE.top], [TABLE.right - 15, TABLE.top],
    [TABLE.right - 20, TABLE.top - c], [cx + topMidGap + 5, TABLE.top - c],
  ], cushionColor, cushionHighlight);

  // Bottom cushion (2 segments)
  drawCushionSegment(ctx, [
    [TABLE.left + 15, TABLE.bottom], [cx - topMidGap, TABLE.bottom],
    [cx - topMidGap - 5, TABLE.bottom + c], [TABLE.left + 20, TABLE.bottom + c],
  ], cushionColor, cushionHighlight);
  drawCushionSegment(ctx, [
    [cx + topMidGap, TABLE.bottom], [TABLE.right - 15, TABLE.bottom],
    [TABLE.right - 20, TABLE.bottom + c], [cx + topMidGap + 5, TABLE.bottom + c],
  ], cushionColor, cushionHighlight);

  // Left cushion
  drawCushionSegment(ctx, [
    [TABLE.left, TABLE.top + 15], [TABLE.left, TABLE.bottom - 15],
    [TABLE.left - c, TABLE.bottom - 20], [TABLE.left - c, TABLE.top + 20],
  ], cushionColor, cushionHighlight);

  // Right cushion
  drawCushionSegment(ctx, [
    [TABLE.right, TABLE.top + 15], [TABLE.right, TABLE.bottom - 15],
    [TABLE.right + c, TABLE.bottom - 20], [TABLE.right + c, TABLE.top + 20],
  ], cushionColor, cushionHighlight);

  // Felt
  const feltGrad = ctx.createRadialGradient(TABLE.centerX, TABLE.centerY, 0, TABLE.centerX, TABLE.centerY, TABLE.width * 0.7);
  feltGrad.addColorStop(0, '#0E8055');
  feltGrad.addColorStop(1, '#0B6E4F');
  ctx.fillStyle = feltGrad;
  ctx.fillRect(TABLE.left, TABLE.top, TABLE.width, TABLE.height);

  // Subtle felt texture
  ctx.strokeStyle = 'rgba(255,255,255,0.018)';
  ctx.lineWidth = 1;
  for (let x = TABLE.left; x < TABLE.right; x += 12) {
    ctx.beginPath(); ctx.moveTo(x, TABLE.top); ctx.lineTo(x, TABLE.bottom); ctx.stroke();
  }
  for (let y = TABLE.top; y < TABLE.bottom; y += 12) {
    ctx.beginPath(); ctx.moveTo(TABLE.left, y); ctx.lineTo(TABLE.right, y); ctx.stroke();
  }

  // Felt border shadow
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 3;
  ctx.strokeRect(TABLE.left, TABLE.top, TABLE.width, TABLE.height);
}

function drawCushionSegment(
  ctx: CanvasRenderingContext2D,
  points: number[][],
  color: string,
  highlight: string
) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = highlight;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawMarkings(ctx: CanvasRenderingContext2D) {
  // Head string
  const headX = TABLE.left + TABLE.width * 0.25;
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 10]);
  ctx.beginPath();
  ctx.moveTo(headX, TABLE.top + 8);
  ctx.lineTo(headX, TABLE.bottom - 8);
  ctx.stroke();
  ctx.setLineDash([]);

  // Head spot
  dot(ctx, headX, TABLE.centerY, 3, 'rgba(255,255,255,0.25)');
  // Foot spot
  dot(ctx, TABLE.left + TABLE.width * 0.72, TABLE.centerY, 3, 'rgba(255,255,255,0.25)');
  // Center spot
  dot(ctx, TABLE.centerX, TABLE.centerY, 3, 'rgba(255,255,255,0.15)');
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawPockets(ctx: CanvasRenderingContext2D) {
  for (const pocket of POCKETS) {
    // Outer glow/shadow
    ctx.beginPath();
    ctx.arc(pocket.x, pocket.y, pocket.r + 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fill();

    // Hole
    const pg = ctx.createRadialGradient(pocket.x - 3, pocket.y - 3, 1, pocket.x, pocket.y, pocket.r);
    pg.addColorStop(0, '#1a0800');
    pg.addColorStop(0.5, '#050300');
    pg.addColorStop(1, '#000');
    ctx.beginPath();
    ctx.arc(pocket.x, pocket.y, pocket.r, 0, Math.PI * 2);
    ctx.fillStyle = pg;
    ctx.fill();

    // Brass ring
    ctx.beginPath();
    ctx.arc(pocket.x, pocket.y, pocket.r, 0, Math.PI * 2);
    ctx.strokeStyle = '#A07820';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Sheen
    ctx.beginPath();
    ctx.arc(pocket.x - pocket.r * 0.2, pocket.y - pocket.r * 0.2, pocket.r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,200,80,0.08)';
    ctx.fill();
  }
}

function lighten(hex: string, amount: number): string {
  try {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (n >> 16) + amount);
    const g = Math.min(255, ((n >> 8) & 0xff) + amount);
    const b = Math.min(255, (n & 0xff) + amount);
    return `rgb(${r},${g},${b})`;
  } catch { return hex; }
}
function darken(hex: string, amount: number): string {
  try {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (n >> 16) - amount);
    const g = Math.max(0, ((n >> 8) & 0xff) - amount);
    const b = Math.max(0, (n & 0xff) - amount);
    return `rgb(${r},${g},${b})`;
  } catch { return hex; }
}

function drawBall(ctx: CanvasRenderingContext2D, ball: Ball) {
  if (ball.pocketed) return;
  const { x, y } = ball;
  const r = BALL_RADIUS;

  // Shadow
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 4, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fill();

  if (ball.number === 0) {
    // Cue ball
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.05, x, y, r);
    g.addColorStop(0, '#FFFFFF');
    g.addColorStop(0.65, '#F0F0F0');
    g.addColorStop(1, '#BBBBBB');
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1; ctx.stroke();
  } else {
    const color = BALL_COLORS[ball.number] || '#888';
    const isStripe = ball.number >= 9;

    if (isStripe) {
      // White base
      const bg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.05, x, y, r);
      bg.addColorStop(0, '#FAFAFA'); bg.addColorStop(1, '#D0D0D0');
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = bg; ctx.fill();

      // Color stripe band
      ctx.save();
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = color;
      ctx.fillRect(x - r, y - r * 0.42, r * 2, r * 0.84);
      ctx.restore();
    } else {
      const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.05, x, y, r);
      g.addColorStop(0, lighten(color, 55));
      g.addColorStop(0.55, color);
      g.addColorStop(1, darken(color, 45));
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
    }

    // Outline
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 1; ctx.stroke();

    // Number disc (white)
    ctx.beginPath(); ctx.arc(x, y, r * 0.43, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF'; ctx.fill();

    // Number text
    ctx.fillStyle = '#111';
    const fontSize = ball.number >= 10 ? Math.round(r * 0.52) : Math.round(r * 0.60);
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(ball.number), x, y + 0.5);
  }

  // Shine highlight
  ctx.beginPath();
  ctx.arc(x - r * 0.27, y - r * 0.27, r * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  ctx.fill();

  // Smaller secondary shine
  ctx.beginPath();
  ctx.arc(x - r * 0.1, y - r * 0.15, r * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fill();
}

function drawAimLine(
  ctx: CanvasRenderingContext2D,
  cue: Ball,
  angle: number,
  balls: Ball[],
) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);

  // Find first collision with ball or wall
  let hitDist = 600;
  let hitNx = 0, hitNy = 0;
  let didHitBall = false;

  for (const ball of balls) {
    if (ball.pocketed || ball.number === 0) continue;
    // Distance from ray to ball center
    const toBallX = ball.x - cue.x;
    const toBallY = ball.y - cue.y;
    const proj = toBallX * dx + toBallY * dy;
    if (proj < 0) continue;
    const perpDist = Math.sqrt(Math.max(0, toBallX * toBallX + toBallY * toBallY - proj * proj));
    if (perpDist < BALL_RADIUS * 2) {
      const d = proj - Math.sqrt(Math.max(0, (BALL_RADIUS * 2) ** 2 - perpDist ** 2));
      if (d > 0 && d < hitDist) {
        hitDist = d;
        // Normal from cue to ball at impact
        const hitX = cue.x + dx * d;
        const hitY = cue.y + dy * d;
        const nx = ball.x - hitX;
        const ny = ball.y - hitY;
        const nl = Math.sqrt(nx * nx + ny * ny);
        hitNx = nx / nl; hitNy = ny / nl;
        didHitBall = true;
      }
    }
  }

  // Main aim line
  ctx.beginPath();
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = 'rgba(255,255,210,0.45)';
  ctx.lineWidth = 1.2;
  ctx.moveTo(cue.x, cue.y);
  ctx.lineTo(cue.x + dx * hitDist, cue.y + dy * hitDist);
  ctx.stroke();
  ctx.setLineDash([]);

  // Continuation arrow at cue ball direction (ghost line)
  if (didHitBall) {
    const impactX = cue.x + dx * hitDist;
    const impactY = cue.y + dy * hitDist;
    // Reflect: r = d - 2(d·n)n
    const dot2 = dx * hitNx + dy * hitNy;
    const rx = dx - 2 * dot2 * hitNx;
    const ry = dy - 2 * dot2 * hitNy;
    ctx.beginPath();
    ctx.setLineDash([4, 8]);
    ctx.strokeStyle = 'rgba(255,255,200,0.2)';
    ctx.lineWidth = 1;
    ctx.moveTo(impactX, impactY);
    ctx.lineTo(impactX + hitNx * 80, impactY + hitNy * 80);
    ctx.stroke();
    ctx.setLineDash([]);

    // Ghost ball at impact point
    ctx.beginPath();
    ctx.arc(impactX, impactY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function drawCueStick(
  ctx: CanvasRenderingContext2D,
  cue: Ball,
  angle: number,
  isPulling: boolean,
  pullDistance: number,
) {
  const pullback = isPulling ? Math.min(pullDistance * 0.25, 45) : 0;
  const offset = BALL_RADIUS + 10 + pullback;
  const length = 195;

  const tipX = cue.x - Math.cos(angle) * offset;
  const tipY = cue.y - Math.sin(angle) * offset;
  const butX = tipX - Math.cos(angle) * length;
  const butY = tipY - Math.sin(angle) * length;

  // Cue shadow
  ctx.beginPath();
  ctx.moveTo(tipX + 2, tipY + 2);
  ctx.lineTo(butX + 2, butY + 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Cue shaft
  const shaftGrad = ctx.createLinearGradient(tipX, tipY, butX, butY);
  shaftGrad.addColorStop(0, '#F5EAD0');
  shaftGrad.addColorStop(0.12, '#E8D4A8');
  shaftGrad.addColorStop(0.45, '#C8A86A');
  shaftGrad.addColorStop(0.7, '#9A7230');
  shaftGrad.addColorStop(1, '#3E1E00');

  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(butX, butY);
  ctx.strokeStyle = shaftGrad;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Wrap rings near butt
  for (let i = 0; i < 5; i++) {
    const t = 0.52 + i * 0.055;
    const wx = tipX + (butX - tipX) * t;
    const wy = tipY + (butY - tipY) * t;
    ctx.beginPath();
    ctx.arc(wx, wy, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? '#3A80C4' : '#F0F0F0';
    ctx.fill();
  }

  // Cue tip
  ctx.beginPath();
  ctx.arc(tipX, tipY, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#4A7EC8';
  ctx.fill();
  ctx.strokeStyle = '#1E4A90';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawPowerMeter(ctx: CanvasRenderingContext2D, power: number) {
  const x = 18;
  const y = CANVAS_H - 130;
  const w = 22;
  const h = 110;
  const segments = 10;

  // Background
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.beginPath();
  (ctx as any).roundRect(x - 6, y - 8, w + 12, h + 28, 6);
  ctx.fill();

  // Segments
  for (let i = 0; i < segments; i++) {
    const segY = y + ((segments - 1 - i) / segments) * h;
    const segH = h / segments - 2;
    const filled = i / segments < power;

    if (filled) {
      const ratio = i / (segments - 1);
      const r = Math.round(40 + 215 * ratio);
      const g = Math.round(220 - 200 * ratio);
      ctx.fillStyle = `rgb(${r},${g},20)`;
    } else {
      ctx.fillStyle = 'rgba(80,80,80,0.45)';
    }
    ctx.beginPath();
    (ctx as any).roundRect(x, segY, w, segH, 2);
    ctx.fill();
  }

  // Label
  ctx.fillStyle = '#F4B400';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('PWR', x + w / 2, y + h + 6);
}
