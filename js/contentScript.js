chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  sendResponse( {URL: document.URL} );
  alert("This website has been blocked!");
  window.location = chrome.extension.getURL("blockedSite.html");
});

