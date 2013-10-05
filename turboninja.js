/* TurboNinja.js */
function startTurboNinja(div)
{
	var bluePaddle = new Image();
	bluePaddle.src = "./img/bluePaddle.png";
	
	window.addEventListener("load",function(){		
		var canvasContainer = document.getElementById(div);
		var canvas = document.createElement('canvas');
		canvas.id = "gameWindow";
		canvas.width = 800;
		canvas.height = 600;
		canvas.style.border = "1px solid black";
		canvas.style.background = "url('./img/arena.gif')";
		canvas.context = canvas.getContext("2d");
		canvasContainer.appendChild(canvas);
		
		var webcam = new tracking.VideoCamera().hide().render().renderVideoCanvas();
		webcam.canvas.context.canvas.style.position = "absolute";
		webcam.canvas.context.canvas.style.top = 0;
		webcam.canvas.context.canvas.style.visibility = "hidden";
		var drawCoords = {x:null,y:null};
		var tracker = webcam.track(
			{
				type: 'color',
				color: 'magenta',
				onFound: function(track) {
					var pixels = track.pixels;                	
					drawCoords.x = canvas.width-(canvas.width/webcam.canvas.context.canvas.clientWidth)*track.x;
					drawCoords.y = (canvas.height/webcam.canvas.context.canvas.clientHeight)*track.y;
				},
				onNotFound: function() {
					drawCoords.x=null;
					drawCoords.y=null;
				}
			}
		);
		setInterval(function(){
			canvas.context.fillStyle = "rgb(0,0,255)";
			canvas.context.clearRect(0,0,canvas.width,canvas.height);
			if(drawCoords.x!=null && drawCoords.y!=null)
				canvas.context.drawImage(bluePaddle, (drawCoords.x*1.7)-54, (drawCoords.y*1.7)-54);
		},33);
		
	},false);
}