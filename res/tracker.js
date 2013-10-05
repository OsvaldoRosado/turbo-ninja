/* TurboNinja.js */
function startTurboNinja(div)
{
	var bluePaddle = new Image();
	bluePaddle.src = "./img/bluePaddle.png";
		
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
	var tracker = webcam.track(
		{
			type: 'color',
			color: 'magenta',
			onFound: function(track) {
				var pixels = track.pixels;      	
				window.phone.x = canvas.width-(canvas.width/webcam.canvas.context.canvas.clientWidth)*track.x;
				window.phone.y = (canvas.height/webcam.canvas.context.canvas.clientHeight)*track.y;
			},
			onNotFound: function() {
				window.phone.x=-1;
				window.phone.y=-1;
			}
		}
	);
	setInterval(function(){
		canvas.context.fillStyle = "rgb(0,0,255)";
		canvas.context.clearRect(0,0,canvas.width,canvas.height);
		if(window.phone.x!=-1 && window.phone.y!=-1)
			canvas.context.drawImage(bluePaddle, (window.phone.x*1.7)-54, (window.phone.y*1.7)-54);
		if(window.other.x!=-1 && window.other.y!=-1)
			canvas.context.drawImage(bluePaddle, (window.other.x*1.7)-54, (window.other.y*1.7)-54);
	},33);
		
}