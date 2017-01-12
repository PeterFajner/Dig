var PORT = 8000;

var util = require("util");
var Server = require("socket.io");
var Player = require("./Player").Player;

var io;
var players;

function init() {
    players = [];
    io = new Server(PORT, { transport: ["websocket"], });
    setEventHandlers();

    console.log("Server started!");
}

function setEventHandlers() {
    io.sockets.on("connection", onSocketConnection);
}

function onSocketConnection(client) {
    util.log("New player has connected: " + client.id);
    client.on("disconnect", onClientDisconnect);
    client.on("new player", onNewPlayer);
    client.on("move player", onMovePlayer);
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
    var newPlayer = new Player(data.x, data.y);
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

function onMovePlayer(data) {
    var movePlayer = playerById(this.id);

    if (!movePlayer) {
        util.log("Player not found: " + this.id);
        return;
    };

    movePlayer.setX(data.x);
    movePlayer.setY(data.y);

    this.broadcast.emit("move player", { id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY() });
};

function playerById(id) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].id == id)
            return players[i];
    };

    return false;
};

function stop() {
    save();
}

function save() {

}

init();