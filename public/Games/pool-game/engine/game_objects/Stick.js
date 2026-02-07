"use strict";

// Detect if we're running in a Capacitor mobile app (NOT just touch-capable browser)
// This ensures desktop browsers with touch screens still use keyboard controls
var isCapacitorApp = typeof window !== 'undefined' && 
    window.Capacitor && 
    typeof window.Capacitor.isNativePlatform === 'function' && 
    window.Capacitor.isNativePlatform();

// Use mobile controls ONLY for actual native mobile apps (iOS/Android via Capacitor)
// Desktop browsers (even with touch) should use W/S keys + click
var isTouchDevice = isCapacitorApp;

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
    this.aimLocked = false;  // For React UI control (mobile only)
    
    // Expose stick instance globally for React controls
    window.PoolStick = this;
}

Stick.prototype.handleInput = function (delta) {

    if(AI_ON && Game.policy.turn === AI_PLAYER_NUM)
      return;

    if(Game.policy.turnPlayed)
      return;

    // Always track mouse for aiming (both desktop and mobile)
    if (this.trackMouse && this.isAiming) {
      var opposite = Mouse.position.y - this.position.y;
      var adjacent = Mouse.position.x - this.position.x;
      this.rotation = Math.atan2(opposite, adjacent);
    }

    if (isTouchDevice) {
      // === MOBILE CONTROLS: React UI buttons (lockAim, +/-, shoot) ===
      // Check if React UI has locked the aim
      if (this.aimLocked) {
        return; // Power/shoot handled by React UI
      }
    } else {
      // === DESKTOP CONTROLS: W/S for power, click or SPACE to shoot ===
      this.handleDesktopInput();
    }
};

Stick.prototype.handleDesktopInput = function() {
    // Keyboard controls for power
    if(Keyboard.down(Keys.W) && KEYBOARD_INPUT_ON){
      if(this.power < 75){
        this.origin.x += 2;
        this.power += 1.2;
      }
    }

    if(Keyboard.down(Keys.S) && KEYBOARD_INPUT_ON){
      if(this.power > 0){
        this.origin.x -= 2;
        this.power -= 1.2;
      }
    }

    // Shoot with mouse click or SPACE when power is set
    if (this.power > 0) {
      if (Mouse.left.pressed || Keyboard.pressed(Keys.space)) {
        this.executeShot();
      }
    }
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
    if (this.isAiming) {
      // Click to lock aim and start dragging for power
      if (Mouse.left.pressed) {
        this.isAiming = false;
        this.isDragging = true;
        this.dragStart = Mouse.position.copy();
      }
    } else {
      // Dragging to set power
      if (this.isDragging && Mouse.left.down) {
        var dx = this.dragStart.x - Mouse.position.x;
        var dy = this.dragStart.y - Mouse.position.y;
        var dragDist = -(dx * Math.cos(this.rotation) + dy * Math.sin(this.rotation));
        this.power = Math.max(0, Math.min(75, dragDist * 0.5));
        this.origin.x = 970 + (this.power / 75) * 50;
      } else if (this.isDragging && !Mouse.left.down) {
        // Released - shoot if we have power
        this.isDragging = false;
        if (this.power > 0) {
          this.executeShot();
        } else {
          // No power, go back to aiming
          this.isAiming = true;
        }
      }
      
      // Tap to shoot if not dragging and power is set
      if (!this.isDragging && Mouse.left.pressed) {
        if (this.power > 0) {
          this.executeShot();
        } else {
          this.isAiming = true;
        }
      }
    }
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
  this.aimLocked = false;
};

Stick.prototype.draw = function () {
  if(!this.visible)
    return;
  var sprite = (AI_ON && Game.policy.turn === AI_PLAYER_NUM) ? sprites.stickEasy : sprites.stick;
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
  var isAI = (AI_ON && Game.policy.turn === AI_PLAYER_NUM);
  var sprite = isAI ? sprites.stickEasy : sprites.stick;
  // easy-cue.png is 479px wide vs spr_stick.png at 938px, so scale the origin to match
  var drawOrigin = isAI ? new Vector2(this.origin.x * (479 / 938), this.origin.y) : this.origin;
  Canvas2D.drawImage(sprite, this.position,this.rotation,1, drawOrigin);
};