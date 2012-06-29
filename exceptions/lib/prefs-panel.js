var data = require("self").data;
var panel = require("panel");
var DNTExceptionManager = require("exception-manager");
var DNTExceptionRequestManager = require("exception-request-manager");

var prefsPanel = panel.Panel({
	width: 600,
	height: 600,
	contentURL: data.url("prefs-panel.html"),
	contentScriptFile: data.url("prefs-panel.js")
});

// Initialize the panel with the current exceptions
refresh();

// Resize the panel as content changes
prefsPanel.port.on("prefs-panel-size-update", function(panelSizeUpdate) {
	prefsPanel.resize(panelSizeUpdate.width + 125, panelSizeUpdate.height + 25);
});

// When the user removes an exception, process it and refresh the panel contents
prefsPanel.port.on("dnt-exception-removal", function(exceptionRemoval) {
	DNTExceptionManager.removeException(exceptionRemoval.firstPartyOrigin, exceptionRemoval.thirdPartyOrigin);
	refresh();
});

exports.show = function () {
	prefsPanel.show();
};

function refresh() {
	prefsPanel.port.emit("dnt-exceptions-state", DNTExceptionManager.getExceptions());
}
exports.refresh = refresh;

DNTExceptionRequestManager.subscribeToGranted(function(firstPartyOrigin, thirdPartyOrigin, granted) {
	refresh();
});