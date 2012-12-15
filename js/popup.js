function clearBlacklist() {
  chrome.storage.local.set( {blocked: []}, function() {
    console.log("Blacklist cleared");
  });
  chrome.extension.getBackgroundPage().clearBlacklist();
}

function blacklistSite() {
  chrome.storage.local.get("blocked", function(items) {
    var blockedSites = [];
    if (items.blocked)
      blockedSites = items.blocked;

    console.log("blocked sites is: " + blockedSites);

    chrome.tabs.getSelected(null, function(tab) {
      chrome.tabs.sendMessage(tab.id, {} , function(response) {
        console.log("BLOCKING SITE " + response.URL);

        var urlToBlock = /.*\/\/.*?\//.exec(response.URL)[0];
        console.log("Root URL is " + urlToBlock);

        if (urlToBlock != "" && blockedSites.indexOf(urlToBlock) == -1) { 

          blockedSites.push(urlToBlock); 

          chrome.extension.getBackgroundPage().addBlockedSite(urlToBlock);

          chrome.storage.local.set( {blocked: blockedSites}, function() {
            console.log("Site Blocked");
          });
        }
      });
    });
  });
}

var triggered = 0;
if (triggered ++ == 0) {
  $("#blacklistButton").click(blacklistSite);

  $("#clearBlacklistButton").click(clearBlacklist);
}
