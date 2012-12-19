var blockedSites = [];
var tabBlockingMap = {};

chrome.storage.local.get("blocked", function(items) {
  if (items.blocked)
    blockedSites = items.blocked;
});

function addBlockedSite(tabid, blockedSite) {
  blockedSites.push(blockedSite);
  tabBlockingMap[tabid] = blockedSite;
}

function clearBlacklist() {
  blockedSites = [];
  tabBlockingMap = {};
}

function getTabState(tabid) {
  console.log(tabid);
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
        console.log("tab blocking state set for tab " + tab.id + " to " + tabBlockingState);
      });
      if (tabBlockingState != 0)
        return {redirectUrl: chrome.extension.getURL("blockedSite.html?blocked=" + tabBlockingState)};
    }
  }
}

chrome.webRequest.onBeforeRequest.addListener(requestChecker, {urls: ["*://*/*"]}, ["blocking"]);

chrome.webNavigation.onTabReplaced.addListener(function(details) {
  console.log("replacing tab " + details.replacedTabId + " with tab " + details.tabId);
  tabBlockingMap[details.tabId] = tabBlockingMap[details.replacedTabId];
  delete tabBlockingMap[details.replacedTabId];
});
