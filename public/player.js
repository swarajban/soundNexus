$(document).ready(function(){

	// Soundcloud init
	var scIFrame = $("#sc-widget")[0];
	var scWidget = SC.Widget(scIFrame);
	var scLoaded = false;
	var scCurrentTrackInfo = {};
	scWidget.bind(SC.Widget.Events.READY, function(data){
		scLoaded = true;
		storeSoundcloudTrackInfo();
	});

	// Youtube init
	var youtubePlayer;
	var youtubeLoaded = false;
	var initYoutube = function(){
		youtubePlayer = new YT.Player('youtubePlayer',{
			events:{
				'onReady': onYoutubePlayerReady
			}
		});
	};

	var onYoutubePlayerReady = function(event){
		youtubeLoaded = true;
	};

	$.getScript("https://www.youtube.com/iframe_api", function(){
		ytInt = setInterval(function(){
			if(typeof YT === 'object'){
				initYoutube();
				clearInterval(ytInt);
			}
		}, 500);
	});


	// Socket connection init
	var socket = io.connect();


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
		if(data.loadedProgress == 1 && scCurrentTrackInfo.hasOwnProperty("duration")){
			var scData = {};
			scData.duration = scCurrentTrackInfo.duration / 1000;
			scData.title = scCurrentTrackInfo.title;
			scData.currentPosition = data.currentPosition / 1000;
			// change to emit < once per second
			socket.emit('playInfo', scData);
		}
	};

	// Loads and plays a new youtube video
	var playYoutubeVideo = function(videoId){
		if(youtubeLoaded){
			youtubePlayer.loadVideoById(videoId);
		}
	};

	// Resumes youtube player
	var resumeYoutube = function(){
		if(youtubeLoaded){
			youtubePlayer.playVideo();
		}
	};

	// Change youtube volume
	var changeYoutubeVolume = function(value){
		if(youtubeLoaded){
			youtubePlayer.setVolume(value);
			console.log("New youtube volume: " + value);
		}
	};

	// Pauses youtube player
	var pauseYoutube = function(){
		if(youtubeLoaded){
			youtubePlayer.pauseVideo();
		}
	};

	// Pauses all players
	var pauseAll = function(){
		pauseSoundCloud();
		pauseYoutube();
	};
});