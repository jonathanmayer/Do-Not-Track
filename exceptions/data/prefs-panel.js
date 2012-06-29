var DNTExceptions = { };

self.port.on("dnt-exceptions-state", function(update) {
	DNTExceptions = update;
	updateDisplay();
});

function updateDisplay() {
	oldRows = document.getElementsByClassName("exceptionRow");
	while(oldRows.length > 0) {
		oldRows[0].parentNode.removeChild(oldRows[0]);
		oldRows = document.getElementsByClassName("exceptionRow");
	}

	var nextRevokeID = 0;
	for(firstParty in DNTExceptions)
		for(thirdParty in DNTExceptions[firstParty]) {
			var row = document.createElement("tr");
			var rowHTML = '<td>';
			if(firstParty != "*")
				rowHTML += '<img src="http://' + firstParty + '/favicon.ico"></img> ';
			rowHTML += firstParty + ' </td><td>';
			if(thirdParty != "*")
				rowHTML += '<img src="http://' + thirdParty + '/favicon.ico"></img> ';
			rowHTML += thirdParty + ' </td><td><a href="#" style="color: red; text-decoration: none;" id="' + nextRevokeID + '">&#10007;</style></td></tr>';
			row.innerHTML = rowHTML;
			row.className = "exceptionRow";
			document.getElementById("lastRow").parentNode.insertBefore(row, document.getElementById("lastRow"));
			var firstPartyCopy = firstParty;
			var thirdPartyCopy = thirdParty;
			document.getElementById(nextRevokeID).addEventListener('click', function() { revokeException(firstPartyCopy, thirdPartyCopy); }, false);
			nextRevokeID++;
		}
	self.port.emit("prefs-panel-size-update", { width: document.getElementById("container").scrollWidth, height: document.getElementById("container").scrollHeight });
};

function revokeException(firstPartyOrigin, thirdPartyOrigin) {
	var revocation = { };
	revocation.firstPartyOrigin = firstPartyOrigin;
	revocation.thirdPartyOrigin = thirdPartyOrigin;
	self.port.emit("dnt-exception-removal", revocation);
}

