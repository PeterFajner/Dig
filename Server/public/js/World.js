var World = function() {
    var BLOCK_SIZE = 10; // block size in pixels
    var CHUNK_SIZE = 10; // chunk size in blocks

    var Chunk = function(chunkX, chunkY, type) {
        var chunkX = chunkX; // chunk coords x
        var chunkY = chunkY; // chunk coords y
        var blocks = [];
        generateBlocks();

        var generateBlocks = function() {
            for (var i = 0; i < CHUNK_SIZE; i++) {
                var row = [];
                for (var j = 0; j < CHUNK_SIZE; j++) {
                    if (type == "land") {
                        var block = createBlock(chunkX, chunkY, i, j, false);
                    } else if (type == "air") {
                        var block = createBlock(chunkX, chunkY, i, j, true);
                    } else if (type == "mixed") {

                    }
                }
            }
            blocks.append(row);
        }
    }
}

var Block = function(properties) {
    var props = properties;
    props.canCollide = props.canCollide || false;

    var getProps() {
        return props;
    }

    return {
        getProps
    }
}

var createBlock = function(chunkX, chunkY, localX, localY, canCollide) {
    var properties = {
        globalX = chunkX * CHUNK_SIZE + localX,
        globalY = chunkY * CHUNK_SIZE + localY,
        localX = localX,
        localY = localY,
        canCollide = canCollide
    }
    return new Block(properties);
}



/*
Chunks are 10x10 groups of blocks. Each block is 10x10 pixels.
The chunks object is indexed by x coordinate and then y coordinate of the top left block. For example chunks[5][10] gets the chunk representing blocks x:50-59 and y:100-109.

Three coordinate systems:
- coords: regular pixel coordinates
- block coords: block positions [coords / BLOCK_SIZE]
- chunk coords: chunk positions [block coords / CHUNK_SIZE]
Global coords are based on the world (block at x=9 in chunk x=10 has global x=90)
Local coords are offset from the chunk (block at x=9 in chunk x=10 has local x=9)
*/
var chunks = {}; // indexed by x coordinate and then y coordinate.

var isCoordFilled = function(x, y) {
    var block = getBlockFromCoords(x, y);
    if (block.getProps().canCollide == true) {
        return true;
    } else return false;
}

var getBlockFromCoords = function(x, y) {
    var blockX = Math.floor(x / BLOCK_SIZE);
    var blockY = Math.floor(y / BLOCK_SIZE);
    var chunkX = Math.floor(blockX / CHUNK_SIZE);
    var chunkY = Math.floor(blockY / CHUNK_SIZE);
    var chunk = chunks.chunkX.chunkY;
    var block = chunk.getBlockGlobalBlockCoords(blockX, blockY);
}

return {
    BLOCK_SIZE: BLOCK_SIZE,
    CHUNK_SIZE: CHUNK_SIZE,
    isCoordFilled: isCoordFilled
}
}

var exports;
if (exports) {
    exports.World = World;
}