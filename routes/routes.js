/**
 * Author swaraj
 * Date: 10/11/13
 */

exports.index = function(req, res){
	console.log("Received page request from host: " + req.headers.host);
	res.redirect('/selectRoom');
};

exports.selector = function(req, res){
	console.log("Received selector page request from host: " + req.headers.host);
	var roomName = req.params.roomName;
	getOrCreateRoom(roomName, function(){
		var title = "Music Selector for " + roomName;
		res.render("selector", {roomName: roomName, title: title});
	});
};

exports.player = function(req, res){
	console.log("Received player page request from host: " + req.headers.host);
	var roomName = req.params.roomName;
	getOrCreateRoom(roomName, function(){
		var title = "Music Player for " + roomName;
		res.render("player", {roomName: roomName, title: title});
	});
}

exports.selectRoom = function(req, res){
	var redis = global.redisClient;
	redis.smembers('soundnexus:rooms', function(err, replies){
		var rooms = replies;
		res.render('selectRoom', {rooms: rooms});
	});
}

var getOrCreateRoom = function(roomName, callback){
	var redis = global.redisClient;
	redis.sismember('soundnexus:rooms', roomName, function(err, reply){
		if(! reply){
			redis.sadd('soundnexus:rooms', roomName);
		}
		callback();
	});
};