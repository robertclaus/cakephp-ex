function initCompass() {
        var compass = document.getElementById('compass');
        var liveDemoCompass = document.getElementById('liveDemoCompass');
        var compassLink = document.getElementById('compassLink');
        liveDemoCompass.style.display = 'block';
        compassLink.innerHTML = '<strong>Orientation:</strong> No data available<br />';

        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', function (event) {
                var alpha;
                var showingNoData = true;
                if (event.webkitCompassHeading) {
                    alpha = event.webkitCompassHeading;
                    compass.style.WebkitTransform = 'rotate(-' + alpha + 'deg)';
direction=alpha;
                }

                    //non iOS
                else {
                    alpha = event.alpha;
                    webkitAlpha = alpha;
                    if (!window.chrome) {
                        //Assume Android stock
                        webkitAlpha = alpha - 270;

                    }
			var lastDirection=direction;
			direction=webkitAlpha;
			if(Math.abs(lastDirection-direction)>160)
			{
				if(direction>180)
				{
				direction=direction-180;
				}
				else {
				direction=direction+180;
				}
			}
                }

                if (alpha == null) {
                    compassLink.innerHTML = '<strong>Orientation:</strong> No data available<br />';
                    showingNoData = true;
                }
                else if (showingNoData) {
                    compassLink.innerHTML =  '<strong>'+Math.floor(direction)+'</strong>';
                    showingNoData = false;
                }
		
                compass.style.Transform = 'rotate(' + alpha + 'deg)';
                compass.style.WebkitTransform = 'rotate(' + webkitAlpha + 'deg)';
                compass.style.MozTransform = 'rotate(-' + alpha + 'deg)';
            }, false);
        }
    }