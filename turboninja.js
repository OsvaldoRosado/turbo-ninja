/* TurboNinja.js */

function startTurboNinja(div)
{
	window.addEventListener("load",function(){
		var webcam = new tracking.VideoCamera().hide().render().renderVideoCanvas(div);
		
		var tracker = webcam.track(
			{
				type: 'color',
				color: 'magenta',
				onFound: function(track) {
					var pixels = track.pixels;
					
					for(var i=0; i<pixels.length; i+=2)
					{
						webcam.canvas.context.fillStyle = "rgb(255,0,255)";
                    	webcam.canvas.context.fillRect(pixels[i], pixels[i+1], 2, 2);
					}
					
					webcam.canvas.context.fillStyle = "rgb(0,0,0)";
                	webcam.canvas.context.fillRect(track.x, track.y, 5, 5);
				},
				onNotFound: function() {
				}
			}
		);
		
	},false);
}