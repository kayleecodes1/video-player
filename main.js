var element = document.getElementById( 'player' );
element.className = 'videoPlayer';

/*
<video controls> 
  <source src=http://techslides.com/demos/sample-videos/small.webm type=video/webm> 
  <source src=http://techslides.com/demos/sample-videos/small.ogv type=video/ogg> 
  <source src=http://techslides.com/demos/sample-videos/small.mp4 type=video/mp4>
  <source src=http://techslides.com/demos/sample-videos/small.3gp type=video/3gp>
</video>
*/

var video = document.createElement( 'video' );
var source = document.createElement( 'source' );
source.type = 'video/mp4';
source.src = element.getAttribute( 'src' );
video.appendChild( source );
element.appendChild( video );

var controls = document.createElement( 'div' );
controls.className = 'controls';

// Play Control
var playControl = document.createElement( 'div' );
playControl.className = 'play';
var isPlaying = false;
var play = function () {
	isPlaying = true;
	video.play();
	playControl.className = 'pause';
};
var pause = function () {
	isPlaying = false;
	video.pause();
	playControl.className = 'play';
};
playControl.addEventListener( 'click', function ( event ) {
	video.paused ? play() : pause();
});
controls.appendChild( playControl );

// Progress
var progress = document.createElement( 'div' );
progress.className = 'progress';

var currentTime = document.createElement( 'div' );
currentTime.className = 'currentTime';

var progressBar = document.createElement( 'div' );
progressBar.className = 'progressBar';
var buffer = document.createElement( 'div' );
buffer.className = 'buffer';
var current = document.createElement( 'div' );
current.className = 'current';
progressBar.appendChild( buffer );
progressBar.appendChild( current );

var clicking = false;
var wasPlaying = false;
progressBar.addEventListener( 'mousedown', function ( event ) {
	clicking = true;
	wasPlaying = isPlaying;
	if( wasPlaying ) { video.pause(); }
	var newProgress = event.offsetX / progressBar.offsetWidth;
	video.currentTime = newProgress * video.duration;
});
document.addEventListener( 'mousemove', function ( event ) {
	if( clicking ) {
		var offsetLeft = 0;
		var node = progressBar;
        do {
            offsetLeft += node.offsetLeft;
        } while ( node = node.offsetParent );
		var location = ( event.clientX - offsetLeft ) / progressBar.offsetWidth;
		setVideoTime( Math.min( 1, Math.max( 0, location ) ) * video.duration );
	};
});
var setVideoTime = function ( time ) {
	console.log( time );
	currentTime.innerHTML = formatSeconds( time );
	var start = ( video.buffered.start( 0 ) || 0 ) / video.duration * 100;
	var actual = time / video.duration * 100;
	current.style.left = start + '%';
	current.style.right = ( 100 - actual ) + '%';
	video.currentTime = time;
};
document.addEventListener( 'mouseup', function ( event ) {
	if( clicking ) {
		clicking = false;
		if( wasPlaying ) {
			video.play();
		}
	}
});

var duration = document.createElement( 'div' );
duration.className = 'duration';

progress.appendChild( currentTime );
progress.appendChild( progressBar );
progress.appendChild( duration );

controls.appendChild( progress );

var volume = document.createElement( 'div' );
volume.className = 'volume volumeHigh';
var volumeSlider = document.createElement( 'div' );
volumeSlider.className = 'slider';
var volumeCurrent = document.createElement( 'div' );
volumeCurrent.className = 'current';
volumeSlider.appendChild( volumeCurrent );
volume.appendChild( volumeSlider );
controls.appendChild( volume );
var setVolume = function ( val ) {
	if( val < 0.35 ) { volume.className = 'volume volumeLow'; }
	else if( val >= 0.35 && val <= 0.65 ) { volume.className = 'volume volumeMid'; }
	else { volume.className = 'volume volumeHigh'; }
	volumeCurrent.style.top = ( 100 - ( val * 100 ) ) + '%';
	video.volume = val;
};
volume.addEventListener( 'mouseover', function ( event ) {
	volumeSlider.style.display = 'block';
});
volume.addEventListener( 'mouseout', function ( event ) {
	volumeSliding = false;
	volumeSlider.style.display = 'none';
});
var volumeSliding = false;
volumeSlider.addEventListener( 'mousedown', function ( event ) {
	volumeSliding = true;
	var newVolume = ( volumeSlider.offsetHeight - event.offsetY ) / volumeSlider.offsetHeight;
	setVolume( newVolume );
});
document.addEventListener( 'mousemove', function ( event ) {
	if( volumeSliding ) {
		var offsetTop = 0;
		var node = volumeSlider;
        do {
            offsetTop += node.offsetTop;
        } while ( node = node.offsetParent );
		var location = ( volumeSlider.offsetHeight - ( event.clientY - offsetTop ) ) / volumeSlider.offsetHeight;
		setVolume( Math.min ( 1, Math.max( 0, location ) ) );
	};
});
document.addEventListener( 'mouseup', function ( event ) {
	volumeSliding = false;
});

element.appendChild( controls );

// Video events
video.onprogress = function ( event ) {
	var start = ( video.buffered.start( 0 ) || 0 ) / video.duration * 100;
	var end = ( video.buffered.end( 0 ) || 0 ) / video.duration * 100;
	buffer.style.left = start + '%';
	buffer.style.right = ( 100 - end ) + '%';
};
video.onwaiting = function ( event ) {
	//TODO: needs to buffer
	console.log( 'waiting', arguments );
};
video.oncanplay = function ( event ) {
	//TODO: can start playing the video
};
video.onplaying = function ( event ) {
	//TODO: buffered and continuing
	console.log( 'playing', arguments );
};
video.ontimeupdate = function ( event ) {
	currentTime.innerHTML = formatSeconds( video.currentTime );
	var start = ( video.buffered.start( 0 ) || 0 ) / video.duration * 100;
	var actual = video.currentTime / video.duration * 100;
	current.style.left = start + '%';
	current.style.right = ( 100 - actual ) + '%';
	if( video.currentTime === video.duration ) { pause(); }
};
video.onloadedmetadata = function ( event ) {
	currentTime.innerHTML = formatSeconds( video.currentTime );
	duration.innerHTML = formatSeconds( video.duration );
};
video.onloadeddata = function ( event ) {
	element.style.width = video.videoWidth  + 'px';
	element.style.height = video.videoHeight + 'px';
	setVolume( video.volume );
};

// Utility
function formatSeconds( sec ) {
	var minutes = Math.floor( sec / 60 );
	var seconds = Math.floor( sec % 60 );
	return minutes + ':' + ( seconds < 10 ? '0' + seconds : seconds );
};