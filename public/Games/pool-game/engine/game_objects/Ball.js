"use strict";

function Ball(initPos,color){
	this.initPos = initPos;
    this.position = initPos.copy();
    this.origin = new Vector2(25,25);
    this.velocity = Vector2.zero;
    this.color = color; 
    this.moving = false;
    this.visible = true;
    this.inHole = false;
    // Rolling animation — 4 frame cycle
    this.rollDist = 0;          // accumulated distance traveled
    this.rollThreshold = 10;    // pixels per frame advance
    this.rollFrameIndex = 0;    // 0-3 cycle
}

Object.defineProperty(Ball.prototype, "color",
    {
    	get: function(){
    		if(this.sprite == sprites.redBall){
    			return Color.red;
    		}
    		else if(this.sprite == sprites.yellowBall){
    			return Color.yellow;
    		}
			else if(this.sprite == sprites.blackBall){
    			return Color.black;
    		}
    		else{
    			return Color.white;
    		}
    	},
        set: function (value) {
            if (value === Color.red){
                this.sprite = sprites.redBall;
            }
            else if(value == Color.yellow){
            	this.sprite = sprites.yellowBall;
            }
			else if(value == Color.black){
            	this.sprite = sprites.blackBall;
            }
            else{
            	this.sprite = sprites.ball;
            }
        }
    });

Ball.prototype.shoot = function(power, angle){
    console.log('[Ball] shoot() called - power:', power, 'angle:', angle, 'already moving:', this.moving);
    if(power <= 0)
        return;

    this.moving = true;

    this.velocity = calculateBallVelocity(power,angle);
}

var calculateBallVelocity = function(power, angle){

    return new Vector2(100*Math.cos(angle)*power,100*Math.sin(angle)*power);
}

Ball.prototype.update = function(delta){

    this.updatePosition(delta);

    this.velocity.multiplyWith(0.98);

    // Rolling frame animation — cycle 0→1→2→3→0 based on distance
    if(this.moving) {
        var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        this.rollDist += speed * delta;
        if(this.rollDist >= this.rollThreshold) {
            this.rollFrameIndex = (this.rollFrameIndex + 1) % 4;
            this.rollDist = 0;
        }
    }

	if(this.moving && Math.abs(this.velocity.x) < 3 && Math.abs(this.velocity.y) < 3){
        this.stop();
    }
}

Ball.prototype.updatePosition = function(delta){

    if(!this.moving || this.inHole)
        return;
    var ball = this;
    var newPos = this.position.add(this.velocity.multiply(delta));


	if(Game.policy.isInsideHole(newPos)){
        sounds.playThrottled(sounds.hole, 0.5);
		this.position = newPos;
        this.inHole = true;
        setTimeout(function(){ball.visible=false;ball.velocity = Vector2.zero;}, 100);
        Game.policy.handleBallInHole(this);
		return;
	}

    var collision = this.handleCollision(newPos);

    if(collision){
		this.velocity.multiplyWith(0.95);
    }else{
    	this.position = newPos;
    }
}

Ball.prototype.handleCollision = function(newPos){

	var collision = false;

	if(Game.policy.isXOutsideLeftBorder(newPos, this.origin)){
        this.velocity.x = -this.velocity.x;
        this.position.x = Game.policy.leftBorderX + this.origin.x;
        collision = true;
    }
    else if(Game.policy.isXOutsideRightBorder(newPos, this.origin)){
        this.velocity.x = -this.velocity.x;
        this.position.x = Game.policy.rightBorderX - this.origin.x;
        collision = true;
    }

    if(Game.policy.isYOutsideTopBorder(newPos, this.origin)){
        this.velocity.y = -this.velocity.y;
        this.position.y = Game.policy.topBorderY + this.origin.y;
        collision = true;
    }
    else if(Game.policy.isYOutsideBottomBorder(newPos, this.origin)){
        this.velocity.y = -this.velocity.y;
        this.position.y = Game.policy.bottomBorderY - this.origin.y;
        collision = true;
    }

    return collision;
}

Ball.prototype.stop = function(){

    this.moving = false;
    this.velocity = Vector2.zero;
    this.rollFrameIndex = 0;
    this.rollDist = 0;
}

Ball.prototype.reset = function(){
	this.inHole = false;
	this.moving = false;
	this.velocity = Vector2.zero;
	this.position = this.initPos;
	this.visible = true;
}

Ball.prototype.out = function(){

	this.position = new Vector2(0, 900);
	this.visible = false;
	this.inHole = true;

}

Ball.prototype.draw = function () {
    if(!this.visible)
        return;

    // Pick the correct roll frame sprite
    var drawSprite = this.sprite;
    if(this.moving && this.rollFrameIndex > 0) {
        var frames = null;
        if(this.sprite === sprites.ball && sprites.ballFrames) frames = sprites.ballFrames;
        else if(this.sprite === sprites.redBall && sprites.redBallFrames) frames = sprites.redBallFrames;
        else if(this.sprite === sprites.yellowBall && sprites.yellowBallFrames) frames = sprites.yellowBallFrames;
        else if(this.sprite === sprites.blackBall && sprites.blackBallFrames) frames = sprites.blackBallFrames;
        if(frames) drawSprite = frames[this.rollFrameIndex];
    }

	Canvas2D.drawImage(drawSprite, this.position, 0, 1, new Vector2(25,25));
};