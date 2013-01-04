var tabState = 0;

function clearBlacklist() {
  chrome.storage.local.set( {blocked: []}, function() {
    console.log("Blacklist cleared");
  });
  chrome.extension.getBackgroundPage().clearBlacklist();
}

function unlist() {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.extension.sendMessage(tab.id);
  });
}

function blacklistSite() {
  console.log("Blacklist site clicked");
  chrome.storage.local.get("blocked", function(items) {
    var blockedSites = [];
    if (items.blocked)
      blockedSites = items.blocked;

    console.log("blocked sites is: " + blockedSites);

    chrome.tabs.getSelected(null, function(tab) {
      chrome.tabs.sendMessage(tab.id, {action: "geturl"} , function(response) {
        console.log("BLOCKING SITE " + response.URL);

        var urlToBlock = /.*\/\/.*?\//.exec(response.URL)[0];
        console.log("Root URL is " + urlToBlock);

        if (urlToBlock != "" && blockedSites.indexOf(urlToBlock) == -1) { 

          blockedSites.push(urlToBlock); 

          chrome.extension.getBackgroundPage().addBlockedSite(tab.id, urlToBlock);

          chrome.storage.local.set( {blocked: blockedSites}, function() {
            console.log("Site Blocked");
          });
        }
        chrome.tabs.sendMessage(tab.id, {action: "redirect", blockedSite: urlToBlock});
      });
    });
  });
}

var triggered = 0;
if (triggered ++ == 0) {
  chrome.tabs.getSelected(null, function(tab) {
    tabState = chrome.extension.getBackgroundPage().getTabState(tab.id);
    var button = $("#blacklistButton")
    if (tabState == 0) {
      button.click(blacklistSite);
      button.text("Blacklist site");
    } else {
      button.click(unlist);
      button.text("Remove " + tabState + " from the Blacklist");
    }
  });    
}
