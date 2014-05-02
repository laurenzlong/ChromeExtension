// this is the background page

var port;

var core = {
  "getOptions": function(){
    console.log('getOptions', localStorage); //retrieves form filling info
    return localStorage;
  },
  "authenticated": false // this is changed to true by index.js when the Nymi is validated
};

window.onload = function(){
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    console.log('eventPage.js got a new message')
    if (request.subject == "contentScript"){
      console.log("detected that subject was contentScript")
      var ret = (core[request.action] || function(){}).apply(this, request.args);
      // console.log(ret)
      if (core[request.condition]){
        sendResponse(ret); //executes the function that changes DOM (defined in contentScript.js)
        console.log('authenticated');
      }
      else
        console.log('not authenticated');
    }
  });
}

var popupLoaded = function(){
  //called by index.js when user clicks on extension button
  console.log('popup loaded, opening port')
  port = chrome.runtime.connectNative('com.nymi.nativemsg');
}; 

var popupUnloaded = function(){
  //called by index.js when user closes the popup
  console.log('popup closed, quitting program')
  port.postMessage('quit');
};
