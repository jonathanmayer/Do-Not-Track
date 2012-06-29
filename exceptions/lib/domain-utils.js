var {Cc, Ci} = require("chrome");

var eTLDService = Cc["@mozilla.org/network/effective-tld-service;1"].getService(Ci.nsIEffectiveTLDService);
var ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);

function isPS1(origin) {
	try {
		computedPS1 = eTLDService.getBaseDomainFromHost(origin, 0);
		if(computedPS1 != origin)
			return false;
		return true;
	}
	catch(error) {
		return false;
	}
}

function isWildcard(origin) {
	return origin == "*";
}

function isValidOrigin(origin) {
	if(isWildcard(origin))
		return true;
	else if(isPS1(origin))
		return true;
	return false;
}
exports.isValidOrigin = isValidOrigin;

exports.isValidOriginPair = function(firstPartyOrigin, thirdPartyOrigin) {
	if(isValidOrigin(firstPartyOrigin) && isValidOrigin(thirdPartyOrigin) && !(isWildcard(firstPartyOrigin) && isWildcard(thirdPartyOrigin)))
		return true;
	return false;
};

exports.isValidURL = function(url) {
	try {
		var urlObject = ioService.newURI(url, null, null).QueryInterface(Ci.nsIURL);
		return true;
	}
	catch(error) {
		return false;
	}
};