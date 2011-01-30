/*
donottrack.js
Jonathan Mayer - jmayer@stanford.edu

An XPCOM component that adds a Do Not Track header to all web requests.

v0.02 - 1/30/11
Updated header.

v0.01 - 10/26/10

Acknowledgement: Closely follows Mozilla's example XPCOM HTTP header modification component, https://developer.mozilla.org/en/Setting_HTTP_request_headers.
*/

var DoNotTrackHeaderName = "DNT";
var DoNotTrackHeaderValue = "1";

function DNTHTTPListener() { }

DNTHTTPListener.prototype =
{
	observe: function(subject, topic, data)
	{
		if (topic == "http-on-modify-request")
		{
			var httpChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
			httpChannel.setRequestHeader(DoNotTrackHeaderName, DoNotTrackHeaderValue, false);
			return;
		}

		else if (topic == "app-startup" || topic == "profile-after-change")
		{
			var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
			observerService.addObserver(this, "http-on-modify-request", false);
			return;
		}
	},
 
	QueryInterface: function (iid)
	{
		if (iid.equals(Components.interfaces.nsIObserver) || iid.equals(Components.interfaces.nsISupports))
			return this;
		Components.returnCode = Components.results.NS_ERROR_NO_INTERFACE;
		return null;
	},
};

var myModule =
{
	registerSelf: function (componentManager, fileSpec, location, type)
	{
		var componentManagerI = componentManager.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		componentManagerI.registerFactoryLocation(this.myCID, this.myName, this.myProgID, fileSpec, location, type);
		var categoryManager = Components.classes["@mozilla.org/categorymanager;1"].getService(Components.interfaces.nsICategoryManager);
		categoryManager.addCategoryEntry("app-startup", this.myName, this.myProgID, true, true);
	},

	getClassObject: function (compMgr, cid, iid)
	{
		return this.myFactory;
	},

	myCID: Components.ID("{b835ff9f-3fdd-47be-b216-d1e8c09252f5}"),

	myProgID: "@donottrack.us/DNTHTTPListener;1",

	myName:	 "Do Not Track HTTP Listener",

	myFactory:
	{
		QueryInterface: function (aIID)
		{
			if (!aIID.equals(Components.interfaces.nsISupports) && !aIID.equals(Components.interfaces.nsIFactory))
				throw Components.results.NS_ERROR_NO_INTERFACE;
			return this;
		},
		createInstance: function (outer, iid)
		{
			return new DNTHTTPListener();
		}
	},

	canUnload: function(compMgr)
	{
		return true;
	}
};

function NSGetModule(compMgr, fileSpec)
{
	return myModule;
}