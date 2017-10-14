Dropzone.autoDiscover = false;


var section;


$(document).ready(function(){
	
	// Grab elements, create settings, etc.
	var video = document.getElementById('video');

	if (location.protocol === 'https:') {
		// Get access to the camera!
		if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			// Not adding `{ audio: true }` since we only want video now
			navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
				video.src = window.URL.createObjectURL(stream);
				video.play();
			});
		}
	}
	else
	{
		alert("Please access page via https to take pictures directly.");
	}
	
	var myDropzone = $("div#myDropzone").dropzone({ url: "../upload.php"});
	
});