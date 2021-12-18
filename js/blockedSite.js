var site = document.URL;
site = site.substring(site.indexOf("?"));
site = site.substring(site.indexOf("=") + 1);
$("#blockMessage").text(site + " has been Blacklisted.");

var content = $("#countdown");
var i = 15;
var interval = 0;

function updateCountdown() {
  content.text("You can unblock " + site + " in " + --i + " seconds...");
  if (i == 0) {
    content.text("You can unblock " + site + " now.");

    clearInterval(interval);
    $("#unblockBtn").toggleClass("hide")
  }
}

var begoneCountdown = false;
function beginCountdown() {
  if (!begoneCountdown) {
    begoneCountdown = true;
    i = 15;
    content.text("Unlisting " + site + " in " + i + " seconds...");
    interval = setInterval(function() {updateCountdown(i)}, 1000);
  }
}

function modalHidden() {
  clearInterval(interval);
}

function hideModal() {
  $("#unlistModal").modal("hide");
}

function clearSiteblock() {
  chrome.tabs.getCurrent(function(tab) {
    chrome.extension.getBackgroundPage().unlistSite(tab.id, site);
  });
  window.location = site;
}

$("#unlistModal").on('hidden', modalHidden);
$("#unblockBtn").click(clearSiteblock)

chrome.extension.onMessage.addListener(
    function(message, sender, sendResponse) {
  chrome.tabs.getCurrent(function(tab) {
    if (tab.id == message) {
      $("#unlistModal").modal("show");
      beginCountdown();
    }
  });
});

