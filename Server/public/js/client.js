// constants
var SERVER = "http://localhost:8000";
var WIDTH = 800;
var HEIGHT = 600;

var CHUNK_SIZE;
var BLOCK_SIZE;

// variables
var canvas; // Canvas DOM element
var ctx; // Canvas rendering context
var keys; // Keyboard input
var localPlayer; // Local player
var socket;
var chunks;
var blocks;
var remotePlayers;


function init() {
    // Declare the canvas and rendering context
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    // initialize remote players and the map
    chunks = {};
    blocks = {};
    remotePlayers = [];

    // Set canvas size and position
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.position = "absolute";
    canvas.style.left = "50%";
    canvas.style.marginLeft = (-WIDTH / 2).toString() + "px";

    // Initialise keyboard controls
    keys = new Keys();

    // connect to the server
    socket = io.connect(SERVER, { transports: ["websocket"] });

    // Start listening for events
    setEventHandlers();

    // communicate with the server to get the map
    socket.emit("request world info");


    // get player ID
    socket.emit("request id");

    // Initialise the local player
    var startX = 0;
    var startY = 0;
    localPlayer = new Player(startX, startY);

    // get nearby world
    requestNearbyChunks();


};


var setEventHandlers = function() {
    // Keyboard
    window.addEventListener("keydown", onKeydown, false);
    window.addEventListener("keyup", onKeyup, false);

    socket.on("connect", onSocketConnected);
    socket.on("disconnect", onSocketDisconnect);
    socket.on("new player", onNewPlayer);
    socket.on("move player", onMovePlayer);
    socket.on("remove player", onRemovePlayer);
    socket.on("send chunk", onReceiveMapChunk);
    socket.on("send id", setId);
    socket.on("send world info", onReceiveWorldInfo);
};

// Keyboard key down
function onKeydown(e) {
    if (localPlayer) {
        keys.onKeyDown(e);
    };
};

// Keyboard key up
function onKeyup(e) {
    if (localPlayer) {
        keys.onKeyUp(e);
    };
};

function onSocketConnected() {
    console.log("Connected to socket server");
    socket.emit("new player", { x: localPlayer.getX(), y: localPlayer.getY() });
};

function onSocketDisconnect() {
    console.log("Disconnected from socket server");
};

function onNewPlayer(data) {
    console.log("New player connected: " + data.id);
    var newPlayer = new Player(data.x, data.y);
    newPlayer.id = data.id;
    remotePlayers.push(newPlayer);
};

function onMovePlayer(data) {
    var movePlayer = playerById(data.id);

    if (!movePlayer) {
        console.log("Player not found: " + data.id);
        return;
    };

    movePlayer.setX(data.x);
    movePlayer.setY(data.y);

};

function onRemovePlayer(data) {
    var removePlayer = playerById(data.id);

    if (!removePlayer) {
        console.log("Player not found: " + data.id);
        return;
    };

    remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};

function setId(data) {
    localPlayer.id = data.id;
}

function onReceiveMapChunk(data) {
    console.log(data)
    var chunkX = data.chunk.getX();
    var chunkY = data.chunk.getY();
    if (!chunks.chunkX) {
        chunks.chunkX = {};
    }
    chunks.chunkX.chunkY = data.chunk;

    var cblocks = data.chunk.blocks();
    for (var x = 0; x < cblocks.length; x++) {
        for (var y = 0; y < cblocks[x].length; y++) {
            var b = cblocks[x][y];
            var globalX = x + chunkX * CHUNK_SIZE;
            var globalY = y + chunkY * CHUNK_SIZE;
            if (!blocks[globalX]) {
                blocks[globalX] = {};
            }
            blocks[globalX][globalY] = b;
        }
    }
};



function onReceiveWorldInfo(data) {
    CHUNK_SIZE = data.CHUNK_SIZE;
    BLOCK_SIZE = data.BLOCK_SIZE;
}

function getPlayerChunkCoords(x, y) {
    var chunkX = Math.round(x / (CHUNK_SIZE * BLOCK_SIZE));
    var chunkY = Math.round(y / (CHUNK_SIZE * BLOCK_SIZE));
    return {
        chunkX: chunkX,
        chunkY: chunkY
    }
}

function requestNearbyChunks() {
    var chunkCoords = getPlayerChunkCoords(localPlayer.getX(), localPlayer.getY());
    socket.emit("request chunk", chunkCoords);
}


/**************************************************
 ** GAME ANIMATION LOOP
 **************************************************/
function animate() {
    update();
    draw();

    // Request a new animation frame using Paul Irish's shim
    window.requestAnimFrame(animate);
};


/**************************************************
 ** GAME UPDATE
 **************************************************/
function update() {
    if (keys.up || keys.down || keys.left || keys.right) {
        socket.emit("key press", { keys: keys });
        //localPlayer.update(keys);
    }
};


/**************************************************
 ** GAME DRAW
 **************************************************/
function draw() {
    // Wipe the canvas clean
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var offset = { x: -localPlayer.getX(), y: -localPlayer.getY() };

    // draw world
    for (var x = 0; x < Math.ceil(canvas.width / BLOCK_SIZE); x++) {
        for (var y = 0; y < Math.ceil(canvas.height / BLOCK_SIZE); y++) {
            ctx.fillStyle = "white";
            try {
                var block = blocks[x][y];
                ctx.fillStyle = block.getProps().colour;
            } catch (err) {}
            ctx.fillRect(x * BLOCK_SIZE + offset.x, y * BLOCK_SIZE + offset.y, BLOCK_SIZE, BLOCK_SIZE);
        }
    }

    // Draw the local player
    localPlayer.draw(ctx, { x: 0, y: 0 });

    // draw remote players
    var i;
    for (i = 0; i < remotePlayers.length; i++) {
        remotePlayers[i].draw(ctx, offset);
    };
};

function playerById(id) {
    if (localPlayer.id == id) {
        return localPlayer;
    }

    var i;
    for (i = 0; i < remotePlayers.length; i++) {
        if (remotePlayers[i].id == id)
            return remotePlayers[i];
    };

    return false;
};