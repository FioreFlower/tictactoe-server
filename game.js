const {v4: uuidv4} = require('uuid');

module.exports = function (server) {
    const io = require("socket.io")(server);

    var rooms = [];

    io.on("connection", function (socket) {
        console.log("user connected");

        if(rooms.length > 0){
            var roomId = rooms.shift();
            socket.join(roomId);
            socket.emit("joinRoom", {roomId});
            socket.to(roomId).emit('startGame', {userId: socket.id});
        } else {
            var roomId = uuidv4();
            socket.join(roomId);
            socket.emit("createRoom", {roomId});
            rooms.push(roomId);
        }

        socket.on('leaveRoom', function (){
            socket.leave(roomId);
            socket.emit("leaveRoom", {roomId});
            socket.to(roomId).emit('gameEnded', {userId: socket.id});
        });


        socket.on('sendMessage', function (message) {
            console.log('메세지를 받았습니다 : ', message.nickname + " : " +message.message + " : " + message.roomId);
            socket.to(message.roomId).emit('receiveMessage', {nickname: message.nickname, message: message.message, userId: socket.id});
        });

        socket.on('disconnect', function () {
            console.log("user disconnected");
        })
    });
};