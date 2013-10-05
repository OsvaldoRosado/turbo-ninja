var messageObject = new Firebase('https://turbo-ninja.firebaseIO.com/');

$(window).load(function(){
	console.log("loaded");
	messageObject.on('child_added', function(snapshot) {
		document.getElementById("messages").innerHTML += "<br>"+snapshot.val();	
	});
	
	$("#submit").bind("click",function(){
		console.log("Sending data to Firebase");
		var listRef = messageObject.push();
		listRef.set($("#write").val());
	});
});