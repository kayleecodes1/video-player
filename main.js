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
video.setAttribute( 'preload', 'metadata' );
var source = document.createElement( 'source' );
source.type = 'video/mp4';
source.src = element.getAttribute( 'video-src' );
video.appendChild( source );
element.appendChild( video );

var isPlaying = false;
var play = function () {
	isPlaying = true;
	video.play();
	element.classList.remove( 'paused' );
	element.classList.remove( 'ended' );
	element.classList.add( 'playing' );
};
var pause = function () {
	isPlaying = false;
	video.pause();
	element.classList.remove( 'playing' );
	element.classList.add( 'paused' );
};
var togglePlay = function () {
	video.paused ? play() : pause();
};

element.setAttribute( 'tabindex', '0' );
element.addEventListener( 'keydown', function ( event ) {
	if ( ( event.which || e.keyCode ) === 32 ) {
		togglePlay();
		event.preventDefault();
	}
});

var overlay = document.createElement( 'div' );
overlay.className = 'overlay';
overlay.addEventListener( 'click', togglePlay );
element.appendChild( overlay );

var info = document.createElement( 'div' );
info.className = 'info';
var title = document.createElement( 'div' );
title.className = 'title';
title.innerHTML = element.getAttribute( 'video-title' );
info.appendChild( title );
element.appendChild( info );

var controls = document.createElement( 'div' );
controls.className = 'controls';
// Show/hide elements if the mouse isn't moving over the element.
var mousemoveTimeout = null;
element.addEventListener( 'mousemove', function () {
	// Clear the current timeout and reveal the elements.
	if( mousemoveTimeout ) { clearTimeout( mousemoveTimeout ); }
	info.classList.remove( 'hidden' );
	controls.classList.remove( 'hidden' );
	// If the video is playing, set a timeout.
	if( element.classList.contains( 'playing' ) ) {
		mousemoveTimeout = setTimeout( function () {
			mousemoveTimeout = null;
			info.classList.add( 'hidden' );
			controls.classList.add( 'hidden' );
		}, 1200);
	}
});

// Play Control
var playControl = document.createElement( 'div' );
playControl.className = 'playControl';
playControl.addEventListener( 'click', togglePlay );
controls.appendChild( playControl );

// Progress
var progress = document.createElement( 'div' );
progress.className = 'progress';

var currentTime = document.createElement( 'div' );
currentTime.className = 'currentTime';

var progressBar = document.createElement( 'div' );
progressBar.className = 'progressBar';
var progressInner = document.createElement( 'div' );
progressInner.className = 'progressInner';
var buffer = document.createElement( 'div' );
buffer.className = 'buffer';
var current = document.createElement( 'div' );
current.className = 'current';
var currentHandle = document.createElement( 'div' );
currentHandle.className = 'currentHandle';
var hoverTime = document.createElement( 'div' );
hoverTime.className = 'hoverTime';
progressInner.appendChild( buffer );
progressInner.appendChild( current );
progressBar.appendChild( progressInner );
progressBar.appendChild( currentHandle );
progressBar.appendChild( hoverTime );

var updateHoverTime = function ( event ) {
	var offsetLeft = calculateOffsetLeft( progressBar );
    var location = ( event.pageX - offsetLeft ) / progressBar.offsetWidth;
    location = Math.min( 1, Math.max( 0, location ) );
	hoverTime.style.left = ( location * 100 ) + '%';
	hoverTime.innerHTML = formatSeconds( location * video.duration );
};
var hovering = false;
progressBar.addEventListener( 'mouseover', function ( event ) {
	hovering = true;
    hoverTime.style.display = 'block';
    updateHoverTime( event );
});
document.addEventListener( 'mousemove', function ( event ) {
	if( clicking || hovering ) {
		updateHoverTime( event );
	}
});
progressBar.addEventListener( 'mouseout', function ( event ) {
	if( !clicking ) {
		hoverTime.style.display = 'none';
	}
	hovering = false;
});

var clicking = false;
var wasPlaying = false;
progressBar.addEventListener( 'mousedown', function ( event ) {
	clicking = true;
	wasPlaying = isPlaying;
	if( wasPlaying ) { video.pause(); }
	var offsetLeft = calculateOffsetLeft( progressBar );
	var location = ( event.pageX - offsetLeft ) / progressBar.offsetWidth;
	video.currentTime = location * video.duration;
});
document.addEventListener( 'mousemove', function ( event ) {
	if( clicking ) {
		var offsetLeft = calculateOffsetLeft( progressBar );
		var location = ( event.pageX - offsetLeft ) / progressBar.offsetWidth;
		setVideoTime( Math.min( 1, Math.max( 0, location ) ) * video.duration );
	}
});
var setVideoTime = function ( time ) {
	currentTime.innerHTML = formatSeconds( time );
	var start = ( video.buffered.start( 0 ) || 0 ) / video.duration * 100;
	var actual = time / video.duration * 100;
	current.style.left = start + '%';
	current.style.right = ( 100 - actual ) + '%';
	currentHandle.style.right = ( 100 - actual ) + '%';
	video.currentTime = time;
};
document.addEventListener( 'mouseup', function ( event ) {
	if( clicking && wasPlaying ) {
		video.play();
	}
	clicking = false;
	if( !hovering ) {
		hoverTime.style.display = 'none';
	}
});

var duration = document.createElement( 'div' );
duration.className = 'duration';

progress.appendChild( currentTime );
progress.appendChild( progressBar );
progress.appendChild( duration );

controls.appendChild( progress );


//------------------------------------------------------------------------------
// Volume Controls
//------------------------------------------------------------------------------

var volume = document.createElement( 'div' );
volume.className = 'volume volumeHigh';
var volumeIcon = document.createElement( 'div' );
volumeIcon.className = 'volumeIcon';
var volumeSlider = document.createElement( 'div' );
volumeSlider.className = 'slider';
var volumeSliderInner = document.createElement( 'div' );
volumeSliderInner.className = 'sliderInner';
var volumeCurrent = document.createElement( 'div' );
volumeCurrent.className = 'current';
var volumeCurrentHandle = document.createElement( 'div' );
volumeCurrentHandle.className = 'currentHandle';
volumeSliderInner.appendChild( volumeCurrent );
volumeSlider.appendChild( volumeSliderInner );
volumeSlider.appendChild( volumeCurrentHandle );
volume.appendChild( volumeIcon );
volume.appendChild( volumeSlider );
controls.appendChild( volume );

var toggleMute = function () {
	if( video.muted ) {
		video.muted = false;
		setVolumeSlider( video.volume );
	} else {
		video.muted = true;
		setVolumeSlider( 0 );
	}
};
volumeIcon.addEventListener( 'click', function ( event ) {
	toggleMute();
});
var setVolume = function ( val ) {
	video.volume = val;
	setVolumeSlider( val );
};
var setVolumeSlider = function ( val ) {
	if( val === 0 ) { volume.className = 'volume volumeMute' }
	else if( val < 0.3 ) { volume.className = 'volume volumeLow'; }
	else if( val < 0.7 ) { volume.className = 'volume volumeMid'; }
	else { volume.className = 'volume volumeHigh'; }
	volumeCurrent.style.right = ( 100 - ( val * 100 ) ) + '%';
	volumeCurrentHandle.style.right = ( 100 - ( val * 100 ) ) + '%';
};
var updateVolume = function ( event ) {
	var offsetLeft = calculateOffsetLeft( volumeSlider );
	var location = ( event.pageX - offsetLeft ) / volumeSlider.offsetWidth;
	location = Math.min( 1, Math.max( 0, location ) );
	setVolume( location );
};
var volumeSliding = false;
volumeSlider.addEventListener( 'mousedown', function ( event ) {
	volumeSliding = true;
	updateVolume( event );
});
document.addEventListener( 'mousemove', function ( event ) {
	if( volumeSliding ) {
		updateVolume( event );
	};
});
document.addEventListener( 'mouseup', function ( event ) {
	volumeSliding = false;
});

//////////

var fullscreen = document.createElement( 'div' );
fullscreen.className = 'fullscreen';
var toggleFullscreen = function () {

	var hasFullscreenSupport = document.fullscreenEnabled || document.webkitFullscreenEnabled || 
    	document.mozFullScreenEnabled || document.msFullscreenEnabled;
	if( !hasFullscreenSupport ) {
    	console.log( 'No fullscreen support.' );
    	return;
    }

	if( document.fullscreenElement || document.webkitFullscreenElement ||
	    document.mozFullScreenElement || document.msFullscreenElement )
	{
		if( document.exitFullscreen ) { document.exitFullscreen(); }
		else if( document.webkitExitFullscreen ) { document.webkitExitFullscreen(); }
		else if( document.mozCancelFullScreen ) { document.mozCancelFullScreen(); }
		else if( document.msExitFullscreen ) { document.msExitFullscreen(); }
    } else {
    	if( element.requestFullscreen ) { element.requestFullscreen(); }
    	else if( element.webkitRequestFullscreen ) { element.webkitRequestFullscreen(); }
    	else if( element.mozRequestFullScreen ) { element.mozRequestFullScreen(); }
		else if( element.msRequestFullscreen ) { element.msRequestFullscreen(); }
    }
};
fullscreen.addEventListener( 'click', toggleFullscreen );
var fullscreenHandler = function () {

	var fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement ||
	    document.mozFullScreenElement || document.msFullscreenElement;
	if( fullscreenElement && fullscreenElement === element ) {
		element.classList.add('fullscreen');
	} else {
		element.classList.remove( 'fullscreen' );
	}
};
document.addEventListener( 'fullscreenchange', fullscreenHandler );
document.addEventListener( 'webkitfullscreenchange', fullscreenHandler );
document.addEventListener( 'mozfullscreenchange', fullscreenHandler );
document.addEventListener( 'MSFullscreenChange', fullscreenHandler );
controls.appendChild( fullscreen );

element.appendChild( controls );

// Video events
video.onprogress = function ( event ) {

	var start = 0;
	var end = 0;
	
	// Find the buffer range we're currently occupying.
	for( var i = 0; i < video.buffered.length; i++ ) {
		var startTime = video.buffered.start( i );
		var endTime = video.buffered.end( i );
		if( startTime <= video.currentTime && endTime >= video.currentTime ) {
			start = startTime / video.duration * 100;
			end = endTime / video.duration * 100;
			break;
		}
	}
	
	buffer.style.left = start + '%';
	buffer.style.right = ( 100 - end ) + '%';
};
// Is waiting for buffer.
video.onwaiting = function ( event ) {
	overlay.className = 'overlay loading';
};
// Can play after buffering.
video.oncanplay = function ( event ) {
	overlay.className = 'overlay';
};
// Starts playing after buffering.
video.onplaying = function ( event ) {
	overlay.className = 'overlay';
};
video.ontimeupdate = function ( event ) {
	currentTime.innerHTML = formatSeconds( video.currentTime );
	var start = ( video.buffered.start( 0 ) || 0 ) / video.duration * 100;
	var actual = video.currentTime / video.duration * 100;
	current.style.left = start + '%';
	current.style.right = ( 100 - actual ) + '%';
	currentHandle.style.right = ( 100 - actual ) + '%';
	if( video.currentTime === video.duration ) {
		pause();
		element.classList.add( 'ended' );
	}
};
video.onloadedmetadata = function ( event ) {
	// Resize video.
	//var widthProportion =  element.offsetWidth / video.videoWidth;
	//var heightProportion = element.offsetHeight / video.videoHeight;
	//video.width = element.offsetWidth;
	//video.height = element.offsetHeight;
	/*if( widthProportion < heightProportion ) {
		video.width = element.offsetWidth;
		video.height = video.videoHeight * widthProportion;
		video.style.left = '0';
		video.style.top = ( ( element.offsetHeight - video.height ) / 2 ) + 'px';
	} else {
		video.width = video.videoWidth * heightProportion;
		video.height = element.offsetHeight;
		video.style.left = ( ( element.offsetWidth - video.width ) / 2 ) + 'px';
		video.style.top = '0';
	}*/
	// Set up progress bar.
	currentTime.innerHTML = formatSeconds( video.currentTime );
	duration.innerHTML = formatSeconds( video.duration );
	// Volume.
	setVolumeSlider( video.volume );
};
video.onloadeddata = function ( event ) {
	//TODO
};

// Utility
var calculateOffsetLeft = function ( element ) {
	var offsetLeft = 0;
	var node = element;
	do {
        offsetLeft += node.offsetLeft;
    } while ( node = node.offsetParent );
    return offsetLeft;
};
var calculateOffsetTop = function ( element ) {
	var offsetTop = 0;
	var node = element;
	do {
        offsetTop += node.offsetTop;
    } while ( node = node.offsetParent );
    return offsetTop;
};
function formatSeconds( sec ) {
	var minutes = Math.floor( sec / 60 );
	var seconds = Math.floor( sec % 60 );
	return minutes + ':' + ( seconds < 10 ? '0' + seconds : seconds );
};