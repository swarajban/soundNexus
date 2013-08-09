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

	$('#soundcloudIncreaseButton').click(function(){
		socket.emit('changeVolume', {type: 'soundcloud', amount:10});
	});

	$('#soundcloudDecreaseButton').click(function(){
		socket.emit('changeVolume', {type: 'soundcloud', amount:-10});
	});

	$('#youtubePlayButton').click(function(){
		var videoId = $('#youtubeVideoIdField').val();
		socket.emit('playLink', {type: 'youtube', link: videoId});
		$('#youtubeVideoIdField').val("");
	});

	$('#youtubeResumeButton').click(function(){
		socket.emit('resume', {type: 'youtube'});
	});

	$('#youtubeIncreaseButton').click(function(){
		socket.emit('changeVolume', {type: 'youtube', amount:10});
	});

	$('#youtubeDecreaseButton').click(function(){
		socket.emit('changeVolume', {type: 'youtube', amount:-10});
	});

	$('#pauseAll').click(function(){
		socket.emit('pauseAll');
	});
});
