chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  sendResponse( {URL: document.URL} );
  window.location = chrome.extension.getURL("blockedSite.html");
});