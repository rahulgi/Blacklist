var blockedSites = [];
var tabBlockingMap = {};

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

function getTabState(tabid) {
  return tabBlockingMap[tabid];
}

function requestChecker(request) {
  if(request && request.url) {
    if (request.type == "main_frame") {
      var tabBlockingState = 0;
      for (var i = 0; i < blockedSites.length; ++i) {
        if (request.url.match(new RegExp(".*" + blockedSites[i] + ".*", "i"))) {
          tabBlockingState = blockedSites[i];
        }
      }
      chrome.tabs.getSelected(null, function(tab) {
        tabBlockingMap[tab.id] = tabBlockingState;
        console.log("tab blocking state set");
      });
      if (tabBlockingState != 0)
        return {redirectUrl: chrome.extension.getURL("blockedSite.html?blocked=" + tabBlockingState)};
    }
  }
}

chrome.webRequest.onBeforeRequest.addListener(requestChecker, {urls: ["*://*/*"]}, ["blocking"]);
