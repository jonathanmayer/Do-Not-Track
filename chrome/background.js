chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
	details.requestHeaders.push({name: "DNT", value: "1"});
	return {requestHeaders: details.requestHeaders};
}, {urls: ["<all_urls>"]}, ["requestHeaders", "blocking"]);