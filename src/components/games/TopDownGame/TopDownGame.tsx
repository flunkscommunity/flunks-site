import { useEffect, useRef, useState } from "react";
import type Phaser from "phaser";
import type { GameScene, Direction } from "./scenes/GameScene";

/**
 * TopDownGame
 * ------------
 * A Phaser 3 top-down RPG embedded as a React component.
 *
 * - SSR-safe: Phaser is dynamically imported inside useEffect so it never runs on the server.
 * - Mobile-friendly: uses Phaser.Scale.FIT which preserves aspect ratio and fills available space.
 * - Touch controls: on-screen D-pad rendered when the device has touch input.
 *
 * To swap art, edit:
 *   src/components/games/TopDownGame/scenes/BootScene.ts
 */
export default function TopDownGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<GameScene | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsTouch(
      "ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0
    );
  }, []);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;
    let cancelled = false;

    (async () => {
      const Phaser = (await import("phaser")).default;
      const { BootScene } = await import("./scenes/BootScene");
      const { GameScene } = await import("./scenes/GameScene");
      if (cancelled || !containerRef.current) return;

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        backgroundColor: "#0a0a0a",
        pixelArt: true,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: 640,
          height: 480,
        },
        physics: {
          default: "arcade",
          arcade: { gravity: { x: 0, y: 0 }, debug: false },
        },
        scene: [BootScene, GameScene],
      });

      gameRef.current = game;

      // Grab a reference to GameScene once it boots
      game.events.once(Phaser.Core.Events.READY, () => {
        const scene = game.scene.getScene("GameScene") as GameScene | null;
        if (scene) sceneRef.current = scene;
        setReady(true);
      });
    })();

    return () => {
      cancelled = true;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        sceneRef.current = null;
      }
    };
  }, []);

  /** Push touch direction into the running scene. */
  const setDir = (dir: Direction) => {
    // Scene might not have grabbed yet — try late lookup.
    if (!sceneRef.current && gameRef.current) {
      sceneRef.current = gameRef.current.scene.getScene("GameScene") as GameScene;
    }
    sceneRef.current?.setTouchDirection(dir);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#0a0a0a",
        overflow: "hidden",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%" }}
      />

      {!ready && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
            fontFamily: "monospace",
            fontSize: 12,
            pointerEvents: "none",
          }}
        >
          Loading…
        </div>
      )}

      {/* On-screen D-pad for touch devices */}
      {isTouch && ready && <DPad onDir={setDir} />}

      {/* Keyboard hint for desktop */}
      {!isTouch && ready && (
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            color: "#9ca3af",
            fontFamily: "monospace",
            fontSize: 10,
            background: "rgba(0,0,0,0.55)",
            padding: "4px 8px",
            borderRadius: 4,
            pointerEvents: "none",
          }}
        >
          Move: WASD or Arrow Keys
        </div>
      )}
    </div>
  );
}

function DPad({ onDir }: { onDir: (d: Direction) => void }) {
  const press = (d: Direction) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onDir(d);
  };
  const release = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onDir(null);
  };

  const btn: React.CSSProperties = {
    width: 52,
    height: 52,
    background: "rgba(0,0,0,0.55)",
    border: "2px solid rgba(255,255,255,0.4)",
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    touchAction: "none",
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        display: "grid",
        gridTemplateColumns: "repeat(3, 52px)",
        gridTemplateRows: "repeat(3, 52px)",
        gap: 4,
        zIndex: 10,
      }}
    >
      <div />
      <button
        style={btn}
        onTouchStart={press("up")}
        onTouchEnd={release}
        onMouseDown={press("up")}
        onMouseUp={release}
        onMouseLeave={release}
      >
        ▲
      </button>
      <div />
      <button
        style={btn}
        onTouchStart={press("left")}
        onTouchEnd={release}
        onMouseDown={press("left")}
        onMouseUp={release}
        onMouseLeave={release}
      >
        ◀
      </button>
      <div />
      <button
        style={btn}
        onTouchStart={press("right")}
        onTouchEnd={release}
        onMouseDown={press("right")}
        onMouseUp={release}
        onMouseLeave={release}
      >
        ▶
      </button>
      <div />
      <button
        style={btn}
        onTouchStart={press("down")}
        onTouchEnd={release}
        onMouseDown={press("down")}
        onMouseUp={release}
        onMouseLeave={release}
      >
        ▼
      </button>
      <div />
    </div>
  );
}
