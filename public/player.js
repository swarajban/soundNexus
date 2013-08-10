$(document).ready(function(){

	// Soundcloud init
	var scIFrame = $("#sc-widget")[0];
	var scWidget = SC.Widget(scIFrame);
	var scLoaded = false;
	scWidget.bind(SC.Widget.Events.READY, function(){
		scLoaded = true;
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
		var amount = data.amount;
		if(type){
			switch(type){
				case 'soundcloud':
					changeSoundcloudVolume(amount);
					break;

				case 'youtube':
					changeYoutubeVolume(amount);
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
			scWidget.load(link, {auto_play: true});	
		}
	};

	// Resumes soundcloud player
	var resumeSoundcloud = function(){
		if(scLoaded){
			scWidget.play();
		}
	};

	// Changes soundcloud volume
	var changeSoundcloudVolume = function(amount){
		if(scLoaded){
			scWidget.getVolume(function(volume){
				var newVolume = volume + amount;
				scWidget.setVolume(newVolume);
				console.log("New soundcloud volume: " + newVolume);
			});
		}
	};

	// Pauses soundcloud player
	var pauseSoundCloud = function(){
		if(scLoaded){
			scWidget.pause();
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
	var changeYoutubeVolume = function(amount){
		if(youtubeLoaded){
			var currentVolume = youtubePlayer.getVolume();
			var newVolume = currentVolume + amount;
			youtubePlayer.setVolume(newVolume);
			console.log("New youtube volume: " + newVolume);
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