/**
 * Author swaraj
 * Date: 10/11/13
 */


module.exports.listen = function(io, socket){

	socket.on('joinRoom', function(data){
		var roomName = data.roomName;
		socket.join(roomName);
		socket.room = roomName;
	});

	socket.on('playLink', function(data){
		io.sockets.in(socket.room).emit('playLink', data);
	});

	socket.on('resume', function(data){
		io.sockets.in(socket.room).emit('resume', data);
	});

	socket.on('playInfo', function(data){
		io.sockets.in(socket.room).emit('playInfo', data);
	});

	socket.on('seekTo', function(data){
		io.sockets.in(socket.room).emit('seekTo', data);
	});

	socket.on('changeVolume', function(data){
		io.sockets.in(socket.room).emit('changeVolume', data);
	});

	socket.on('pauseAll', function(data){
		io.sockets.in(socket.room).emit('pauseAll');
	});
}