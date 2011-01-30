/*
donottrack.js
Jonathan Mayer - jmayer@stanford.edu
 
A Jetpack module that adds a Do Not Track header to all web requests.

v0.02 - 1/30/11
Updated header.

v0.01 - 11/14/10
*/

var DoNotTrackHeaderName = "DNT";
var DoNotTrackHeaderValue = "1";

var {Cc, Ci} = require("chrome");
var observerService = require("observer-service");

var DNTCallback = function(subject, data)
{
	var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
	httpChannel.setRequestHeader(DoNotTrackHeaderName, DoNotTrackHeaderValue, false);
};

exports.register = function register()
{
	observerService.add("http-on-modify-request", DNTCallback);
};

exports.unregister = function unregister()
{
	observerService.remove("http-on-modify-request", DNTCallback);
};