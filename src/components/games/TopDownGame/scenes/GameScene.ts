import Phaser from "phaser";

const TILE = 32;
const MAP_COLS = 20;
const MAP_ROWS = 15;

// 0=grass, 1=path, 2=wall, 3=water
// Solids: 2, 3
const DEFAULT_MAP: number[][] = [
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,2],
  [2,0,0,1,1,1,1,1,1,0,0,2,1,1,1,1,1,0,0,2],
  [2,0,0,1,0,0,0,0,2,0,0,2,1,0,0,0,1,0,0,2],
  [2,0,0,1,0,0,0,0,2,2,2,2,1,0,0,0,1,0,0,2],
  [2,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,2],
  [2,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,3,3,3,0,0,0,0,0,0,0,0,3,3,3,0,0,2],
  [2,0,0,3,3,3,0,0,0,0,0,0,0,0,3,3,3,0,0,2],
  [2,0,0,3,3,3,0,0,0,0,0,0,0,0,3,3,3,0,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
];

export type Direction = "up" | "down" | "left" | "right" | null;

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private touchDir: Direction = null;
  private speed = 140;

  constructor() {
    super("GameScene");
  }

  /** Public API for React touch controls. */
  public setTouchDirection(dir: Direction) {
    this.touchDir = dir;
  }

  create() {
    const map = this.make.tilemap({
      data: DEFAULT_MAP,
      tileWidth: TILE,
      tileHeight: TILE,
    });
    const tileset = map.addTilesetImage("tiles", undefined, TILE, TILE, 0, 0);
    if (!tileset) return;

    const layer = map.createLayer(0, tileset, 0, 0);
    if (!layer) return;
    layer.setCollision([2, 3]);

    // Player
    this.anims.create({
      key: "walk-down",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 2 }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "walk-left",
      frames: this.anims.generateFrameNumbers("player", { start: 3, end: 5 }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "walk-right",
      frames: this.anims.generateFrameNumbers("player", { start: 6, end: 8 }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "walk-up",
      frames: this.anims.generateFrameNumbers("player", { start: 9, end: 11 }),
      frameRate: 6,
      repeat: -1,
    });

    this.player = this.physics.add.sprite(TILE * 2 + 16, TILE * 2 + 16, "player", 1);
    this.player.setSize(20, 18);
    this.player.setOffset(6, 14);
    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, layer);

    // Camera
    const worldW = MAP_COLS * TILE;
    const worldH = MAP_ROWS * TILE;
    this.physics.world.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
    this.cameras.main.setBackgroundColor("#1a1a1a");

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  update() {
    if (!this.player) return;

    let vx = 0;
    let vy = 0;

    const left = !!this.cursors?.left?.isDown || !!this.wasd?.A?.isDown || this.touchDir === "left";
    const right = !!this.cursors?.right?.isDown || !!this.wasd?.D?.isDown || this.touchDir === "right";
    const up = !!this.cursors?.up?.isDown || !!this.wasd?.W?.isDown || this.touchDir === "up";
    const down = !!this.cursors?.down?.isDown || !!this.wasd?.S?.isDown || this.touchDir === "down";

    if (left) vx = -this.speed;
    else if (right) vx = this.speed;
    if (up) vy = -this.speed;
    else if (down) vy = this.speed;

    // Normalize diagonal speed
    if (vx !== 0 && vy !== 0) {
      vx *= Math.SQRT1_2;
      vy *= Math.SQRT1_2;
    }

    this.player.setVelocity(vx, vy);

    // Anim choice — prefer horizontal when both
    if (left) this.player.anims.play("walk-left", true);
    else if (right) this.player.anims.play("walk-right", true);
    else if (up) this.player.anims.play("walk-up", true);
    else if (down) this.player.anims.play("walk-down", true);
    else {
      this.player.anims.stop();
      // Idle frame: middle of current direction row
      const cur = this.player.anims.currentAnim?.key;
      if (cur === "walk-left") this.player.setFrame(4);
      else if (cur === "walk-right") this.player.setFrame(7);
      else if (cur === "walk-up") this.player.setFrame(10);
      else this.player.setFrame(1);
    }
  }
}
