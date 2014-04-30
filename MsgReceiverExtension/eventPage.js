// this is the event page

var core = {
  "getOptions": function(){
    console.log('getOptions', localStorage);
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

  chrome.tabs.onRemoved.addListener(function(tabID, removeInfo){
    //maybe now close the native application
  });
}

