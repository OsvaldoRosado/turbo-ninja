$(document).ready(function(){
	window.phone = {x:-1,y:-1};
	window.other = {x:-1,y:-1};
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
		startTurboNinja("gameDiv");
		
		var game = new Firebase(gameManager.url + "/" + gameID);
		game.on('child_changed', function(snapshot) {
			var coords = snapshot.val();
			if(snapshot.name() == "hostCursor" && gameManager.isHost == false){
				window.other = coords;
			}else if(snapshot.name() == "guestCursor" && gameManager.isHost == true){
				window.other = coords;
			}
		});
		
		setInterval(function(){
			var cursor = new Firebase(
				gameManager.url + "/" + gameID + "/" + ((gameManager.isHost)?"hostCursor":"guestCursor"));
			cursor.update({x:window.phone.x, y:window.phone.y});
		},100);
	}
}