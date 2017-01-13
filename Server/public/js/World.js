var World = function(loop, width) { // loop makes the world loop horizontally, width is in chunks
    var BLOCK_SIZE = 10; // block size in pixels
    var CHUNK_SIZE = 10; // chunk size in blocks

    var Chunk = function(chunkX, chunkY, type) {
        var chunkX = chunkX; // chunk coords x
        var chunkY = chunkY; // chunk coords y
        var blocks = [];

        var getX = function() {
            return chunkX;
        }

        var getY = function() {
            return chunkY;
        }

        var generateBlocks = function() {
            for (var i = 0; i < CHUNK_SIZE; i++) {
                var row = [];
                for (var j = 0; j < CHUNK_SIZE; j++) {
                    if (type == "land") {
                        var block = createBlock(chunkX, chunkY, i, j, "brown", false);
                    } else if (type == "air") {
                        var block = createBlock(chunkX, chunkY, i, j, "blue", true);
                    }
                    row.push(block);
                }
                blocks.push(row);
            }
        }

        var getBlockFromGlobalBlockCoords = function(globalX, globalY) {
            var localX = globalX % CHUNK_SIZE;
            var localY = globalY % CHUNK_SIZE;
            if (localX < 0) localX += CHUNK_SIZE;
            if (localY < 0) localY += CHUNK_SIZE;
            return blocks[localX][localY];

        }

        var getNeighbours = function() {
            return [
                getNeighbourChunk(0, 1),
                getNeighbourChunk(0, -1),
                getNeighbourChunk(1, 0),
                getNeighbourChunk(-1, 0),
            ]
        }

        var getNeighbourChunk = function(deltaX, deltaY) { // chunk coordinates
            var neighbourX = chunkX + deltaX;
            var neighbourY = chunkY + deltaY;
            if (loop) {
                if (neighbourX >= width) {
                    neighbourX = 0;
                } else if (neighbourX < 0) {
                    neighbourX = width - 1;
                }
            }
            return getChunkFromChunkCoords(neighbourX, neighbourY);
        }

        generateBlocks();

        return {
            getX: getX,
            getY: getY,
            generateBlocks: generateBlocks,
            getBlockFromGlobalBlockCoords: getBlockFromGlobalBlockCoords,
            getNeighbours: getNeighbours,
            getNeighbourChunk: getNeighbourChunk,
            blocks: () => blocks
        }
    }

    var Block = function(properties) {
        var props = properties;
        props.canCollide = props.canCollide || false;
        props.globalX = props.globalBlockX * BLOCK_SIZE;
        props.globalY = props.globalBlockY * BLOCK_SIZE;

        var getProps = function() {
            return props;
        }

        var getChunk = function() {
            return props.chunk;
        }

        return {
            getProps: getProps,
            getChunk: getChunk
        }
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

    var createBlock = function(chunkX, chunkY, localBlockX, localBlockY, colour, canCollide) {
        var properties = {
            globalBlockX: chunkX * CHUNK_SIZE + localBlockX,
            globalBlockY: chunkY * CHUNK_SIZE + localBlockY,
            localBlockX: localBlockX,
            localBlockY: localBlockY,
            colour: colour,
            canCollide: canCollide,
            chunkX: chunkX,
            chunkY: chunkY
        }
        return new Block(properties);
    }

    var generateChunk = function(chunkX, chunkY) {
        if (!chunks.chunkX) {
            chunks.chunkX = {}
        }
        var type = "land";
        if (chunkY < 5) {
            type = "air";
        }
        chunks.chunkX.chunkY = new Chunk(chunkX, chunkY, type);
    }

    var getChunkFromChunkCoords = function(chunkX, chunkY) { // gets a chunk, ensuring that it exists
        if (loop) {
            while (chunkX >= width) {
                chunkX -= width;
            }
            while (chunkX < 0) {
                chunkX += width;
            }
        }
        if (!chunks.chunkX) {
            chunks.chunkX = {}
        }
        if (!chunks.chunkX.chunkY) {
            generateChunk(chunkX, chunkY);
        }
        return chunks.chunkX.chunkY;
    }

    var getChunkFromGlobalBlockCoords = function(blockX, blockY) {
        return getChunkFromChunkCoords(Math.floor(blockX / CHUNK_SIZE), Math.floor(blockY / CHUNK_SIZE));
    }

    var getChunkFromCoords = function(x, y) { // pixel coords
        return getChunkFromGlobalBlockCoords(Math.floor(x / BLOCK_SIZE), Math.floor(y / BLOCK_SIZE));
    }

    var getNeighbourBlock = function(block, deltaX, deltaY) { // block coordinates
        var newX = block.getProps().globalBlockX + deltaX;
        var newY = block.getProps().globalBlockY + deltaY;
        if (loop) {
            var widthInBlocks = width * CHUNK_SIZE;
            if (newX >= widthInBlocks) {
                newX = 0;
            } else if (newX < 0) {
                newX = widthInBlocks - 1;
            }
        }
        return getBlockFromBlockCoords(newX, newY);
    }

    var getBlockFromBlockCoords = function(blockX, blockY) {
        var chunk = getChunkFromChunkCoords(blockX / CHUNK_SIZE, blockY / CHUNK_SIZE);
        return chunk.getBlockFromGlobalBlockCoords(blockX, blockY);
    }

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
        var chunk = getChunkFromChunkCoords(chunkX, chunkY);
        var block = chunk.getBlockFromGlobalBlockCoords(blockX, blockY);
        return block;
    }

    var getNearestEmptyHeight = function(x, y) {
        var block = getBlockFromCoords(x, y);
        while (true) {
            if (block.getProps().canCollide) {
                break;
            }
            block = getNeighbourBlock(block, 0, -1);
            console.log(block.getProps().globalY);
        }
        var y = block.getProps().globalY;
        return y;
    }

    var ensureSurroundingsLoaded = function(players) {
        for (var i = 0; i < players.length; i++) {
            var p = players[i];
            var chunk = getChunkFromCoords(p.getX(), p.getY());
            var neighbours = chunk.getNeighbours(); // this ensures they exist
        }

    }

    return {
        BLOCK_SIZE: () => BLOCK_SIZE,
        CHUNK_SIZE: () => CHUNK_SIZE,
        isCoordFilled: isCoordFilled,
        getNearestEmptyHeight: getNearestEmptyHeight,
        ensureSurroundingsLoaded: ensureSurroundingsLoaded,
        getChunkFromChunkCoords: getChunkFromChunkCoords
    }
}

var exports;
if (exports) {
    exports.World = World;
}