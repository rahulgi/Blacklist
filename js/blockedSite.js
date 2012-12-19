var site = document.URL;
site = site.substring(site.indexOf("?"));
site = site.substring(site.indexOf("=") + 1);
$("#blockMessage").text(site + " has been Blacklisted.");