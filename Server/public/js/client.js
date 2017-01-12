// constants
var SERVER = "http://localhost:8000";

// variables
var canvas; // Canvas DOM element
var ctx; // Canvas rendering context
var keys; // Keyboard input
var localPlayer; // Local player
var socket;
var map;
var remotePlayers;


function init() {
    // Declare the canvas and rendering context
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    // initialize remote players and the map
    map = [];
    remotePlayers = [];

    // Maximise the canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialise keyboard controls
    keys = new Keys();

    // connect to the server
    socket = io.connect(SERVER, { transports: ["websocket"] });

    // TODO: communicate with the server to get the map and player location
    var startX = 0;
    var startY = 0;

    // Initialise the local player
    localPlayer = new Player(startX, startY);

    // Start listening for events
    setEventHandlers();
};


var setEventHandlers = function() {
    // Keyboard
    window.addEventListener("keydown", onKeydown, false);
    window.addEventListener("keyup", onKeyup, false);

    // Window resize
    window.addEventListener("resize", onResize, false);

    socket.on("connect", onSocketConnected);
    socket.on("disconnect", onSocketDisconnect);
    socket.on("new player", onNewPlayer);
    socket.on("move player", onMovePlayer);
    socket.on("remove player", onRemovePlayer);
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

// Browser window resize
function onResize(e) {
    // Maximise the canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
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

};

function onRemovePlayer(data) {

};


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
    localPlayer.update(keys);
};


/**************************************************
 ** GAME DRAW
 **************************************************/
function draw() {
    // Wipe the canvas clean
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the local player
    localPlayer.draw(ctx);

    var i;
    for (i = 0; i < remotePlayers.length; i++) {
        remotePlayers[i].draw(ctx);
    };
};