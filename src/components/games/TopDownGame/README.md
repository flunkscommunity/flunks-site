# Top-Down Game (Phaser 3)

A Pokemon-style top-down RPG embedded as a window inside the Flunks site.
Works on web, iOS (Capacitor), and Android (Capacitor) with the same codebase.

## Architecture

```
TopDownGame/
├─ TopDownGame.tsx        ← React wrapper (SSR-safe dynamic Phaser import + touch D-pad)
├─ scenes/
│  ├─ BootScene.ts        ← Loads/generates art assets
│  └─ GameScene.ts        ← Game loop: tilemap, player, collisions, camera
└─ README.md
```

## Controls

- **Desktop**: WASD or Arrow keys
- **Mobile**: On-screen D-pad (auto-shows on touch devices)

## Replacing Placeholder Art with Your Own

The game currently uses **procedurally generated graphics** (drawn at runtime, zero asset bytes)
so it works out of the box. To swap in your custom pixel art:

### 1. Add your image files

Drop your PNGs into `public/images/games/topdown/`:

```
public/images/games/topdown/
├─ tiles.png          ← Tileset image (horizontal strip of 32x32 tiles)
└─ player.png         ← Character spritesheet (3 cols × 4 rows, 32x32 each)
```

**Recommended specs** (for small mobile bundle):

| Asset    | Format     | Size        | Layout                                    |
| -------- | ---------- | ----------- | ----------------------------------------- |
| `tiles`  | PNG (8-bit indexed) | 32×32 per tile, any # of tiles | Horizontal strip |
| `player` | PNG (8-bit indexed) | 32×32 per frame, 3 cols × 4 rows | Row 0=down, 1=left, 2=right, 3=up |

Keep PNGs under ~100KB each. Use [TinyPNG](https://tinypng.com/) or `pngquant` to compress.

### 2. Update `BootScene.ts`

Replace the procedural generation calls in `preload()` with file loads:

```ts
preload() {
  this.load.image("tiles", "/images/games/topdown/tiles.png");
  this.load.spritesheet("player", "/images/games/topdown/player.png", {
    frameWidth: 32,
    frameHeight: 32,
  });
}
```

Then delete the `generatePlaceholder*` helper methods (no longer needed).

### 3. (Optional) Update the map

The map is hand-authored in `GameScene.ts` as `DEFAULT_MAP` — a 2D array of tile indices:

- `0` = grass
- `1` = path
- `2` = wall (solid)
- `3` = water (solid)

For larger / more complex maps, export from [Tiled](https://www.mapeditor.org/) as JSON
and load with `this.load.tilemapTiledJSON(...)`.

## Mobile / Capacitor Notes

- The game canvas uses `Phaser.Scale.FIT` → automatically scales to fit the window while
  preserving aspect ratio. Works in any window size.
- `pixelArt: true` disables texture smoothing — keeps your pixel art crisp.
- D-pad uses absolute positioning over the canvas; it never interferes with native gestures.
- Phaser bundle (~1MB gzipped) is **dynamically imported** so it only loads when the user
  opens the game window — no impact on initial page load.

## Adding NPCs, Items, Combat

The scene is intentionally minimal so you can extend it. Common next steps:

- Add NPC sprites via `this.physics.add.sprite(...)` + `physics.add.collider(player, npc)`
- Trigger dialog by checking `Phaser.Math.Distance.Between(player, npc) < 40`
- Add item pickups via `physics.add.overlap(player, items, callback)`
