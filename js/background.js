var blockedSites = [];
var blockedUrls = [];
var tabBlockingMap = {};

chrome.storage.local.get("blockedSites", function(items) {
  if (items.blockedSites)
    blockedSites = items.blockedSites;
});

chrome.storage.local.get("blockedUrls", function(items) {
  if (items.blockedUrls)
    blockedUrls = items.blockedUrls;
});

function addBlockedSiteOrUrl(tabid, blocked, isSite) {
  if (isSite) {
    blockedSites.push(blocked);
  } else {
    blockedUrls.push(blocked);
  }
  tabBlockingMap[tabid] = blocked;
}

function extract_url_domain(data) {
  var a = document.createElement('a');
  a.href = data;
  return a.hostname;
}

function findInList(list, urlstr, partialMatch) {
  var matched_indices = [];
  if (!partialMatch) {
    var i = list.indexOf(urlstr);
    if (i >= 0) {
      matched_indices.push(i);
    }
    return matched_indices;
  }
  var rootUrl = extract_url_domain(urlstr);
  for (var i = 0; i < list.length; ++i) {
    if (list[i].match(rootUrl)) {
      matched_indices.push(i);
    }
  }
  return matched_indices;
}

function unlist(blockedList, curUrl, blockedType, isSite) {
  var matched_indices = findInList(blockedList, curUrl, isSite);
  console.log("found " + matched_indices.length + " matches for " + curUrl);
  for (var i = matched_indices.length - 1; i >= 0; --i) {
    blockedList.splice(matched_indices[i], 1);
  }
  var storedict = {};
  storedict[blockedType] = blockedList;
  chrome.storage.local.set(storedict, function() {
    console.log("Site or url(s) Unlisted");
  });
}

function unlistSiteOrUrl(tabid, curUrl, isSite) {
  //we only have to partial match urls if user clicked remove site
  unlist(blockedUrls, curUrl, "blockedUrls", isSite);
  //we never have to partial match while checking blocked sites
  unlist(blockedSites, curUrl, "blockedSites", false);
  tabBlockingMap[tabid] = 0;
}

function clearBlacklist() {
  blockedSites = [];
  blockedUrls = [];
  tabBlockingMap = {};
}

function getTabState(tabid) {
  console.log(tabid);
  return tabBlockingMap[tabid];
}

function requestChecker(request) {
  console.log("onBeforeRequest");
  if (request && request.url) {
    if (request.type == "main_frame") {
      var tabBlockingState = 0;
      for (var i = 0; i < blockedSites.length; ++i) {
        if (request.url.match(new RegExp(
            ".*" + blockedSites[i] + ".*", "i"))) {
          tabBlockingState = blockedSites[i];
          console.log("found " + request.url + " in blocked sites");
        }
      }
      if (tabBlockingState == 0) {
        for (var i = 0; i < blockedUrls.length; ++i) {
         if (request.url.toLowerCase() == blockedUrls[i].toLowerCase()) {
          tabBlockingState = blockedUrls[i];
          console.log("found " + request.url + " in blocked urls");
         }
        }
      }
      chrome.tabs.getSelected(null, function(tab) {
        tabBlockingMap[tab.id] = tabBlockingState;
        console.log(
          "tab blocking state set for tab " +
          tab.id +
          " to " +
          tabBlockingState);
      });
      if (tabBlockingState != 0) {
        var redirectUrl = chrome.extension.getURL(
            "blockedSite.html?blocked=" + tabBlockingState);
        return { redirectUrl: redirectUrl };
      }
    }
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  requestChecker, {urls: ["*://*/*"]}, ["blocking"]);

function updateMapping(details) {
  console.log("onCommitted");
  console.log(
    "replacing tab " +
    details.replacedTabId +
    " with tab " +
    details.tabId);
  if (typeof details.replacedTabId == "undefined") {
    if (!details.tabId in tabBlockingMap) {
      tabBlockingMap[details.tabId] = 0;
    }
  }
  else {
    tabBlockingMap[details.tabId] = tabBlockingMap[details.replacedTabId];
    delete tabBlockingMap[details.replacedTabId];
  }
}

chrome.webNavigation.onTabReplaced.addListener(updateMapping);
chrome.webNavigation.onCommitted.addListener(updateMapping);
