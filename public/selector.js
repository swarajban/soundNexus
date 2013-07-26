$(document).ready(function(){
	var socket = io.connect();

	$('#soundcloudPlayButton').click(function(){
		var link = $('#soundcloudLinkField').val();
		socket.emit('playLink', {type: 'soundcloud', link: link});
		$('#soundcloudLinkField').val("");
	});

	$('#soundcloudResumeButton').click(function(){
		socket.emit('resume', {type: 'soundcloud'});
	});

	$('#pauseAll').click(function(){
		socket.emit('pauseAll');
	});
});