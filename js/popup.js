function clearBlacklist() {
  chrome.storage.local.set( {blocked: []}, function() {
    console.log("Blacklist cleared");
  });
  chrome.extension.getBackgroundPage().clearBlacklist();
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

          chrome.extension.getBackgroundPage().addBlockedSite(urlToBlock);

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
  /*console.log(chrome);
  chrome.tabs.getSelected(null, function(tab) {
    console.log(tab.id);
    chrome.tabs.sendMessage(tab.id, {action: "checkBlockState"}, function(response) {
      console.log("response");
    });
  });
  */
  chrome.tabs.getSelected(null, function(tab) {
    var tabState = chrome.extension.getBackgroundPage().getTabState(tab.id);
    if (tabState == 0) {
    
    } else {
    
    }
    /*
    console.log(tab.id);
    chrome.tabs.sendMessage(tab.id, {action: "getBlockState"}, function(response) {
      if (response == null) {
        console.log("No response");
        chrome.tabs.executeScript(tab.id, {code:"console.log(document.URL);"}, function(response) {
          console.log(response);
        });
      } else {
        console.log(response.blockState);
        if (response.blockState == 1) {
          $("#clearBlacklistButton").click(clearBlacklist);
        } else {
          console.log("Blacklisting site");
          $("#blacklistButton").click(blacklistSite);
        }
      }
    });
    */
  });
  
  $("#clearBlacklistButton").click(clearBlacklist);
  $("#blacklistButton").click(blacklistSite);
  
}
