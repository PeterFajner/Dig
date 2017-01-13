/**************************************************
 ** GAME PLAYER CLASS
 **************************************************/
var Player = function(startX, startY) {
    var x = startX,
        y = startY,
        moveAmount = 2;
    var vX = 0; // horizontal velocity
    var vY = 0; // vertical velocity
    var gravity = 1; // the vertical change in velocity every time period
    var timeScale = 0.01;
    var id;
    var updated = false;

    var getX = function() {
        return x;
    };

    var getY = function() {
        return y;
    };

    var setX = function(newX) {
        x = newX;
    };

    var setY = function(newY) {
        y = newY;
    };

    var update = function(keys, world) {
        var prevX = x;
        var prevY = y;

        // Up key takes priority over down
        if (keys.up) {
            y -= moveAmount;
        }
        /*else if (keys.down) {
                   y += moveAmount;
               }*/
        ;

        // Left key takes priority over right
        if (keys.left) {
            x -= moveAmount;
        } else if (keys.right) {
            x += moveAmount;
        };

        if (prevX != x || prevY != y) {
            updated = true;
            return true;
        } else return false;
    };

    var step = function(timeDelta, world) {
        var scale = timeDelta * timeScale;

        var oldX = x;
        var oldY = y;

        // apply gravity
        vY += gravity * scale;
        if (Math.abs(vY) > world.BLOCK_SIZE()) {
            vY = world.BLOCK_SIZE; // prevents falling through blocks
        }
        y += vY * scale;
        if (world.isCoordFilled(x, y)) {
            y = world.getNearestEmptyHeight(x, y);
            vY = 0;
        }
        if (oldX - x != 0 || oldY - y != 0) {
            updated = true;
            return true;
        }
    }

    var draw = function(ctx, offset) {
        ctx.fillRect(x - 5 + offset.x, y - 5 + offset.y, 10, 10);
    };

    var hasUpdated = function() {
        if (updated) {
            updated = false;
            return true;
        } else return false;
    }

    return {
        update: update,
        step: step,
        draw: draw,
        getX: getX,
        getY: getY,
        setX: setX,
        setY: setY,
        hasUpdated: hasUpdated,
        id: id,
    }
};

var exports;
if (exports) {
    exports.Player = Player;
}