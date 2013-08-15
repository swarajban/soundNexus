$(document).ready(function(){
	var socket = io.connect();

	var currentScTitle = "";
	var currentScDuration = -1;
	SC.initialize({
			client_id: 'ad25d194c7d81e03f443be418b1b176c'
		}
	);

	var ytAPIKey = 'AIzaSyDcth1OwFR5eEXUcr8ujW23K4OXdJuqyfc';
	var currentYtId = "";
	var currentYtDuration = -1;


	// Soundcloud UI
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

	$('#soundcloudSearchButton').click(function(){
		var query = $('#soundcloudSearchQuery').val();
		SC.get('/tracks', {
			q: query
		}, onGetSoundcloudSearch);
	});

	// Youtube UI
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

	$('#youtubePlaybackSlider').slider({
		orientation: "horizontal",
		range: "min",
		min: 0,
		max: 100,
		value: 0,
		stop: function(event, ui){
			socket.emit('seekTo', {type: 'youtube', value: ui.value});
		}
	});

	$('#youtubeSearchButton').click(function(){
		var query = $('#youtubeSearchQuery').val();
		var baseYtDataApiUrl = 'https://www.googleapis.com/youtube/v3/search?part=snippet';
		var searchUrl = baseYtDataApiUrl + '&key=' + ytAPIKey;
		searchUrl += '&maxResults=10';
		searchUrl += '&q=' + query;
		$.ajax({
			url: searchUrl,
			type: "GET",
			"dataType": "json",
			success: function(result){
				showYoutubeSearchResult(result.items);
			}
		});
	});

	$('#pauseAll').click(function(){
		socket.emit('pauseAll');
	});


	// Handle currently playing track's info
	socket.on('playInfo', function(data){
		var type = data.type;
		if(type){
			switch(type){
				case 'soundcloud':
					onScPlayInfo(data);
					break;

				case 'youtube':
					onYtPlayInfo(data);
					break;

				default:
					break;
			}
		}
	});

	// Soundcloud play info handler
	var onScPlayInfo = function(data){
		if(data.duration && data.title && data.currentPosition){
			updateScTitle(data.title);
			updateScProgress(data.duration, data.currentPosition);
		}
	};

	// Updates soundcloud currently playing track name
	var updateScTitle = function(title){
		if(title != currentScTitle){
			currentScTitle = title;
			$('#soundcloudTitle').html(currentScTitle);
		}
	};

	// Updates soundcloud progress bar
	var updateScProgress = function(duration, currentPosition){
		if(duration != currentScDuration){
			currentScDuration = duration;
			$('#soundcloudPlaybackSlider').slider("option", "max", currentScDuration);
		}
		$('#soundcloudPlaybackSlider').slider("option", "value", currentPosition);

		var progressString = getProgressString(currentScDuration, currentPosition);
		$('#soundcloudProgressText').html(progressString);
	};


	// Populates soundcloud search results and adds click handlers
	var onGetSoundcloudSearch = function(tracks){
		tracks = tracks.slice(0, 15);
		var scSearchResults = $("#soundcloudSearchResult").empty();
		for(var i = 0; i < tracks.length; i++){
			var track = tracks[i];
			var title = track.title;
			var clickHandler = getOnSearchResultClickHandler($('#soundcloudSearchQuery'), 'soundcloud', track.permalink_url);
			$('<li>' + title + '</li>').
				addClass('soundcloudSearchResult searchResultItem').
				click(clickHandler).
				appendTo(scSearchResults);
		}
	}

	// Youtube play info handler
	var onYtPlayInfo = function(data){
		if(data.duration && data.id && data.currentPosition){
			updateYtTitle(data.id);
			updateYtProgress(data.duration, data.currentPosition);
		}
	};

	// Updates youtube progress bar
	var updateYtProgress = function(duration, currentPosition){
		if(duration != currentYtDuration){
			currentYtDuration = duration;
			$('#youtubePlaybackSlider').slider("option", "max", currentYtDuration);
		}
		$('#youtubePlaybackSlider').slider("option", "value", currentPosition);

		var progressString = getProgressString(currentYtDuration, currentPosition);
		$('#youtubeProgressText').html(progressString);
	};

	// Updates youtube currently playing track name
	var updateYtTitle = function(videoId){
		if(videoId != currentYtId){
			var baseYtDataApiUrl = 'https://www.googleapis.com/youtube/v3/videos?part=snippet';
			var requestUrl = baseYtDataApiUrl + '&key=' + ytAPIKey;
			requestUrl += '&id=' + videoId;
			$.ajax({
				url: requestUrl,
				type: "GET",
				dataType: "json",
				success: function(result){
					if(result.items && result.items.length == 1 && result.items[0].snippet){
						var title = result.items[0].snippet.title;
						$('#youtubeTitle').html(title);
						currentYtId = videoId;
					}
				}
			});
		}
	};

	// Populates youtube search results and adds click handlers
	var showYoutubeSearchResult = function(searchResults){
		var ytSearchResults = $("#youtubeSearchResult").empty();
		for(var i = 0; i < searchResults.length; i++){
			var currResult = searchResults[i];
			var title = currResult.snippet.title;
			var clickHandler = getOnSearchResultClickHandler($('#youtubeSearchQuery'), 'youtube', currResult.id.videoId);
			$('<li>' + title + '</li>').
				addClass('youtubeSearchResult searchResultItem').
				click(clickHandler).
				appendTo(ytSearchResults);
		}
	};

	// Returns search result click handler closure
	var getOnSearchResultClickHandler = function(searchFieldElement, type, link){
		searchFieldElement.val("");
		return function(){
			socket.emit('playLink', {type: type, link: link});
		}
	};


	// Generates HH:MM:SS / HH:MM:SS string based on track duration and progress
	var getProgressString = function(duration, currentProgress){
		var durationString = duration.toString().toHHMMSS();
		var currentProgressString = currentProgress.toString().toHHMMSS();
		return currentProgressString + "/" + durationString;
	};

});
