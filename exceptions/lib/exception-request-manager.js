var exceptionRequests = [ ];
var topSubscribers = [ ];
var grantedSubscribers = [ ];

exports.addExceptionRequest = function(firstPartyOrigin, thirdPartyOrigin, explanation, learnMoreURL) {
	var exceptionRequest = { };
	exceptionRequest.firstPartyOrigin = firstPartyOrigin;
	exceptionRequest.thirdPartyOrigin = thirdPartyOrigin;
	exceptionRequest.explanation = explanation;
	exceptionRequests.learnMoreURL = learnMoreURL;
	exceptionRequests.push(exceptionRequest);
	if(exceptionRequests.length == 1)
		notifyTopSubscribers();
};

exports.processExceptionRequest = function(granted) {
	notifyGrantedSubscribers(granted);
	exceptionRequests.shift();
	if(exceptionRequests.length > 0)
		notifyTopSubscribers();
};

exports.subscribeToTop = function(callback) {
	topSubscribers.push(callback);
};

function notifyTopSubscribers() {
	for(var i = 0; i < topSubscribers.length; i++)
		topSubscribers[i](exceptionRequests[0].firstPartyOrigin, exceptionRequests[0].thirdPartyOrigin, exceptionRequests[0].explanation, exceptionRequests[0].learnMoreURL);
}

exports.subscribeToGranted = function(callback) {
	grantedSubscribers.push(callback);
};

function notifyGrantedSubscribers(granted) {
	for(var i = 0; i < grantedSubscribers.length; i++)
		grantedSubscribers[i](exceptionRequests[0].firstPartyOrigin, exceptionRequests[0].thirdPartyOrigin, granted);
};