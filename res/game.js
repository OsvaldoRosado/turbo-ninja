$(document).ready(function(){
	window.phone = {x:-1,y:-1};
	window.other = {x:-1,y:-1};
});

// Game Manager
var gameManager = {

	// Reference to the current firebase games
	url: "https://turbo-ninja.firebaseIO.com/games",
	games: new Firebase("https://turbo-ninja.firebaseIO.com/games"),
	game: undefined,
	
	// State management
	isHost: false,
	isLaunching: false,
	responsible: 0,
	isResponsible: false,
	lastHitTime: 0,
	hitCount: 0,
	ball: {hitX: 0, hitY: 0, hitPlayer: 0, dx: 0, dy: 0, dz: 0},
	
	// Constants
	startSpeed: {x: 0, y: 0, z: 1},
	hitThreshold: 40,
	speedIncreaseFactor: 1.5;
	
	createGame: function(){
		// Create game
		var gameID = parseInt(Math.random()*99999);
		var gameValue = {};
		gameValue[gameID] = {started: false};
		gameManager.games.set(gameValue);
		console.log("Creating Game: "+gameID);
		
		// Listen for the game join
		gameManager.games.once('child_changed', function(snapshot) {
			console.log("Game joined");
			gameManager.setupGame(gameID);
			gameManager.startGaming(gameID);
		});
		
		// Set the state
		gameManager.isHost = true;
		gameManager.isResponsible = true;
		
		
		return gameID;
	},
	
	joinGame: function(gameID){
		gameManager.game = new Firebase(gameManager.url + "/" + gameID);
		gameManager.game.once("value",function(gameObject){
			var gameValue = gameObject.val();
			if(gameValue == undefined || !("started" in gameValue))return alert("Game does not exist");
			if(gameValue.started !== false)return alert("Game has already started");
			gameManager.game.update({started: true});
			setTimeout(function(){
				gameManager.startGaming(gameID);
			},500);
		});
	},
	
	// Setup the firebase data
	setupGame: function(gameID){
		gameManager.game = new Firebase(gameManager.url + "/" + gameID);
		gameManager.game.update({
			hostCursor: {x: 0, y:0},
			guestCursor: {x:0, y:0},
			ball: {hitX: 0, hitY: 0, hitPlayer: 0, dx: 0, dy: 0, dz: 0},
			responsible: 0,
			isLaunching: true,
			hitCount: 0,
			score: [0,0]
		});
	},
	
	// Central Game Loop
	startGaming: function(gameID){
		
		// Start game
		$("#showID").hide(); $("#startSelect").hide(); $("#game").show();
		startTurboNinja("gameDiv");
		
		// Configure state
		gameManager.isLaunching = true;
		gameManager.lastHitTime = new Date().getTime();
		
		// Deal with data
		gameManager.game.on('child_changed', function(snapshot) {
			
			// Update cursors
			if(snapshot.name().indexOf("Cursor")!==-1)return gameManager.updateCursors(snapshot);
			
			if(snapshot.name() == "ball"){gameManager.lastHitTime = new Date().getTime();gameManager.ball = snapshot.val();}
			if(snapshot.name() == "isLaunching")gameManager.isLaunching = snapshot.val();
			if(snapshot.name() == "responsible"){
				gameManager.responsible = snapshot.val();
				gameManager.isResponsible = (gameManager.isHost)?(gameManager.responsible==0):(gameManager.responsible==1);}
			if(snapshot.name() == "hitCount")gameManager.hitCount = snapshot.val();
			
		});
		
		// Temporary thing to launch the ball
		$("body").on("click",function(){
			if(gameManager.isLaunching && gameManager.isResponsible){
				gameManager.lastHitTime = new Date().getTime();
				gameManager.isLaunching = false;
				
				gameManager.ball.dx = gameManager.startSpeed.x;
				gameManager.ball.dy = gameManager.startSpeed.y;
				gameManager.ball.dz = gameManager.startSpeed.z;
				gameManager.ball.hitPlayer = gameManager.responsible;
				
				gameManager.responsible = (gameManager.responsible==1)?0:1;
				
				gameManager.game.update({hitCount: gameManager.hitCount++, ball:gameManager.ball, isLaunching: false, responsible: gameManager.responsible});
			}
		});
		
		// Send cursor position routinely
		setInterval(function(){
			var cursor = new Firebase(
				gameManager.url + "/" + gameID + "/" + ((gameManager.isHost)?"hostCursor":"guestCursor"));
			cursor.update({x:window.phone.x, y:window.phone.y});
		},100);
		
		// Ball loop
		setInterval(gameManager.trackBall, 30);
	},
	
	// Update Cursor Positions accordingly
	updateCursors: function(snapshot){
		
		var coords = snapshot.val();
		if(snapshot.name() == "hostCursor" && gameManager.isHost == false){
			window.other = coords;
		}else if(snapshot.name() == "guestCursor" && gameManager.isHost == true){
			window.other = coords;
		}
		
		if(gameManager.isLaunching)
		{
			
			if(!gameManager.isResponsible)
			{
				//The ball should be on the other player's paddle.
				gameManager.ball.hitX = window.other.x;
				gameManager.ball.hitY = window.other.y;
			}else{
				//The ball belongs on this player's paddle
				gameManager.ball.hitX = window.phone.x;
				gameManager.ball.hitY = window.phone.y;
			}
		}
		
	},
	
	// Loop to test the ball's position
	trackBall: function(){
		if(!gameManager.isResponsible || gameManager.isLaunching)return;
		var threshold = (gameManager.isHost)?1:-1;
		var bp = gameManager.ballPosition();
		if(bp.z >= 1){
			// Ball has reached you
			console.log("XThresh: "+Math.abs(bp.x - window.phone.x));
			console.log("YThresh: "+Math.abs(bp.y - window.phone.y));
			if((Math.abs(bp.x - window.phone.x) < gameManager.hitThreshold) && (Math.abs(bp.y - window.phone.y) < gameManager.hitThreshold)){
				
				// You hit the ball!
				// We need to determine the bounce angle
				
				gameManager.lastHitTime = new Date().getTime();
				gameManager.ball.hitPlayer = gameManager.responsible;
				gameManager.responsible = (gameManager.responsible==1)?0:1;
				gameManager.ball.dx = bp.x-window.phone.x;
				gameManager.ball.dy = bp.y-window.phone.y;
				gameManager.ball.dz *= gameManager.speedIncreaseFactor;
				
				gameManager.game.update({hitCount: gameManager.hitCount++, ball:gameManager.ball, responsible: gameManager.responsible});
				
			}else{
				alert("NOO YOU MISSED WHY");
				
				gameManager.responsible = (gameManager.responsible==1)?0:1;
				gameManager.ball.hitPlayer = gameManager.responsible;
				gameManager.ball.dz = 0; gameManager.ball.dx = 0; gameManager.ball.dy = 0;
				gameManager.game.update({ball:gameManager.ball, responsible: gameManager.responsible, isLaunching: true});
			}
		}
	},
	
	timeSinceHit: function(){ return new Date().getTime() - gameManager.lastHitTime; },
	
	ballPosition: function(milliseconds){
		if(milliseconds==undefined)milliseconds = gameManager.timeSinceHit();
		var seconds = milliseconds/1000;
		
		var zval = 0;
		if((gameManager.ball.hitPlayer==0 && gameManager.isHost) || (gameManager.ball.hitPlayer==1 && !gameManager.isHost)){
			// You hit the ball
			zval = 1 - gameManager.ball.dz*seconds;
		}else{
			// They hit the ball
			zval = -1 + gameManager.ball.dz*seconds;
		}
		
		return {
			x: gameManager.ball.hitX + gameManager.ball.dx*seconds,
			y: gameManager.ball.hitY + gameManager.ball.dy*seconds,
			z: zval
		};
	}
	
	
}