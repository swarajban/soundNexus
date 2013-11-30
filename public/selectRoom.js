$(document).ready(function(){
	$('#goToSelector').click(function(){
		var roomName = 	$('#roomSelector').val();
		var currentLocation = window.location.href;
		var newPath = 'selector/' + roomName;
		var newLocation = currentLocation.replace('selectRoom', newPath);
		window.location.href = newLocation;
	});

	$('#goToPlayer').click(function(){
		var roomName = 	$('#roomSelector').val();
		var currentLocation = window.location.href;
		var newPath = 'player/' + roomName;
		var newLocation = currentLocation.replace('selectRoom', newPath);
		window.location.href = newLocation;
	})
});