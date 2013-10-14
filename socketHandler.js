/**
 * Author swaraj
 * Date: 10/11/13
 */


module.exports.listen = function(io, socket){
	socket.on('playLink', function(data){
		io.sockets.emit('playLink', data);
	});

	socket.on('resume', function(data){
		io.sockets.emit('resume', data);
	});

	socket.on('playInfo', function(data){
		io.sockets.emit('playInfo', data);
	});

	socket.on('seekTo', function(data){
		io.sockets.emit('seekTo', data);
	});

	socket.on('changeVolume', function(data){
		io.sockets.emit('changeVolume', data);
	});

	socket.on('pauseAll', function(data){
		io.sockets.emit('pauseAll');
	});
}