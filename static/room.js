// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('wrapper', {
    height: '100%',
    width: '100%',
    playerVars: {
       autoplay: 1,
       controls: 0,
       showinfo: 0,
       modestbranding: 1,
       wmode: 'transparent'
    },
    videoId: 'M7lc1UVf-VE',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}
// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
  console.log("onPlayerStateChange");
/*
  if (event.data == YT.PlayerState.PLAYING && !done) {
    setTimeout(stopVideo, 6000);
    done = true;
  }
*/
}
function stopVideo() {
  player.stopVideo();
}

if (!Date.now) {
	Date.now = function() { return new Date().getTime(); };
}

var video_id = "";
var t = 0;

window.setInterval(function () {
	console.log("sync interval");
	var current_video_time = player.getCurrentTime();
	var current_time = Date.now() / 1000;
	var delta_time = current_time - t;
	console.log("player is at: " + current_video_time +
	            "\n should be at: " + delta_time);
	console.log("available playback: "+ player.getAvailablePlaybackRates());
	if (delta_time - current_video_time > 0.4) {
		console.log("too far behind");
		player.seekTo(delta_time + 1, true);
	} else if (current_video_time - delta_time > 0.4) {
		console.log("too far ahead");
		player.seekTo(delta_time , true);
	}
	
}, 10000);

function MainSocketLoop() {

  if ("WebSocket" in window) {
     console.log("WebSocket is supported by your Browser!");

     // Let us open a web socket
     var ws = new WebSocket("ws://localhost:4000/socket/kimo");
     ws.onopen = function() {
        // Web Socket is connected, send data using send()
        // ws.send("Message to send");
        console.log("Message is sent...");
     };
     ws.onmessage = function (message) { 
        var payload = message.data;
        console.log("Message is received...");
		console.log(payload);
		object = JSON.parse(payload)
		
		var current_time = Date.now() / 1000;
		console.log("Current time: " + current_time);
		var start_time = object['start'];
		t = start_time;
		video_id = object['id'];
		var delta_time = current_time - start_time;
		console.log("Delta time: " + delta_time);
		//player.seekTo(delta_time, true);
		player.loadVideoById({'videoId': object['id'], 'startSeconds': delta_time});
     };

     ws.onclose = function() { 
        // websocket is closed.
        console.log("connection closed"); 
     };

	 return ws
  } else {
     // The browser doesn't support WebSocket
     alert("WebSocket NOT supported by your Browser!");
  }
}

$(window).load(function () {
	ws = MainSocketLoop();
	var searchBox = $('#search')
	searchBox.keyup(function(){
		$.ajax({
		  url: "https://gdata.youtube.com/feeds/api/videos?alt=json&q=" + encodeURI(searchBox.val())
		}).done(function ( data ) {
		  var firstYouTubeId = data['feed']['entry'][0]['id']['$t'].substring(42);
		  var firstYouTubeTitle = data['feed']['entry'][0]['title']['$t'];
		  console.log(firstYouTubeTitle);
		  if( console && console.log ) {
		    console.log("Sample of data:", firstYouTubeId);
		  }
		  ws.send(JSON.stringify({'id': firstYouTubeId}));
		  $('#now_playing').text(firstYouTubeTitle);
		});
		console.log(searchBox.val());
	});
	
});