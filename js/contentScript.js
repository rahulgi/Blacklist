// var blockedRoot = "";

console.log("Content script running");

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
  console.log("Message action " + request.action);
  if (request.action == "geturl")
    sendResponse( {URL: document.URL} );
  else if (request.action == "redirect") {
    window.location = chrome.extension.getURL(
      "blockedSite.html?blocked=" + request.blockedSite);
  }
});
