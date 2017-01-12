var PORT = 8000;

var util = require("util");
var Server = require("socket.io");
var Player = require("./public/js/Player").Player;

var io;
var players;

var previousTime;

function init() {
    players = [];
    io = new Server(PORT, { transport: ["websocket"], });
    setEventHandlers();

    previousTime = Date.now();
    setInterval(timeStep, 50);

    console.log("Server started!");
}

function setEventHandlers() {
    io.sockets.on("connection", onSocketConnection);
}

function onSocketConnection(client) {
    util.log("New player has connected: " + client.id);
    client.on("disconnect", onClientDisconnect);
    client.on("new player", onNewPlayer);
    client.on("key press", onKeyPress);
    client.on("request id", onRequestId);
};

function onClientDisconnect() {
    util.log("Player has disconnected: " + this.id);

    var removePlayer = playerById(this.id);

    if (!removePlayer) {
        util.log("Player not found: " + this.id);
        return;
    };

    players.splice(players.indexOf(removePlayer), 1);
    this.broadcast.emit("remove player", { id: this.id });
};

function onNewPlayer(data) {
    // create new player object
    var newPlayer = new Player(0, 0); // TODO: start coordinates
    newPlayer.id = this.id;

    // send new player to other players
    this.broadcast.emit("new player", { id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY() });

    // send other players to new player
    var i, existingPlayer;
    for (i = 0; i < players.length; i++) {
        existingPlayer = players[i];
        this.emit("new player", { id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY() });
    };

    // add the new player to the player list
    players.push(newPlayer);
};

function onKeyPress(data) {
    var playerToMove = playerById(this.id);

    if (!playerToMove) {
        util.log("Player not found: " + this.id);
        return;
    };

    playerToMove.update(data.keys);

    io.emit("move player", { id: playerToMove.id, x: playerToMove.getX(), y: playerToMove.getY() });
};

function onRequestId(data) {
    this.emit("send id", { id: this.id });
}

function playerById(id) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].id == id)
            return players[i];
    };

    return false;
};

function timeStep() {
    // update all player positions
    var currentTime = Date.now();
    for (var i = 0; i < players.length; i++) {
        var p = players[i];
        //util.log("y: " + p.getY());
        p.step(currentTime - previousTime)
        if (p.hasUpdated()) {
            io.emit("move player", { id: p.id, x: p.getX(), y: p.getY() });
        }
    }
    previousTime = currentTime;

    // send all player positions

}

function stop() {
    save();
}

function save() {

}

function resendPositions() {

}

init();