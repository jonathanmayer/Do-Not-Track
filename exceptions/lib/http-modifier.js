var observerService = require("observer-service");
var DNTExceptionManager = require("exception-manager");
var headerName = "DNT";
var headerValueDefault = "1";
var headerValueException = "0";

function httpModificationCallback(subject, data) {
	try {
		// Grab PS+1 for the current request and top window
		var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
		var currentHost = httpChannel.originalURI.host;
		var currentPS1 = eTLDService.getBaseDomainFromHost(currentHost, 0);
		var currentWindow = windowFromHttpChannel(httpChannel);
		var topWindow = topWindowFromWindow(currentWindow);
		var topHost = topWindow.location.hostname;
		var topPS1 = eTLDService.getBaseDomainFromHost(topHost, 0);
		
		// Look up DNT exception
		var hasException = DNTExceptionManager.checkException(topPS1, currentPS1);

		var headerValue = hasException ? headerValueException : headerValueDefault;
		httpChannel.setRequestHeader(headerName, headerValue, false);		
	}
	catch(error) {
	}
}

function windowFromHttpChannel(httpChannel) {
	try {
		var notificationCallbacks = null;
		if(httpChannel.notificationCallbacks)
			notificationCallbacks = httpChannel.notificationCallbacks;
		else
			notificationCallbacks = httpChannel.loadGroup.notificationCallbacks;
		if(notificationCallbacks) {
			var interfaceRequestor = notificationCallbacks.QueryInterface(Ci.nsIInterfaceRequestor);
			return interfaceRequestor.getInterface(Ci.nsIDOMWindow);
		}
	}
	catch(error) {
	}
	return null;
}

function topWindowFromWindow(currentWindow) {
	while(currentWindow.parent != currentWindow)
		currentWindow = currentWindow.parent;
	return currentWindow;
}

observerService.add("http-on-modify-request", httpModificationCallback);