var video;
var canvas;
var stat;
var ctx;
var classifier1;
var classifier2;
var gui,options,canvasWidth,canvasHeight;
var img_u8,work_canvas,work_ctx,ii_sum,ii_sqsum,ii_tilted,edg,ii_canny;
var lastRectctx;
var currentFacectx;
var max_work_size;
var demo_opt;
var readyListener;
var attempts;
var findVideoSize;
var onDimensionsReady;
var previousAnimation=undefined;

var requestingMedia=false;

//Multiply width and height of the image by this to get the width and height of the
//image used for processing.  Ex. 0.5 -> Only use half the resolution for detection.
//Used in VideoStart.js demo_app
var work_canvas_resolution;


var constraints;

var videoSelect = document.querySelector('select#videoSource');

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var doInitialize = false;
function startVideo(runInitialization) {
stat = new profiler();
doInitialize = runInitialization;
console.log(gui);
if(gui==undefined)
{            
options = new demo_opt();

gui = new dat.GUI();
                gui.add(options, 'min_scale', 0.01, 1.6).step(0.01);
                gui.add(options, 'scale_factor', 1.000001, 1.5).step(0.01);
                gui.add(options, 'equalize_histogram');
                gui.add(options, 'use_canny');
                gui.add(options, 'edges_density', 0.01, 1.).step(0.005);
gui.close();
document.getElementsByClassName("dg")[0].style.visibility = "hidden";
}
                stat.add("haar detector");

function gotSources(sourceInfos) {
  for (var i = 0; i !== sourceInfos.length; ++i) {
    var sourceInfo = sourceInfos[i];
    var option = document.createElement('option');
    option.value = sourceInfo.id;
if (sourceInfo.kind === 'video') {
      option.text = sourceInfo.label || 'camera ' + (videoSelect.length + 1);
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source: ', sourceInfo);
    }
  }
}

if (typeof MediaStreamTrack === 'undefined'){
  alert('This browser does not support MediaStreamTrack.\n\nTry Chrome Canary.');
} else {
  MediaStreamTrack.getSources(gotSources);
}

function successCallback(stream) {
  window.stream = stream; // make stream available to console
  videoElement.src = window.URL.createObjectURL(stream);
  videoElement.play();
}

function errorCallback(error){
  console.log('navigator.getUserMedia error: ', error);
}

function start(){
            video = document.getElementById('webcam');
            canvas = document.getElementById('canvas');
	    display = document.getElementById('display');
	    currentFace = document.getElementById('showFace');
  if (!!window.stream) {
    video.src = null;
    window.stream.stop();
  }
  var videoSource = videoSelect.value;
//alert(videoSource);
  constraints = {
    audio: false,
    video: {
      optional: [{sourceId: videoSource}]
    }
  };
if(doInitialize)
{
  initializeVideo();
}
else
{
doInitialize=true;
}
  //navigator.getUserMedia(constraints, successCallback, errorCallback);
}


videoSelect.onchange = start;

start();
}

function initializeVideo()
{
	video.src=null;
            try {
                attempts = 0;
                readyListener = function(event) {
                    findVideoSize();
                };
                findVideoSize = function() {
                    if(video.videoWidth > 0 && video.videoHeight > 0) {
                        video.removeEventListener('loadeddata', readyListener);
                        onDimensionsReady(video.videoWidth, video.videoHeight);
                    } else {
                        if(attempts < 10) {
                            attempts++;
                            setTimeout(findVideoSize, 200);
                        } else {
                            onDimensionsReady(640, 480);
                        }
                    }
                };
                onDimensionsReady = function(width, height) {
                    demo_app(width, height);
		    if(previousAnimation!=undefined)
		    {
			compatibility.cancelAnimationFrame(previousAnimation);
			previousAnimation=undefined;
		    }
                    previousAnimation=compatibility.requestAnimationFrame(tick);
                };

                video.addEventListener('loadeddata', readyListener);
		
		if(requestingMedia==false)
		{
		requestingMedia=true;
                compatibility.getUserMedia(constraints, function(stream) {
			requestingMedia=false;
			if(startUpPhaseID==0)
			{
			startUpPhaseID++;
			}
                    	try {
				window.stream=stream;
                	        video.src = compatibility.URL.createObjectURL(stream);
                	    } catch (error) {
				alert("failed");
                	        video.src = stream;
                	    }
                	    setTimeout(function() {
                	            video.play();
                	    }, 500);
                }, function (error) {
		    alert(error.name);
		    requestingMedia=false;
                    $('#canvas').hide();
                    $('#log').hide();
                    $('#no_rtc').html('<h4>WebRTC not available.</h4>');
                    $('#no_rtc').show();
                });
		}//end if requestingMedia

            } catch (error) {
                $('#canvas').hide();
                $('#log').hide();
                $('#no_rtc').html('<h4>Something goes wrong...</h4>');
                $('#no_rtc').show();
            }

            
	    classifier1 = jsfeat.haar.frontalface;
            classifier2 = jsfeat.haar.profileface;

		//for bff 500 works well on the webcam.
            max_work_size = 100;//100;// 320;//160;
	    work_canvas_resolution = 1;



            function demo_app(videoWidth, videoHeight) {
jsfeat.bbf.prepare_cascade(jsfeat.bbf.face_cascade);
                canvasWidth  = canvas.width;
                canvasHeight = canvas.height;
                ctx = canvas.getContext('2d');

                ctx.fillStyle = "rgb(0,255,0)";
                ctx.strokeStyle = "rgb(0,255,0)";

                var scale = Math.min(max_work_size/videoWidth, max_work_size/videoHeight);
                var w = (videoWidth*scale)|0;
                var h = (videoHeight*scale)|0;
		//w = w*work_canvas_resolution;
		//h = h*work_canvas_resolution;

                img_u8 = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);
                edg = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);
                work_canvas = document.createElement('canvas');

                work_canvas.width = w;
                work_canvas.height = h;
                work_ctx = work_canvas.getContext('2d');

		lastRectctx=display.getContext('2d');
		currentFacectx=currentFace.getContext('2d');

                ii_sum = new Int32Array((w+1)*(h+1));
                ii_sqsum = new Int32Array((w+1)*(h+1));
                ii_tilted = new Int32Array((w+1)*(h+1));
                ii_canny = new Int32Array((w+1)*(h+1));
            }

            function tick() {
		previousAnimation=compatibility.requestAnimationFrame(tick);
                processFrame();
            }
}

            demo_opt = function(){
                this.min_scale = 1;
                this.scale_factor = 1.5;
                this.use_canny = false;
                this.edges_density = 0.13;
                this.equalize_histogram = true;
            }