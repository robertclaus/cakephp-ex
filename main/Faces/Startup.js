var direction;
var video;
//var sonicSocket;
//var sonicServer;
//var sonicCoder;

$(window).load(function() {

//Initiate Compass - Compass.js
direction=0;
initCompass();

//Resize Canvas to screen size.
var canvas = document.getElementById("canvas");
video = document.getElementById("webcam");
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;
video.width = window.innerWidth;

/*
//Lock orientation (should make orientation listener below obsolete
screen.lockOrientationUniversal = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation;
if (screen!=null && screen.lockOrientationUniversal("landscape-primary")) {
  alert("should be locked");
} else {
  alert("Failed to lock orientation");
}
*/

//Resize on screensize or orientation change and reset video.
window.addEventListener('resize', resize_canvas, false);
//window.addEventListener('orientationchange', resize_canvas);
        function resize_canvas(){
            var canvas = document.getElementById("canvas");
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
	    video.width = window.innerWidth;
	    initializeVideo(); //From VideoStart.js
        }

//Start Video - VideoStart.js
//Runs function - processFrame() every tick.
//processFrame() is currently defined in FaceDetect.js
startVideo(false);


//Start sonic network
/*
createSonicNetwork();

function createSonicNetwork() {
  // Stop the sonic server if it is listening.
  if (sonicServer) {
    sonicServer.stop();
  }
    var coder = new SonicCoder({
      freqMin: 500,
      freqMax: 2000
    });
    sonicServer = new SonicServer({coder: coder, alphabet:'0123456789', charDuration:.2, startCharacter:'*',endCharacter:'%', debug:false});
    sonicSocket = new SonicSocket({coder: coder, alphabet:'0123456789', charDuration:.2, startCharacter:'*',endCharacter:'%',});
    //sonicServer = new SonicServer({alphabet:'0123456789', debug:false});
    //sonicSocket = new SonicSocket({alphabet:'0123456789'});

  sonicServer.start();
  sonicServer.on('message', onIncomingSonicMessage);
}

function onIncomingSonicMessage(message) {
  console.log('message: ' + message);
  document.getElementById("room").innerHTML=message;
}

document.querySelector('#broadcast').addEventListener('click', function(e) {
  var room = document.querySelector('#room');
  console.log("sending: "+room.innerHTML);
  sonicSocket.send("1");
});
*/

navigator.vibrate = navigator.vibrate ||
                  navigator.webkitVibrate ||
                  navigator.mozVibrate || 
                  navigator.msVibrate;

document.querySelector('#screen').addEventListener('click', function(e) {
navigator.vibrate([500]);
toggleFullScreen();
});

startGame();



            $(window).unload(function() {
                video.pause();
                video.src=null;
            });
});
//End of On Load


function toggleFullScreen() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
    document.querySelector('#screen').style.visibility = "hidden";
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}




//Not sure what this does, probably not relevant to my site so commenting out.
/*
      var _gaq = _gaq || [];
          _gaq.push(['_setAccount', 'UA-36419199-1']);
          _gaq.push(['_trackPageview']);
          (function() {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
          })();
*/