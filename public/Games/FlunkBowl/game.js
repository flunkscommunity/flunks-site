// ============================================================================
// FLUNK BOWL - 8-Bit Retro Bowling for Flunks: Semester Zero
// ============================================================================
// We render at a small "pixel" resolution then scale up for that chunky look.

const canvas = document.getElementById('bowling-canvas');
const ctx = canvas.getContext('2d');

// Internal pixel resolution — big enough for readable text, still chunky
const PW = 420;  // pixel width
const PH = 500;  // pixel height

// Display scale
const SCALE = 2;
canvas.width = PW * SCALE;
canvas.height = PH * SCALE;
canvas.style.width = (PW * SCALE) + 'px';
canvas.style.height = (PH * SCALE) + 'px';
ctx.imageSmoothingEnabled = false;

// We'll draw to an offscreen canvas at native res, then blit scaled
const off = document.createElement('canvas');
off.width = PW;
off.height = PH;
const oc = off.getContext('2d');
oc.imageSmoothingEnabled = false;

const W = PW;
const H = PH;

// ============================================================================
// LAYOUT CONSTANTS — straight lanes, no perspective
// ============================================================================

const SCOREBOARD_H = 74;          // top scoreboard height (bigger for readable text)
const LANE_TOP = SCOREBOARD_H + 4;
const LANE_BOT = H - 8;
const LANE_W = 100;               // player lane width in px
const GUTTER_W = 8;
const LANE_CX = W / 2;           // center x of player lane
const LANE_L = LANE_CX - LANE_W / 2;
const LANE_R = LANE_CX + LANE_W / 2;

// Neighbor lane width (they're just backdrop)
const NEIGHBOR_LANE_W = 70;

// Pin layout (flat, in lane coords — no perspective)
// Ball rolls UPWARD (negative Y), so row 0 (4 pins) is at top = back, 
// row 3 (headpin) is at bottom = closest to bowler
const PIN_AREA_TOP = LANE_TOP + 20;
const PIN_SPACING_X = 16;
const PIN_SPACING_Y = 14;
const PIN_R = 5;                  // pin collision radius
const BALL_R = 6;                 // ball radius

// Ball start
const BALL_START_Y = LANE_BOT - 24;

// ============================================================================
// COLORS (8-bit palette)
// ============================================================================
const C = {
  bg:         '#181425',
  lanewood:   '#C4983A',
  lanewood2:  '#B8882E',
  lanelight:  '#D4A84A',
  laneline:   '#A07820',
  gutter:     '#333',
  gutterLine: '#222',
  pinWhite:   '#FFF',
  pinRed:     '#E03030',
  pinOutline: '#888',
  ball:       '#7B2FBE',
  ballHi:     '#A855F7',
  ballHole:   '#3A0068',
  foul:       '#E03030',
  neon1:      '#FF00FF',
  neon2:      '#00FFFF',
  neon3:      '#FFD700',
  neon4:      '#FF69B4',
  scoreBg:    '#0D001A',
  scoreBox:   '#1A0033',
  scoreBorder:'#FFD700',
  scoreText:  '#00FF00',
  scoreNum:   '#FFD700',
  active:     '#00FF00',
  dim:        '#555',
  white:      '#FFF',
  black:      '#000',
  wallDark:   '#12062a',
  wallMid:    '#1e0a3e',
  neighborDim:'#7A6420',
  neighborDim2:'#6A5818',
};

// ============================================================================
// GAME STATE
// ============================================================================

const Phase = {
  TITLE: 0, AIMING: 1, POWER: 2, ROLLING: 3,
  PIN_SETTLE: 4, FRAME_RESULT: 5, GAME_OVER: 6,
};

const S = {
  phase: Phase.TITLE,
  // aim
  aimX: 0,             // -1..1, oscillates
  aimDir: 1,
  aimSpeed: 0.03,
  // power
  power: 0,
  powerDir: 1,
  powerSpeed: 0.025,
  // ball — uses flat lane coordinates (same space as pins)
  bx: LANE_CX,
  by: BALL_START_Y,
  bvx: 0,
  bvy: 0,
  bspin: 0,
  rolling: false,
  gutter: false,
  // pins
  pins: [],
  firstRollDown: 0,
  // scoring
  frames: [],
  frame: 0,
  roll: 0,
  total: 0,
  // fx
  particles: [],
  shake: 0,
  msg: '',
  msgTimer: 0,
  msgColor: '#FFF',
  // title blink
  titleBlink: 0,
};

// ============================================================================
// PINS
// ============================================================================

function makePins() {
  const pins = [];
  // Row 0 (top/back): 4 pins — farthest from bowler
  // Row 3 (bottom/front): 1 headpin — closest to bowler
  const rows = [[-3,-1,1,3], [-2,0,2], [-1,1], [0]];
  let id = 0;
  for (let r = 0; r < rows.length; r++) {
    for (const off of rows[r]) {
      const px = LANE_CX + off * (PIN_SPACING_X / 2);
      const py = PIN_AREA_TOP + r * PIN_SPACING_Y;
      pins.push({
        id: id++, x: px, y: py,
        ox: px, oy: py,
        vx: 0, vy: 0,
        rot: 0, rotV: 0,
        up: true, falling: false,
        alpha: 1,
      });
    }
  }
  return pins;
}

function resetPins() { S.pins = makePins(); }

// ============================================================================
// SCORING
// ============================================================================

function initScoring() {
  S.frames = [];
  for (let i = 0; i < 10; i++) S.frames.push({ rolls: [], disp: [], score: null });
  S.frame = 0; S.roll = 0; S.total = 0; S.firstRollDown = 0;
}

function recordRoll(n) {
  const f = S.frames[S.frame];
  f.rolls.push(n);
  // display char
  if (S.roll === 0 && n === 10) f.disp.push('X');
  else if (S.roll === 1 && f.rolls[0] + n === 10) f.disp.push('/');
  else if (S.frame === 9 && S.roll >= 1) {
    if (n === 10) f.disp.push('X');
    else {
      const prev = f.rolls[S.roll - 1] || 0;
      if (prev !== 10 && prev + n === 10) f.disp.push('/');
      else f.disp.push(n === 0 ? '-' : '' + n);
    }
  } else f.disp.push(n === 0 ? '-' : '' + n);
  calcScores();
}

function calcScores() {
  const all = []; S.frames.forEach(f => f.rolls.forEach(r => all.push(r)));
  let ri = 0, tot = 0;
  for (let f = 0; f < 10; f++) {
    const fr = S.frames[f];
    if (ri >= all.length) { fr.score = null; continue; }
    if (f < 9) {
      if (all[ri] === 10) {
        if (ri + 2 < all.length) { tot += 10 + all[ri+1] + all[ri+2]; fr.score = tot; }
        else fr.score = null;
        ri++;
      } else if (ri + 1 < all.length) {
        if (all[ri] + all[ri+1] === 10) {
          if (ri + 2 < all.length) { tot += 10 + all[ri+2]; fr.score = tot; }
          else fr.score = null;
        } else { tot += all[ri] + all[ri+1]; fr.score = tot; }
        ri += 2;
      } else { fr.score = null; ri++; }
    } else {
      let ft = 0;
      for (let r = 0; r < fr.rolls.length; r++) ft += all[ri + r];
      const max = (fr.rolls[0] === 10 || (fr.rolls.length >= 2 && fr.rolls[0] + fr.rolls[1] === 10)) ? 3 : 2;
      if (fr.rolls.length >= max) { tot += ft; fr.score = tot; }
      else fr.score = null;
      ri += fr.rolls.length;
    }
  }
  S.total = tot;
}

function frameComplete() {
  const f = S.frames[S.frame];
  if (S.frame < 9) {
    if (!f.rolls.length) return false;
    if (f.rolls[0] === 10) return true;
    return f.rolls.length >= 2;
  }
  if (f.rolls.length < 2) return false;
  if (f.rolls[0] === 10 || f.rolls[0] + f.rolls[1] === 10) return f.rolls.length >= 3;
  return f.rolls.length >= 2;
}

function advanceFrame() {
  if (S.frame >= 9 && frameComplete()) { S.phase = Phase.GAME_OVER; return; }
  if (frameComplete()) {
    S.frame++; S.roll = 0; S.firstRollDown = 0; resetPins();
  } else {
    S.roll++;
    if (S.frame === 9) {
      const f = S.frames[9];
      if ((f.rolls.length === 1 && f.rolls[0] === 10) ||
          (f.rolls.length === 2 && f.rolls[0] + f.rolls[1] === 10)) {
        resetPins();
      }
    }
  }
}

// ============================================================================
// DRAW HELPERS — pixelated primitives
// ============================================================================

function pxRect(x, y, w, h, col) { oc.fillStyle = col; oc.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function pxLine(x1, y1, x2, y2, col) {
  // Bresenham-ish thick pixel line
  oc.strokeStyle = col; oc.lineWidth = 1;
  oc.beginPath(); oc.moveTo(Math.round(x1)+.5, Math.round(y1)+.5);
  oc.lineTo(Math.round(x2)+.5, Math.round(y2)+.5); oc.stroke();
}
function pxText(str, x, y, col, size) {
  oc.fillStyle = col;
  oc.font = 'bold ' + (size || 8) + 'px monospace';
  oc.textAlign = 'left';
  oc.fillText(str, Math.round(x), Math.round(y));
}
function pxTextCenter(str, x, y, col, size) {
  oc.fillStyle = col;
  oc.font = 'bold ' + (size || 8) + 'px monospace';
  oc.textAlign = 'center';
  oc.fillText(str, Math.round(x), Math.round(y));
}

// ============================================================================
// DRAW — 8-BIT SCOREBOARD (top of screen)
// ============================================================================

function drawScoreboard() {
  // Background bar
  pxRect(0, 0, W, SCOREBOARD_H, C.scoreBg);
  
  // "FLUNK BOWL" banner at very top
  pxTextCenter('FLUNK BOWL', W/2, 12, C.neon3, 12);
  
  const boxW = 36;
  const boxH = 30;
  const gap = 2;
  const startX = (W - boxW * 10 - 9 * gap) / 2;
  const boxY = 18;
  
  for (let i = 0; i < 10; i++) {
    const bx = startX + i * (boxW + gap);
    const f = S.frames[i];
    const isActive = (i === S.frame && S.phase !== Phase.TITLE && S.phase !== Phase.GAME_OVER);
    
    // Box border
    const borderCol = isActive ? C.active : C.scoreBorder;
    pxRect(bx, boxY, boxW, boxH, borderCol);
    pxRect(bx + 1, boxY + 1, boxW - 2, boxH - 2, C.scoreBox);
    
    // Frame number (top center of box)
    pxTextCenter('' + (i + 1), bx + boxW/2, boxY + 10, C.dim, 7);
    
    // Roll display — small boxes in top right corner
    if (f && f.disp.length) {
      for (let r = 0; r < f.disp.length; r++) {
        const rx = bx + boxW - 10 - (f.disp.length - 1 - r) * 10;
        const ry = boxY + 2;
        pxRect(rx - 1, ry, 9, 9, '#000');
        const ch = f.disp[r];
        const chCol = ch === 'X' ? '#FF4444' : ch === '/' ? '#44FF44' : C.scoreText;
        pxTextCenter(ch, rx + 3, ry + 8, chCol, 7);
      }
    }
    
    // Score total (bottom of box)
    if (f && f.score !== null) {
      pxTextCenter('' + f.score, bx + boxW/2, boxY + 26, C.scoreNum, 9);
    }
  }
  
  // Info bar below boxes
  const totalY = boxY + boxH + 3;
  pxRect(0, totalY, W, 16, C.scoreBg);
  
  // Frame / Roll on left
  if (S.phase !== Phase.TITLE && S.phase !== Phase.GAME_OVER) {
    pxText('F' + (S.frame + 1) + ' R' + (S.roll + 1), 6, totalY + 12, C.active, 9);
  }
  
  // Total on right (big & bold)
  oc.textAlign = 'right';
  oc.fillStyle = C.scoreNum;
  oc.font = 'bold 11px monospace';
  oc.fillText('TOTAL: ' + S.total, W - 6, totalY + 12);
  oc.textAlign = 'left';
  
  // Bottom border line (neon)
  pxRect(0, SCOREBOARD_H - 2, W, 3, C.neon3);
}

// ============================================================================
// DRAW — LANES (straight, parallel, pixelated)
// ============================================================================

function drawLanes() {
  const top = LANE_TOP;
  const bot = LANE_BOT;
  const h = bot - top;
  
  // ---- LEFT NEIGHBOR LANES (2 lanes) ----
  for (let n = 1; n <= 2; n++) {
    const cx = LANE_CX - n * (LANE_W + GUTTER_W * 2 + 4);
    const lw = NEIGHBOR_LANE_W;
    const ll = cx - lw/2;
    const lr = cx + lw/2;
    const dim = n === 1 ? 0.6 : 0.3;
    
    oc.globalAlpha = dim;
    // Lane wood
    pxRect(ll, top, lw, h, C.neighborDim);
    // Plank lines
    for (let p = -2; p <= 2; p++) {
      pxLine(cx + p * (lw/5), top, cx + p * (lw/5), bot, C.neighborDim2);
    }
    // Gutters
    pxRect(ll - GUTTER_W, top, GUTTER_W, h, C.gutter);
    pxRect(lr, top, GUTTER_W, h, C.gutter);
    // Fake pins (static decor) — same triangle as player: 4 at back, 1 headpin front
    const fakeRows = [[-3,-1,1,3],[-2,0,2],[-1,1],[0]];
    for (let r = 0; r < fakeRows.length; r++) {
      for (const off of fakeRows[r]) {
        const px = cx + off * 6;
        const py = PIN_AREA_TOP + r * 10;
        pxRect(px - 2, py - 3, 5, 7, '#ccc');
        pxRect(px - 1, py - 1, 3, 1, C.pinRed);
      }
    }
    oc.globalAlpha = 1;
  }
  
  // ---- RIGHT NEIGHBOR LANES (2 lanes) ----
  for (let n = 1; n <= 2; n++) {
    const cx = LANE_CX + n * (LANE_W + GUTTER_W * 2 + 4);
    const lw = NEIGHBOR_LANE_W;
    const ll = cx - lw/2;
    const lr = cx + lw/2;
    const dim = n === 1 ? 0.6 : 0.3;
    
    oc.globalAlpha = dim;
    pxRect(ll, top, lw, h, C.neighborDim);
    for (let p = -2; p <= 2; p++) {
      pxLine(cx + p * (lw/5), top, cx + p * (lw/5), bot, C.neighborDim2);
    }
    pxRect(ll - GUTTER_W, top, GUTTER_W, h, C.gutter);
    pxRect(lr, top, GUTTER_W, h, C.gutter);
    const fakeRows = [[-3,-1,1,3],[-2,0,2],[-1,1],[0]];
    for (let r = 0; r < fakeRows.length; r++) {
      for (const off of fakeRows[r]) {
        const px = cx + off * 6;
        const py = PIN_AREA_TOP + r * 10;
        pxRect(px - 2, py - 3, 5, 7, '#ccc');
        pxRect(px - 1, py - 1, 3, 1, C.pinRed);
      }
    }
    oc.globalAlpha = 1;
  }
  
  // ---- PLAYER LANE (center, full brightness) ----
  // Lane wood
  pxRect(LANE_L, top, LANE_W, h, C.lanewood);
  
  // Plank lines (vertical stripes for wood grain)
  for (let p = 0; p <= 8; p++) {
    const lx = LANE_L + p * (LANE_W / 8);
    pxLine(lx, top, lx, bot, C.laneline);
  }
  
  // Alternating plank shading
  for (let p = 0; p < 8; p++) {
    if (p % 2 === 0) {
      const lx = LANE_L + p * (LANE_W / 8);
      pxRect(lx, top, LANE_W / 8, h, C.lanelight);
    }
  }
  
  // Gutters
  pxRect(LANE_L - GUTTER_W, top, GUTTER_W, h, C.gutter);
  pxLine(LANE_L - GUTTER_W, top, LANE_L - GUTTER_W, bot, C.gutterLine);
  pxRect(LANE_R, top, GUTTER_W, h, C.gutter);
  pxLine(LANE_R + GUTTER_W, top, LANE_R + GUTTER_W, bot, C.gutterLine);
  
  // Foul line
  pxRect(LANE_L - GUTTER_W, LANE_BOT - 80, LANE_W + GUTTER_W * 2, 3, C.foul);
  
  // Arrow markers
  const arrowY = LANE_BOT - 160;
  for (let i = -3; i <= 3; i++) {
    const ax = LANE_CX + i * 10;
    // Pixel arrow pointing up
    pxRect(ax, arrowY, 2, 4, C.laneline);
    pxRect(ax - 1, arrowY + 4, 4, 1, C.laneline);
  }
  
  // Approach dots
  for (let i = -2; i <= 2; i++) {
    pxRect(LANE_CX + i * 12 - 1, LANE_BOT - 50, 3, 3, '#FFF');
  }
  
  // Pin area backdrop (behind pins)
  pxRect(LANE_L - GUTTER_W, top, LANE_W + GUTTER_W * 2, 8, '#111');
  
  // Neon edge highlights on player lane
  const t = Date.now() * 0.004;
  const neonCols = [C.neon1, C.neon2, C.neon3, C.neon4];
  const nc = neonCols[Math.floor(t) % 4];
  pxLine(LANE_L - GUTTER_W - 1, top, LANE_L - GUTTER_W - 1, bot, nc);
  pxLine(LANE_R + GUTTER_W + 1, top, LANE_R + GUTTER_W + 1, bot, nc);
}

// ============================================================================
// DRAW — PINS (pixelated)
// ============================================================================

function drawPin(p) {
  if (!p.up && !p.falling) return;
  oc.globalAlpha = p.alpha;
  const x = Math.round(p.x);
  const y = Math.round(p.y);
  
  if (p.falling) {
    // Fallen pin — small rotated shape
    oc.save();
    oc.translate(x, y);
    oc.rotate(p.rot);
    pxRect(-4, -3, 8, 5, C.pinWhite);
    pxRect(-3, 0, 6, 1, C.pinRed);
    oc.restore();
  } else {
    // Standing pin — pixel art pin shape
    // Head (round top)
    pxRect(x - 2, y - PIN_R - 3, 5, 3, C.pinWhite);
    // Neck
    pxRect(x - 1, y - PIN_R, 3, 2, C.pinWhite);
    // Body (wider)
    pxRect(x - 3, y - PIN_R + 2, 7, 5, C.pinWhite);
    pxRect(x - 4, y - PIN_R + 5, 9, 3, C.pinWhite);
    // Red stripe
    pxRect(x - 3, y - PIN_R + 3, 7, 2, C.pinRed);
    // Base
    pxRect(x - 3, y + PIN_R - 1, 7, 2, '#ddd');
    // Outline dots for depth
    pxRect(x - 4, y - PIN_R + 4, 1, 2, C.pinOutline);
    pxRect(x + 4, y - PIN_R + 4, 1, 2, C.pinOutline);
  }
  oc.globalAlpha = 1;
}

// ============================================================================
// DRAW — BALL (pixelated)
// ============================================================================

function drawBall() {
  if (S.phase === Phase.TITLE || S.phase === Phase.GAME_OVER) return;
  const x = Math.round(S.bx);
  const y = Math.round(S.by);
  
  // Shadow
  pxRect(x - BALL_R + 1, y + BALL_R, BALL_R * 2, 3, 'rgba(0,0,0,0.3)');
  
  // Ball body (circle via pixels)
  for (let py = -BALL_R; py <= BALL_R; py++) {
    const hw = Math.round(Math.sqrt(BALL_R * BALL_R - py * py));
    pxRect(x - hw, y + py, hw * 2 + 1, 1, C.ball);
  }
  // Highlight
  pxRect(x - 3, y - 4, 3, 2, C.ballHi);
  pxRect(x - 2, y - 3, 2, 1, '#D4A0FF');
  // Finger holes
  pxRect(x - 2, y - 1, 2, 2, C.ballHole);
  pxRect(x + 1, y - 1, 2, 2, C.ballHole);
  pxRect(x, y + 2, 2, 2, C.ballHole);
}

// ============================================================================
// DRAW — AIM INDICATOR
// ============================================================================

function drawAim() {
  if (S.phase !== Phase.AIMING) return;
  
  const angle = S.aimX * 0.35;
  const len = 80;
  const sx = Math.round(S.bx);
  const sy = Math.round(S.by);
  const ex = Math.round(sx + Math.sin(angle) * len);
  const ey = Math.round(sy - Math.cos(angle) * len);
  
  // Dashed pixel line
  const steps = 20;
  for (let i = 0; i < steps; i++) {
    if (i % 3 === 0) continue; // gaps
    const t = i / steps;
    const px = Math.round(sx + (ex - sx) * t);
    const py = Math.round(sy + (ey - sy) * t);
    pxRect(px, py, 1, 1, C.active);
  }
  // Arrow tip
  pxRect(ex - 1, ey - 1, 3, 3, C.active);
  
  // Label
  pxTextCenter('< AIM >', W/2, H - 6, C.active, 9);
}

// ============================================================================
// DRAW — POWER METER
// ============================================================================

function drawPower() {
  if (S.phase !== Phase.POWER) return;
  
  const mx = W - 22;
  const my = LANE_TOP + 14;
  const mw = 10;
  const mh = 180;
  
  // Border
  pxRect(mx - 1, my - 1, mw + 2, mh + 2, C.scoreBorder);
  pxRect(mx, my, mw, mh, '#000');
  
  // Fill
  const fillH = Math.round(S.power * mh);
  // Color gradient (green -> yellow -> red)
  for (let i = 0; i < fillH; i++) {
    const t = i / mh;
    let col;
    if (t < 0.4) col = '#00CC00';
    else if (t < 0.7) col = '#CCCC00';
    else if (t < 0.9) col = '#CC6600';
    else col = '#CC0000';
    pxRect(mx + 1, my + mh - 1 - i, mw - 2, 1, col);
  }
  
  // Label
  pxTextCenter('PWR', mx + mw/2, my - 6, C.neon1, 8);
  pxTextCenter('CLICK!', W/2, H - 6, '#FFFF00', 10);
}

// ============================================================================
// DRAW — PARTICLES
// ============================================================================

function drawParticles() {
  S.particles.forEach(p => {
    oc.globalAlpha = p.life;
    pxRect(Math.round(p.x), Math.round(p.y), Math.max(1, Math.round(p.size)), Math.max(1, Math.round(p.size)), p.color);
  });
  oc.globalAlpha = 1;
}

function spawnParticles(x, y, n, col) {
  for (let i = 0; i < n; i++) {
    S.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      size: Math.random() * 2 + 1,
      life: 1,
      decay: Math.random() * 0.03 + 0.015,
      color: col || [C.neon3, C.neon4, C.neon2, C.neon1][Math.floor(Math.random()*4)],
    });
  }
}

function spawnStrikeEffect() {
  for (let i = 0; i < 30; i++) {
    const a = (Math.PI * 2 / 30) * i;
    const spd = Math.random() * 3 + 1.5;
    S.particles.push({
      x: LANE_CX, y: PIN_AREA_TOP + 20,
      vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
      size: Math.random() * 3 + 1,
      life: 1, decay: 0.018,
      color: [C.neon3, '#FF0000', C.active, C.neon1, C.neon2][Math.floor(Math.random()*5)],
    });
  }
}

// ============================================================================
// DRAW — MESSAGE OVERLAY
// ============================================================================

function drawMessage() {
  if (S.msgTimer <= 0) return;
  const alpha = Math.min(1, S.msgTimer / 15);
  oc.globalAlpha = alpha;
  pxTextCenter(S.msg, W/2, H/2 - 30, S.msgColor, 14);
  oc.globalAlpha = 1;
}

// ============================================================================
// DRAW — TITLE SCREEN
// ============================================================================

function drawTitle() {
  if (S.phase !== Phase.TITLE) return;
  
  // Darken
  pxRect(0, 0, W, H, 'rgba(10,10,26,0.85)');
  
  // Title
  pxTextCenter('FLUNK BOWL', W/2, H/2 - 70, C.neon3, 20);
  
  // Subtitle
  pxTextCenter('SEMESTER ZERO', W/2, H/2 - 42, C.neon1, 11);
  pxTextCenter('BOWLING ALLEY', W/2, H/2 - 26, C.neon1, 11);
  
  // Frog
  pxTextCenter('\u{1F438}', W/2, H/2 + 10, C.white, 28);
  
  // Blink
  S.titleBlink += 0.05;
  if (Math.sin(S.titleBlink) > 0) {
    pxTextCenter('CLICK TO PLAY', W/2, H/2 + 55, '#FFFF00', 12);
  }
  
  pxTextCenter('AIM > POWER > BOWL!', W/2, H/2 + 80, C.dim, 9);
}

// ============================================================================
// DRAW — GAME OVER SCREEN
// ============================================================================

function drawGameOver() {
  if (S.phase !== Phase.GAME_OVER) return;
  
  pxRect(0, SCOREBOARD_H, W, H - SCOREBOARD_H, 'rgba(10,10,26,0.88)');
  
  pxTextCenter('GAME OVER', W/2, H/2 - 55, C.neon3, 18);
  pxTextCenter('' + S.total, W/2, H/2 - 15, C.active, 24);
  
  let msg;
  if (S.total >= 250) msg = 'LEGENDARY!';
  else if (S.total >= 200) msg = 'AMAZING!';
  else if (S.total >= 150) msg = 'GREAT GAME!';
  else if (S.total >= 100) msg = 'SOLID!';
  else if (S.total >= 50) msg = 'KEEP TRYING!';
  else msg = 'OOF...';
  pxTextCenter(msg, W/2, H/2 + 20, C.neon4, 12);
  
  S.titleBlink += 0.05;
  if (Math.sin(S.titleBlink) > 0) {
    pxTextCenter('CLICK TO RETRY', W/2, H/2 + 50, '#FFFF00', 12);
  }
}

// ============================================================================
// PHYSICS — BALL (flat coordinates, no perspective distortion)
// ============================================================================

function launchBall() {
  const angle = S.aimX * 0.35;  // aiming angle
  const speed = 2.5 + S.power * 5;
  
  S.bvx = Math.sin(angle) * speed;
  S.bvy = -Math.cos(angle) * speed;
  S.bspin = S.aimX * 0.15 * S.power;
  S.rolling = true;
  S.gutter = false;
  S.phase = Phase.ROLLING;
}

function updateBall() {
  if (!S.rolling) return;
  
  // Spin curves the ball
  S.bvx += S.bspin * 0.01;
  
  // Friction
  S.bvy *= 0.997;
  S.bvx *= 0.998;
  
  S.bx += S.bvx;
  S.by += S.bvy;
  
  // Gutter check (straight lane, no perspective)
  if (S.bx < LANE_L + BALL_R) {
    S.gutter = true;
    S.bx = LANE_L - GUTTER_W/2; // roll in gutter
    S.bvx = 0;
  }
  if (S.bx > LANE_R - BALL_R) {
    S.gutter = true;
    S.bx = LANE_R + GUTTER_W/2;
    S.bvx = 0;
  }
  
  // Pin collisions (continuous — check every frame while in pin zone)
  if (!S.gutter) {
    checkPinCollisions();
  }
  
  // Ball past pin area — end roll
  if (S.by < LANE_TOP - 5) {
    endRoll();
  }
}

// ============================================================================
// PHYSICS — PIN COLLISIONS (fixed! same coordinate space)
// ============================================================================

function checkPinCollisions() {
  const br = BALL_R;
  
  // Ball-to-pin collisions
  S.pins.forEach(pin => {
    if (!pin.up) return;
    
    const dx = S.bx - pin.x;
    const dy = S.by - pin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = br + PIN_R + 2; // +2 for generous hitbox
    
    if (dist < minDist) {
      // KNOCK!
      knockPin(pin, dx, dy, dist);
      
      // Deflect ball slightly (conserve some momentum)
      S.bvx += dx * 0.03;
      S.bvy += dy * 0.01;
      S.bvx *= 0.92;
      S.bvy *= 0.95;
      
      spawnParticles(pin.x, pin.y, 5);
    }
  });
  
  // Pin-to-pin chain reactions (improved impulse-based, inspired by biancacchino/bowling-game)
  for (let i = 0; i < S.pins.length; i++) {
    for (let j = i + 1; j < S.pins.length; j++) {
      const a = S.pins[i];
      const b = S.pins[j];
      
      // Falling pin hits standing pin
      if (a.up && b.falling && !b.up) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < PIN_R * 4 && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          const impulse = Math.sqrt(b.vx * b.vx + b.vy * b.vy) * 0.7;
          knockPin(a, -nx * impulse, -ny * impulse, dist);
          // Slow the falling pin that hit
          b.vx *= 0.6;
          b.vy *= 0.6;
          spawnParticles(a.x, a.y, 3);
        }
      }
      if (b.up && a.falling && !a.up) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < PIN_R * 4 && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          const impulse = Math.sqrt(a.vx * a.vx + a.vy * a.vy) * 0.7;
          knockPin(b, -nx * impulse, -ny * impulse, dist);
          a.vx *= 0.6;
          a.vy *= 0.6;
          spawnParticles(b.x, b.y, 3);
        }
      }
      
      // Two falling pins collide — transfer momentum
      if (a.falling && b.falling) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minD = PIN_R * 2.5;
        if (dist < minD && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          const relVx = b.vx - a.vx;
          const relVy = b.vy - a.vy;
          const relSpeed = relVx * nx + relVy * ny;
          if (relSpeed > 0) {
            const imp = relSpeed * 0.4;
            a.vx += nx * imp;
            a.vy += ny * imp;
            b.vx -= nx * imp;
            b.vy -= ny * imp;
          }
          // Separate overlapping
          const overlap = minD - dist;
          a.x -= nx * overlap * 0.5;
          a.y -= ny * overlap * 0.5;
          b.x += nx * overlap * 0.5;
          b.y += ny * overlap * 0.5;
        }
      }
    }
  }
}

function knockPin(pin, dx, dy, dist) {
  pin.up = false;
  pin.falling = true;
  const force = 2.5 + Math.random() * 2;
  const nx = dx / (dist || 1);
  const ny = dy / (dist || 1);
  pin.vx = nx * force + (Math.random() - 0.5) * 1.5;
  pin.vy = ny * force + (Math.random() - 0.5) * 1.5;
  pin.rotV = (Math.random() - 0.5) * 0.4;
  S.shake = 6;
}

function updatePins() {
  S.pins.forEach(pin => {
    if (!pin.falling) return;
    pin.x += pin.vx;
    pin.y += pin.vy;
    pin.rot += pin.rotV;
    pin.vx *= 0.92;
    pin.vy *= 0.92;
    pin.rotV *= 0.92;
    pin.alpha -= 0.015;
    if (pin.alpha <= 0.05 || (Math.abs(pin.vx) < 0.05 && Math.abs(pin.vy) < 0.05)) {
      pin.falling = false;
      pin.alpha = 0;
    }
  });
}

// ============================================================================
// ROLL COMPLETION
// ============================================================================

function endRoll() {
  S.rolling = false;
  S.phase = Phase.PIN_SETTLE;
  
  setTimeout(() => {
    const knocked = S.pins.filter(p => !p.up).length;
    let down;
    
    if (S.roll === 0) {
      down = knocked;
      S.firstRollDown = down;
    } else {
      down = knocked - S.firstRollDown;
      if (S.frame === 9) {
        const f = S.frames[9];
        if ((f.rolls.length === 1 && f.rolls[0] === 10) ||
            (f.rolls.length === 2 && f.rolls[0] + f.rolls[1] === 10)) {
          down = knocked;
          S.firstRollDown = down;
        }
      }
    }
    down = Math.max(0, down);
    
    recordRoll(down);
    
    // Message
    if (S.roll === 0 && down === 10) {
      S.msg = 'STRIKE!'; S.msgColor = C.neon3; S.msgTimer = 70;
      spawnStrikeEffect();
    } else if (S.roll >= 1 && knocked === 10) {
      S.msg = 'SPARE!'; S.msgColor = C.neon2; S.msgTimer = 55;
      spawnParticles(LANE_CX, PIN_AREA_TOP + 20, 20, C.neon2);
    } else if (S.gutter) {
      S.msg = 'GUTTER!'; S.msgColor = '#FF4444'; S.msgTimer = 40;
    } else if (down === 0) {
      S.msg = 'MISS!'; S.msgColor = '#FF4444'; S.msgTimer = 35;
    } else {
      S.msg = down + (down > 1 ? ' PINS!' : ' PIN!'); S.msgColor = C.active; S.msgTimer = 35;
    }
    
    S.phase = Phase.FRAME_RESULT;
    
    setTimeout(() => {
      if (S.phase !== Phase.FRAME_RESULT) return;
      advanceFrame();
      if (S.phase !== Phase.GAME_OVER) {
        resetBall();
        S.phase = Phase.AIMING;
      }
    }, 1200);
    
  }, 500);
}

function resetBall() {
  S.bx = LANE_CX;
  S.by = BALL_START_Y;
  S.bvx = 0; S.bvy = 0; S.bspin = 0;
  S.aimX = 0; S.aimDir = 1;
  S.power = 0; S.powerDir = 1;
  S.rolling = false; S.gutter = false;
}

// ============================================================================
// UPDATE
// ============================================================================

function update() {
  if (S.phase === Phase.AIMING) {
    S.aimX += S.aimSpeed * S.aimDir;
    if (S.aimX >= 1 || S.aimX <= -1) S.aimDir *= -1;
  }
  
  if (S.phase === Phase.POWER) {
    S.power += S.powerSpeed * S.powerDir;
    if (S.power >= 1 || S.power <= 0) S.powerDir *= -1;
  }
  
  if (S.phase === Phase.ROLLING) {
    updateBall();
  }
  
  updatePins();
  
  // Particles
  S.particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    p.vy += 0.06;
    p.life -= p.decay;
  });
  S.particles = S.particles.filter(p => p.life > 0);
  
  if (S.shake > 0) S.shake--;
  if (S.msgTimer > 0) S.msgTimer--;
}

// ============================================================================
// RENDER
// ============================================================================

function render() {
  // Clear offscreen
  oc.clearRect(0, 0, W, H);
  oc.fillStyle = C.bg;
  oc.fillRect(0, 0, W, H);
  
  // Shake
  oc.save();
  if (S.shake > 0) {
    oc.translate((Math.random()-.5) * S.shake * 0.6, (Math.random()-.5) * S.shake * 0.6);
  }
  
  // Lanes
  drawLanes();
  
  // Pins
  S.pins.forEach(p => drawPin(p));
  
  // Ball
  drawBall();
  
  // Aim / Power
  drawAim();
  drawPower();
  
  // Particles
  drawParticles();
  
  // Message
  drawMessage();
  
  oc.restore();
  
  // Scoreboard (no shake)
  drawScoreboard();
  
  // Title / Game Over
  drawTitle();
  drawGameOver();
  
  // Blit to main canvas (scaled up for pixel art)
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off, 0, 0, PW, PH, 0, 0, PW * SCALE, PH * SCALE);
}

// ============================================================================
// MAIN LOOP
// ============================================================================

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

// ============================================================================
// INPUT
// ============================================================================

canvas.addEventListener('click', () => {
  if (S.phase === Phase.TITLE) { startGame(); return; }
  if (S.phase === Phase.AIMING) { S.phase = Phase.POWER; return; }
  if (S.phase === Phase.POWER) { launchBall(); return; }
  if (S.phase === Phase.GAME_OVER) { startGame(); return; }
});

// ============================================================================
// START
// ============================================================================

function startGame() {
  resetPins();
  resetBall();
  initScoring();
  S.particles = [];
  S.msgTimer = 0;
  S.titleBlink = 0;
  S.phase = Phase.AIMING;
}

// Boot
gameLoop();
