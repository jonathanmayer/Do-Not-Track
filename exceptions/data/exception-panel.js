var pendingRequests = [ ];

function updateDisplay() {
	if(pendingRequests.length == 0) {
		document.getElementById("title").innerHTML = "Nobody's asked to track you.";
		document.getElementById("explanation").innerHTML = 'But you can always <span id="prefs"><a href="#" style="color: white">change your preferences</a></span>.';
		document.getElementById("choice").style.display = "none";

		document.getElementById("prefs").addEventListener('click', function() { self.port.emit("show-prefs", ""); }, false);
	}
	else {
		// Explicit-explicit
		if(pendingRequests[0].firstPartyOrigin != "*" && pendingRequests[0].thirdPartyOrigin != "*")
			document.getElementById("title").innerHTML = 'Allow <img src="http://' + pendingRequests[0].thirdPartyOrigin + '/favicon.ico"></img> ' + pendingRequests[0].thirdPartyOrigin + ' to track you on <img src="http://' + pendingRequests[0].firstPartyOrigin + '/favicon.ico"></img> ' + pendingRequests[0].firstPartyOrigin + '?';
		// Web-wide
		else if(pendingRequests[0].firstPartyOrigin == "*")
			document.getElementById("title").innerHTML = 'Allow <img src="http://' + pendingRequests[0].thirdPartyOrigin + '/favicon.ico"></img> ' + pendingRequests[0].thirdPartyOrigin + ' to track you everywhere on the web?';
		// Site-wide
		else
			document.getElementById("title").innerHTML = 'Allow any website to track you on <img src="http://' + pendingRequests[0].firstPartyOrigin + '/favicon.ico"></img> ' + pendingRequests[0].firstPartyOrigin + '?';
		document.getElementById("explanation").innerHTML = pendingRequests[0].explanation + " <a target=\"_blank\" style=\"color:white;\" href=\"" + pendingRequests[0].learnMoreURL + "\">Learn more.</a>";
		document.getElementById("choice").style.display = "inline";
	}
	self.port.emit("exception-panel-size-update", { width: document.getElementById("container").scrollWidth, height: document.getElementById("container").scrollHeight });
}

updateDisplay();

self.port.on("dnt-exception-request", function(exceptionRequest) {
	pendingRequests.push(exceptionRequest);
	updateDisplay();
});

function handleClick(granted) {
	var exceptionResponse = { };
	exceptionResponse.localID = pendingRequests[0].localID;
	exceptionResponse.globalID = pendingRequests[0].globalID;
	exceptionResponse.granted = granted;
	self.port.emit("dnt-exception-response", exceptionResponse);
	pendingRequests.shift();
	updateDisplay();
}

document.getElementById("allow").addEventListener('click', function() { handleClick(true) }, false);
document.getElementById("disallow").addEventListener('click', function() { handleClick(false) }, false);