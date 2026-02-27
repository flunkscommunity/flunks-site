"use strict";

function handleMouseMove(evt) {
    if (!Canvas2D._canvas) return;
    var canvasScale = Canvas2D.scale;
    var canvasOffset = Canvas2D.offset;
    var mx = (evt.pageX - canvasOffset.x) / canvasScale.x;
    var my = (evt.pageY - canvasOffset.y) / canvasScale.y;
    Mouse._position = new Vector2(mx, my);
}

function handleMouseDown(evt) {
    handleMouseMove(evt);

    if (evt.which === 1) {
        if (!Mouse._left.down)
            Mouse._left.pressed = true;
        Mouse._left.down = true;
    } else if (evt.which === 2) {
        if (!Mouse._middle.down)
            Mouse._middle.pressed = true;
        Mouse._middle.down = true;
    } else if (evt.which === 3) {
        if (!Mouse._right.down)
            Mouse._right.pressed = true;
        Mouse._right.down = true;
    }
}

function handleMouseUp(evt) {
    handleMouseMove(evt);

    if (evt.which === 1)
        Mouse._left.down = false;
    else if (evt.which === 2)
        Mouse._middle.down = false;
    else if (evt.which === 3)
        Mouse._right.down = false;
}

function Mouse_Singleton() {
    this._position = Vector2.zero;
    this._left = new ButtonState();
    this._middle = new ButtonState();
    this._right = new ButtonState();
    document.onmousemove = handleMouseMove;
    document.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    
    // Touch events for mobile - update position for aiming
    // Only track touches directly on the game canvas, not on React overlay buttons
    function isTouchOnCanvas(touch) {
        var target = touch.target;
        // Walk up the DOM tree checking if target is inside the canvas or IS the canvas
        while (target) {
            if (target.tagName === 'CANVAS') return true;
            // Stop if we hit a button or interactive element (React overlay)
            if (target.tagName === 'BUTTON' || target.tagName === 'A' || 
                (target.classList && target.classList.contains('pointer-events-auto'))) return false;
            target = target.parentElement;
        }
        return false;
    }
    document.addEventListener('touchmove', function(evt) {
        if (evt.touches.length > 0 && isTouchOnCanvas(evt.touches[0])) {
            handleMouseMove(evt.touches[0]);
        }
    }, { passive: true });
    document.addEventListener('touchstart', function(evt) {
        if (evt.touches.length > 0 && isTouchOnCanvas(evt.touches[0])) {
            handleMouseMove(evt.touches[0]);
        }
    }, { passive: true });
}

Object.defineProperty(Mouse_Singleton.prototype, "left",
    {
        get: function () {
            return this._left;
        }
    });

Object.defineProperty(Mouse_Singleton.prototype, "middle",
    {
        get: function () {
            return this._middle;
        }
    });

Object.defineProperty(Mouse_Singleton.prototype, "right",
    {
        get: function () {
            return this._right;
        }
    });

Object.defineProperty(Mouse_Singleton.prototype, "position",
    {
        get: function () {
            return this._position;
        }
    });

Mouse_Singleton.prototype.reset = function () {
    this._left.pressed = false;
    this._middle.pressed = false;
    this._right.pressed = false;
};

Mouse_Singleton.prototype.containsMouseDown = function (rect) {
    return this._left.down && rect.contains(this._position);
};

Mouse_Singleton.prototype.containsMousePress = function (rect) {
    return this._left.pressed && rect.contains(this._position);
};

var Mouse = new Mouse_Singleton();
