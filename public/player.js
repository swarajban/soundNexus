$(document).ready(function(){
	var scIFrame = $('#sc-widget');
	var scWidget = SC.Widget(scIFrame);

	scWidget.bind(SC.Widget.Events.READY, function(){
		alert("bound to this biatch");
	});

});

