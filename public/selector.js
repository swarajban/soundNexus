$(document).ready(function(){
	var roomName = $('#roomName').val();
	var socket = io.connect();

	var isConnected = false;
	var heartbeatIntervalId = null;
	updateIsConnected();

	// jquery selectors
	var scPlaybackSlider = $('#soundcloudPlaybackSlider');
	var ytPlaybackSlider = $('#youtubePlaybackSlider');

	// Join room
	socket.on('connect', function(){
		socket.emit('joinRoom', {roomName: roomName});
		heartbeatIntervalId = setInterval(onHeartbeatTimeout, 3000);
	});

	var currentScTitle = "";
	var currentScDuration = -1;
	SC.initialize({
			client_id: 'ad25d194c7d81e03f443be418b1b176c'
		}
	);

	var ytAPIKey = 'AIzaSyDcth1OwFR5eEXUcr8ujW23K4OXdJuqyfc';
	var currentYtId = "";
	var currentYtDuration = -1;

//	var list = $('#playlist')[0];
//	new Slip(list);
//
//	list.addEventListener('slip:reorder', function (event) {
//		event.target.parentNode.insertBefore(event.target, event.detail.insertBefore);
//		console.log('re-ordered');
//	});
//
//	list.addEventListener('slip:beforewait', function (event) {
//		event.preventDefault();
//	});



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
		stop: function () {
			socket.emit('changeVolume', {type: 'soundcloud', value: this.value});
		}
	});

	scPlaybackSlider.slider({
		stop: function () {
			socket.emit('seekTo', {type: 'soundcloud', value: this.value});
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
		stop: function () {
			socket.emit('changeVolume', {type: 'youtube', value: this.value});
		}
	});

	ytPlaybackSlider.slider({
		stop: function () {
			socket.emit('seekTo', {type: 'youtube', value: this.value});
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

	$('.pauseButton').click(function(){
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

	socket.on('heartbeat', function(){
		isConnected = true;
		updateIsConnected();
		clearInterval(heartbeatIntervalId);
		heartbeatIntervalId = setInterval(onHeartbeatTimeout, 3000);
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
			scPlaybackSlider.attr("max", currentScDuration);
			scPlaybackSlider.slider('refresh');
		}
		scPlaybackSlider.val(currentPosition);
		scPlaybackSlider.slider('refresh');

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
			$('#soundcloudSearchResult').listview('refresh');
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
			ytPlaybackSlider.attr("max", currentYtDuration);
			ytPlaybackSlider.slider('refresh');
		}
		ytPlaybackSlider.val(currentPosition);
		ytPlaybackSlider.slider('refresh');

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
			$('#youtubeSearchResult').listview('refresh');
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

	var onHeartbeatTimeout = function(){
		isConnected = false;
		updateIsConnected();
	};

	function updateIsConnected(){
		var playerConnectedText = $('#playerConnected');
		var text;
		if(isConnected){
			text = "Player Connected!";
			playerConnectedText.removeClass('disconnected');
			playerConnectedText.addClass('connected');
		}
		else{
			text = "Player Disconnected"
			playerConnectedText.removeClass('connected');
			playerConnectedText.addClass('disconnected');
		}
		playerConnectedText.html(text);
	};

});
