$(document).ready(function(){
	var scIFrame = $("#sc-widget")[0];
	var scWidget = SC.Widget(scIFrame);
	var scLoaded = false;

	var socket = io.connect();
	scWidget.bind(SC.Widget.Events.READY, function(){
		scLoaded = true;
	});

	socket.on('playLink', function(data){
		var type = data.type;
		var link = data.link;
		if(type && link){
			pauseAll();
			switch(type){
				case 'soundcloud':
					playSoundCloudLink(link);
					break;
				default:
					break;
			}
		}	
	});

	socket.on('resume', function(data){
		var type = data.type;
		if(type){
			switch(type){
				case 'soundcloud':
					resumeSoundcloud();
					break;
				default:
					break;
			}
		}
	});

	socket.on('pauseAll', function(data){
		pauseAll();
	});

	var playSoundCloudLink = function(link){
		if(scLoaded){
			scWidget.load(link, {auto_play: true});	
		}
	}

	var resumeSoundcloud = function(){
		if(scLoaded){
			scWidget.play();
		}
	}

	var pauseAll = function(){
		if(scLoaded){
			scWidget.pause();	
		}
	};
});

