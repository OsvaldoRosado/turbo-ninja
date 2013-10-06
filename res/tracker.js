/* TurboNinja.js */
function startTurboNinja(div)
{
	
	var bluePaddle = new Image();
	bluePaddle.src = "./img/bluePaddle.png";
	
	var redPaddle = new Image();
	redPaddle.src = "./img/redPaddle.png";
	
	var ballImage = new Image();
	ballImage.src = "./img/Ball-Scaled.png";
		
	var canvasContainer = document.getElementById(div);
	var canvas = document.createElement('canvas');
	canvas.id = "gameWindow";
	canvas.width = 800;
	canvas.height = 600;
	canvas.style.border = "1px solid black";
	canvas.style.background = "url('./img/arena.png')";
<<<<<<< HEAD
=======
	canvas.style.backgroundSize = "100% 100%";
>>>>>>> game-mechanics
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
				
				if(gameManager.isLaunching && gameManager.isResponsible){
					//The ball belongs on this player's paddle
					gameManager.ball.hitX = window.phone.x;
					gameManager.ball.hitY = window.phone.y;
				}
			},
			onNotFound: function() {
				window.phone.x=-1;
				window.phone.y=-1;
			}
		}
	);
	function mapRawCanvasX(position, scale){
		return position*scale - $(canvas).width()*(scale-1)/2;
	}
	function mapRawCanvasY(position, scale){
		return position*scale - $(canvas).height()*(scale-1)/2;
	}	
		
	setInterval(function(){
		canvas.context.fillStyle = "rgb(0,0,255)";
		canvas.context.clearRect(0,0,canvas.width,canvas.height);
		
		if(window.other.x!=-1 && window.other.y!=-1)
			canvas.context.drawImage(redPaddle, mapRawCanvasX(window.other.x,.56)-18, mapRawCanvasY(window.other.y,.56)-18);
		
		var ball = gameManager.ballPosition();
		var size = 18 + 18*(ball.z+1);
		var scale = 0.56 + 0.57*(ball.z+1);
		canvas.context.drawImage(ballImage, 0,0,108,108,
								 mapRawCanvasX(ball.x,scale)-size/2, mapRawCanvasY(ball.y,scale)-size/2,
								 size, size);
		
		if(window.phone.x!=-1 && window.phone.y!=-1)
			canvas.context.drawImage(bluePaddle, mapRawCanvasX(window.phone.x,1.7)-54, mapRawCanvasY(window.phone.y,1.7)-54);
	},33);
		
}