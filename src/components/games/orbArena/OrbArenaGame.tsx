import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";
import {
  ORB_ARENA_ASSET_SLOTS,
  ORB_ARENA_GUIDE,
  ORB_ARENA_PILLARS,
  ORB_ARENA_SETTINGS,
} from "./orbArenaConfig";

type GamePhase = "intro" | "playing" | "paused" | "won" | "lost";
type EnemyKind = "scout" | "heavy" | "boss";

interface HudState {
  health: number;
  ammo: number;
  wave: number;
  kills: number;
  objective: string;
}

interface OrbArenaGameProps {
  onExit: () => void;
}

interface EnemyState {
  id: string;
  kind: EnemyKind;
  health: number;
  maxHealth: number;
  radius: number;
  speed: number;
  position: THREE.Vector3;
  bobOffset: number;
  shootCooldown: number;
  touchCooldown: number;
}

interface ProjectileState {
  id: string;
  radius: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  ttl: number;
  color: string;
}

interface ImpactState {
  id: string;
  position: THREE.Vector3;
  ttl: number;
  color: string;
  scale: number;
}

interface ArenaControlBridge {
  requestLock: () => void;
  resetGame: () => void;
}

const LOCK_SENSITIVITY_X = 0.0024;
const LOCK_SENSITIVITY_Y = 0.0018;
const PLAYER_SPAWN = new THREE.Vector3(0, ORB_ARENA_SETTINGS.playerHeight, 16);
const SCOUT_DAMAGE = 14;
const HEAVY_DAMAGE = 20;
const PROJECTILE_DAMAGE = 12;
const MAX_FIRE_RANGE = 64;

const createHud = (): HudState => ({
  health: ORB_ARENA_SETTINGS.maxHealth,
  ammo: ORB_ARENA_SETTINGS.maxAmmo,
  wave: 1,
  kills: 0,
  objective: "Lock in and clear the arena.",
});

const OrbArenaGame: React.FC<OrbArenaGameProps> = ({ onExit }) => {
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [locked, setLocked] = useState(false);
  const [hud, setHud] = useState<HudState>(() => createHud());
  const [flashTick, setFlashTick] = useState(0);
  const controlBridgeRef = useRef<ArenaControlBridge | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const phaseLabel = useMemo(() => {
    if (phase === "won") return "Arena clear";
    if (phase === "lost") return "System failure";
    if (phase === "paused") return "Paused";
    if (phase === "playing") return locked ? "Locked" : "Click to resume";
    return "Ready";
  }, [locked, phase]);

  const startRun = useCallback(() => {
    if (controlBridgeRef.current) {
      controlBridgeRef.current.requestLock();
      return;
    }

    document.body.requestPointerLock?.();
  }, []);

  const resetRun = useCallback(() => {
    controlBridgeRef.current?.resetGame();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative h-screen w-screen overflow-hidden bg-[#02030a] text-white"
      onMouseDown={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("button")) return;
        if (phase === "intro" || phase === "paused") {
          startRun();
        }
      }}
    >
      <Canvas
        camera={{ fov: 72, near: 0.1, far: 200, position: [0, ORB_ARENA_SETTINGS.playerHeight, 16] }}
        gl={{ antialias: true }}
      >
        <ArenaWorld
          phase={phase}
          setPhase={setPhase}
          setLocked={setLocked}
          onHudChange={setHud}
          onWeaponFlash={() => setFlashTick((current) => current + 1)}
          registerControls={(controls) => {
            controlBridgeRef.current = controls;
          }}
        />
      </Canvas>

      <div className="absolute inset-0">
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 via-black/30 to-transparent px-6 pb-24 pt-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-cyan-300">Flunks Orb Arena</p>
              <p className="mt-2 max-w-xl text-sm text-slate-200">{hud.objective}</p>
            </div>
            <div className="rounded-full border border-cyan-400/50 bg-cyan-400/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.3em] text-cyan-100">
              {phaseLabel}
            </div>
          </div>

          <div className="mt-5 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            <HudCard label="Health" value={`${hud.health}%`} accent="from-rose-500/80 to-orange-400/80" />
            <HudCard label="Ammo" value={`${hud.ammo}%`} accent="from-cyan-500/80 to-sky-300/80" />
            <HudCard label="Wave" value={`${hud.wave}/${ORB_ARENA_SETTINGS.finalWave}`} accent="from-violet-500/80 to-fuchsia-400/80" />
            <HudCard label="Kills" value={`${hud.kills}`} accent="from-lime-500/80 to-emerald-300/80" />
          </div>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2">
          <div className={`absolute left-1/2 top-1/2 h-px w-8 -translate-x-1/2 -translate-y-1/2 bg-cyan-200/80 transition-all duration-150 ${flashTick ? "scale-x-125" : ""}`} />
          <div className={`absolute left-1/2 top-1/2 h-8 w-px -translate-x-1/2 -translate-y-1/2 bg-cyan-200/80 transition-all duration-150 ${flashTick ? "scale-y-125" : ""}`} />
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/80" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-6 pb-6 pt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="pointer-events-none max-w-2xl text-sm text-slate-200">
              <p className="font-mono uppercase tracking-[0.3em] text-slate-300">Controls</p>
              <p className="mt-2">WASD move, Shift sprint, Space jump, mouse aim, hold click to fire, Esc release pointer lock.</p>
              <p className="mt-2 text-xs text-slate-400">
                Asset slots are prewired for later art swaps:
                <span className="ml-2 text-slate-300">{ORB_ARENA_ASSET_SLOTS.environmentModel}</span>
              </p>
            </div>

            <div className="pointer-events-auto flex flex-wrap gap-3">
              {(phase === "intro" || phase === "paused") && (
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    startRun();
                  }}
                  className="rounded-full border border-cyan-300/60 bg-cyan-400/15 px-6 py-3 font-mono text-xs uppercase tracking-[0.3em] text-cyan-100 transition hover:bg-cyan-400/25"
                >
                  {phase === "intro" ? "Enter Arena" : "Resume Run"}
                </button>
              )}
              {(phase === "won" || phase === "lost") && (
                <button
                  type="button"
                  onClick={resetRun}
                  className="rounded-full border border-fuchsia-300/60 bg-fuchsia-400/15 px-6 py-3 font-mono text-xs uppercase tracking-[0.3em] text-fuchsia-100 transition hover:bg-fuchsia-400/25"
                >
                  Run It Back
                </button>
              )}
              <button
                type="button"
                onClick={onExit}
                className="rounded-full border border-white/20 bg-white/10 px-6 py-3 font-mono text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20"
              >
                Exit to Desktop
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute right-6 top-28 hidden max-w-sm rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur lg:block">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-slate-300">Asset Pipeline</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-200">
          {ORB_ARENA_GUIDE.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

interface HudCardProps {
  label: string;
  value: string;
  accent: string;
}

const HudCard: React.FC<HudCardProps> = ({ label, value, accent }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-3 backdrop-blur">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-slate-300">{label}</p>
      <p className={`mt-2 bg-gradient-to-r ${accent} bg-clip-text font-mono text-2xl text-transparent`}>{value}</p>
    </div>
  );
};

interface ArenaWorldProps {
  phase: GamePhase;
  setPhase: React.Dispatch<React.SetStateAction<GamePhase>>;
  setLocked: React.Dispatch<React.SetStateAction<boolean>>;
  onHudChange: (hud: HudState) => void;
  onWeaponFlash: () => void;
  registerControls: (controls: ArenaControlBridge) => void;
}

const ArenaWorld: React.FC<ArenaWorldProps> = ({
  phase,
  setPhase,
  setLocked,
  onHudChange,
  onWeaponFlash,
  registerControls,
}) => {
  const { camera, gl, scene } = useThree();
  const phaseRef = useRef<GamePhase>(phase);
  const lockRef = useRef(false);
  const keyStateRef = useRef<Record<string, boolean>>({});
  const mouseDownRef = useRef(false);
  const velocityRef = useRef(new THREE.Vector3());
  const enemiesRef = useRef<EnemyState[]>([]);
  const enemyNodesRef = useRef<Record<string, THREE.Group | null>>({});
  const projectileNodesRef = useRef<Record<string, THREE.Mesh | null>>({});
  const impactNodesRef = useRef<Record<string, THREE.Group | null>>({});
  const projectilesRef = useRef<ProjectileState[]>([]);
  const impactsRef = useRef<ImpactState[]>([]);
  const fireCooldownRef = useRef(0);
  const waveRef = useRef(1);
  const killsRef = useRef(0);
  const healthRef = useRef<number>(ORB_ARENA_SETTINGS.maxHealth);
  const ammoRef = useRef<number>(ORB_ARENA_SETTINGS.maxAmmo);
  const nextWaveAtRef = useRef<number | null>(null);
  const idCounterRef = useRef(0);
  const hudTimerRef = useRef(0);
  const objectiveRef = useRef("Lock in and clear the arena.");
  const raycasterRef = useRef(new THREE.Raycaster());
  const tempDirectionRef = useRef(new THREE.Vector3());
  const [enemyRenderList, setEnemyRenderList] = useState<EnemyState[]>([]);
  const [projectileRenderList, setProjectileRenderList] = useState<ProjectileState[]>([]);
  const [impactRenderList, setImpactRenderList] = useState<ImpactState[]>([]);

  const pushHud = useCallback(
    (force = false) => {
      if (!force && hudTimerRef.current > 0) return;
      hudTimerRef.current = 0.08;
      onHudChange({
        health: Math.max(0, Math.round(healthRef.current)),
        ammo: Math.max(0, Math.round(ammoRef.current)),
        wave: waveRef.current,
        kills: killsRef.current,
        objective: objectiveRef.current,
      });
    },
    [onHudChange]
  );

  const nextId = useCallback((prefix: string) => {
    idCounterRef.current += 1;
    return `${prefix}-${idCounterRef.current}`;
  }, []);

  const syncEnemies = useCallback(() => {
    setEnemyRenderList([...enemiesRef.current]);
  }, []);

  const syncProjectiles = useCallback(() => {
    setProjectileRenderList([...projectilesRef.current]);
  }, []);

  const syncImpacts = useCallback(() => {
    setImpactRenderList([...impactsRef.current]);
  }, []);

  const addImpact = useCallback(
    (position: THREE.Vector3, color: string, scale = 1) => {
      impactsRef.current.push({
        id: nextId("impact"),
        position: position.clone(),
        ttl: 0.28,
        color,
        scale,
      });
      syncImpacts();
    },
    [nextId, syncImpacts]
  );

  const removeEnemy = useCallback(
    (enemyId: string) => {
      enemiesRef.current = enemiesRef.current.filter((enemy) => enemy.id !== enemyId);
      delete enemyNodesRef.current[enemyId];
      killsRef.current += 1;
      addImpact(
        (enemyRenderList.find((enemy) => enemy.id === enemyId)?.position || new THREE.Vector3()).clone(),
        "#7cf0ff",
        1.9
      );
      syncEnemies();
      pushHud(true);
    },
    [addImpact, enemyRenderList, pushHud, syncEnemies]
  );

  const damagePlayer = useCallback(
    (amount: number, reason: string) => {
      if (phaseRef.current !== "playing") return;
      healthRef.current = Math.max(0, healthRef.current - amount);
      objectiveRef.current = reason;
      pushHud(true);

      if (healthRef.current <= 0) {
        phaseRef.current = "lost";
        setPhase("lost");
        document.exitPointerLock();
      }
    },
    [pushHud, setPhase]
  );

  const spawnProjectile = useCallback(
    (position: THREE.Vector3, velocity: THREE.Vector3, color: string, radius = 0.28) => {
      projectilesRef.current.push({
        id: nextId("projectile"),
        position: position.clone(),
        velocity: velocity.clone(),
        ttl: 5,
        radius,
        color,
      });
      syncProjectiles();
    },
    [nextId, syncProjectiles]
  );

  const spawnWave = useCallback(
    (waveNumber: number) => {
      const enemies: EnemyState[] = [];
      const arenaEdge = ORB_ARENA_SETTINGS.arenaHalfExtent - 3;
      const pushEnemy = (kind: EnemyKind, x: number, z: number) => {
        if (kind === "boss") {
          enemies.push({
            id: nextId("boss"),
            kind,
            health: 420,
            maxHealth: 420,
            radius: 2.4,
            speed: 2.7,
            position: new THREE.Vector3(x, 2.5, z),
            bobOffset: Math.random() * Math.PI * 2,
            shootCooldown: 1.4,
            touchCooldown: 0,
          });
          return;
        }

        if (kind === "heavy") {
          enemies.push({
            id: nextId("heavy"),
            kind,
            health: 90,
            maxHealth: 90,
            radius: 1.2,
            speed: 3.1,
            position: new THREE.Vector3(x, 1.8, z),
            bobOffset: Math.random() * Math.PI * 2,
            shootCooldown: 2 + Math.random(),
            touchCooldown: 0,
          });
          return;
        }

        enemies.push({
          id: nextId("scout"),
          kind,
          health: 40,
          maxHealth: 40,
          radius: 0.9,
          speed: 4.4,
          position: new THREE.Vector3(x, 1.4, z),
          bobOffset: Math.random() * Math.PI * 2,
          shootCooldown: 99,
          touchCooldown: 0,
        });
      };

      if (waveNumber >= ORB_ARENA_SETTINGS.finalWave) {
        pushEnemy("boss", 0, -16);
        pushEnemy("heavy", -12, 10);
        pushEnemy("heavy", 12, 10);
        pushEnemy("scout", -16, -2);
        pushEnemy("scout", 16, -2);
      } else {
        const scoutCount = 4 + waveNumber * 2;
        for (let index = 0; index < scoutCount; index += 1) {
          const angle = (index / scoutCount) * Math.PI * 2;
          pushEnemy("scout", Math.cos(angle) * arenaEdge, Math.sin(angle) * arenaEdge);
        }

        if (waveNumber >= 2) {
          pushEnemy("heavy", -16, -14);
        }

        if (waveNumber >= 3) {
          pushEnemy("heavy", 16, -14);
        }

        if (waveNumber >= 4) {
          pushEnemy("heavy", 0, 18);
        }
      }

      enemiesRef.current = enemies;
      objectiveRef.current =
        waveNumber >= ORB_ARENA_SETTINGS.finalWave
          ? "Boss wave. Break the core."
          : `Wave ${waveNumber} online. Clear the room.`;
      syncEnemies();
      pushHud(true);
    },
    [nextId, pushHud, syncEnemies]
  );

  const resetGame = useCallback(() => {
    document.exitPointerLock();
    phaseRef.current = "intro";
    setPhase("intro");
    setLocked(false);
    mouseDownRef.current = false;
    keyStateRef.current = {};
    velocityRef.current.set(0, 0, 0);
    healthRef.current = ORB_ARENA_SETTINGS.maxHealth;
    ammoRef.current = ORB_ARENA_SETTINGS.maxAmmo;
    waveRef.current = 1;
    killsRef.current = 0;
    nextWaveAtRef.current = null;
    objectiveRef.current = "Lock in and clear the arena.";
    enemiesRef.current = [];
    projectilesRef.current = [];
    impactsRef.current = [];
    setEnemyRenderList([]);
    setProjectileRenderList([]);
    setImpactRenderList([]);
    camera.position.copy(PLAYER_SPAWN);
    camera.rotation.set(0, Math.PI, 0);
    spawnWave(1);
    onHudChange(createHud());
  }, [camera, onHudChange, setLocked, setPhase, spawnWave]);

  useEffect(() => {
    phaseRef.current = phase;
    if (phase !== "playing") {
      mouseDownRef.current = false;
    }
  }, [phase]);

  useEffect(() => {
    gl.domElement.tabIndex = 0;
    scene.fog = new THREE.FogExp2("#030714", 0.032);
    registerControls({
      requestLock: () => document.body.requestPointerLock(),
      resetGame,
    });
    resetGame();

    return () => {
      scene.fog = null;
    };
  }, [gl.domElement, registerControls, resetGame, scene]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.code === "Enter" &&
        (phaseRef.current === "intro" || phaseRef.current === "paused")
      ) {
        document.body.requestPointerLock?.();
      }
      keyStateRef.current[event.code] = true;
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keyStateRef.current[event.code] = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!lockRef.current || phaseRef.current !== "playing") return;
      camera.rotation.order = "YXZ";
      camera.rotation.y -= event.movementX * LOCK_SENSITIVITY_X;
      camera.rotation.x -= event.movementY * LOCK_SENSITIVITY_Y;
      camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x, -1.15, 1.15);
    };

    const handlePointerLock = () => {
      const isLocked =
        document.pointerLockElement === document.body ||
        document.pointerLockElement === gl.domElement;
      lockRef.current = isLocked;
      setLocked(isLocked);

      if (isLocked && (phaseRef.current === "intro" || phaseRef.current === "paused")) {
        phaseRef.current = "playing";
        setPhase("playing");
      }

      if (!isLocked && phaseRef.current === "playing") {
        phaseRef.current = "paused";
        setPhase("paused");
      }
    };

    const handleMouseUp = () => {
      mouseDownRef.current = false;
    };

    const handleMouseDown = () => {
      if (phaseRef.current === "won" || phaseRef.current === "lost") return;
      if (
        document.pointerLockElement !== document.body &&
        document.pointerLockElement !== gl.domElement
      ) {
        document.body.requestPointerLock();
        return;
      }
      mouseDownRef.current = true;
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("pointerlockchange", handlePointerLock);
    window.addEventListener("mouseup", handleMouseUp);
    gl.domElement.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("pointerlockchange", handlePointerLock);
      window.removeEventListener("mouseup", handleMouseUp);
      gl.domElement.removeEventListener("mousedown", handleMouseDown);
    };
  }, [camera, gl.domElement, setLocked, setPhase]);

  useFrame((state, delta) => {
    hudTimerRef.current -= delta;

    if (phaseRef.current !== "playing") {
      pushHud();
      return;
    }

    fireCooldownRef.current = Math.max(0, fireCooldownRef.current - delta);
    ammoRef.current = Math.min(
      ORB_ARENA_SETTINGS.maxAmmo,
      ammoRef.current + ORB_ARENA_SETTINGS.ammoRegenPerSecond * delta
    );

    const forward = new THREE.Vector3();
    const strafe = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    strafe.crossVectors(forward, camera.up).normalize();

    const speed =
      keyStateRef.current.ShiftLeft || keyStateRef.current.ShiftRight
        ? ORB_ARENA_SETTINGS.sprintSpeed
        : ORB_ARENA_SETTINGS.moveSpeed;
    const moveVector = new THREE.Vector3();

    if (keyStateRef.current.KeyW) moveVector.add(forward);
    if (keyStateRef.current.KeyS) moveVector.addScaledVector(forward, -1);
    if (keyStateRef.current.KeyA) moveVector.addScaledVector(strafe, -1);
    if (keyStateRef.current.KeyD) moveVector.add(strafe);

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize().multiplyScalar(speed * delta);
      camera.position.add(moveVector);
    }

    if (keyStateRef.current.Space && camera.position.y <= ORB_ARENA_SETTINGS.playerHeight + 0.02) {
      velocityRef.current.y = ORB_ARENA_SETTINGS.jumpVelocity;
    }

    velocityRef.current.y -= ORB_ARENA_SETTINGS.gravity * delta;
    camera.position.y += velocityRef.current.y * delta;

    if (camera.position.y < ORB_ARENA_SETTINGS.playerHeight) {
      camera.position.y = ORB_ARENA_SETTINGS.playerHeight;
      velocityRef.current.y = 0;
    }

    camera.position.x = THREE.MathUtils.clamp(
      camera.position.x,
      -ORB_ARENA_SETTINGS.arenaHalfExtent,
      ORB_ARENA_SETTINGS.arenaHalfExtent
    );
    camera.position.z = THREE.MathUtils.clamp(
      camera.position.z,
      -ORB_ARENA_SETTINGS.arenaHalfExtent,
      ORB_ARENA_SETTINGS.arenaHalfExtent
    );

    ORB_ARENA_PILLARS.forEach((pillar) => {
      const offsetX = camera.position.x - pillar.x;
      const offsetZ = camera.position.z - pillar.z;
      const distance = Math.sqrt(offsetX * offsetX + offsetZ * offsetZ);
      const minDistance = pillar.radius + ORB_ARENA_SETTINGS.playerRadius;

      if (distance > 0 && distance < minDistance) {
        const push = (minDistance - distance) / distance;
        camera.position.x += offsetX * push;
        camera.position.z += offsetZ * push;
      }
    });

    if (
      mouseDownRef.current &&
      fireCooldownRef.current === 0 &&
      ammoRef.current >= ORB_ARENA_SETTINGS.shotCost
    ) {
      fireCooldownRef.current = ORB_ARENA_SETTINGS.shotIntervalMs / 1000;
      ammoRef.current -= ORB_ARENA_SETTINGS.shotCost;
      onWeaponFlash();

      raycasterRef.current.far = MAX_FIRE_RANGE;
      camera.getWorldDirection(tempDirectionRef.current);
      raycasterRef.current.set(camera.position, tempDirectionRef.current);

      const activeEnemyRoots = Object.values(enemyNodesRef.current).filter(Boolean) as THREE.Object3D[];
      const intersections = raycasterRef.current.intersectObjects(activeEnemyRoots, true);
      const hit = intersections.find((entry) => {
        let node: THREE.Object3D | null = entry.object;
        while (node) {
          if (typeof node.userData.enemyId === "string") return true;
          node = node.parent;
        }
        return false;
      });

      if (hit) {
        let node: THREE.Object3D | null = hit.object;
        let enemyId = "";
        while (node && !enemyId) {
          if (typeof node.userData.enemyId === "string") {
            enemyId = node.userData.enemyId;
          }
          node = node.parent;
        }

        const enemy = enemiesRef.current.find((candidate) => candidate.id === enemyId);
        if (enemy) {
          enemy.health -= enemy.kind === "boss" ? 24 : enemy.kind === "heavy" ? 30 : 40;
          addImpact(hit.point, enemy.kind === "boss" ? "#ff8f4e" : "#77f0ff", enemy.kind === "boss" ? 1.3 : 0.9);
          objectiveRef.current =
            enemy.kind === "boss" ? "Boss shield destabilized." : "Direct hit. Keep pressure on.";
          if (enemy.health <= 0) {
            if (enemy.kind === "boss") {
              objectiveRef.current = "Boss core shattered. Arena clear.";
            }
            removeEnemy(enemy.id);
          }
        }
      } else {
        addImpact(
          camera.position.clone().add(tempDirectionRef.current.clone().multiplyScalar(18)),
          "#2dd4bf",
          0.7
        );
      }
      pushHud(true);
    }

    const playerFlat = new THREE.Vector3(camera.position.x, 0, camera.position.z);
    enemiesRef.current.forEach((enemy) => {
      enemy.shootCooldown = Math.max(0, enemy.shootCooldown - delta);
      enemy.touchCooldown = Math.max(0, enemy.touchCooldown - delta);
      const bobHeight = enemy.kind === "boss" ? 2.4 : enemy.kind === "heavy" ? 1.65 : 1.25;
      enemy.position.y = bobHeight + Math.sin(state.clock.elapsedTime * 2.2 + enemy.bobOffset) * 0.3;

      const toPlayer = new THREE.Vector3(camera.position.x - enemy.position.x, 0, camera.position.z - enemy.position.z);
      const distance = toPlayer.length();
      if (distance > 0.001) {
        toPlayer.normalize();
        enemy.position.addScaledVector(toPlayer, enemy.speed * delta);
      }

      ORB_ARENA_PILLARS.forEach((pillar) => {
        const offsetX = enemy.position.x - pillar.x;
        const offsetZ = enemy.position.z - pillar.z;
        const length = Math.sqrt(offsetX * offsetX + offsetZ * offsetZ);
        const minDistance = pillar.radius + enemy.radius;
        if (length > 0 && length < minDistance) {
          const push = (minDistance - length) / length;
          enemy.position.x += offsetX * push;
          enemy.position.z += offsetZ * push;
        }
      });

      if (distance < enemy.radius + ORB_ARENA_SETTINGS.playerRadius + 0.5 && enemy.touchCooldown === 0) {
        enemy.touchCooldown = enemy.kind === "boss" ? 0.8 : 1.1;
        damagePlayer(enemy.kind === "heavy" ? HEAVY_DAMAGE : enemy.kind === "boss" ? 24 : SCOUT_DAMAGE, "Orb impact. Reposition.");
      }

      if ((enemy.kind === "heavy" || enemy.kind === "boss") && enemy.shootCooldown === 0 && distance < 28) {
        const shotDirection = playerFlat
          .clone()
          .sub(new THREE.Vector3(enemy.position.x, 0, enemy.position.z))
          .normalize();
        const shotOrigin = enemy.position.clone();
        shotOrigin.y += enemy.kind === "boss" ? 0.1 : -0.1;

        if (enemy.kind === "boss") {
          const spreadAngles = [-0.22, 0, 0.22];
          spreadAngles.forEach((angle) => {
            const velocity = shotDirection.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).multiplyScalar(9);
            spawnProjectile(shotOrigin, velocity, "#ffb703", 0.36);
          });
          enemy.shootCooldown = 1.3;
        } else {
          spawnProjectile(shotOrigin, shotDirection.multiplyScalar(11), "#7c3aed");
          enemy.shootCooldown = 2.2;
        }
      }

      const enemyNode = enemyNodesRef.current[enemy.id];
      if (enemyNode) {
        enemyNode.position.copy(enemy.position);
        enemyNode.rotation.y += delta * (enemy.kind === "boss" ? 0.25 : 0.7);
      }
    });

    projectilesRef.current = projectilesRef.current.filter((projectile) => {
      projectile.ttl -= delta;
      projectile.position.addScaledVector(projectile.velocity, delta);

      const projectileNode = projectileNodesRef.current[projectile.id];
      if (projectileNode) {
        projectileNode.position.copy(projectile.position);
      }

      if (
        projectile.position.distanceTo(camera.position) <
        projectile.radius + ORB_ARENA_SETTINGS.playerRadius
      ) {
        damagePlayer(PROJECTILE_DAMAGE, "Incoming plasma. Keep moving.");
        addImpact(projectile.position, projectile.color, 0.9);
        delete projectileNodesRef.current[projectile.id];
        return false;
      }

      if (
        projectile.ttl <= 0 ||
        Math.abs(projectile.position.x) > ORB_ARENA_SETTINGS.arenaHalfExtent + 6 ||
        Math.abs(projectile.position.z) > ORB_ARENA_SETTINGS.arenaHalfExtent + 6
      ) {
        delete projectileNodesRef.current[projectile.id];
        return false;
      }

      return true;
    });

    impactsRef.current = impactsRef.current.filter((impact) => {
      impact.ttl -= delta;
      const node = impactNodesRef.current[impact.id];
      if (node) {
        const life = Math.max(0, impact.ttl / 0.28);
        const growth = impact.scale * (1 + (1 - life) * 2.8);
        node.position.copy(impact.position);
        node.scale.setScalar(growth);
      }

      if (impact.ttl <= 0) {
        delete impactNodesRef.current[impact.id];
        return false;
      }

      return true;
    });

    if (projectileRenderList.length !== projectilesRef.current.length) {
      syncProjectiles();
    }

    if (impactRenderList.length !== impactsRef.current.length) {
      syncImpacts();
    }

    if (enemiesRef.current.length === 0 && nextWaveAtRef.current === null) {
      if (waveRef.current >= ORB_ARENA_SETTINGS.finalWave) {
        phaseRef.current = "won";
        setPhase("won");
        document.exitPointerLock();
      } else {
        objectiveRef.current = `Wave ${waveRef.current} clear. Systems recharging.`;
        nextWaveAtRef.current = state.clock.elapsedTime + 2;
      }
      pushHud(true);
    }

    if (nextWaveAtRef.current !== null && state.clock.elapsedTime >= nextWaveAtRef.current) {
      waveRef.current += 1;
      nextWaveAtRef.current = null;
      spawnWave(waveRef.current);
    }

    pushHud();
  });

  return (
    <>
      <color attach="background" args={["#02030a"]} />
      <ambientLight intensity={0.55} color="#79d7ff" />
      <directionalLight position={[18, 22, 10]} intensity={1.7} color="#fffbcc" castShadow />
      <pointLight position={[0, 12, 0]} intensity={20} distance={48} color="#00e5ff" />
      <pointLight position={[0, 9, -16]} intensity={12} distance={38} color="#ff5f6d" />

      <Stars radius={90} depth={40} count={1800} factor={3.8} saturation={0.8} fade speed={0.7} />
      <Sparkles count={140} scale={[56, 18, 56]} size={2} speed={0.18} color="#42d4ff" />

      <group position={[0, -0.01, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[80, 80]} />
          <meshStandardMaterial color="#050917" metalness={0.6} roughness={0.35} />
        </mesh>
        <gridHelper args={[80, 48, "#2fe3ff", "#14304f"]} position={[0, 0.02, 0]} />
      </group>

      <group>
        <mesh position={[0, 7, -24]}>
          <boxGeometry args={[48, 14, 1]} />
          <meshStandardMaterial color="#071124" emissive="#102649" emissiveIntensity={0.7} transparent opacity={0.82} />
        </mesh>
        <mesh position={[0, 7, 24]}>
          <boxGeometry args={[48, 14, 1]} />
          <meshStandardMaterial color="#071124" emissive="#102649" emissiveIntensity={0.7} transparent opacity={0.82} />
        </mesh>
        <mesh position={[-24, 7, 0]}>
          <boxGeometry args={[1, 14, 48]} />
          <meshStandardMaterial color="#071124" emissive="#102649" emissiveIntensity={0.7} transparent opacity={0.82} />
        </mesh>
        <mesh position={[24, 7, 0]}>
          <boxGeometry args={[1, 14, 48]} />
          <meshStandardMaterial color="#071124" emissive="#102649" emissiveIntensity={0.7} transparent opacity={0.82} />
        </mesh>
      </group>

      {ORB_ARENA_PILLARS.map((pillar) => (
        <group key={`${pillar.x}-${pillar.z}`} position={[pillar.x, pillar.height / 2, pillar.z]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[pillar.radius, pillar.radius, pillar.height, 24]} />
            <meshStandardMaterial color="#0f172a" emissive="#0f4865" emissiveIntensity={0.8} metalness={0.5} roughness={0.35} />
          </mesh>
          <mesh position={[0, -pillar.height / 2 + 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[pillar.radius + 0.25, pillar.radius + 0.6, 32]} />
            <meshBasicMaterial color="#22d3ee" transparent opacity={0.55} />
          </mesh>
        </group>
      ))}

      {enemyRenderList.map((enemy) => (
        <group
          key={enemy.id}
          ref={(node) => {
            enemyNodesRef.current[enemy.id] = node;
            if (node) {
              node.userData.enemyId = enemy.id;
            }
          }}
          position={enemy.position.toArray()}
        >
          <EnemyVisual enemy={enemy} />
        </group>
      ))}

      {projectileRenderList.map((projectile) => (
        <mesh
          key={projectile.id}
          ref={(node) => {
            projectileNodesRef.current[projectile.id] = node;
          }}
          position={projectile.position.toArray()}
        >
          <sphereGeometry args={[projectile.radius, 20, 20]} />
          <meshStandardMaterial color={projectile.color} emissive={projectile.color} emissiveIntensity={2.4} metalness={0.2} roughness={0.15} />
        </mesh>
      ))}

      {impactRenderList.map((impact) => (
        <group
          key={impact.id}
          ref={(node) => {
            impactNodesRef.current[impact.id] = node;
          }}
          position={impact.position.toArray()}
        >
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.25, 0.38, 32]} />
            <meshBasicMaterial color={impact.color} transparent opacity={0.85} />
          </mesh>
        </group>
      ))}
    </>
  );
};

interface EnemyVisualProps {
  enemy: EnemyState;
}

const EnemyVisual: React.FC<EnemyVisualProps> = ({ enemy }) => {
  const baseColor = enemy.kind === "boss" ? "#ff9f43" : enemy.kind === "heavy" ? "#7c3aed" : "#61dafb";
  const shellScale = enemy.kind === "boss" ? 1.5 : enemy.kind === "heavy" ? 1.12 : 0.88;
  const innerScale = enemy.kind === "boss" ? 0.8 : enemy.kind === "heavy" ? 0.58 : 0.42;

  return (
    <>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[shellScale, 32, 32]} />
        <meshStandardMaterial color="#050816" emissive={baseColor} emissiveIntensity={1.4} metalness={0.75} roughness={0.12} />
      </mesh>
      <mesh scale={innerScale}>
        <icosahedronGeometry args={[1, enemy.kind === "boss" ? 1 : 0]} />
        <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={2.8} metalness={0.35} roughness={0.08} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[shellScale + 0.18, enemy.kind === "boss" ? 0.11 : 0.07, 16, 48]} />
        <meshBasicMaterial color={baseColor} transparent opacity={0.6} />
      </mesh>
      {enemy.kind !== "scout" && (
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[shellScale + 0.32, 0.05, 16, 40]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
        </mesh>
      )}
      <pointLight
        color={baseColor}
        intensity={enemy.kind === "boss" ? 18 : enemy.kind === "heavy" ? 9 : 5}
        distance={enemy.kind === "boss" ? 20 : 10}
      />
    </>
  );
};

export default OrbArenaGame;
