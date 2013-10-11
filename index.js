var express = require("express");
var app = express();
var port = process.env.PORT || 3700;

// Jade
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);

// Routes
var routes = require('./routes/routes.js');
app.use(app.router);
app.get('/', routes.index);
app.get('/selector', routes.selector);
app.get('/player', routes.player);

// Static files
app.use(express.static(__dirname + '/public'));


// Start App + Socket.io init
var io = require('socket.io').listen(app.listen(port));

io.sockets.on('connection', function(socket){
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
});


console.log("Listening on port " + port);