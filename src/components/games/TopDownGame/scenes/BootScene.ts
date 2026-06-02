import Phaser from "phaser";

/**
 * BootScene
 * ----------
 * Loads (or procedurally generates) all art assets used by the game.
 *
 * 👉 To swap in your own art:
 *   1. Drop PNGs into `public/images/games/topdown/`
 *   2. Replace the `generatePlaceholder*` calls below with `this.load.image(...)`
 *      and/or `this.load.spritesheet(...)`.
 *
 * Recommended sizes (mobile-friendly, small bundle):
 *   - Tile size:        16x16 or 32x32
 *   - Character sprite: 32x32 per frame, 4 frames per direction (down/left/right/up)
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // ---- PLACEHOLDER ART (procedurally drawn, zero asset bytes) ----
    // Replace these with real PNGs when you have them.
    this.generatePlaceholderTiles();
    this.generatePlaceholderPlayer();
  }

  create() {
    this.scene.start("GameScene");
  }

  /** Build a small 4-tile "tileset" texture: grass, path, wall, water. */
  private generatePlaceholderTiles() {
    const TILE = 32;
    const g = this.make.graphics({ x: 0, y: 0 }, false);

    // 4 tiles laid horizontally
    const palette = [
      { fill: 0x5fa55a, accent: 0x4f8e4a }, // 0 grass
      { fill: 0xc9a96e, accent: 0xb89358 }, // 1 path
      { fill: 0x6b6b6b, accent: 0x3d3d3d }, // 2 wall (solid)
      { fill: 0x3b82f6, accent: 0x2563eb }, // 3 water (solid)
    ];

    palette.forEach((p, i) => {
      g.fillStyle(p.fill, 1);
      g.fillRect(i * TILE, 0, TILE, TILE);
      // Sprinkle of accent pixels for texture
      g.fillStyle(p.accent, 1);
      for (let k = 0; k < 6; k++) {
        const px = i * TILE + ((k * 7) % TILE);
        const py = (k * 11) % TILE;
        g.fillRect(px, py, 3, 3);
      }
    });

    g.generateTexture("tiles", TILE * palette.length, TILE);
    g.destroy();
  }

  /** Build a 4-row, 3-col character spritesheet (down, left, right, up). */
  private generatePlaceholderPlayer() {
    const FRAME = 32;
    const COLS = 3;
    const ROWS = 4;
    const g = this.make.graphics({ x: 0, y: 0 }, false);

    const skin = 0xfcd9b6;
    const shirt = 0xef4444;
    const pants = 0x1f2937;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = col * FRAME;
        const y = row * FRAME;

        // Pants
        g.fillStyle(pants, 1);
        g.fillRect(x + 10, y + 22, 12, 8);

        // Shirt
        g.fillStyle(shirt, 1);
        g.fillRect(x + 9, y + 14, 14, 10);

        // Head
        g.fillStyle(skin, 1);
        g.fillRect(x + 11, y + 6, 10, 9);

        // Tiny "leg swing" for walking animation: alternate cols 0/2
        if (col === 0) {
          g.fillStyle(0x000000, 1);
          g.fillRect(x + 10, y + 28, 4, 2);
        } else if (col === 2) {
          g.fillStyle(0x000000, 1);
          g.fillRect(x + 18, y + 28, 4, 2);
        }

        // Eyes — face direction
        g.fillStyle(0x000000, 1);
        if (row === 0) {
          // down
          g.fillRect(x + 13, y + 10, 2, 2);
          g.fillRect(x + 17, y + 10, 2, 2);
        } else if (row === 1) {
          // left
          g.fillRect(x + 12, y + 10, 2, 2);
        } else if (row === 2) {
          // right
          g.fillRect(x + 18, y + 10, 2, 2);
        }
        // row 3 (up) — no eyes shown
      }
    }

    g.generateTexture("player", FRAME * COLS, FRAME * ROWS);
    g.destroy();

    // Slice the generated texture into individual frames so
    // `this.anims.generateFrameNumbers('player', ...)` works.
    const tex = this.textures.get("player");
    // Remove the default frame Phaser auto-adds so our numeric frames start at 0
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const idx = row * COLS + col;
        tex.add(idx, 0, col * FRAME, row * FRAME, FRAME, FRAME);
      }
    }
  }
}
