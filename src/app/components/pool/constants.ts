export const BALL_RADIUS = 13;
export const FRICTION = 0.9875;
export const MIN_SPEED = 0.07;
export const CUSHION_RESTITUTION = 0.80;
export const MAX_SHOT_POWER = 22;

export const CANVAS_W = 1000;
export const CANVAS_H = 560;

export const TABLE = {
  left: 64,
  top: 64,
  right: 936,
  bottom: 496,
  get width() { return this.right - this.left; },
  get height() { return this.bottom - this.top; },
  get centerX() { return (this.left + this.right) / 2; },
  get centerY() { return (this.top + this.bottom) / 2; },
};

export const POCKET_RADIUS = 20;
export const CORNER_POCKET_RADIUS = 18;

export const POCKETS = [
  { x: TABLE.left - 1, y: TABLE.top - 1, r: CORNER_POCKET_RADIUS },
  { x: (TABLE.left + TABLE.right) / 2, y: TABLE.top - 5, r: POCKET_RADIUS },
  { x: TABLE.right + 1, y: TABLE.top - 1, r: CORNER_POCKET_RADIUS },
  { x: TABLE.left - 1, y: TABLE.bottom + 1, r: CORNER_POCKET_RADIUS },
  { x: (TABLE.left + TABLE.right) / 2, y: TABLE.bottom + 5, r: POCKET_RADIUS },
  { x: TABLE.right + 1, y: TABLE.bottom + 1, r: CORNER_POCKET_RADIUS },
];

export const BALL_COLORS: Record<number, string> = {
  1: '#F0C020',
  2: '#1A3EAD',
  3: '#C62828',
  4: '#6A1FAC',
  5: '#E65100',
  6: '#1B7A30',
  7: '#8B2500',
  8: '#1A1A1A',
  9: '#F0C020',
  10: '#1A3EAD',
  11: '#C62828',
  12: '#6A1FAC',
  13: '#E65100',
  14: '#1B7A30',
  15: '#8B2500',
};

export const CUE_START = {
  x: TABLE.left + (TABLE.right - TABLE.left) * 0.25,
  y: (TABLE.top + TABLE.bottom) / 2,
};

export const RACK_APEX = {
  x: TABLE.left + (TABLE.right - TABLE.left) * 0.72,
  y: (TABLE.top + TABLE.bottom) / 2,
};
