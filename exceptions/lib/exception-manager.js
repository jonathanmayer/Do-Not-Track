var simpleStorage = require("simple-storage");
var DNTExceptionRequestManager = require("exception-request-manager");

var exceptions = { };
if(simpleStorage.hasOwnProperty("exceptions"))
	exceptions = simpleStorage.exceptions;
else
	simpleStorage.exceptions = exceptions;

function addException(firstPartyOrigin, thirdPartyOrigin) {
	if(!exceptions.hasOwnProperty(firstPartyOrigin))
		exceptions[firstPartyOrigin] = { };
	exceptions[firstPartyOrigin][thirdPartyOrigin] = true;
};
exports.addException = addException;

exports.removeException = function (firstPartyOrigin, thirdPartyOrigin) {
	var firstPartyExceptions = exceptions[firstPartyOrigin];
	delete firstPartyExceptions[thirdPartyOrigin];
};

exports.checkException = function (firstPartyOrigin, thirdPartyOrigin) {
	var hasException = false;
	if(exceptions.hasOwnProperty(firstPartyOrigin)) {
		// Site-wide
		if(exceptions[firstPartyOrigin].hasOwnProperty("*"))
			hasException = true;
		// Explicit-explicit
		else if(exceptions[firstPartyOrigin].hasOwnProperty(thirdPartyOrigin))
			hasException = true;
	}
	// Web-wide
	else if(exceptions.hasOwnProperty("*"))
		if(exceptions["*"].hasOwnProperty(thirdPartyOrigin))
			hasException = true;
	return hasException;
};

exports.getExceptions = function () {
	return exceptions;
}

DNTExceptionRequestManager.subscribeToGranted(function(firstPartyOrigin, thirdPartyOrigin, granted) {
	if(granted)
		addException(firstPartyOrigin, thirdPartyOrigin);
});