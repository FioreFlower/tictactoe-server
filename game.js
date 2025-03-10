const {v4: uuidv4} = require('uuid');

module.exports = function(server) {

    const io = require('socket.io')(server, {
        transports: ['websocket']
    });

    // 방 정보
    var rooms = [];
    var socketRooms = new Map();

    io.on('connection', function(socket) {
        console.log('Connected: ' + socket.id);
        if (rooms.length > 0) {
            var roomId = rooms.shift();
            socket.join(roomId)
            socket.emit('joinRoom', { roomId: roomId });
            socket.to(roomId).emit('startGame', { roomId: socket.id });
            socketRooms.set(socket.id, roomId);
        } else {
            var roomId = uuidv4();
            socket.join(roomId);
            socket.emit('createRoom', { room: roomId });
            rooms.push(roomId);
            socketRooms.set(socket.id, roomId);
        }

        socket.on('leaveRoom', function(roomData) {
            socket.leave(roomData.roomId);
            socket.emit('exitRoom');
            socket.to(roomData.roomId).emit('endGame');

            // 방 만든 후 혼자 들어갔다가 나갈 때 rooms에서 방 삭제
            var roomId = socketRooms.get(socket.id);
            const roomIdx = rooms.indexOf(roomId);
            if (roomIdx !== -1) {
                rooms.splice(roomIdx, 1);
                console.log('Room removed:', roomId);
            }

            socketRooms.delete(socket.id);
        });

        socket.on('doPlayer', function(moveData) {
            const roomId = moveData.roomId;
            const position = moveData.position;

            socket.to(roomId).emit('doOpponent', { position: position });
        });

        socket.on('disconnect', function(reason) {
            console.log('Disconnected: ' + socket.id + ', Reason: ' + reason);
        });
    });
};