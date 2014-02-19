$(document).ready(function(){

	// Soundcloud init
	var scIFrame = $("#sc-widget")[0];
	var scWidget = SC.Widget(scIFrame);
	var scLoaded = false;
	var scCurrentTrackInfo = {};
	var scLastPositionSent = -1;
	scWidget.bind(SC.Widget.Events.READY, function(data){
		scLoaded = true;
		storeSoundcloudTrackInfo();
	});

	// Youtube init
	var youtubePlayer;
	var youtubeLoaded = false;
	var ytCurrentId = "";
	var ytCurrentDuration = -1;
	var ytPollIntervalId = -1;
	var initYoutube = function(){
		youtubePlayer = new YT.Player('youtubePlayer',{
			events:{
				'onReady': onYoutubePlayerReady,
				'onStateChange': onYoutubePlayerStateChange
			}
		});
	};

	var onYoutubePlayerReady = function(event){
		youtubeLoaded = true;
	};

	$.getScript("https://www.youtube.com/iframe_api", function(){
		var ytInt = setInterval(function(){
			if(typeof YT === 'object'){
				initYoutube();
				clearInterval(ytInt);
			}
		}, 500);
	});


	// Socket connection init
	var roomName = $('#roomName').val();
	var socket = io.connect();

	// Join room
	socket.on('connect', function(){
		socket.emit('joinRoom', {roomName: roomName});
		startHeartbeat();
	});

	// -- Socket handlers -- //

	// Remote play link
	socket.on('playLink', function(data){
		var type = data.type;
		var link = data.link;
		if(type && link){
			pauseAll();
			switch(type){
				case 'soundcloud':
					playSoundCloudLink(link);
					break;

				case 'youtube':
					playYoutubeVideo(link);
					break;

				default:
					break;
			}
		}
	});

	// Change volume
	socket.on('changeVolume', function(data){
		var type = data.type;
		var value = data.value;
		if(type){
			switch(type){
				case 'soundcloud':
					changeSoundcloudVolume(value);
					break;

				case 'youtube':
					changeYoutubeVolume(value);
					break;

				default:
					break;
			}
		}
	});

	socket.on('seekTo', function(data){
		var type = data.type;
		var value = data.value;
		if(type){
			switch(type){
				case 'soundcloud':
					soundcloudSeekTo(value);
					break;

				case 'youtube':
					youtubeSeekTo(value);
					break;

				default:
					break;
			}
		}
	});

	// Resume
	socket.on('resume', function(data){
		var type = data.type;
		if(type){
			switch(type){
				case 'soundcloud':
					resumeSoundcloud();
					break;
				case 'youtube':
					resumeYoutube();
					break;
				default:
					break;
			}
		}
	});

	// Global pause
	socket.on('pauseAll', function(data){
		pauseAll();
	});

	// Loads and plays a new soundcloud link
	var playSoundCloudLink = function(link){
		if(scLoaded){
			scWidget.load(link, {auto_play: true, callback: storeSoundcloudTrackInfo});
			scCurrentTrackInfo = {};
			toggleSoundcloudPlayProgressEvent(true);
		}
	};

	// Resumes soundcloud player
	var resumeSoundcloud = function(){
		if(scLoaded){
			scWidget.play();
			toggleSoundcloudPlayProgressEvent(true);
		}
	};

	// Changes soundcloud volume
	var changeSoundcloudVolume = function(value){
		if(scLoaded){
			scWidget.setVolume(value);
			console.log("New soundcloud volume: " + value);
		}
	};

	// Seeks to location in soundcloud sound
	var soundcloudSeekTo = function(value){
		if(scLoaded){
			scWidget.seekTo(value * 1000);
		}
	}

	// Pauses soundcloud player
	var pauseSoundCloud = function(){
		if(scLoaded){
			scWidget.pause();
			toggleSoundcloudPlayProgressEvent(false);
		}
	};


	// Starts/stops listening to soundcloud's PLAY_PROGRESS event
	var toggleSoundcloudPlayProgressEvent = function(toggle){
		if(scLoaded){
			if(toggle){
				scLastPositionSent = -1;
				scWidget.bind(SC.Widget.Events.PLAY_PROGRESS, onSoundcloudPlayProgress);
			}
			else{
				scWidget.unbind(SC.Widget.Events.PLAY_PROGRESS);
			}
		}
	};

	// Stores current track info on load
	var storeSoundcloudTrackInfo = function(){
		scWidget.getCurrentSound(function(songData){
				scCurrentTrackInfo = songData;
			}
		);
	};

	// On soundcloud play progress, will broadcast progress to soundNexus selectors
	var onSoundcloudPlayProgress = function(data){
		if(scCurrentTrackInfo.duration){
			var currentPosition = data.currentPosition / 1000;
			var positionDifference = Math.abs(currentPosition - scLastPositionSent);
			if(positionDifference > 1){
				var scData = {};
				scData.type = 'soundcloud';
				scData.duration = scCurrentTrackInfo.duration / 1000;
				scData.title = scCurrentTrackInfo.title;
				scData.currentPosition = currentPosition;
				socket.emit('playInfo', scData);
				scLastPositionSent = currentPosition;
			}
		}
	};

	// Youtube player state change callback stores video id and duration
	var onYoutubePlayerStateChange = function(event){
		if(event.data == YT.PlayerState.PLAYING){
			togglePollYoutubeProgress(true);
		}
		if (event.data == YT.PlayerState.PAUSED || event.data == YT.PlayerState.ENDED) {
			togglePollYoutubeProgress(false);
		}
	};

	// Loads and plays a new youtube video
	var playYoutubeVideo = function(videoId){
		if(youtubeLoaded){
			youtubePlayer.loadVideoById(videoId);
			togglePollYoutubeProgress(true);
		}
	};

	// Resumes youtube player
	var resumeYoutube = function(){
		if(youtubeLoaded){
			youtubePlayer.playVideo();
			togglePollYoutubeProgress(true);
		}
	};

	// Starts or stops a timer that gets youtube player's current progress and broadcasts status to selectors
	var togglePollYoutubeProgress = function(toggle){
		if(youtubeLoaded){
			if(toggle){
				if(ytPollIntervalId == -1){
					ytPollIntervalId = setInterval(broadcastYoutubePlayerInfo, 1000);
				}
			}
			else{
				if(ytPollIntervalId != -1){
					clearInterval(ytPollIntervalId);
					ytPollIntervalId = -1;
				}
			}
		}
	};


	// Broadcasts current youtube video progress, duration, and id
	var broadcastYoutubePlayerInfo = function(){
		if(youtubeLoaded){
			var ytData = {};
			ytData.type = 'youtube';
			ytData.duration = youtubePlayer.getDuration();
			var currentUrl = youtubePlayer.getVideoUrl();
			var idRegex = /\&v\=(\S+)$/;
			var result = idRegex.exec(currentUrl);
			if(result){
				ytCurrentId = result[1];
			}
			else {
				idRegex = /\?v\=(\S+)$/;
				result = idRegex.exec(currentUrl);
				if (result) {
					ytCurrentId = result[1];
				}
			}
			ytData.id = ytCurrentId;
			ytData.currentPosition = youtubePlayer.getCurrentTime();
			socket.emit('playInfo', ytData);
		}
	};

	// Change youtube volume
	var changeYoutubeVolume = function(value){
		if(youtubeLoaded){
			youtubePlayer.setVolume(value);
			console.log("New youtube volume: " + value);
		}
	};

	// Seeks to specified location in youtube video
	var youtubeSeekTo = function(value){
		if(youtubeLoaded){
			youtubePlayer.seekTo(value, true);
		}
	};

	// Pauses youtube player
	var pauseYoutube = function(){
		if(youtubeLoaded){
			youtubePlayer.pauseVideo();
			togglePollYoutubeProgress(false);
		}
	};

	// Pauses all players
	var pauseAll = function(){
		pauseSoundCloud();
		pauseYoutube();
	};

	var startHeartbeat = function(){
		setInterval(function(){
				socket.emit('heartbeat');
		}, 1000);
	};
});