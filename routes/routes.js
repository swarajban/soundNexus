/**
 * Author swaraj
 * Date: 10/11/13
 */

exports.selector = function(req, res){
	console.log("Received selector page request from host: " + req.headers.host);
	res.render("selector");
};

exports.player = function(req, res){
	console.log("Received player page request from host: " + req.headers.host);
	res.render("player");
}