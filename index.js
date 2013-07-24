var express = require("express");
var app = express();
var port = process.env.PORT || 3700;

// Jade
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);


// Routes
app.get("/player", function(req, res){
	res.render("player");
	console.log("Received player page request from host: " + req.headers.host);
});

app.get("/selector", function(req, res){
	res.render("selector");
	console.log("Received selector page request from host: " + req.headers.host);
});


// Static files
app.use(express.static(__dirname + '/public'));


// Start App + Socket.io init
var io = require('socket.io').listen(app.listen(port));

io.sockets.on('connection', function(socket){
	socket.on('playLink', function(data){
		io.sockets.emit('playLink', data);
	});
});


console.log("Listening on port " + port);