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

        chrome.storage.local.set( {blocked: blockedSites}, function() {
          console.log("Site BLocked");
          chrome.extension.getBackgroundPage().addBlockedSite(urlToBlock);
        });
      }
    });
  });
});
