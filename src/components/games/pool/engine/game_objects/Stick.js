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
      // === MOBILE CONTROLS: Click & drag to set power, release to shoot ===
      this.handleMobileInput();
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

Stick.prototype.shoot = function(power, rotation){
  this.power = power;
  this.rotation = rotation;

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
  setTimeout(function(){stick.visible = false;}, 500);
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
};

Stick.prototype.draw = function () {
  if(!this.visible)
    return;
  Canvas2D.drawImage(sprites.stick, this.position,this.rotation,1, this.origin);
};