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

	$('#youtubePlayButton').click(function(){
		var videoId = $('#youtubeVideoIdField').val();
		socket.emit('playLink', {type: 'youtube', link: videoId});
		$('#youtubeVideoIdField').val("");
	});

	$('#youtubeResumeButton').click(function(){
		socket.emit('resume', {type: 'youtube'});
	});

	$('#pauseAll').click(function(){
		socket.emit('pauseAll');
	});
});
