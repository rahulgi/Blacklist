var site = document.URL;
site = site.substring(site.indexOf("?"));
site = site.substring(site.indexOf("=") + 1);
$("#blockMessage").text(site + " has been Blacklisted.");

var content = $("#countdown");
var i = 15;
var interval = 0;

function updateCountdown() {
  content.text("Unlisting " + site + " in " + --i + " seconds...");
  if (i == 0) {
    clearInterval(interval);
    chrome.tabs.getCurrent(function(tab) {
      chrome.extension.getBackgroundPage().unlistSite(tab.id, site);
    });
    window.location = site;
  }
}

function beginCountdown() {
  i = 15;
  content.text("Unlisting " + site + " in " + i + " seconds...");
  interval = setInterval(function() {updateCountdown(i)}, 1000);
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
    function(message, sender, sendResponse) {
  chrome.tabs.getCurrent(function(tab) {
    if (tab.id == message) {
      $("#unlistModal").modal("show");
      beginCountdown();
    }
  });
});

