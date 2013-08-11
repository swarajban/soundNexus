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

	$('#soundcloudVolumeSlider').slider({
		orientation: "vertical",
		range: "min",
		min: 0,
		max: 100,
		value: 100,
		slide: function(event, ui){
			socket.emit('changeVolume', {type: 'soundcloud', value: ui.value});
		}
	});

	$('#youtubePlayButton').click(function(){
		var videoId = $('#youtubeVideoIdField').val();
		socket.emit('playLink', {type: 'youtube', link: videoId});
		$('#youtubeVideoIdField').val("");
	});

	$('#youtubeResumeButton').click(function(){
		socket.emit('resume', {type: 'youtube'});
	});

	$('#youtubeVolumeSlider').slider({
		orientation: "vertical",
		range: "min",
		min: 0,
		max: 100,
		value: 100,
		slide: function(event, ui){
			socket.emit('changeVolume', {type: 'youtube', value: ui.value});
		}
	});

	$('#pauseAll').click(function(){
		socket.emit('pauseAll');
	});
});
