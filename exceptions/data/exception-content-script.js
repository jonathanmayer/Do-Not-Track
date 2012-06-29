
(function() {

var exceptionRequests = [ ];

unsafeWindow.requestDNTException = function(firstPartyOrigin, thirdPartyOrigin, callback, explanation, learnMoreURL) {

	// Type checks
	if(typeof firstPartyOrigin != "string")
		throw "Type Error: firstPartyOrigin in window.requestDNTException";
	if(typeof thirdPartyOrigin != "string")
		throw "Type Error: thirdPartyOrigin in window.requestDNTException";		
	if(typeof callback != "function")
		throw "Type Error: callback in window.requestDNTException";
	if(typeof explanation != "string")
		throw "Type Error: explanation in window.requestDNTException";
	if(typeof learnMoreURL != "string")
		throw "Type Error: learnMoreURL in window.requestDNTException";
	
	var exceptionRequest = {};
	exceptionRequest.firstPartyOrigin = firstPartyOrigin;
	exceptionRequest.thirdPartyOrigin = thirdPartyOrigin;
	exceptionRequest.explanation = explanation;
	exceptionRequest.learnMoreURL = learnMoreURL;
	exceptionRequest.callback = callback;
	
	if(exceptionRequests.length == 0)
		sendExceptionRequest(firstPartyOrigin, thirdPartyOrigin, explanation, learnMoreURL);

	// Queue callback
	exceptionRequests.push(exceptionRequest);
};

function sendExceptionRequest(firstPartyOrigin, thirdPartyOrigin, explanation, learnMoreURL) {
	var exceptionRequest = {};
	exceptionRequest.firstPartyOrigin = firstPartyOrigin;
	exceptionRequest.thirdPartyOrigin = thirdPartyOrigin;
	exceptionRequest.explanation = explanation;
	exceptionRequest.learnMoreURL = learnMoreURL;
	self.port.emit("dnt-exception-request", exceptionRequest);
};

self.port.on("dnt-exception-response", function(exceptionResponse) {
	if(exceptionResponse.hasOwnProperty("error"))
		throw exceptionResponse.error;
	else if(exceptionResponse.hasOwnProperty("granted"))
		exceptionRequests[0].callback(exceptionResponse.granted);
	exceptionRequests.shift();
	if(exceptionRequests.length > 0)
		sendExceptionRequest(exceptionRequests[0].firstPartyOrigin, exceptionRequests[0].thirdPartyOrigin, exceptionRequests[0].explanation, exceptionRequests[0].learnMoreURL);
});

})();