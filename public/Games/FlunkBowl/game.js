// ============================================================================
// FLUNK BOWL - Arcade Perspective Bowling (League Bowling style)
// ============================================================================
// Physics runs in flat 2D. Drawing uses perspective projection for that
// classic behind-the-bowler arcade look.

const canvas = document.getElementById('bowling-canvas');
const ctx = canvas.getContext('2d');

// Internal pixel resolution
const PW = 420;
const PH = 480;
const SCALE = 2;
canvas.width = PW * SCALE;
canvas.height = PH * SCALE;
canvas.style.width = (PW * SCALE) + 'px';
canvas.style.height = (PH * SCALE) + 'px';
ctx.imageSmoothingEnabled = false;

// Offscreen canvas at native res
const off = document.createElement('canvas');
off.width = PW;
off.height = PH;
const oc = off.getContext('2d');
oc.imageSmoothingEnabled = false;

const W = PW;
const H = PH;

// ============================================================================
// PERSPECTIVE PROJECTION SETUP
// ============================================================================
// The "world" lane goes from z=0 (bowler, bottom of screen) to z=1 (pins, top).
// We project world coords to screen coords with foreshortening.

const SCOREBOARD_H = 68;
const SCENE_TOP = SCOREBOARD_H + 2;   // top of the 3D scene area
const SCENE_BOT = H - 6;              // bottom of scene
const SCENE_H = SCENE_BOT - SCENE_TOP;

// Perspective params — how wide the lane is at bottom vs top
const LANE_W_BOT = 180;   // lane width at bowler (bottom of screen)
const LANE_W_TOP = 70;    // lane width at pins (top of screen)
const GUTTER_W_BOT = 22;  // gutter width at bottom
const GUTTER_W_TOP = 8;   // gutter width at top

// The vanishing point X is always screen center
const VP_X = W / 2;

// Where pins sit in screen Y (the "back" of the lane)
const PIN_SCREEN_Y = SCENE_TOP + 30;

// ============================================================================
// PERSPECTIVE HELPERS
// ============================================================================

// t: 0 = bottom (bowler), 1 = top (pins)
function lerpLaneWidth(t) {
  return LANE_W_BOT + (LANE_W_TOP - LANE_W_BOT) * t;
}
function lerpGutterWidth(t) {
  return GUTTER_W_BOT + (GUTTER_W_TOP - GUTTER_W_BOT) * t;
}

// Convert world position to screen position
// worldX: -1 (left edge) to +1 (right edge) of lane, 0 = center
// worldZ: 0 (bowler) to 1 (pins)
function worldToScreen(worldX, worldZ) {
  const t = Math.max(0, Math.min(1, worldZ));
  const screenY = SCENE_BOT - t * (SCENE_BOT - PIN_SCREEN_Y);
  const laneW = lerpLaneWidth(t);
  const screenX = VP_X + worldX * (laneW / 2);
  return { x: screenX, y: screenY };
}

// Scale factor at a given depth (for sizing sprites)
function scaleAtDepth(worldZ) {
  const t = Math.max(0, Math.min(1, worldZ));
  return 1.0 - t * 0.55; // objects shrink to 45% at the back
}

// ============================================================================
// PHYSICS CONSTANTS (flat world space)
// ============================================================================
// Physics X: -1..+1 across the lane. Physics Z (depth): 0 = bowler, 1 = past pins.

const PHYS_PIN_AREA_Z = 0.82;   // depth where headpin sits
const PHYS_PIN_SPACING_X = 0.12;
const PHYS_PIN_SPACING_Z = 0.045;
const PIN_R = 0.035;
const BALL_R = 0.04;
const BALL_START_Z = 0.05;

// ============================================================================
// COLORS
// ============================================================================
const C = {
  bg:         '#181425',
  lanewood:   '#D4A84A',
  lanewood2:  '#C4983A',
  lanewood3:  '#B88830',
  lanelight:  '#E0B85A',
  laneline:   '#A07820',
  gutter:     '#444',
  gutterDark: '#2A2A2A',
  gutterStripe:'#8B4513',
  wallBlue:   '#2244CC',
  wallBlue2:  '#1A33AA',
  wallBlueHi: '#4466EE',
  wallRed:    '#CC2222',
  wallRedHi:  '#EE4444',
  wallWhite:  '#FFFFFF',
  pinWhite:   '#FFFFFF',
  pinBlue:    '#99CCFF',
  pinRed:     '#E03030',
  pinOutline: '#888888',
  ball:       '#2233DD',
  ballHi:     '#5566FF',
  ballHole:   '#000033',
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
  aimX: 0,
  aimDir: 1,
  aimSpeed: 0.025,
  power: 0,
  powerDir: 1,
  powerSpeed: 0.022,
  // Ball in physics coords
  bx: 0,               // -1..1
  bz: BALL_START_Z,    // 0..1+ depth
  bvx: 0,
  bvz: 0,
  bspin: 0,
  rolling: false,
  gutter: false,
  // Bowler position
  bowlerX: 0,
  // Pins
  pins: [],
  firstRollDown: 0,
  // Scoring
  frames: [],
  frame: 0,
  roll: 0,
  total: 0,
  // FX
  particles: [],
  shake: 0,
  msg: '',
  msgTimer: 0,
  msgColor: '#FFF',
  titleBlink: 0,
};

// ============================================================================
// PINS (physics coords)
// ============================================================================

function makePins() {
  const pins = [];
  // Row 0 = headpin (closest to bowler), Row 3 = back row (4 pins, furthest)
  const rows = [[0], [-1,1], [-2,0,2], [-3,-1,1,3]];
  let id = 0;
  for (let r = 0; r < rows.length; r++) {
    for (const off of rows[r]) {
      const px = off * PHYS_PIN_SPACING_X;
      const pz = PHYS_PIN_AREA_Z + r * PHYS_PIN_SPACING_Z;
      pins.push({
        id: id++, x: px, z: pz,
        ox: px, oz: pz,
        vx: 0, vz: 0,
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
// SCORING (unchanged logic)
// ============================================================================

function initScoring() {
  S.frames = [];
  for (let i = 0; i < 10; i++) S.frames.push({ rolls: [], disp: [], score: null });
  S.frame = 0; S.roll = 0; S.total = 0; S.firstRollDown = 0;
}

function recordRoll(n) {
  const f = S.frames[S.frame];
  f.rolls.push(n);
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
// DRAW HELPERS
// ============================================================================

function pxRect(x, y, w, h, col) {
  oc.fillStyle = col;
  oc.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
function pxLine(x1, y1, x2, y2, col, width) {
  oc.strokeStyle = col;
  oc.lineWidth = width || 1;
  oc.beginPath();
  oc.moveTo(Math.round(x1)+.5, Math.round(y1)+.5);
  oc.lineTo(Math.round(x2)+.5, Math.round(y2)+.5);
  oc.stroke();
}
function pxTri(x1,y1, x2,y2, x3,y3, col) {
  oc.fillStyle = col;
  oc.beginPath();
  oc.moveTo(Math.round(x1), Math.round(y1));
  oc.lineTo(Math.round(x2), Math.round(y2));
  oc.lineTo(Math.round(x3), Math.round(y3));
  oc.closePath();
  oc.fill();
}
function pxQuad(x1,y1, x2,y2, x3,y3, x4,y4, col) {
  oc.fillStyle = col;
  oc.beginPath();
  oc.moveTo(Math.round(x1), Math.round(y1));
  oc.lineTo(Math.round(x2), Math.round(y2));
  oc.lineTo(Math.round(x3), Math.round(y3));
  oc.lineTo(Math.round(x4), Math.round(y4));
  oc.closePath();
  oc.fill();
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
// DRAW — SCOREBOARD
// ============================================================================

function drawScoreboard() {
  pxRect(0, 0, W, SCOREBOARD_H, C.scoreBg);
  
  pxTextCenter('FLUNK BOWL', W/2, 13, C.neon3, 12);
  
  const boxW = 36;
  const boxH = 28;
  const gap = 2;
  const startX = (W - boxW * 10 - 9 * gap) / 2;
  const boxY = 17;
  
  for (let i = 0; i < 10; i++) {
    const bx = startX + i * (boxW + gap);
    const f = S.frames[i];
    const isActive = (i === S.frame && S.phase !== Phase.TITLE && S.phase !== Phase.GAME_OVER);
    
    const borderCol = isActive ? C.active : C.scoreBorder;
    pxRect(bx, boxY, boxW, boxH, borderCol);
    pxRect(bx + 1, boxY + 1, boxW - 2, boxH - 2, C.scoreBox);
    
    pxTextCenter('' + (i + 1), bx + boxW/2, boxY + 10, C.dim, 7);
    
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
    
    if (f && f.score !== null) {
      pxTextCenter('' + f.score, bx + boxW/2, boxY + 24, C.scoreNum, 9);
    }
  }
  
  const totalY = boxY + boxH + 2;
  pxRect(0, totalY, W, 14, C.scoreBg);
  
  if (S.phase !== Phase.TITLE && S.phase !== Phase.GAME_OVER) {
    pxText('F' + (S.frame + 1) + ' R' + (S.roll + 1), 6, totalY + 11, C.active, 9);
  }
  
  oc.textAlign = 'right';
  oc.fillStyle = C.scoreNum;
  oc.font = 'bold 11px monospace';
  oc.fillText('TOTAL: ' + S.total, W - 6, totalY + 11);
  oc.textAlign = 'left';
  
  pxRect(0, SCOREBOARD_H - 2, W, 3, C.neon3);
}

// ============================================================================
// DRAW — PERSPECTIVE LANE
// ============================================================================

function drawPerspectiveLane() {
  // Background
  pxRect(0, SCENE_TOP, W, SCENE_H + 10, '#0a0a1a');
  
  const STRIPS = 100;
  
  for (let i = 0; i <= STRIPS; i++) {
    const t = i / STRIPS;  // 0 = top (pins), 1 = bottom (bowler)
    const z = 1 - t;       // depth: 0 = bowler, 1 = pins
    const y = SCENE_TOP + t * SCENE_H;
    const nextY = SCENE_TOP + (i + 1) / STRIPS * SCENE_H;
    const stripH = Math.max(1, nextY - y);
    
    const laneW = lerpLaneWidth(z);
    const gutW = lerpGutterWidth(z);
    
    const laneL = VP_X - laneW / 2;
    const laneR = VP_X + laneW / 2;
    
    // --- SIDE WALLS (diagonal stripes like League Bowling) ---
    const wallThick = 18 * (1 - z * 0.4);
    const stripePhase = Math.floor((y * 0.8 + Date.now() * 0.008) / 5) % 4;
    const wallCols = ['#8B4513', '#A0522D', '#6B3410', '#994C1A'];
    const wallCol = wallCols[stripePhase];
    
    // Left wall
    pxRect(laneL - gutW - wallThick, y, wallThick, stripH, wallCol);
    // Right wall  
    pxRect(laneR + gutW, y, wallThick, stripH, wallCol);
    
    // Red trim on wall inner edge
    if (stripePhase < 2) {
      pxRect(laneL - gutW - 3, y, 3, stripH, '#AA3333');
      pxRect(laneR + gutW, y, 3, stripH, '#AA3333');
    }
    
    // --- GUTTERS ---
    pxRect(laneL - gutW, y, gutW, stripH, C.gutterDark);
    pxRect(laneR, y, gutW, stripH, C.gutterDark);
    // Gutter highlight lines
    if (i % 6 === 0) {
      pxRect(laneL - gutW, y, 1, Math.min(stripH, 2), '#555');
      pxRect(laneR + gutW - 1, y, 1, Math.min(stripH, 2), '#555');
    }
    
    // --- LANE WOOD ---
    const plankCount = 7;
    const plankW = laneW / plankCount;
    for (let p = 0; p < plankCount; p++) {
      const px = laneL + p * plankW;
      const col = p % 2 === 0 ? C.lanewood : C.lanewood2;
      pxRect(px, y, plankW + 1, stripH, col);
    }
    
    // Plank divider lines
    for (let p = 1; p < plankCount; p++) {
      const px = laneL + p * plankW;
      pxRect(px, y, 1, stripH, C.laneline);
    }
    
    // Lane edge highlights
    pxRect(laneL, y, 1, stripH, '#8B6914');
    pxRect(laneR - 1, y, 1, stripH, '#8B6914');
  }
  
  // --- FOUL LINE ---
  const foulZ = 0.18;
  const foulScreen = worldToScreen(0, foulZ);
  const foulLaneW = lerpLaneWidth(foulZ);
  const foulGutW = lerpGutterWidth(foulZ);
  pxRect(VP_X - foulLaneW/2 - foulGutW, foulScreen.y, foulLaneW + foulGutW * 2, 3, C.foul);
  
  // --- ARROW MARKERS ---
  for (let i = -3; i <= 3; i++) {
    const arrowZ = 0.35;
    const sc = worldToScreen(i * 0.12, arrowZ);
    const sz = scaleAtDepth(arrowZ);
    const aw = Math.max(2, Math.round(3 * sz));
    const ah = Math.max(3, Math.round(6 * sz));
    // Diamond shape
    pxRect(sc.x - 1, sc.y - ah, 3, ah, C.laneline);
    pxRect(sc.x - 2, sc.y - ah + 2, 5, 1, C.laneline);
  }
  
  // --- APPROACH DOTS ---
  for (let i = -2; i <= 2; i++) {
    const dotZ = 0.08;
    const sc = worldToScreen(i * 0.18, dotZ);
    pxRect(sc.x - 1, sc.y - 1, 3, 3, '#FFF');
  }
  
  // --- BACK WALL (blue, with triangular displays) ---
  drawBackWall();
  
  // --- NEIGHBOR LANES (visible at edges) ---
  drawNeighborLanes();
}

// ============================================================================
// DRAW — BACK WALL (blue wall with triangular score displays)
// ============================================================================

function drawBackWall() {
  const wallY = SCENE_TOP;
  const wallH = 32;
  const topLaneW = lerpLaneWidth(1);
  const topGutW = lerpGutterWidth(1);
  
  // Full-width blue wall
  const wallL = 0;
  const wallR = W;
  
  // Blue wall
  pxRect(wallL, wallY, wallR - wallL, wallH, C.wallBlue);
  // Highlight stripes
  pxRect(wallL, wallY + 2, wallR - wallL, 2, C.wallBlueHi);
  pxRect(wallL, wallY + wallH - 3, wallR - wallL, 2, C.wallBlue2);
  // Vertical panel lines
  for (let i = 0; i < 8; i++) {
    const px = wallL + (wallR - wallL) / 8 * i;
    pxRect(px, wallY, 2, wallH, C.wallBlue2);
  }
  
  // Red triangular score displays (like the arcade!)
  const triW = 32;
  const triH = 22;
  const triCount = 5;
  const triSpacing = (W - 40) / (triCount - 1);
  const triStartX = 20;
  
  for (let i = 0; i < triCount; i++) {
    const tx = triStartX + i * triSpacing;
    const ty = wallY + 3;
    
    // Red downward-pointing triangle
    pxTri(tx, ty, tx + triW/2, ty + triH, tx - triW/2, ty + triH, C.wallRed);
    // Light edge highlight
    pxLine(tx, ty + 1, tx + triW/2 - 1, ty + triH, C.wallRedHi);
    pxLine(tx, ty + 1, tx - triW/2 + 1, ty + triH, C.wallRedHi);
    // White trim at bottom
    pxRect(tx - triW/2 + 3, ty + triH - 2, triW - 6, 2, C.wallWhite);
    
    // Little trophy/pin icons under triangle
    pxRect(tx - 2, ty + triH + 1, 4, 5, C.wallWhite);
    pxRect(tx - 1, ty + triH + 2, 2, 1, C.wallRed);
  }
  
  // Pin deck area (dark strip below wall)
  const deckY = wallY + wallH;
  const deckH = 6;
  pxRect(VP_X - topLaneW/2 - topGutW - 20, deckY, topLaneW + topGutW * 2 + 40, deckH, '#1a1a1a');
  pxRect(VP_X - topLaneW/2 - topGutW - 20, deckY + deckH - 1, topLaneW + topGutW * 2 + 40, 1, '#444');
}

// ============================================================================
// DRAW — NEIGHBOR LANES (visible on left/right edges)
// ============================================================================

function drawNeighborLanes() {
  const STRIPS = 40;
  
  for (let side = -1; side <= 1; side += 2) {
    oc.globalAlpha = 0.45;
    for (let i = 0; i <= STRIPS; i++) {
      const t = i / STRIPS;
      const z = 1 - t;
      const y = SCENE_TOP + t * SCENE_H;
      const nextY = SCENE_TOP + (i + 1) / STRIPS * SCENE_H;
      const stripH = Math.max(1, nextY - y);
      
      const laneW = lerpLaneWidth(z);
      const gutW = lerpGutterWidth(z);
      const wallThick = 18 * (1 - z * 0.4);
      
      // The neighbor lane starts after wall+gutter of main lane
      const edgeX = VP_X + side * (laneW / 2 + gutW + wallThick);
      const neighborW = 40 * (1 - z * 0.5);
      
      if (side === -1) {
        pxRect(edgeX - neighborW, y, neighborW, stripH, '#8A7830');
      } else {
        pxRect(edgeX, y, neighborW, stripH, '#8A7830');
      }
    }
    
    // Neighbor pins (static decor)
    for (let r = 0; r < 4; r++) {
      const rowCounts = [4, 3, 2, 1];
      for (let p = 0; p < rowCounts[r]; p++) {
        const pz = 0.88 + r * 0.025;
        const sc = worldToScreen(0, pz);
        const sz = scaleAtDepth(pz);
        
        const laneW = lerpLaneWidth(pz);
        const gutW = lerpGutterWidth(pz);
        const wallThick = 18 * (1 - pz * 0.4);
        const edgeX = VP_X + side * (laneW / 2 + gutW + wallThick);
        const neighborCX = side === -1 ? edgeX - 20 * (1 - pz * 0.5) : edgeX + 20 * (1 - pz * 0.5);
        
        const pOff = (p - (rowCounts[r] - 1) / 2) * 4 * sz;
        const pinX = neighborCX + pOff;
        const pinH = Math.max(3, 7 * sz);
        const pinW = Math.max(2, 4 * sz);
        pxRect(pinX - pinW/2, sc.y - pinH, pinW, pinH, '#ccc');
        pxRect(pinX - pinW/2 + 1, sc.y - pinH + 2, pinW - 2, Math.max(1, 2 * sz), C.pinRed);
      }
    }
    oc.globalAlpha = 1;
  }
}

// ============================================================================
// DRAW — PINS (projected)
// ============================================================================

function drawPin(p) {
  if (!p.up && !p.falling) return;
  
  const sc = worldToScreen(p.x, p.z);
  const sz = scaleAtDepth(p.z);
  oc.globalAlpha = p.alpha;
  
  const x = Math.round(sc.x);
  const y = Math.round(sc.y);
  
  if (p.falling) {
    oc.save();
    oc.translate(x, y);
    oc.rotate(p.rot);
    const fw = Math.max(4, Math.round(10 * sz));
    const fh = Math.max(3, Math.round(6 * sz));
    pxRect(-fw/2, -fh/2, fw, fh, C.pinWhite);
    pxRect(-fw/2 + 1, 1, fw - 2, Math.max(1, 2 * sz), C.pinRed);
    oc.restore();
  } else {
    // Standing pin — classic bowling pin shape, scaled by depth
    const ph = Math.max(6, Math.round(16 * sz));
    const headW = Math.max(3, Math.round(6 * sz));
    const headH = Math.max(2, Math.round(4 * sz));
    const neckW = Math.max(2, Math.round(4 * sz));
    const bodyW = Math.max(4, Math.round(10 * sz));
    const bodyH = Math.max(4, Math.round(8 * sz));
    const stripeH = Math.max(1, Math.round(2 * sz));
    const baseH = Math.max(1, Math.round(2 * sz));
    
    // Head
    pxRect(x - headW/2, y - ph, headW, headH, C.pinWhite);
    // Neck
    pxRect(x - neckW/2, y - ph + headH, neckW, Math.max(1, Math.round(2 * sz)), C.pinWhite);
    // Body
    pxRect(x - bodyW/2, y - bodyH - baseH, bodyW, bodyH, C.pinWhite);
    // Red stripe (the iconic red band)
    pxRect(x - bodyW/2 + 1, y - bodyH - baseH + Math.round(2 * sz), bodyW - 2, stripeH, C.pinRed);
    // Base
    pxRect(x - bodyW/2, y - baseH, bodyW, baseH, '#ddd');
    
    // Blue highlight on head
    if (sz > 0.55) {
      pxRect(x - 1, y - ph + 1, 2, 2, C.pinBlue);
    }
    // Side shadow
    if (sz > 0.5) {
      pxRect(x - bodyW/2, y - bodyH, 1, bodyH, C.pinOutline);
      pxRect(x + bodyW/2 - 1, y - bodyH, 1, bodyH, C.pinOutline);
    }
  }
  oc.globalAlpha = 1;
}

// ============================================================================
// DRAW — BALL (projected)
// ============================================================================

function drawBall() {
  if (S.phase === Phase.TITLE || S.phase === Phase.GAME_OVER) return;
  
  const sc = worldToScreen(S.bx, S.bz);
  const sz = scaleAtDepth(S.bz);
  const x = Math.round(sc.x);
  const y = Math.round(sc.y);
  const r = Math.max(3, Math.round(BALL_R * LANE_W_BOT * sz));
  
  // Shadow
  oc.globalAlpha = 0.35;
  pxRect(x - r + 1, y + r, r * 2, Math.max(2, Math.round(3 * sz)), '#000');
  oc.globalAlpha = 1;
  
  // Ball body (circle)
  for (let py = -r; py <= r; py++) {
    const hw = Math.round(Math.sqrt(r * r - py * py));
    pxRect(x - hw, y + py, hw * 2 + 1, 1, C.ball);
  }
  
  // Highlight
  const hlW = Math.max(1, Math.round(r * 0.4));
  const hlH = Math.max(1, Math.round(r * 0.3));
  pxRect(x - Math.round(r * 0.4), y - Math.round(r * 0.6), hlW, hlH, C.ballHi);
  
  // Finger holes
  if (r > 4) {
    pxRect(x - 2, y - 1, 2, 2, C.ballHole);
    pxRect(x + 1, y - 1, 2, 2, C.ballHole);
    pxRect(x, y + 1, 2, 2, C.ballHole);
  }
}

// ============================================================================
// DRAW — BOWLER CHARACTER (seen from behind, like the arcade)
// ============================================================================

function drawBowler() {
  if (S.phase === Phase.TITLE || S.phase === Phase.GAME_OVER) return;
  
  // If rolling, show bowler at the position they released from
  const bowlerWorldX = S.rolling ? S.bowlerX : S.bx;
  const bsc = worldToScreen(bowlerWorldX, 0.02);
  const x = Math.round(bsc.x);
  const y = SCENE_BOT - 2;
  
  // --- PIXEL ART BOWLER (from behind) ---
  // Head (dark hair)
  pxRect(x - 5, y - 38, 10, 8, '#222');
  pxRect(x - 4, y - 37, 3, 2, '#444'); // hair highlight
  
  // Shirt (white, like arcade)
  pxRect(x - 7, y - 30, 14, 14, '#EEE');
  // Collar
  pxRect(x - 3, y - 31, 6, 2, '#CCC');
  // Back detail (number or logo)
  pxRect(x - 3, y - 26, 6, 5, '#DDD');
  pxTextCenter('F', x, y - 22, '#7B2FBE', 5); // Flunks logo
  
  // Arms
  pxRect(x - 10, y - 28, 4, 10, '#EEE');
  pxRect(x + 6, y - 28, 4, 10, '#EEE');
  // Hands (skin)
  pxRect(x - 10, y - 18, 4, 3, '#FFCCAA');
  pxRect(x + 6, y - 18, 4, 3, '#FFCCAA');
  
  // Pants (pink like the arcade!)
  pxRect(x - 6, y - 16, 12, 8, '#FF99AA');
  // Legs
  pxRect(x - 6, y - 8, 5, 8, '#FF99AA');
  pxRect(x + 1, y - 8, 5, 8, '#FF99AA');
  
  // Shoes
  pxRect(x - 7, y, 6, 3, '#663311');
  pxRect(x + 1, y, 6, 3, '#663311');
  
  // Ball in hand when aiming/powering
  if (!S.rolling) {
    const ballR = 4;
    for (let py = -ballR; py <= ballR; py++) {
      const hw = Math.round(Math.sqrt(ballR * ballR - py * py));
      pxRect(x + 7 - hw + 3, y - 17 + py, hw * 2 + 1, 1, C.ball);
    }
    pxRect(x + 9, y - 18, 2, 1, C.ballHi);
  }
}

// ============================================================================
// DRAW — AIM INDICATOR (perspective projected)
// ============================================================================

function drawAim() {
  if (S.phase !== Phase.AIMING) return;
  
  const angle = S.aimX * 0.5;
  const steps = 16;
  
  for (let i = 1; i <= steps; i++) {
    if (i % 3 === 0) continue;
    const t = i / steps;
    const az = BALL_START_Z + t * 0.85;
    const ax = S.bx + Math.sin(angle) * t * 0.6;
    const sc = worldToScreen(ax, az);
    const sz = scaleAtDepth(az);
    const dotSize = Math.max(1, Math.round(4 * sz));
    pxRect(sc.x - dotSize/2, sc.y - dotSize/2, dotSize, dotSize, C.active);
  }
  
  pxTextCenter('< AIM >', W/2, H - 6, C.active, 10);
}

// ============================================================================
// DRAW — POWER METER (left side, vertical like the arcade)
// ============================================================================

function drawPower() {
  if (S.phase !== Phase.POWER) return;
  
  const mx = 12;
  const my = SCENE_TOP + 20;
  const mw = 16;
  
  // "POWER" label vertically
  const letters = ['P','O','W','E','R'];
  for (let i = 0; i < letters.length; i++) {
    pxTextCenter(letters[i], mx + mw/2, my + i * 11, C.neon3, 9);
  }
  
  const barY = my + 58;
  const barH = 130;
  
  // Border
  pxRect(mx - 2, barY - 2, mw + 4, barH + 4, C.neon3);
  pxRect(mx, barY, mw, barH, '#000');
  
  // Fill (bottom to top)
  const fillH = Math.round(S.power * barH);
  for (let i = 0; i < fillH; i++) {
    const t = i / barH;
    let col;
    if (t < 0.4) col = '#00CC00';
    else if (t < 0.7) col = '#CCCC00';
    else if (t < 0.9) col = '#CC6600';
    else col = '#CC0000';
    pxRect(mx + 1, barY + barH - 1 - i, mw - 2, 1, col);
  }
  
  // Moving marker
  const markerY = barY + barH - fillH;
  pxRect(mx - 4, markerY - 1, mw + 8, 3, '#FFF');
  
  // "CONTROL" label on right side
  const mx2 = W - 28;
  const cLetters = ['C','L','I','C','K','!'];
  for (let i = 0; i < cLetters.length; i++) {
    pxTextCenter(cLetters[i], mx2 + 8, my + i * 11, '#FFFF00', 9);
  }
}

// ============================================================================
// DRAW — PARTICLES (projected)
// ============================================================================

function drawParticles() {
  S.particles.forEach(p => {
    oc.globalAlpha = p.life;
    const sc = worldToScreen(p.x, p.z);
    const sz = scaleAtDepth(p.z);
    const ps = Math.max(1, Math.round(p.size * sz * 3));
    pxRect(Math.round(sc.x), Math.round(sc.y), ps, ps, p.color);
  });
  oc.globalAlpha = 1;
}

function spawnParticles(px, pz, n, col) {
  for (let i = 0; i < n; i++) {
    S.particles.push({
      x: px, z: pz,
      vx: (Math.random() - 0.5) * 0.04,
      vz: (Math.random() - 0.5) * 0.02,
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
    const spd = Math.random() * 0.03 + 0.015;
    S.particles.push({
      x: 0, z: PHYS_PIN_AREA_Z + 0.05,
      vx: Math.cos(a) * spd, vz: Math.sin(a) * spd * 0.5,
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
  const msgW = S.msg.length * 11 + 30;
  pxRect(W/2 - msgW/2, H/2 - 52, msgW, 34, 'rgba(0,0,0,0.75)');
  pxRect(W/2 - msgW/2 + 1, H/2 - 51, msgW - 2, 32, 'rgba(20,0,40,0.8)');
  pxTextCenter(S.msg, W/2, H/2 - 28, S.msgColor, 18);
  oc.globalAlpha = 1;
}

// ============================================================================
// DRAW — TITLE
// ============================================================================

function drawTitle() {
  if (S.phase !== Phase.TITLE) return;
  pxRect(0, 0, W, H, 'rgba(10,10,26,0.88)');
  
  pxTextCenter('FLUNK BOWL', W/2, H/2 - 80, C.neon3, 22);
  pxTextCenter('SEMESTER ZERO', W/2, H/2 - 50, C.neon1, 12);
  pxTextCenter('BOWLING ALLEY', W/2, H/2 - 34, C.neon1, 12);
  
  pxTextCenter('\u{1F438}', W/2, H/2 + 10, C.white, 30);
  
  S.titleBlink += 0.05;
  if (Math.sin(S.titleBlink) > 0) {
    pxTextCenter('CLICK TO PLAY', W/2, H/2 + 55, '#FFFF00', 13);
  }
  
  pxTextCenter('AIM > POWER > BOWL!', W/2, H/2 + 80, C.dim, 10);
}

// ============================================================================
// DRAW — GAME OVER
// ============================================================================

function drawGameOver() {
  if (S.phase !== Phase.GAME_OVER) return;
  pxRect(0, SCOREBOARD_H, W, H - SCOREBOARD_H, 'rgba(10,10,26,0.88)');
  
  pxTextCenter('GAME OVER', W/2, H/2 - 55, C.neon3, 20);
  pxTextCenter('' + S.total, W/2, H/2 - 15, C.active, 26);
  
  let msg;
  if (S.total >= 250) msg = 'LEGENDARY!';
  else if (S.total >= 200) msg = 'AMAZING!';
  else if (S.total >= 150) msg = 'GREAT GAME!';
  else if (S.total >= 100) msg = 'SOLID!';
  else if (S.total >= 50) msg = 'KEEP TRYING!';
  else msg = 'OOF...';
  pxTextCenter(msg, W/2, H/2 + 20, C.neon4, 14);
  
  S.titleBlink += 0.05;
  if (Math.sin(S.titleBlink) > 0) {
    pxTextCenter('CLICK TO RETRY', W/2, H/2 + 52, '#FFFF00', 13);
  }
}

// ============================================================================
// PHYSICS — BALL
// ============================================================================

function launchBall() {
  const angle = S.aimX * 0.5;
  const speed = 0.012 + S.power * 0.03;
  
  S.bowlerX = S.bx;
  S.bvx = Math.sin(angle) * speed;
  S.bvz = Math.cos(angle) * speed;
  S.bspin = S.aimX * 0.15 * S.power;
  S.rolling = true;
  S.gutter = false;
  S.phase = Phase.ROLLING;
}

function updateBall() {
  if (!S.rolling) return;
  
  S.bvx += S.bspin * 0.0001;
  S.bvz *= 0.998;
  S.bvx *= 0.997;
  
  S.bx += S.bvx;
  S.bz += S.bvz;
  
  const gutterEdge = 0.55;
  if (S.bx < -gutterEdge) {
    S.gutter = true;
    S.bx = -gutterEdge - 0.05;
    S.bvx = 0;
  }
  if (S.bx > gutterEdge) {
    S.gutter = true;
    S.bx = gutterEdge + 0.05;
    S.bvx = 0;
  }
  
  if (!S.gutter) {
    checkPinCollisions();
  }
  
  if (S.bz > 1.05) {
    endRoll();
  }
}

// ============================================================================
// PHYSICS — PIN COLLISIONS
// ============================================================================

function checkPinCollisions() {
  S.pins.forEach(pin => {
    if (!pin.up) return;
    
    const dx = S.bx - pin.x;
    const dz = S.bz - pin.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const minDist = BALL_R + PIN_R + 0.01;
    
    if (dist < minDist) {
      knockPin(pin, dx, dz, dist);
      S.bvx += dx * 0.02;
      S.bvz += dz * 0.005;
      S.bvx *= 0.92;
      S.bvz *= 0.96;
      spawnParticles(pin.x, pin.z, 5);
    }
  });
  
  // Pin-to-pin
  for (let i = 0; i < S.pins.length; i++) {
    for (let j = i + 1; j < S.pins.length; j++) {
      const a = S.pins[i];
      const b = S.pins[j];
      
      if (a.up && b.falling && !b.up) {
        const dx = a.x - b.x;
        const dz = a.z - b.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < PIN_R * 4 && dist > 0) {
          const nx = dx / dist;
          const nz = dz / dist;
          const impulse = Math.sqrt(b.vx * b.vx + b.vz * b.vz) * 0.7;
          knockPin(a, -nx * impulse, -nz * impulse, dist);
          b.vx *= 0.6; b.vz *= 0.6;
          spawnParticles(a.x, a.z, 3);
        }
      }
      if (b.up && a.falling && !a.up) {
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < PIN_R * 4 && dist > 0) {
          const nx = dx / dist;
          const nz = dz / dist;
          const impulse = Math.sqrt(a.vx * a.vx + a.vz * a.vz) * 0.7;
          knockPin(b, -nx * impulse, -nz * impulse, dist);
          a.vx *= 0.6; a.vz *= 0.6;
          spawnParticles(b.x, b.z, 3);
        }
      }
      
      if (a.falling && b.falling) {
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const minD = PIN_R * 2.5;
        if (dist < minD && dist > 0) {
          const nx = dx / dist;
          const nz = dz / dist;
          const relVx = b.vx - a.vx;
          const relVz = b.vz - a.vz;
          const relSpeed = relVx * nx + relVz * nz;
          if (relSpeed > 0) {
            const imp = relSpeed * 0.4;
            a.vx += nx * imp; a.vz += nz * imp;
            b.vx -= nx * imp; b.vz -= nz * imp;
          }
          const overlap = minD - dist;
          a.x -= nx * overlap * 0.5; a.z -= nz * overlap * 0.5;
          b.x += nx * overlap * 0.5; b.z += nz * overlap * 0.5;
        }
      }
    }
  }
}

function knockPin(pin, dx, dz, dist) {
  pin.up = false;
  pin.falling = true;
  const force = 0.04 + Math.random() * 0.03;
  const nx = dx / (dist || 0.01);
  const nz = dz / (dist || 0.01);
  pin.vx = nx * force + (Math.random() - 0.5) * 0.02;
  pin.vz = nz * force + (Math.random() - 0.5) * 0.02;
  pin.rotV = (Math.random() - 0.5) * 0.4;
  S.shake = 6;
}

function updatePins() {
  S.pins.forEach(pin => {
    if (!pin.falling) return;
    pin.x += pin.vx;
    pin.z += pin.vz;
    pin.rot += pin.rotV;
    pin.vx *= 0.92;
    pin.vz *= 0.92;
    pin.rotV *= 0.92;
    pin.alpha -= 0.015;
    if (pin.alpha <= 0.05 || (Math.abs(pin.vx) < 0.001 && Math.abs(pin.vz) < 0.001)) {
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
    
    if (S.roll === 0 && down === 10) {
      S.msg = 'STRIKE!'; S.msgColor = C.neon3; S.msgTimer = 70;
      spawnStrikeEffect();
    } else if (S.roll >= 1 && knocked === 10) {
      S.msg = 'SPARE!'; S.msgColor = C.neon2; S.msgTimer = 55;
      spawnParticles(0, PHYS_PIN_AREA_Z + 0.05, 20, C.neon2);
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
  S.bx = 0;
  S.bz = BALL_START_Z;
  S.bvx = 0; S.bvz = 0; S.bspin = 0;
  S.aimX = 0; S.aimDir = 1;
  S.power = 0; S.powerDir = 1;
  S.rolling = false; S.gutter = false;
  S.bowlerX = 0;
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
  
  S.particles.forEach(p => {
    p.x += p.vx;
    p.z += p.vz;
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
  oc.clearRect(0, 0, W, H);
  oc.fillStyle = C.bg;
  oc.fillRect(0, 0, W, H);
  
  oc.save();
  if (S.shake > 0) {
    oc.translate((Math.random()-.5) * S.shake * 0.8, (Math.random()-.5) * S.shake * 0.8);
  }
  
  drawPerspectiveLane();
  
  // Pins (draw back-to-front so closer pins overlap farther ones)
  const sortedPins = [...S.pins].sort((a, b) => b.z - a.z);
  sortedPins.forEach(p => drawPin(p));
  
  drawBall();
  drawBowler();
  drawAim();
  drawPower();
  drawParticles();
  drawMessage();
  
  oc.restore();
  
  drawScoreboard();
  drawTitle();
  drawGameOver();
  
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

gameLoop();
