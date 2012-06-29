var data = require("self").data;
var pageMod = require("page-mod");
var DNTExceptionManager = require("exception-manager");
var DNTExceptionRequestManager = require("exception-request-manager");
var DNTDomainUtils = require("domain-utils");

pageMod.PageMod({
	include: ["*", "file://*"],
	contentScriptWhen: "start",
	contentScriptFile: data.url("exception-content-script.js"),
	onAttach: function(worker) {

		// Handler for when the content script passes an exception request
		worker.port.on("dnt-exception-request", function(exceptionRequest) {

			var exceptionResponse = { };

			// Check that the origins are valid
			var firstPartyOrigin = exceptionRequest.firstPartyOrigin;
			if(!DNTDomainUtils.isValidOrigin(firstPartyOrigin)) {
				exceptionResponse.error = "Format Error: firstPartyOrigin in window.requestDNTException";
				worker.port.emit("dnt-exception-response", exceptionResponse);
				return;
			}

			var thirdPartyOrigin = exceptionRequest.thirdPartyOrigin;
			if(!DNTDomainUtils.isValidOrigin(thirdPartyOrigin)) {
				exceptionResponse.error = "Format Error: thirdPartyOrigin in window.requestDNTException";
				worker.port.emit("dnt-exception-response", exceptionResponse);
				return;
			}

			if(!DNTDomainUtils.isValidOriginPair(firstPartyOrigin, thirdPartyOrigin)) {
				exceptionResponse.error = "Semantic Error: firstPartyOrigin and thirdPartyOrigin in window.requestDNTException";
				worker.port.emit("dnt-exception-response", exceptionResponse);
				return;
			}

			// Check that the URL is actually a URL
			var learnMoreURL = exceptionRequest.learnMoreURL;
			if(!DNTDomainUtils.isValidURL(learnMoreURL)) {
				exceptionResponse.error = "Format Error: learnMoreURL in window.requestDNTException";
				worker.port.emit("dnt-exception-response", exceptionResponse);
				return;			
			}

			// If there's already an exception, just grant
			if(DNTExceptionManager.checkException(firstPartyOrigin, thirdPartyOrigin)) {
				exceptionResponse.granted = true;
				worker.port.emit("dnt-exception-response", exceptionResponse);
				return;
			}

			DNTExceptionRequestManager.addExceptionRequest(firstPartyOrigin, thirdPartyOrigin, exceptionRequest.explanation, learnMoreURL);
		});
	}
});