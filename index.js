var express = require('express'),
	http = require('http'),
	routes = require('./routes/routes.js'),
	io = require('socket.io'),
	redis = require('redis');

var app = express();
var server = http.createServer(app);
io = io.listen(server);

//Redis
global.redisClient = redis.createClient();


// Jade
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);

// favicon
app.use(express.favicon(__dirname + '/public/favicon.ico'));

// Static files
app.use(express.static(__dirname + '/public'));

// Routes
app.use(app.router);
app.get('/', routes.index);
app.get('/selector', routes.index);
app.get('/player', routes.index);
app.get('/selector/:roomName', routes.selector);
app.get('/player/:roomName', routes.player);
app.get('/selectRoom', routes.selectRoom);


// Start socket
io.sockets.on('connection', function(socket){
	require('./socketHandler.js').listen(io, socket);
});

var port = process.env.PORT || 3700;
server.listen(port);
console.log("Listening on port " + port);