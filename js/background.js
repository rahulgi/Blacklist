var blockedSites = [];

chrome.storage.local.get("blocked", function(items) {
  if (items.blocked)
    blockedSites = items.blocked;
});

function addBlockedSite(blockedSite) {
  blockedSites.push(blockedSite);
}

function clearBlacklist() {
  blockedSites = [];
}

function requestChecker(request) {
  if(request && request.url) {
    if (request.type == "main_frame") {
      for (var i = 0; i < blockedSites.length; ++i) {
        if (request.url.match(new RegExp(".*" + blockedSites[i] + ".*", "i"))) {
          return {redirectUrl: chrome.extension.getURL("blockedSite.html")};
        }
      }
    }
  }
}

chrome.webRequest.onBeforeRequest.addListener(requestChecker, {urls: ["*://*/*"]}, ["blocking"]);
