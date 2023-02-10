var tabState = 0;

function clearBlacklist() {
  chrome.storage.local.set( {blockedSites: []}, function() {
    console.log("Blacklist Sites cleared");
  });
  chrome.storage.local.set( {blockedUrls: []}, function() {
    console.log("Blacklist Urls cleared");
  });
  chrome.extension.getBackgroundPage().clearBlacklist();
}

function unlistSiteOrUrl(isSite) {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendMessage(tab.id, {tabid: tab.id, isSite: isSite});
  });
}

function blacklistSiteOrUrl(isSite) {
  var blockedType = (isSite)? "blockedSites": "blockedUrls";
  chrome.storage.local.get(blockedType, function(items) {
    var blockedList = [];
    if ((isSite && items.blockedSites)) {
      blockedList = items.blockedSites;
    } else if (!isSite && items.blockedUrls) {
      blockedList = items.blockedUrls;
    }
    console.log("blocked sites is: " + blockedList);

    chrome.tabs.getSelected(null, function(tab) {
      chrome.tabs.sendMessage(tab.id, {action: "geturl"} , function(response) {

        var rootUrl = /.*\/\/.*?\//.exec(response.URL)[0];
        var urlToBlock = (isSite)? rootUrl: response.URL;

        console.log("BLOCKING " + urlToBlock);

        if (urlToBlock != "" && blockedList.indexOf(urlToBlock) == -1) {
          blockedList.push(urlToBlock);
          chrome.extension.getBackgroundPage().addBlockedSiteOrUrl(tab.id, urlToBlock, isSite);
          var storedict = {};
          storedict[blockedType] = blockedList;
          chrome.storage.local.set(storedict, function() {
            console.log("Site or url Blocked");
          });
        }
        chrome.tabs.sendMessage(tab.id, {action: "redirect", blocked: urlToBlock});
      });
    });
  });
}

function blacklistSite() {
  console.log("Blacklist site clicked");
  blacklistSiteOrUrl(true);
}

function blacklistUrl() {
  console.log("Blacklist url clicked");
  blacklistSiteOrUrl(false);
}

function unlistSite() {
  console.log("Unlist site clicked");
  unlistSiteOrUrl(true);
}

function unlistUrl() {
  console.log("Unlist url clicked");
  unlistSiteOrUrl(false);
}

var triggered = 0;
if (triggered ++ == 0) {
  chrome.tabs.getSelected(null, function(tab) {
    tabState = chrome.extension.getBackgroundPage().getTabState(tab.id);
    var buttonSite = $("#blacklistSiteButton");
    var buttonUrl = $("#blacklistUrlButton");
    if (tabState == 0) {
      buttonSite.click(blacklistSite);
      buttonUrl.click(blacklistUrl);
      buttonSite.text("Blacklist site");
      buttonUrl.text("Blacklist url");
    } else {
      buttonSite.click(unlistSite);
      buttonUrl.click(unlistUrl);
      buttonSite.text("Remove site from the Blacklist");
      buttonUrl.text("Remove url from the Blacklist");
    }
  });    
}
