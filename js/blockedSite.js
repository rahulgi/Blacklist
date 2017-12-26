var site = document.URL;
site = site.substring(site.indexOf("?"));
site = site.substring(site.indexOf("=") + 1);
$("#blockMessage").text(site + " has been Blacklisted.");

var content = $("#countdown");
var UNLOCK_INTERVAL = 15;
var interval = 0;

function beginCountdown(isSite) {
  var i = UNLOCK_INTERVAL;
  var unlistType = (isSite)? "entire site": "url";
  content.text("Unlisting " + unlistType + " in " + i + " seconds...");
  interval = setInterval(function() {
    content.text("Unlisting " + unlistType + " in " + --i + " seconds...");
    if (i == 0) {
      clearInterval(interval);
      chrome.tabs.getCurrent(function(tab) {
        chrome.extension.getBackgroundPage().unlistSiteOrUrl(tab.id, site, isSite);
      });
      window.location = site;
    }
  }, 1000);
}

function modalHidden() {
  clearInterval(interval);
}

function hideModal() {
  $("#unlistModal").modal("hide");
}

$("#unlistModal").on('hidden', modalHidden);
$("#cancelUnlist").click(hideModal);

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    chrome.tabs.getCurrent(function(tab) {
      if (tab.id == request.tabid) {
        $("#unlistModal").modal("show");
        beginCountdown(request.isSite);
      }
    });
  }
);

