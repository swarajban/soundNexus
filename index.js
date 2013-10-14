var express = require('express'),
	http = require('http'),
	routes = require('./routes/routes.js'),
	io = require('socket.io');

var app = express();
var server = http.createServer(app);
io = io.listen(server);


// Jade
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);

// Routes
app.use(app.router);
app.get('/', routes.index);
app.get('/selector', routes.selector);
app.get('/player', routes.player);

// Static files
app.use(express.static(__dirname + '/public'));

// Start socket
io.sockets.on('connection', function(socket){
	require('./socketHandler.js').listen(io, socket);
});

var port = process.env.PORT || 3700;
server.listen(port);
console.log("Listening on port " + port);