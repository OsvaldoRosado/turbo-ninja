// Mouse Tracking
jQuery(document).ready(function(){
   $("body").on("mousemove",function(e){
      window.mouseXPos = e.pageX;
      window.mouseYPos = e.pageY;
   }); 
});

// Game Manager
var gameManager = {

	// Reference to the current firebase games
	url: "https://turbo-ninja.firebaseIO.com/games",
	games: new Firebase("https://turbo-ninja.firebaseIO.com/games"),
	
	// State management
	isHost: false,
	
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
			var game = new Firebase(gameManager.url + "/" + gameID);
			game.update({hostCursor: {x: 0, y:0}, guestCursor: {x:0, y:0}});
			gameManager.startGaming(gameID);
		});
		
		// Set the state
		gameManager.isHost = true;
		
		return gameID;
	},
	
	joinGame: function(gameID){
		var game = new Firebase(gameManager.url + "/" + gameID);
		game.once("value",function(gameObject){
			var gameValue = gameObject.val();
			if(gameValue == undefined || !("started" in gameValue))return alert("Game does not exist");
			if(gameValue.started !== false)return alert("Game has already started");
			game.update({started: true});
			setTimeout(function(){
				gameManager.startGaming(gameID);
			},500);
		});
	},
	
	startGaming: function(gameID){
		$("#showID").hide(); $("#startSelect").hide(); $("#game").show();
		
		var game = new Firebase(gameManager.url + "/" + gameID);
		game.on('child_changed', function(snapshot) {
			var coords = snapshot.val();
			if(snapshot.name() == "hostCursor"){
				$("#hostCursor").css("left",coords.x).css("top",coords.y);
			}else{
				$("#guestCursor").css("left",coords.x).css("top",coords.y);
			}
		});
		
		setInterval(function(){
			var cursor = new Firebase(
				gameManager.url + "/" + gameID + "/" + ((gameManager.isHost)?"hostCursor":"guestCursor"));
			cursor.update({x:window.mouseXPos, y:window.mouseYPos});
		},100);
	}
}