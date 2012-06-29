var data = require("self").data;
var panel = require("panel");
var widget = require("widget");
var DNTPrefsPanel = require("prefs-panel");
var DNTExceptionRequestManager = require("exception-request-manager");

var exceptionPanel = panel.Panel({
	width: 100,
	height: 100,
	contentURL: data.url("exception-panel.html"),
	contentScriptFile: data.url("exception-panel.js")
});

exceptionPanel.port.on("show-prefs", function() {
	exceptionPanel.hide();
	DNTPrefsPanel.show();
});

exceptionPanel.port.on("exception-panel-size-update", function(panelSizeUpdate) {
	exceptionPanel.resize(panelSizeUpdate.width + 25, panelSizeUpdate.height + 20);
});

exceptionPanel.port.on("dnt-exception-response", function(exceptionResponse) {
	exceptionPanel.hide();
	DNTExceptionRequestManager.processExceptionRequest(exceptionResponse.granted);
});

var exceptionWidget = widget.Widget({
	id: "dnt-icon",
	label: "Do Not Track",
	contentURL: data.url("bug.png"),
	panel: exceptionPanel
});

function showRequest(firstPartyOrigin, thirdPartyOrigin, explanation, learnMoreURL) {
	var exceptionRequest = { };
	exceptionRequest.firstPartyOrigin = firstPartyOrigin;
	exceptionRequest.thirdPartyOrigin = thirdPartyOrigin;
	exceptionRequest.explanation = explanation;
	exceptionRequest.learnMoreURL = learnMoreURL;
	exceptionPanel.port.emit("dnt-exception-request", exceptionRequest);
};
exports.showRequest = showRequest;

DNTExceptionRequestManager.subscribeToTop(function(firstPartyOrigin, thirdPartyOrigin, explanation, learnMoreURL) {
	showRequest(firstPartyOrigin, thirdPartyOrigin, explanation, learnMoreURL);
});