const jsurl = chrome.runtime.getURL("show-custom-globals.js");
const body = document.body || document.getElementsByTagName("body")[0];

const script = document.createElement("script");
script.src = jsurl;
body.appendChild(script);