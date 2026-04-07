export const ORB_ARENA_ASSET_SLOTS = {
  environmentModel: "/games/orb-arena/models/arena.glb",
  scoutEnemyModel: "/games/orb-arena/models/scout-orb.glb",
  heavyEnemyModel: "/games/orb-arena/models/heavy-orb.glb",
  bossEnemyModel: "/games/orb-arena/models/boss-orb.glb",
  weaponModel: "/games/orb-arena/models/weapon.glb",
  ambientLoop: "/games/orb-arena/audio/ambient-loop.ogg",
  shotFx: "/games/orb-arena/audio/shot.ogg",
  hitFx: "/games/orb-arena/audio/hit.ogg",
} as const;

export const ORB_ARENA_GUIDE = [
  "Drop replacement GLB files into public/games/orb-arena/models.",
  "Keep exports lightweight. Mobile is blocked, but desktop GPUs still punish oversized assets.",
  "Use Blender for mesh cleanup, pivots, collisions, and decimation before export.",
  "The current build uses procedural geometry as fallback so you can iterate before sourcing art.",
] as const;

export const ORB_ARENA_SETTINGS = {
  arenaHalfExtent: 24,
  playerHeight: 1.7,
  playerRadius: 0.65,
  moveSpeed: 8.5,
  sprintSpeed: 13.5,
  jumpVelocity: 8.75,
  gravity: 24,
  maxAmmo: 100,
  ammoRegenPerSecond: 18,
  shotCost: 10,
  shotIntervalMs: 150,
  finalWave: 5,
  maxHealth: 100,
} as const;

export const ORB_ARENA_PILLARS = [
  { x: -10, z: -8, radius: 1.8, height: 8 },
  { x: 10, z: -8, radius: 1.8, height: 8 },
  { x: -10, z: 8, radius: 1.8, height: 8 },
  { x: 10, z: 8, radius: 1.8, height: 8 },
  { x: 0, z: 0, radius: 2.25, height: 10 },
] as const;
