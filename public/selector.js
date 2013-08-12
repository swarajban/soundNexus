$(document).ready(function(){
	var socket = io.connect();

	var currentScTitle = "";
	var currentScDuration = -1;

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

	$('#soundcloudPlaybackSlider').slider({
		orientation: "horizontal",
		range: "min",
		min: 0,
		max: 100,
		value: 0,
		stop: function(event, ui){
			socket.emit('seekTo', {type: 'soundcloud', value: ui.value});
		}
	});


	$('#youtubePlayButton').click(function(){
		var videoUrl = $('#youtubeVideoIdField').val();
		var idRegex = /\?v\=(\S+)$/;
		var result = idRegex.exec(videoUrl);
		if(result){
			var videoId = result[1];
			socket.emit('playLink', {type: 'youtube', link: videoId});
		}
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


	socket.on('playInfo', function(data){
		var type = data.type;
		if(type){
			switch(type){
				case 'soundcloud':
					onScPlayInfo(data);
					break;

				default:
					break;
			}
		}
	});

	var onScPlayInfo = function(data){
		if(data.duration && data.title && data.currentPosition){
			updateScTitle(data.title);
			updateScProgress(data.duration, data.currentPosition);
		}
	};

	var updateScTitle = function(title){
		if(title != currentScTitle){
			currentScTitle = title;
			$('#soundcloudTitle').html(currentScTitle);
		}
	};

	var updateScProgress = function(duration, currentPosition){
		if(duration != currentScDuration){
			currentScDuration = duration;
			$('#soundcloudPlaybackSlider').slider("option", "max", currentScDuration);
		}
		$('#soundcloudPlaybackSlider').slider("option", "value", currentPosition);

		var durationString = currentScDuration.toString().toHHMMSS();
		var currentProgressString = currentPosition.toString().toHHMMSS();
		var progressString = currentProgressString + "/" + durationString;
		$('#soundcloudProgressText').html(progressString);
	};
});
