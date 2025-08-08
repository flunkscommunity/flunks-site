import React, { useMemo, useState } from 'react';

const IconAnimationWindow: React.FC = () => {
  const [speed, setSpeed] = useState(1.2); // seconds per cycle
  const [amp, setAmp] = useState(8); // px amplitude for translate
  const [deg, setDeg] = useState(8); // degrees amplitude for rotate
  const [glow, setGlow] = useState(0.7); // glow intensity 0..1

  const cssVars = useMemo(() => ({
    // CSS variables applied to the preview grid so keyframes can read them
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ['--speed' as any]: `${speed}s`,
    ['--amp' as any]: `${amp}px`,
    ['--deg' as any]: `${deg}deg`,
    ['--glow' as any]: glow.toString(),
  }), [speed, amp, deg, glow]);

  return (
    <div className="w-full h-full p-4 text-white" style={{ fontFamily: 'monospace' }}>
      <style>{`
        /* Core animations (use CSS variables for live tuning) */
        @keyframes bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(calc(-1 * var(--amp))) scale(1.05); }
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 rgba(48,197,255,0.0); }
          50% { box-shadow: 0 0 calc(36px * var(--glow)) rgba(48,197,255,0.7); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(calc(-1 * var(--amp))); }
          75% { transform: translateX(var(--amp)); }
        }
        @keyframes hoverBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(calc(-0.6 * var(--amp))); }
        }
        @keyframes wobble {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(calc(-1 * var(--deg))); }
          75% { transform: rotate(var(--deg)); }
        }
        @keyframes flipY {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(180deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes sway {
          0%, 100% { transform: translateX(0) rotate(0); }
          50% { transform: translateX(var(--amp)) rotate(calc(var(--deg) / 2)); }
        }
        @keyframes jitter {
          0% { transform: translate(0,0) }
          25% { transform: translate(calc(0.4 * var(--amp)), calc(-0.4 * var(--amp))) }
          50% { transform: translate(calc(-0.4 * var(--amp)), calc(0.4 * var(--amp))) }
          75% { transform: translate(calc(0.3 * var(--amp)), calc(0.3 * var(--amp))) }
          100% { transform: translate(0,0) }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.06); }
          50% { transform: scale(0.98); }
          75% { transform: scale(1.04); }
        }
        @keyframes floaty {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(calc(-0.4 * var(--amp))); }
        }
        @keyframes tilt {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(var(--deg)); }
        }

        .anim { will-change: transform, box-shadow; }
      `}</style>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-wide">Icon Animation Lab</h2>
        <p className="opacity-90">Tweak speed and intensity, then preview common desktop icon effects.</p>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="text-sm md:col-span-1">Speed ({speed.toFixed(2)}s)</label>
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="md:col-span-3"
          />

          <label className="text-sm md:col-span-1">Amplitude ({amp}px)</label>
          <input
            type="range"
            min={2}
            max={20}
            step={1}
            value={amp}
            onChange={(e) => setAmp(parseInt(e.target.value))}
            className="md:col-span-3"
          />

          <label className="text-sm md:col-span-1">Angle ({deg}°)</label>
          <input
            type="range"
            min={2}
            max={20}
            step={1}
            value={deg}
            onChange={(e) => setDeg(parseInt(e.target.value))}
            className="md:col-span-3"
          />

          <label className="text-sm md:col-span-1">Glow ({glow.toFixed(2)})</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={glow}
            onChange={(e) => setGlow(parseFloat(e.target.value))}
            className="md:col-span-3"
          />
        </div>

        {/* Previews */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mt-2" style={cssVars as React.CSSProperties}>
          {[
            { name: 'Bounce', anim: 'bounce', icon: "/images/icons/onlyflunks.png" },
            { name: 'Spin', anim: 'spin linear', icon: "/images/icons/newterminal.png" },
            { name: 'Pulse Glow', anim: 'pulseGlow ease-in-out', icon: "/images/icons/chat-rooms.png" },
            { name: 'Shake', anim: 'shake ease-in-out', icon: "/images/icons/fhs.png" },
            { name: 'Hover/Bob', anim: 'hoverBob ease-in-out', icon: "/images/icons/myplace.png" },
            { name: 'Wobble', anim: 'wobble ease-in-out', icon: "/images/icons/experiment-3d.png" },
            { name: 'Flip', anim: 'flipY linear', icon: "/images/icons/flowty.png" },
            { name: 'Sway', anim: 'sway ease-in-out', icon: "/images/icons/boom-box.png" },
            { name: 'Jitter', anim: 'jitter steps(6) ', icon: "/images/icons/attack-64x64.png" },
            { name: 'Heartbeat', anim: 'heartbeat ease-in-out', icon: "/images/icons/discord.png" },
            { name: 'Float', anim: 'floaty ease-in-out', icon: "/images/icons/onlyflunks.png" },
            { name: 'Tilt', anim: 'tilt ease-in-out', icon: "/images/icons/semester0-icon.png" },
          ].map((item) => (
            <div key={item.name} className="flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 bg-center bg-contain rounded anim"
                style={{
                  backgroundImage: `url('${item.icon}')`,
                  animation: `${item.anim} var(--speed) infinite`,
                }}
              />
              <span className="text-sm text-center">{item.name}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 opacity-80 text-sm">
          Tip: This is a visual preview. We can apply any of these effects to desktop icons globally or per app.
        </div>
      </div>
    </div>
  );
};

export default IconAnimationWindow;
