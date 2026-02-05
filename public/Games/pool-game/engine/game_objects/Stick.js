"use strict";

// Detect if we're on a touch device
var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

function Stick(position){
    this.position = position;
    this.origin = new Vector2(970,11);
    this.shotOrigin = new Vector2(950,11);
    this.shooting = false;
    this.visible = true;
    this.rotation = 0;
    this.power = 0;
    this.trackMouse = true;
    // Drag-to-power state (mobile only)
    this.isDragging = false;
    this.dragStart = null;
    this.isAiming = true;
    this.aimLocked = false;  // New: for React UI control
    
    // Expose stick instance globally for React controls
    window.PoolStick = this;
}

Stick.prototype.handleInput = function (delta) {

    if(AI_ON && Game.policy.turn === AI_PLAYER_NUM)
      return;

    if(Game.policy.turnPlayed)
      return;

    // Check if React UI has locked the aim
    if (this.aimLocked) {
      // Aim is locked, only respond to power/shoot commands from React
      return;
    }

    // Always track mouse/touch for aiming
    if (this.trackMouse && this.isAiming) {
      var opposite = Mouse.position.y - this.position.y;
      var adjacent = Mouse.position.x - this.position.x;
      this.rotation = Math.atan2(opposite, adjacent);
    }

    // Don't process keyboard/mouse shooting - React UI handles it
    // Desktop users can still aim with mouse, but shoot via React buttons
};

Stick.prototype.handleDesktopInput = function() {
    // Desktop input now handled by React UI buttons
    // This is kept for backwards compatibility but not actively used
};

// New methods for React UI control
Stick.prototype.lockAim = function() {
    this.aimLocked = true;
    this.isAiming = false;
};

Stick.prototype.unlockAim = function() {
    this.aimLocked = false;
    this.isAiming = true;
    this.power = 0;
    this.origin = new Vector2(970,11);
};

Stick.prototype.increasePower = function() {
    if (this.power < 75) {
        this.power += 5;
        this.origin.x = 970 + (this.power / 75) * 50;
    }
};

Stick.prototype.decreasePower = function() {
    if (this.power > 0) {
        this.power -= 5;
        if (this.power < 0) this.power = 0;
        this.origin.x = 970 + (this.power / 75) * 50;
    }
};

Stick.prototype.getPower = function() {
    return this.power;
};

Stick.prototype.getMaxPower = function() {
    return 75;
};

Stick.prototype.isAimLocked = function() {
    return this.aimLocked;
};

Stick.prototype.canShoot = function() {
    return this.aimLocked && this.power > 0 && !this.shooting && !Game.policy.turnPlayed;
};

Stick.prototype.handleMobileInput = function() {
    // Mobile input now handled by React UI buttons
    // This is kept for backwards compatibility but not actively used
};

Stick.prototype.executeShot = function() {
    if (Game.sound && SOUND_ON) {
      var strike = sounds.strike.cloneNode(true);
      strike.volume = (this.power / 10) < 1 ? (this.power / 10) : 1;
      strike.play();
    }
    Game.policy.turnPlayed = true;
    this.shooting = true;
    this.origin = this.shotOrigin.copy();

    Game.gameWorld.whiteBall.shoot(this.power, this.rotation);
    var stick = this;
    setTimeout(function(){ stick.visible = false; }, 500);
};

Stick.prototype.shoot = function(power, rotation, hideDelay){
  console.log('[Stick] shoot() called - power:', power, 'rotation:', rotation);
  this.power = power;
  this.rotation = rotation;
  var stickHideDelay = typeof hideDelay === "number" ? hideDelay : 500;

  if(Game.sound && SOUND_ON){
    var strike = sounds.strike.cloneNode(true);
    strike.volume = (this.power/(10))<1?(this.power/(10)):1;
    strike.play();
  }
  Game.policy.turnPlayed = true;
  this.shooting = true;
  this.origin = this.shotOrigin.copy();

  Game.gameWorld.whiteBall.shoot(this.power, this.rotation);
  var stick = this;
  setTimeout(function(){stick.visible = false;}, stickHideDelay);
}

Stick.prototype.update = function(){
  if(this.shooting && !Game.gameWorld.whiteBall.moving)
    this.reset();
};

Stick.prototype.reset = function(){
  this.position.x = Game.gameWorld.whiteBall.position.x;
  this.position.y = Game.gameWorld.whiteBall.position.y;
	this.origin = new Vector2(970,11);
  this.shooting = false;
  this.visible = true;
	this.power = 0;
  this.isAiming = true;
  this.isDragging = false;
  this.dragStart = null;
  this.aimLocked = false;  // Reset aim lock on turn reset
};

Stick.prototype.draw = function () {
  if(!this.visible)
    return;
  var ctx = Canvas2D._canvasContext;
  var canvasScale = Canvas2D.scale;
  var lineLength = 520;
  var targetLength = lineLength;
  if (Game.gameWorld && Game.gameWorld.balls) {
    var rayX = Math.cos(this.rotation);
    var rayY = Math.sin(this.rotation);
    var closest = lineLength;
    for (var i = 0; i < Game.gameWorld.balls.length; i++) {
      var ball = Game.gameWorld.balls[i];
      if (!ball || ball.inHole || ball === Game.gameWorld.whiteBall) {
        continue;
      }
      var dx = ball.position.x - this.position.x;
      var dy = ball.position.y - this.position.y;
      var proj = dx * rayX + dy * rayY;
      if (proj <= 0 || proj > lineLength) {
        continue;
      }
      var perp = Math.abs(dx * rayY - dy * rayX);
      if (perp <= BALL_SIZE * 0.6 && proj < closest) {
        closest = proj;
      }
    }
    targetLength = closest;
  }
  ctx.save();
  ctx.scale(canvasScale.x, canvasScale.y);
  ctx.beginPath();
  ctx.setLineDash([10, 8]);
  ctx.moveTo(this.position.x, this.position.y);
  ctx.lineTo(
    this.position.x + Math.cos(this.rotation) * targetLength,
    this.position.y + Math.sin(this.rotation) * targetLength
  );
  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  Canvas2D.drawImage(sprites.stick, this.position,this.rotation,1, this.origin);
};