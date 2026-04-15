import React, { useState, useEffect, useRef, useCallback } from 'react';

/*
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  PAPER TOSS – Flunks High School Edition                       ║
 * ║  • RESPONSIVE: portrait on phones, landscape on desktop        ║
 * ║  • Measures container → picks canvas size to fill it           ║
 * ║  • BG image covers/crops to fill any ratio                     ║
 * ║  • All game coords are relative to canvas W/H                  ║
 * ║  • Endless mode, wind, multiple throwables                     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ─── TYPES ────────────────────────────────────────────────────────
type Phase = 'title' | 'ready' | 'aiming' | 'flying' | 'scored' | 'missed' | 'levelUp' | 'gameOver';
type ThrowObj = 'paper' | 'airplane' | 'note' | 'banana' | 'soda';
interface Drag { on: boolean; sx: number; sy: number; cx: number; cy: number }
interface FlyState {
  frame: number; startX: number; throwVX: number; throwVY: number;
  x: number; y: number; z: number; rot: number; rs: number;
  landed: boolean; sinkFrame: number;
}
interface Diff {
  name: string; windBase: number; gusty: boolean; gustStr: number; desc: string;
  fan: 'none' | 'left' | 'right'; binDrift: number; makesNeeded: number;
}
const MAKES_DEFAULT = 5;
interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number; }

// Layout computed from canvas dimensions
interface Layout {
  W: number; H: number;
  binCX: number; binTopY: number; binW: number; binH: number;
  binRimRX: number; binRimRY: number; hitRX: number;
  handY: number; flightFrames: number; arcHeight: number;
  isPortrait: boolean;
}

function computeLayout(cw: number, ch: number): Layout {
  const isPortrait = ch > cw;
  // Bin positions as percentage of canvas
  const binW = isPortrait ? cw * 0.2 : cw * 0.12;
  const binH = binW * 1.18;
  const binCX = cw * 0.5;
  // Portrait: bin on the floor (~68% down); Landscape: bin at ~56% down
  const binTopY = isPortrait ? ch * 0.68 : ch * 0.56;
  const binRimRX = binW * 0.54;   // wide isometric rim
  const binRimRY = binW * 0.18;   // squashed for 3/4 view
  const hitRX = binRimRX * 0.82;
  const handY = ch - (isPortrait ? ch * 0.05 : ch * 0.13);
  const flightFrames = isPortrait ? 45 : 50;
  const arcHeight = isPortrait ? ch * 0.18 : ch * 0.38;
  return { W: cw, H: ch, binCX, binTopY, binW, binH, binRimRX, binRimRY, hitRX, handY, flightFrames, arcHeight, isPortrait };
}

// ─── PHYSICS ──────────────────────────────────────────────────────
const WIND_MULT = 0.5;
const THROW_POWER = 0.075;

const DIFFS: Diff[] = [
  { name: 'Study Hall',     windBase: 0,    gusty: false, gustStr: 0,   fan: 'none',  binDrift: 0,    makesNeeded: 3, desc: 'No wind. Easy warm-up!' },
  { name: 'Open Window',    windBase: 0.3,  gusty: true,  gustStr: 0.6, fan: 'none',  binDrift: 0,    makesNeeded: 5, desc: 'Window\'s open — gusty breeze!' },
  { name: 'Hallway Draft',  windBase: -0.5, gusty: true,  gustStr: 0.8, fan: 'none',  binDrift: 0,    makesNeeded: 5, desc: 'Drafts swirling through the hall.' },
  { name: 'Desk Fan',       windBase: 0.6,  gusty: true,  gustStr: 0.9, fan: 'right', binDrift: 0,    makesNeeded: 5, desc: 'Someone turned on a fan!' },
  { name: 'Vent Blast',     windBase: -0.4, gusty: true,  gustStr: 1.2, fan: 'left',  binDrift: 0,    makesNeeded: 5, desc: 'Gusty vent overhead.' },
  { name: 'Wobbly Bin',     windBase: 0.3,  gusty: true,  gustStr: 0.7, fan: 'none',  binDrift: 0.08, makesNeeded: 5, desc: 'The bin is on wheels!' },
  { name: 'Storm Breeze',   windBase: -0.7, gusty: true,  gustStr: 1.4, fan: 'right', binDrift: 0.05, makesNeeded: 5, desc: 'Wind + moving target.' },
  { name: 'Rooftop',        windBase: 0.9,  gusty: true,  gustStr: 1.8, fan: 'left',  binDrift: 0.08, makesNeeded: 5, desc: 'Wild gusts up here!' },
  { name: 'Tornado Alley',  windBase: -1.0, gusty: true,  gustStr: 2.4, fan: 'right', binDrift: 0.12, makesNeeded: 5, desc: 'Insane wind. Bin is sliding!' },
  { name: 'Hurricane',      windBase: 1.3,  gusty: true,  gustStr: 3.0, fan: 'left',  binDrift: 0.15, makesNeeded: 5, desc: 'Max difficulty. Good luck.' },
];

const THROW_OBJECTS: ThrowObj[] = ['paper', 'airplane', 'note', 'banana', 'soda'];
const THROW_LABELS: Record<ThrowObj, string> = {
  paper: '📄 Paper', airplane: '✈️ Airplane', note: '📝 Note', banana: '🍌 Banana', soda: '🥤 Soda',
};

interface PaperTossProps { onClose?: () => void; onScoreUpdate?: (score: number) => void; }

// ════════════════════════════════════════════════════════════════════
const PaperToss: React.FC<PaperTossProps> = ({ onClose, onScoreUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  const bgImg = useRef<HTMLImageElement | null>(null);
  const bgLoaded = useRef(false);
  const tRef = useRef(0);
  const windNow = useRef(0);
  const windDisp = useRef(0);
  const parts = useRef<Particle[]>([]);
  const binBounce = useRef(0);
  const layoutRef = useRef<Layout>(computeLayout(600, 400));

  const [phase, setPhase] = useState<Phase>('title');
  const [diffIdx, setDiffIdx] = useState(0);
  const [con, setCon] = useState(0);
  const [best, setBest] = useState(0);
  const [makes, setMakes] = useState(0);
  const [tosses, setTosses] = useState(0);
  const [throwObj, setThrowObj] = useState<ThrowObj>('paper');
  const [fly, setFly] = useState<FlyState | null>(null);
  const [drag, setDrag] = useState<Drag>({ on: false, sx: 0, sy: 0, cx: 0, cy: 0 });
  const [showPicker, setShowPicker] = useState(false);
  const [canvasSize, setCanvasSize] = useState<{ w: number; h: number }>({ w: 600, h: 400 });
  const [makesInLevel, setMakesInLevel] = useState(0);
  const levelUpTimer = useRef(0);

  const s = useRef({ phase, diffIdx, con, best, makes, tosses, fly, drag, throwObj, makesInLevel });
  s.current = { phase, diffIdx, con, best, makes, tosses, fly, drag, throwObj, makesInLevel };
  const diff = DIFFS[diffIdx] ?? DIFFS[0]!;

  // ─── RESIZE → recalc canvas to fill container ───────────────────
  useEffect(() => {
    const measure = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Use container pixel size directly as logical canvas size (capped for perf)
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const maxDim = 800;
      let cw = Math.min(rect.width * dpr, maxDim * dpr);
      let ch = Math.min(rect.height * dpr, maxDim * dpr);
      // Keep nice round-ish numbers
      cw = Math.round(cw);
      ch = Math.round(ch);
      if (cw < 100 || ch < 100) return;
      const L = computeLayout(cw, ch);
      layoutRef.current = L;
      setCanvasSize({ w: cw, h: ch });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  // ─── LOAD BG ────────────────────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.onload = () => { bgLoaded.current = true; };
    img.src = '/Games/PaperToss/room-bg.png';
    bgImg.current = img;
  }, []);

  // ─── WIND ───────────────────────────────────────────────────────
  useEffect(() => {
    windNow.current = diff.windBase;
    windDisp.current = diff.windBase;
    if (!diff.gusty) return;
    const id = setInterval(() => {
      windNow.current = diff.windBase + (Math.random() - 0.5) * diff.gustStr;
      windDisp.current = windNow.current;
    }, 1100 + Math.random() * 900);
    return () => clearInterval(id);
  }, [diff.windBase, diff.gusty, diff.gustStr, diffIdx]);

  // ─── POINTER (canvas coords) ───────────────────────────────────
  const pos = (e: React.MouseEvent | React.TouchEvent) => {
    const el = cvs.current; if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const L = layoutRef.current;
    const sx = L.W / rect.width, sy = L.H / rect.height;
    if ('touches' in e) {
      const tc = e.touches[0] ?? e.changedTouches[0];
      return tc ? { x: (tc.clientX - rect.left) * sx, y: (tc.clientY - rect.top) * sy } : { x: 0, y: 0 };
    }
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  };

  const onDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const ph = s.current.phase;
    if (ph === 'title') { setPhase('ready'); return; }
    if (ph === 'gameOver') { restart(); return; }
    if (ph !== 'ready') return;
    const p = pos(e);
    const L = layoutRef.current;
    if (p.y < L.H * 0.4) return; // only start drag in lower portion
    setDrag({ on: true, sx: p.x, sy: p.y, cx: p.x, cy: p.y });
    setPhase('aiming');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!s.current.drag.on) return;
    const p = pos(e);
    setDrag(d => ({ ...d, cx: p.x, cy: p.y }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onUp = useCallback(() => {
    const d = s.current.drag;
    if (!d.on || s.current.phase !== 'aiming') { setDrag(prev => ({ ...prev, on: false })); return; }
    setDrag(prev => ({ ...prev, on: false }));
    const L = layoutRef.current;
    const dx = d.cx - d.sx, dy = d.cy - d.sy;
    const minSwipe = L.isPortrait ? -40 : -25;
    if (dy > minSwipe) { setPhase('ready'); return; }
    const maxSwipeDist = L.isPortrait ? 350 : 250;
    const power = Math.min(1, Math.abs(dy) / maxSwipeDist);
    const side = dx * THROW_POWER;
    setFly({
      frame: 0, startX: L.W / 2, throwVX: side, throwVY: power,
      x: L.W / 2, y: L.handY, z: 0, rot: 0, rs: side * 0.02, landed: false, sinkFrame: 0,
    });
    setPhase('flying');
    setTosses(n => n + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restart = useCallback(() => {
    setDiffIdx(0); setCon(0); setMakes(0); setTosses(0); setMakesInLevel(0);
    setFly(null); setPhase('ready'); parts.current = []; tRef.current = 0;
    windNow.current = DIFFS[0]!.windBase; levelUpTimer.current = 0;
  }, []);

  const spawnConfetti = useCallback((cx: number, cy: number) => {
    const colors = ['#FFD700', '#50FA7B', '#FF79C6', '#8BE9FD', '#BD93F9', '#FF5555', '#FFA500'];
    const batch: Particle[] = [];
    for (let i = 0; i < 22; i++) {
      const a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 3;
      batch.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2,
        life: 40 + Math.random() * 25, maxLife: 65,
        color: colors[Math.floor(Math.random() * colors.length)]!, size: 2 + Math.random() * 3 });
    }
    parts.current = [...parts.current, ...batch];
  }, []);

  // ─── FLIGHT ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'flying' || !fly) return;
    let fid = 0;
    const step = () => {
      setFly(prev => {
        if (!prev || prev.landed) return prev;
        const L = layoutRef.current;
        const f = prev.frame + 1;
        const prog = f / L.flightFrames;
        if (prog >= 1) {
          const finalX = prev.startX + prev.throwVX * L.flightFrames + windNow.current * WIND_MULT * L.flightFrames * 0.5;
          // Account for bin drift at the moment of landing
          const di = s.current.diffIdx;
          const curDiff = DIFFS[di] ?? DIFFS[0]!;
          const driftNow = curDiff.binDrift > 0 ? Math.sin(tRef.current * curDiff.binDrift) * L.W * 0.06 : 0;
          const actualBinCX = L.W * 0.5 + driftNow;
          const dx = (finalX - actualBinCX) / L.hitRX;
          const hit = Math.abs(dx) < 1 && prev.throwVY > 0.28;
          if (hit) {
            setPhase('scored'); setCon(c => c + 1);
            setBest(b => Math.max(b, s.current.con + 1));
            setMakes(m => m + 1);
            onScoreUpdate?.(s.current.con + 1);
            spawnConfetti(actualBinCX, L.binTopY - 5);
            binBounce.current = 10;
            return { ...prev, frame: f, x: actualBinCX, y: L.binTopY + 8, z: 1, landed: true, sinkFrame: 0 };
          } else {
            setPhase('missed');
            return { ...prev, frame: f, x: finalX, y: L.binTopY + 35 + Math.random() * 40, z: 1, landed: true };
          }
        }
        const windDrift = windNow.current * WIND_MULT * prog * prog;
        const throwDrift = prev.throwVX * prog * L.flightFrames;
        const x = prev.startX + throwDrift + windDrift;
        const arcH = L.arcHeight * prev.throwVY;
        const startY = L.handY;
        const y = startY - arcH * Math.sin(prog * Math.PI) + (L.binTopY - startY + arcH * 0.3) * prog;
        return { ...prev, frame: f, x, y, z: prog, rot: prev.rot + prev.rs };
      });
      if (s.current.phase === 'flying') fid = requestAnimationFrame(step);
    };
    fid = requestAnimationFrame(step);
    return () => cancelAnimationFrame(fid);
  }, [phase, fly, onScoreUpdate, spawnConfetti]);

  // ─── AUTO ADVANCE ───────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'scored') {
      const newMIL = s.current.makesInLevel + 1;
      setMakesInLevel(newMIL);
      const di = s.current.diffIdx;
      const needed = DIFFS[di]?.makesNeeded ?? MAKES_DEFAULT;
      if (newMIL >= needed && di < DIFFS.length - 1) {
        // Level up!
        const id = setTimeout(() => {
          setFly(null); setPhase('levelUp'); levelUpTimer.current = 0;
        }, 600);
        return () => clearTimeout(id);
      } else {
        const id = setTimeout(() => { setFly(null); setPhase('ready'); }, 850);
        return () => clearTimeout(id);
      }
    }
    if (phase === 'levelUp') {
      const id = setTimeout(() => {
        setDiffIdx(l => Math.min(l + 1, DIFFS.length - 1));
        setMakesInLevel(0);
        setFly(null); setPhase('ready');
      }, 1500);
      return () => clearTimeout(id);
    }
    if (phase === 'missed') {
      const id = setTimeout(() => setPhase('gameOver'), 750);
      return () => clearTimeout(id);
    }
  }, [phase]);

  // ════════════════════════════════════════════════════════════════
  //  RENDER LOOP
  // ════════════════════════════════════════════════════════════════
  useEffect(() => {
    const el = cvs.current; if (!el) return;
    const ctx = el.getContext('2d')!; if (!ctx) return;
    let fid = 0;

    const draw = () => {
      tRef.current += 1;
      const T = tRef.current;
      const L = layoutRef.current;
      const { W, H, binCX, binTopY, binW, binH, binRimRX, binRimRY } = L;
      const { phase: ph, diffIdx: di, con: streak, best: bs,
        fly: fl, drag: dd, throwObj: to } = s.current;
      const d = DIFFS[di] ?? DIFFS[0]!;
      ctx.clearRect(0, 0, W, H);

      // ═══ BACKGROUND IMAGE (cover/crop to fill canvas) ═══
      if (bgLoaded.current && bgImg.current) {
        const img = bgImg.current;
        const iw = img.naturalWidth, ih = img.naturalHeight;
        const imgRatio = iw / ih;
        const canvasRatio = W / H;
        let sx = 0, sy = 0, sw = iw, sh = ih;
        if (canvasRatio > imgRatio) {
          // Canvas wider → crop top/bottom of image
          sh = iw / canvasRatio;
          sy = (ih - sh) * 0.3; // bias slightly toward top to show ceiling
        } else {
          // Canvas taller → crop sides of image (center crop)
          sw = ih * canvasRatio;
          sx = (iw - sw) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
      } else {
        ctx.fillStyle = '#3a3528'; ctx.fillRect(0, 0, W, H);
      }

      // ═══ OPEN WINDOW (appears from level 2 onward) ═══
      if (di >= 1) drawOpenWindow(ctx, T, windNow.current, W, H, L);

      // ═══ FLOOR OVERLAY (darken floor area so bin stands out) ═══
      const floorY = binTopY + binH + 10;
      if (floorY < H) {
        ctx.fillStyle = 'rgba(20,15,10,0.15)';
        ctx.fillRect(0, floorY, W, H - floorY);
      }

      // ═══ TRASH CAN (cartoon style) ═══
      drawBin(ctx, L, binBounce.current, T);
      if (binBounce.current > 0) binBounce.current -= 0.4;

      // ═══ TITLE SCREEN ═══
      if (ph === 'title') {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, W, H);
        const s1 = Math.min(W, H);

        const pulse = 1 + Math.sin(T * 0.04) * 0.03;
        const titleY = H * 0.15;
        ctx.save(); ctx.translate(W / 2, titleY); ctx.scale(pulse, pulse);
        ctx.textAlign = 'center';
        const titleSize = Math.round(s1 * 0.085);
        ctx.font = `bold ${titleSize}px "Segoe UI", system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillText('PAPER TOSS', 2, 2);
        ctx.fillStyle = '#FFD700';
        ctx.shadowColor = '#FF8C00'; ctx.shadowBlur = 25;
        ctx.fillText('PAPER TOSS', 0, 0); ctx.shadowBlur = 0;
        ctx.restore();

        const subSize = Math.round(s1 * 0.022);
        ctx.font = `${subSize}px "Segoe UI", system-ui, sans-serif`;
        ctx.fillStyle = '#8BE9FD'; ctx.textAlign = 'center';
        ctx.fillText('FLUNKS HIGH SCHOOL EDITION', W / 2, titleY + titleSize * 0.5);

        const bob = Math.sin(T * 0.04) * 8;
        const paperY = L.isPortrait ? H * 0.32 : H * 0.4;
        drawThrowable(ctx, W / 2, paperY + bob, Math.sin(T * 0.025) * 0.2, 1.4, 'paper');

        // Bin glow
        ctx.save(); ctx.globalAlpha = 0.3 + Math.sin(T * 0.05) * 0.1;
        const gl = ctx.createRadialGradient(binCX, binTopY, 5, binCX, binTopY, binW * 1.4);
        gl.addColorStop(0, 'rgba(255,215,0,0.5)'); gl.addColorStop(1, 'rgba(255,215,0,0)');
        ctx.fillStyle = gl;
        ctx.beginPath(); ctx.ellipse(binCX, binTopY, binW * 1.4, binW * 0.7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.restore();

        const tapSize = Math.round(s1 * 0.035);
        const tapY = L.isPortrait ? H * 0.75 : H * 0.8;
        ctx.font = `${tapSize}px "Segoe UI", system-ui, sans-serif`; ctx.fillStyle = '#FFD700'; ctx.textAlign = 'center';
        if (Math.sin(T * 0.06) > 0) ctx.fillText('TAP TO START', W / 2, tapY);
        const hintSize = Math.round(s1 * 0.02);
        ctx.font = `${hintSize}px "Segoe UI", system-ui, sans-serif`; ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('Swipe UP to throw · Miss once = game over!', W / 2, tapY + tapSize * 1.1);
        fid = requestAnimationFrame(draw); return;
      }

      // ═══ GAME OVER ═══
      if (ph === 'gameOver') {
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H);
        const s1 = Math.min(W, H);
        const goSize = Math.round(s1 * 0.08);
        ctx.font = `bold ${goSize}px "Segoe UI", system-ui, sans-serif`;
        ctx.textAlign = 'center'; ctx.fillStyle = '#FF5555';
        ctx.shadowColor = '#FF0000'; ctx.shadowBlur = 20;
        const goY = H * 0.18;
        ctx.fillText('GAME OVER', W / 2, goY); ctx.shadowBlur = 0;
        const scoreSize = Math.round(s1 * 0.15);
        ctx.font = `bold ${scoreSize}px "Segoe UI", system-ui, sans-serif`; ctx.fillStyle = '#FFD700';
        ctx.fillText(`${streak}`, W / 2, goY + scoreSize * 0.9);
        const labelSize = Math.round(s1 * 0.03);
        ctx.font = `${labelSize}px "Segoe UI", system-ui, sans-serif`; ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText('CONSECUTIVE', W / 2, goY + scoreSize * 0.9 + labelSize * 1.3);
        ctx.fillStyle = '#8BE9FD';
        ctx.fillText(`Best: ${bs}`, W / 2, goY + scoreSize * 0.9 + labelSize * 2.8);
        ctx.fillStyle = '#BD93F9';
        const acc = s.current.tosses ? Math.round((s.current.makes / s.current.tosses) * 100) : 0;
        ctx.fillText(`Accuracy: ${acc}% (${s.current.makes}/${s.current.tosses})`, W / 2, goY + scoreSize * 0.9 + labelSize * 4.3);
        if (Math.sin(T * 0.06) > 0) {
          const tapSize2 = Math.round(s1 * 0.032);
          ctx.font = `bold ${tapSize2}px "Segoe UI", system-ui, sans-serif`; ctx.fillStyle = '#FFD700';
          ctx.fillText('TAP TO PLAY AGAIN', W / 2, H * 0.85);
        }
        updateParticles(ctx, parts);
        fid = requestAnimationFrame(draw); return;
      }

      // ═══ LEVEL UP SCREEN ═══
      if (ph === 'levelUp') {
        ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H);
        levelUpTimer.current += 1;
        const lu = levelUpTimer.current;
        const s1 = Math.min(W, H);
        const scale = Math.min(1, lu / 12) * (1 + Math.sin(lu * 0.08) * 0.02);
        ctx.save(); ctx.translate(W / 2, H * 0.3); ctx.scale(scale, scale);
        const luSize = Math.round(s1 * 0.09);
        ctx.font = `bold ${luSize}px "Segoe UI", system-ui, sans-serif`;
        ctx.textAlign = 'center'; ctx.fillStyle = '#FFD700';
        ctx.shadowColor = '#FF8C00'; ctx.shadowBlur = 30;
        ctx.fillText('LEVEL UP!', 0, 0); ctx.shadowBlur = 0;
        ctx.restore();
        const nextDi = Math.min(di + 1, DIFFS.length - 1);
        const nd = DIFFS[nextDi]!;
        const nameSize = Math.round(s1 * 0.05);
        ctx.font = `bold ${nameSize}px "Segoe UI", system-ui, sans-serif`;
        ctx.textAlign = 'center'; ctx.fillStyle = '#8BE9FD';
        ctx.fillText(`Lv${nextDi + 1}: ${nd.name}`, W / 2, H * 0.45);
        const descSize = Math.round(s1 * 0.025);
        ctx.font = `${descSize}px "Segoe UI", system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText(nd.desc, W / 2, H * 0.52);
        // Show challenges
        const challenges: string[] = [];
        if (nd.windBase !== 0) challenges.push(nd.gusty ? '💨 Gusty wind' : '🌬️ Steady wind');
        if (nd.fan !== 'none') challenges.push(`🌀 Fan from ${nd.fan}`);
        if (nd.binDrift > 0) challenges.push('🎯 Moving bin');
        if (challenges.length) {
          const chSize = Math.round(s1 * 0.022);
          ctx.font = `${chSize}px "Segoe UI", system-ui, sans-serif`;
          ctx.fillStyle = '#FF79C6';
          challenges.forEach((ch, i) => ctx.fillText(ch, W / 2, H * 0.58 + i * chSize * 1.5));
        }
        updateParticles(ctx, parts);
        fid = requestAnimationFrame(draw); return;
      }

      // ═══ GAMEPLAY ═══

      // Bin drift (wobble side to side on later levels)
      if (d.binDrift > 0) {
        const drift = Math.sin(T * d.binDrift) * W * 0.06;
        // Temporarily shift binCX for rendering — flight physics use base binCX
        // We apply drift to the drawn bin and the hit detection uses it too
        (L as { binCX: number }).binCX = L.W * 0.5 + drift;
      } else {
        (L as { binCX: number }).binCX = L.W * 0.5;
      }

      // Fan visual
      if (d.fan !== 'none') drawFan(ctx, d.fan, T, W, H, L);

      // Score glow
      if (binBounce.current > 1) {
        const int = binBounce.current / 10;
        ctx.save(); ctx.globalAlpha = int * 0.5;
        const bg2 = ctx.createRadialGradient(binCX, binTopY, 3, binCX, binTopY, binW);
        bg2.addColorStop(0, 'rgba(80,250,123,0.7)'); bg2.addColorStop(1, 'rgba(80,250,123,0)');
        ctx.fillStyle = bg2;
        ctx.beginPath(); ctx.ellipse(binCX, binTopY, binW, binW * 0.35, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.restore();
      }

      // Wind
      if (d.gusty || d.windBase !== 0) drawWindStreams(ctx, T, windNow.current, W, H);
      drawWindIndicator(ctx, windDisp.current, d.gusty, W);

      // Flying paper
      if (fl && !fl.landed && ph === 'flying') {
        const ds = 1 - fl.z * 0.6;
        ctx.fillStyle = `rgba(0,0,0,${0.1 * ds})`;
        const shdY = H * 0.78 - fl.z * (H * 0.78 - binTopY - 15);
        ctx.beginPath(); ctx.ellipse(fl.x, shdY, 10 * ds, 3 * ds, 0, 0, Math.PI * 2); ctx.fill();
        drawThrowable(ctx, fl.x, fl.y, fl.rot, ds, to);
      }

      // Scored → sink
      if (fl && fl.landed && ph === 'scored') {
        const sf = Math.min(15, fl.sinkFrame + 1);
        if (fl.sinkFrame < 15) setFly(p => p ? { ...p, sinkFrame: sf } : p);
        const sp = sf / 15;
        const ds = 0.32 * (1 - sp * 0.5);
        const sy = binTopY + sp * 12;
        ctx.save();
        ctx.beginPath(); ctx.ellipse(binCX, binTopY + 2, binRimRX - 4, binRimRY - 1, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = 1 - sp * 0.7;
        drawThrowable(ctx, fl.x, sy, fl.rot, ds, to);
        ctx.globalAlpha = 1; ctx.restore();

        const s1 = Math.min(W, H);
        const msgSize = Math.round(s1 * 0.06);
        ctx.font = `bold ${msgSize}px "Segoe UI", system-ui, sans-serif`;
        ctx.textAlign = 'center'; ctx.fillStyle = '#50FA7B';
        ctx.shadowColor = '#00FF88'; ctx.shadowBlur = 14;
        const ny = binTopY - binH * 0.6 + Math.sin(T * 0.1) * 3;
        const lbl = ['SWISH!', 'NICE!', 'CLEAN!', 'MONEY!', 'PERFECT!', 'KOBE!'];
        ctx.fillText(lbl[streak % lbl.length]!, W / 2, ny); ctx.shadowBlur = 0;
        if (streak > 1) {
          const streakSize = Math.round(s1 * 0.035);
          ctx.font = `bold ${streakSize}px "Segoe UI", system-ui, sans-serif`; ctx.fillStyle = '#FFD700';
          ctx.fillText(`🔥 ${streak}x STREAK`, W / 2, ny + msgSize * 0.8);
        }
      }

      // Paper in hand
      if (ph === 'ready' || ph === 'aiming') {
        const hx = W / 2, hy = L.handY;
        const ox = dd.on ? (dd.cx - dd.sx) * 0.12 : 0;
        const oy = dd.on ? Math.min(0, (dd.cy - dd.sy) * 0.07) : Math.sin(T * 0.04) * 2;
        drawThrowable(ctx, hx + ox, hy + oy, 0, 1.05, to);

        if (!dd.on) {
          ctx.globalAlpha = 0.3 + Math.sin(T * 0.06) * 0.12;
          ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2; ctx.lineCap = 'round';
          const ay = hy - 28;
          ctx.beginPath(); ctx.moveTo(hx, ay + 12); ctx.lineTo(hx, ay); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(hx - 5, ay + 5); ctx.lineTo(hx, ay); ctx.lineTo(hx + 5, ay + 5); ctx.stroke();
          ctx.lineCap = 'butt'; ctx.globalAlpha = 1;
        }

        if (dd.on && ph === 'aiming') {
          const dxx = dd.cx - dd.sx, dyy = dd.cy - dd.sy;
          const maxSwipeDist = L.isPortrait ? 350 : 250;
          const pwr = Math.min(1, Math.abs(dyy) / maxSwipeDist);
          const side = dxx * THROW_POWER;
          const minSwipe = L.isPortrait ? -40 : -25;
          if (dyy < minSwipe) {
            for (let i = 1; i <= 10; i++) {
              const prog = i / L.flightFrames;
              const wd = windNow.current * WIND_MULT * prog * prog;
              const td = side * prog * L.flightFrames;
              const px = W / 2 + td + wd;
              const aH = L.arcHeight * pwr;
              const py = L.handY - aH * Math.sin(prog * Math.PI) + (binTopY - L.handY + aH * 0.3) * prog;
              const dsc = 1 - prog * 0.6;
              ctx.fillStyle = `rgba(255,215,0,${(1 - i / 10) * 0.4})`;
              ctx.beginPath(); ctx.arc(px, py, 2 * dsc, 0, Math.PI * 2); ctx.fill();
            }
            const bw = Math.min(W * 0.3, 120), bh = 8, bx = W / 2 - bw / 2, barY = H - 14;
            ctx.fillStyle = 'rgba(0,0,0,0.5)'; fillRR(ctx, bx - 2, barY - 2, bw + 4, bh + 4, 4);
            const pg = ctx.createLinearGradient(bx, 0, bx + bw * pwr, 0);
            pg.addColorStop(0, '#50FA7B'); pg.addColorStop(0.6, '#FFD700'); pg.addColorStop(1, '#FF5555');
            ctx.fillStyle = pg; fillRR(ctx, bx, barY, bw * pwr, bh, 3);
          }
        }
      }

      // Missed
      if (fl && fl.landed && ph === 'missed') {
        ctx.globalAlpha = 0.7;
        drawThrowable(ctx, fl.x, fl.y, fl.rot + 0.5, 0.3, to);
        ctx.globalAlpha = 1;
        const s1 = Math.min(W, H);
        const missSize = Math.round(s1 * 0.07);
        ctx.font = `bold ${missSize}px "Segoe UI", system-ui, sans-serif`;
        ctx.textAlign = 'center'; ctx.fillStyle = '#FF5555';
        ctx.shadowColor = '#FF0000'; ctx.shadowBlur = 14;
        ctx.fillText('MISS!', W / 2, binTopY - binH); ctx.shadowBlur = 0;
      }

      drawHUD(ctx, d, di, streak, bs, W, H, s.current.makesInLevel);
      drawObjBtn(ctx, to, W, H);
      updateParticles(ctx, parts);
      fid = requestAnimationFrame(draw);
    };

    fid = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(fid);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, diffIdx, con, best, makes, tosses, fly, throwObj, canvasSize, makesInLevel]);

  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const p = pos(e);
    const L = layoutRef.current;
    if (p.x > L.W - 50 && p.y > L.H - 50 && (s.current.phase === 'ready' || s.current.phase === 'aiming')) {
      e.preventDefault(); e.stopPropagation(); setShowPicker(prev => !prev); return;
    }
    if (showPicker && p.y > L.H - 190) {
      const idx = Math.floor((p.y - (L.H - 180)) / 28);
      if (idx >= 0 && idx < THROW_OBJECTS.length) setThrowObj(THROW_OBJECTS[idx]!);
      setShowPicker(false); return;
    }
    if (showPicker) { setShowPicker(false); return; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPicker]);

  return (
    <div ref={containerRef} style={{
      width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center',
      position: 'relative', background: '#1a1810', userSelect: 'none', touchAction: 'none', overflow: 'hidden',
    }}>
      <canvas
        ref={cvs} width={canvasSize.w} height={canvasSize.h}
        onClick={handleClick}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
        style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
      />
      {showPicker && (
        <div style={{
          position: 'absolute', bottom: 50, right: 8, background: 'rgba(20,20,40,0.95)',
          borderRadius: 10, padding: '6px 4px', display: 'flex', flexDirection: 'column', gap: 2,
          border: '1px solid rgba(255,215,0,0.3)', zIndex: 10,
        }}>
          {THROW_OBJECTS.map(obj => (
            <button key={obj} onClick={() => { setThrowObj(obj); setShowPicker(false); }}
              style={{
                background: obj === throwObj ? 'rgba(255,215,0,0.2)' : 'transparent',
                border: 'none', color: '#FFD700', padding: '5px 14px', cursor: 'pointer',
                fontSize: 12, textAlign: 'left', borderRadius: 6, fontFamily: 'Segoe UI, system-ui, sans-serif',
              }}>
              {THROW_LABELS[obj]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
//  DRAW HELPERS
// ════════════════════════════════════════════════════════════════════

function fillRR(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w <= 0 || h <= 0) return;
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath(); ctx.fill();
}

// ── ISOMETRIC TRASH CAN (3/4 perspective, cylindrical) ────────────
function drawBin(ctx: CanvasRenderingContext2D, L: Layout, bounce: number, _time: number) {
  const { binCX: cx, binTopY, binW: w, binH: h } = L;
  const by = binTopY - bounce * 0.3;

  // Isometric ellipse radii — wide horizontal, compressed vertical (top-down perspective)
  const rimRX = w * 0.54;           // wide rim
  const rimRY = w * 0.18;           // squashed for 3/4 view
  const botRX = rimRX * 0.82;       // bottom slightly narrower (tapered)
  const botRY = rimRY * 0.75;
  const bodyBot = by + h;            // bottom center Y

  ctx.save();

  // ── Floor shadow (ellipse on ground) ──
  ctx.fillStyle = 'rgba(20,15,8,0.3)';
  ctx.beginPath();
  ctx.ellipse(cx + 2, bodyBot + botRY + 4, botRX + 8, botRY * 0.7 + 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Bottom ellipse (visible base) ──
  ctx.fillStyle = '#5c5850';
  ctx.strokeStyle = 'rgba(40,35,25,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(cx, bodyBot, botRX, botRY, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // ── Body: connect rim ellipse to bottom ellipse with curved sides ──
  const bodyG = ctx.createLinearGradient(cx - rimRX, 0, cx + rimRX, 0);
  bodyG.addColorStop(0, '#6e6960');
  bodyG.addColorStop(0.12, '#827c74');
  bodyG.addColorStop(0.3, '#9a9488');
  bodyG.addColorStop(0.45, '#a8a296');
  bodyG.addColorStop(0.55, '#b0aa9e');
  bodyG.addColorStop(0.7, '#a49e92');
  bodyG.addColorStop(0.88, '#8a847a');
  bodyG.addColorStop(1, '#706a62');
  ctx.fillStyle = bodyG;

  // Draw the body as a shape: left side arc down, bottom ellipse, right side arc up
  ctx.beginPath();
  // Start at top-left of rim
  ctx.ellipse(cx, by, rimRX, rimRY, 0, Math.PI, 0, true); // top half (rim) going left→right across bottom
  // Right side curves down to bottom-right
  ctx.quadraticCurveTo(cx + rimRX + 2, by + h * 0.5, cx + botRX, bodyBot);
  // Bottom ellipse arc (front half: right→left)
  ctx.ellipse(cx, bodyBot, botRX, botRY, 0, 0, Math.PI, false);
  // Left side curves back up to top-left
  ctx.quadraticCurveTo(cx - rimRX - 2, by + h * 0.5, cx - rimRX, by);
  ctx.closePath();
  ctx.fill();

  // ── Body outline ──
  ctx.strokeStyle = 'rgba(45,38,28,0.3)';
  ctx.lineWidth = 1.3;
  ctx.lineJoin = 'round';
  // Left edge
  ctx.beginPath();
  ctx.moveTo(cx - rimRX, by);
  ctx.quadraticCurveTo(cx - rimRX - 2, by + h * 0.5, cx - botRX, bodyBot);
  ctx.stroke();
  // Right edge
  ctx.beginPath();
  ctx.moveTo(cx + rimRX, by);
  ctx.quadraticCurveTo(cx + rimRX + 2, by + h * 0.5, cx + botRX, bodyBot);
  ctx.stroke();

  // ── Left shadow (cylindrical shading) ──
  ctx.fillStyle = 'rgba(40,32,22,0.12)';
  ctx.beginPath();
  ctx.moveTo(cx - rimRX, by);
  ctx.quadraticCurveTo(cx - rimRX - 2, by + h * 0.5, cx - botRX, bodyBot);
  ctx.lineTo(cx - botRX + w * 0.12, bodyBot);
  ctx.quadraticCurveTo(cx - rimRX + w * 0.1, by + h * 0.5, cx - rimRX + w * 0.08, by);
  ctx.closePath(); ctx.fill();

  // ── Right highlight (cylindrical shading) ──
  ctx.fillStyle = 'rgba(255,248,235,0.07)';
  ctx.beginPath();
  ctx.moveTo(cx + rimRX - w * 0.12, by + 2);
  ctx.quadraticCurveTo(cx + rimRX - w * 0.08, by + h * 0.5, cx + botRX - w * 0.1, bodyBot - 2);
  ctx.lineTo(cx + botRX - w * 0.03, bodyBot - 2);
  ctx.quadraticCurveTo(cx + rimRX + 1, by + h * 0.5, cx + rimRX - w * 0.04, by + 2);
  ctx.closePath(); ctx.fill();

  // ── Horizontal ribs (bands on the body for detail) ──
  ctx.strokeStyle = 'rgba(60,52,40,0.08)';
  ctx.lineWidth = 0.8;
  for (let i = 1; i <= 2; i++) {
    const frac = i / 3;
    const ribY = by + h * frac;
    const ribRX = rimRX + (botRX - rimRX) * frac;
    const ribRY = rimRY + (botRY - rimRY) * frac;
    ctx.beginPath();
    ctx.ellipse(cx, ribY, ribRX, ribRY, 0, Math.PI * 0.02, Math.PI * 0.98);
    ctx.stroke();
  }

  // ── "TRASH" text on the front face ──
  ctx.save();
  const trashSize = Math.max(7, Math.round(w * 0.16));
  ctx.font = `bold ${trashSize}px "Segoe UI", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(45,38,28,0.35)';
  const textY = by + h * 0.52;
  // Slight scale to fake perspective on text
  ctx.translate(cx, textY);
  ctx.scale(1, 0.85);
  ctx.fillText('TRASH', 0, 0);
  ctx.restore();

  // ── Rim (thick metallic ring at the top) ──
  // Rim band thickness
  const rimThick = Math.max(3, w * 0.06);
  // Outer rim
  const orimG = ctx.createLinearGradient(cx - rimRX, by - rimThick, cx + rimRX, by - rimThick);
  orimG.addColorStop(0, '#7a756c');
  orimG.addColorStop(0.15, '#9e9888');
  orimG.addColorStop(0.35, '#c0b8a8');
  orimG.addColorStop(0.5, '#d0c8b8');
  orimG.addColorStop(0.65, '#c0b8a8');
  orimG.addColorStop(0.85, '#9e9888');
  orimG.addColorStop(1, '#7a756c');
  ctx.fillStyle = orimG;
  ctx.beginPath();
  ctx.ellipse(cx, by, rimRX + 2, rimRY + rimThick * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Rim outline
  ctx.strokeStyle = 'rgba(45,38,28,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(cx, by, rimRX + 2, rimRY + rimThick * 0.4, 0, 0, Math.PI * 2);
  ctx.stroke();

  // ── Inner darkness (the opening) ──
  const innerG = ctx.createRadialGradient(cx, by, 1, cx, by, rimRX * 0.85);
  innerG.addColorStop(0, '#141210');
  innerG.addColorStop(0.7, '#1e1c16');
  innerG.addColorStop(1, '#2a2620');
  ctx.fillStyle = innerG;
  ctx.beginPath();
  ctx.ellipse(cx, by, rimRX - 3, rimRY - 1, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Rim top highlight arc ──
  ctx.strokeStyle = 'rgba(255,250,235,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(cx, by - 1, rimRX, rimRY + rimThick * 0.3, 0, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();

  // ── Scattered crumpled papers on the floor ──
  const floorOff = h + botRY + 4;
  drawFloorPaper(ctx, cx - w * 0.7, by + floorOff, 0.3);
  drawFloorPaper(ctx, cx + w * 0.6, by + floorOff + 2, -0.5);
  drawFloorPaper(ctx, cx - w * 0.2, by + floorOff + 8, 0.7);
  drawFloorPaper(ctx, cx + w * 0.85, by + floorOff - 2, 1.2);

  ctx.restore();
}

function drawFloorPaper(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(0.4, 0.4);
  ctx.fillStyle = '#d8d4cc';
  ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 3; ctx.shadowOffsetY = 1;
  ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(160,155,145,0.5)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(-5, -5); ctx.quadraticCurveTo(1, 0, -3, 6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(4, -6); ctx.quadraticCurveTo(-1, 1, 6, 5); ctx.stroke();
  ctx.restore();
}

// ── OPEN WINDOW (drawn on wall from level 2+) ─────────────────────
function drawOpenWindow(
  ctx: CanvasRenderingContext2D, time: number, wind: number,
  W: number, H: number, L: Layout,
) {
  // Position: upper-right area of the room wall
  const wW = W * 0.16;     // window width
  const wH = H * 0.32;     // window height
  const wX = L.isPortrait ? W * 0.68 : W * 0.76;  // left edge
  const wY = H * 0.06;     // top edge

  ctx.save();

  // ── Window hole (sky/outside) ──
  const skyGrad = ctx.createLinearGradient(wX, wY, wX, wY + wH);
  skyGrad.addColorStop(0, '#87CEEB');
  skyGrad.addColorStop(0.6, '#B0E0F6');
  skyGrad.addColorStop(1, '#C8F0C8');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(wX, wY, wW, wH);

  // Clouds drifting by
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  const cloudOff = (time * 0.3) % (wW + 30);
  ctx.beginPath();
  ctx.ellipse(wX + cloudOff - 5, wY + wH * 0.25, 14, 6, 0, 0, Math.PI * 2);
  ctx.ellipse(wX + cloudOff + 8, wY + wH * 0.22, 10, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  const cloudOff2 = ((time * 0.2) + wW * 0.5) % (wW + 20);
  ctx.beginPath();
  ctx.ellipse(wX + cloudOff2, wY + wH * 0.55, 11, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Window frame (wood/brown) ──
  const frameW = Math.max(2, W * 0.006);
  ctx.strokeStyle = '#5D4037';
  ctx.lineWidth = frameW * 2;
  ctx.strokeRect(wX, wY, wW, wH);
  // Cross bars
  ctx.lineWidth = frameW;
  ctx.beginPath();
  ctx.moveTo(wX + wW / 2, wY); ctx.lineTo(wX + wW / 2, wY + wH);
  ctx.moveTo(wX, wY + wH / 2); ctx.lineTo(wX + wW, wY + wH / 2);
  ctx.stroke();

  // ── Open pane (pushed outward, top-right half swung open) ──
  ctx.save();
  ctx.translate(wX + wW, wY);
  // Slight 3D rotation effect — narrower toward hinge
  const paneW = wW * 0.42;
  const paneH = wH * 0.48;
  ctx.fillStyle = 'rgba(180,220,255,0.35)';
  ctx.strokeStyle = '#5D4037';
  ctx.lineWidth = frameW;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(paneW * 0.6, -paneH * 0.08);
  ctx.lineTo(paneW * 0.6, paneH * 0.88);
  ctx.lineTo(0, paneH);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // ── Curtains blowing in the wind ──
  const absWind = Math.abs(wind);
  const windDir = wind >= 0 ? 1 : -1;
  const flutter = Math.sin(time * 0.08) * 6 + absWind * 12;
  const curtainW = wW * 0.22;
  const curtainH = wH * 0.85;

  // Left curtain
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = '#E8D5B7';
  ctx.beginPath();
  ctx.moveTo(wX + frameW, wY + frameW);
  ctx.lineTo(wX + frameW, wY + curtainH);
  ctx.quadraticCurveTo(
    wX + frameW + curtainW + flutter * windDir * 0.5,
    wY + curtainH * 0.6,
    wX + frameW + curtainW * 0.3 + flutter * windDir * 0.3,
    wY + curtainH
  );
  ctx.lineTo(wX + frameW + curtainW + flutter * windDir, wY + frameW);
  ctx.closePath();
  ctx.fill();

  // Right curtain
  ctx.beginPath();
  ctx.moveTo(wX + wW - frameW, wY + frameW);
  ctx.lineTo(wX + wW - frameW, wY + curtainH);
  ctx.quadraticCurveTo(
    wX + wW - frameW - curtainW + flutter * windDir * 0.7,
    wY + curtainH * 0.5,
    wX + wW - frameW - curtainW * 0.3 + flutter * windDir * 0.4,
    wY + curtainH
  );
  ctx.lineTo(wX + wW - frameW - curtainW + flutter * windDir, wY + frameW);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  // ── Windowsill ──
  ctx.fillStyle = '#6D4C41';
  const sillH = Math.max(3, H * 0.012);
  ctx.fillRect(wX - frameW, wY + wH, wW + frameW * 2, sillH);
  // Sill highlight
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(wX - frameW, wY + wH, wW + frameW * 2, sillH * 0.4);

  ctx.restore();
}

// ── DESK FAN (visual on gusty/fan levels) ─────────────────────────
function drawFan(ctx: CanvasRenderingContext2D, side: 'left' | 'right', time: number, W: number, H: number, L: Layout) {
  const fanX = side === 'left' ? W * 0.08 : W * 0.92;
  const fanY = L.binTopY - L.binH * 0.3;
  const fanR = Math.min(W, H) * 0.06;

  ctx.save();
  ctx.translate(fanX, fanY);

  // Base/stand
  ctx.fillStyle = '#4a4540';
  ctx.beginPath();
  ctx.moveTo(-fanR * 0.3, fanR * 1.2); ctx.lineTo(fanR * 0.3, fanR * 1.2);
  ctx.lineTo(fanR * 0.15, fanR * 0.4); ctx.lineTo(-fanR * 0.15, fanR * 0.4);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3a3530';
  ctx.beginPath();
  ctx.ellipse(0, fanR * 1.25, fanR * 0.45, fanR * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cage circle
  ctx.strokeStyle = 'rgba(100,95,85,0.5)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, fanR, 0, Math.PI * 2); ctx.stroke();
  // Inner cage circle
  ctx.strokeStyle = 'rgba(100,95,85,0.3)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.arc(0, 0, fanR * 0.7, 0, Math.PI * 2); ctx.stroke();

  // Spinning blades
  const bladeCount = 3;
  const rotSpeed = 0.15;
  const angle = time * rotSpeed;
  ctx.globalAlpha = 0.6;
  for (let i = 0; i < bladeCount; i++) {
    const a = angle + (i * Math.PI * 2) / bladeCount;
    ctx.save();
    ctx.rotate(a);
    ctx.fillStyle = '#6a6560';
    ctx.beginPath();
    ctx.ellipse(fanR * 0.4, 0, fanR * 0.45, fanR * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // Center hub
  ctx.fillStyle = '#555048';
  ctx.beginPath(); ctx.arc(0, 0, fanR * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3a3530';
  ctx.beginPath(); ctx.arc(0, 0, fanR * 0.08, 0, Math.PI * 2); ctx.fill();

  // Wind lines coming from fan
  const dir = side === 'left' ? 1 : -1;
  ctx.strokeStyle = 'rgba(180,210,255,0.15)'; ctx.lineWidth = 1; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const ly = -fanR * 0.5 + i * fanR * 0.35;
    const phase = time * 0.08 + i * 1.2;
    const waveX = Math.sin(phase) * 3;
    const startX = dir * (fanR + 4);
    const endX = dir * (fanR + 18 + Math.sin(phase) * 5);
    ctx.beginPath();
    ctx.moveTo(startX, ly);
    ctx.quadraticCurveTo(startX + dir * 8, ly + waveX, endX, ly + waveX * 0.5);
    ctx.stroke();
  }
  ctx.lineCap = 'butt';

  ctx.restore();
}

// ── WIND STREAMS ──────────────────────────────────────────────────
function drawWindStreams(ctx: CanvasRenderingContext2D, time: number, wind: number, W: number, H: number) {
  const dir = wind > 0 ? 1 : wind < 0 ? -1 : 0;
  if (dir === 0) return;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 1.2;
  const count = Math.min(7, 2 + Math.floor(Math.abs(wind) * 3));
  for (let i = 0; i < count; i++) {
    const baseY = H * 0.25 + (i * 157 + 41) % (H * 0.45);
    const baseX = dir > 0 ? 20 + (i * 83) % (W * 0.23) : W - 20 - (i * 83) % (W * 0.23);
    const wv = Math.sin(time * 0.04 + i * 1.6) * 5;
    const len = 15 + Math.abs(wind) * 30 + Math.sin(time * 0.03 + i) * 6;
    const alpha = Math.max(0.05, 0.08 + Math.abs(wind) * 0.08);
    ctx.strokeStyle = `rgba(220,230,255,${alpha})`;
    ctx.beginPath(); ctx.moveTo(baseX, baseY + wv);
    ctx.quadraticCurveTo(baseX + dir * len * 0.5, baseY + wv + Math.sin(time * 0.06 + i) * 3, baseX + dir * len, baseY + wv - 1);
    ctx.stroke();
    if (i % 2 === 0) {
      const ex = baseX + dir * len, ey = baseY + wv - 1;
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - dir * 4, ey - 3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - dir * 4, ey + 3); ctx.stroke();
    }
  }
  ctx.lineCap = 'butt'; ctx.restore();
}

// ── WIND INDICATOR ────────────────────────────────────────────────
function drawWindIndicator(ctx: CanvasRenderingContext2D, wind: number, gusty: boolean, W: number) {
  const cx = W / 2, cy = 42;
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; fillRR(ctx, cx - 68, cy - 15, 136, 30, 15);
  const sp = Math.abs(wind);
  ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = gusty ? '#FF79C6' : '#8BE9FD';
  ctx.fillText(sp.toFixed(1), cx, cy);
  ctx.font = '8px "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillText(gusty ? 'GUSTY WIND' : 'WIND', cx, cy - 8);
  const dir = wind > 0 ? 1 : wind < 0 ? -1 : 0;
  if (dir !== 0) {
    const n = Math.min(3, Math.ceil(sp));
    for (let i = 0; i < n; i++) {
      const ax = cx + dir * (24 + i * 11);
      const a = 0.4 + (1 - i / n) * 0.5;
      ctx.fillStyle = gusty ? `rgba(255,121,198,${a})` : `rgba(139,233,253,${a})`;
      ctx.beginPath(); ctx.moveTo(ax + dir * 5, cy - 1); ctx.lineTo(ax - dir * 3, cy - 6); ctx.lineTo(ax - dir * 3, cy + 4);
      ctx.closePath(); ctx.fill();
    }
  }
}

// ── HUD ───────────────────────────────────────────────────────────
function drawHUD(ctx: CanvasRenderingContext2D, d: Diff, di: number, streak: number, best: number, W: number, H: number, makesInLvl: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 0, W, 26);
  ctx.font = '10px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'left'; ctx.fillStyle = '#BD93F9';
  ctx.fillText(`Lv${di + 1}  ${d.name}`, 10, 12);
  ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText(`Best: ${best}`, W - 10, 12);
  // Level progress bar
  const needed = d.makesNeeded;
  const barW = Math.min(W * 0.35, 130), barH = 4;
  const barX = (W - barW) / 2, barY = 19;
  ctx.fillStyle = 'rgba(255,255,255,0.1)'; fillRR(ctx, barX, barY, barW, barH, 2);
  const prog = Math.min(1, makesInLvl / needed);
  if (prog > 0) {
    const pg = ctx.createLinearGradient(barX, 0, barX + barW * prog, 0);
    pg.addColorStop(0, '#50FA7B'); pg.addColorStop(1, '#FFD700');
    ctx.fillStyle = pg;
    fillRR(ctx, barX, barY, barW * prog, barH, 2);
  }
  ctx.font = '7px "Segoe UI", system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText(`${makesInLvl}/${needed}`, W / 2, barY + barH + 8);
  // Big streak
  const streakSize = Math.round(Math.min(W, H) * 0.08);
  ctx.font = `bold ${streakSize}px "Segoe UI", system-ui, sans-serif`; ctx.textAlign = 'right';
  ctx.fillStyle = streak > 0 ? '#FFD700' : 'rgba(255,215,0,0.2)';
  if (streak > 0) { ctx.shadowColor = 'rgba(255,215,0,0.35)'; ctx.shadowBlur = 8; }
  ctx.fillText(`${streak}`, W - 10, H - streakSize * 1.1); ctx.shadowBlur = 0;
  ctx.font = '8px "Segoe UI", system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillText('STREAK', W - 10, H - streakSize * 0.75);
}

// ── OBJ BUTTON ────────────────────────────────────────────────────
function drawObjBtn(ctx: CanvasRenderingContext2D, obj: ThrowObj, W: number, H: number) {
  const x = W - 32, y = H - 32, r = 15;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,215,0,0.25)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.font = '13px "Segoe UI", system-ui, sans-serif'; ctx.textAlign = 'center';
  const em: Record<ThrowObj, string> = { paper: '📄', airplane: '✈️', note: '📝', banana: '🍌', soda: '🥤' };
  ctx.fillText(em[obj], x, y + 4);
}

// ── THROWABLE OBJECTS ─────────────────────────────────────────────
function drawThrowable(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number, scale: number, type: ThrowObj) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(scale, scale);
  if (type === 'airplane') {
    ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 5; ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#F0EDE6';
    ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(18, 7); ctx.lineTo(0, 2); ctx.lineTo(-18, 7); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = '#C0BAB0'; ctx.lineWidth = 0.7; ctx.stroke();
    ctx.strokeStyle = '#A8A298'; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(0, 7); ctx.stroke();
  } else if (type === 'note') {
    ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#FFF9C4'; ctx.fillRect(-12, -12, 24, 24); ctx.shadowBlur = 0;
    ctx.strokeStyle = '#E6D98A'; ctx.lineWidth = 0.5; ctx.strokeRect(-12, -12, 24, 24);
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-8, -6 + i * 5); ctx.lineTo(8, -6 + i * 5); ctx.stroke(); }
  } else if (type === 'banana') {
    ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 5; ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#FFE135';
    ctx.beginPath(); ctx.moveTo(-2, -12); ctx.quadraticCurveTo(14, -7, 12, 7);
    ctx.quadraticCurveTo(7, 14, -3, 9); ctx.quadraticCurveTo(-10, 3, -7, -9);
    ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = '#DAB820'; ctx.lineWidth = 0.7; ctx.stroke();
    ctx.fillStyle = '#8B6914'; ctx.beginPath(); ctx.arc(-2, -11, 1.8, 0, Math.PI * 2); ctx.fill();
  } else if (type === 'soda') {
    ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 5; ctx.shadowOffsetY = 2;
    const cg = ctx.createLinearGradient(-7, 0, 7, 0);
    cg.addColorStop(0, '#CC2222'); cg.addColorStop(0.3, '#FF4444'); cg.addColorStop(0.5, '#FF6666');
    cg.addColorStop(0.7, '#FF4444'); cg.addColorStop(1, '#CC2222');
    ctx.fillStyle = cg; fillRR(ctx, -7, -12, 14, 24, 3); ctx.shadowBlur = 0;
    ctx.fillStyle = '#C0C0C0'; ctx.fillRect(-6, -12, 12, 3);
    ctx.fillStyle = '#A0A0A0'; ctx.fillRect(-6, 9, 12, 3);
  } else {
    // Crumpled paper ball — irregular blobby shape
    ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
    const g = ctx.createRadialGradient(-2, -3, 1, 1, 1, 14);
    g.addColorStop(0, '#FDFCF8'); g.addColorStop(0.25, '#F4F0E8');
    g.addColorStop(0.5, '#E8E2D8'); g.addColorStop(0.8, '#D8D2C6'); g.addColorStop(1, '#C8C2B6');
    ctx.fillStyle = g;
    // Irregular crumpled outline
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.quadraticCurveTo(6, -13, 10, -8);
    ctx.quadraticCurveTo(14, -4, 12, 1);
    ctx.quadraticCurveTo(13, 6, 9, 10);
    ctx.quadraticCurveTo(5, 13, 0, 11);
    ctx.quadraticCurveTo(-4, 13, -9, 9);
    ctx.quadraticCurveTo(-13, 5, -12, 0);
    ctx.quadraticCurveTo(-14, -5, -10, -9);
    ctx.quadraticCurveTo(-6, -13, 0, -12);
    ctx.closePath();
    ctx.fill(); ctx.shadowBlur = 0;
    // Crinkle/fold lines
    ctx.strokeStyle = 'rgba(140,132,120,0.35)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(-6, -8); ctx.quadraticCurveTo(-1, -2, -5, 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3, -10); ctx.quadraticCurveTo(0, -1, 4, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-9, 1); ctx.quadraticCurveTo(-2, 3, 8, -1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-4, -5); ctx.quadraticCurveTo(3, -3, 8, -7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-7, 5); ctx.quadraticCurveTo(0, 8, 7, 5); ctx.stroke();
    // Paper edge flap (small triangle sticking out)
    ctx.fillStyle = '#EDE8DE';
    ctx.beginPath(); ctx.moveTo(9, -6); ctx.lineTo(14, -10); ctx.lineTo(12, -4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(140,132,120,0.25)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(9, -6); ctx.lineTo(14, -10); ctx.lineTo(12, -4); ctx.closePath(); ctx.stroke();
    // Highlight
    ctx.fillStyle = 'rgba(255,255,250,0.3)';
    ctx.beginPath(); ctx.ellipse(-3, -5, 4, 2.5, -0.4, 0, Math.PI * 2); ctx.fill();
    // Subtle second highlight
    ctx.fillStyle = 'rgba(255,255,248,0.15)';
    ctx.beginPath(); ctx.ellipse(4, -2, 2.5, 1.5, 0.3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ── PARTICLES ─────────────────────────────────────────────────────
function updateParticles(ctx: CanvasRenderingContext2D, pRef: React.MutableRefObject<Particle[]>) {
  pRef.current = pRef.current.filter(p => {
    p.x += p.vx; p.y += p.vy; p.vy += 0.07; p.life -= 1;
    if (p.life <= 0) return false;
    ctx.globalAlpha = p.life / p.maxLife; ctx.fillStyle = p.color;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.life * 0.1);
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
    ctx.restore(); ctx.globalAlpha = 1;
    return true;
  });
}

export default PaperToss;
