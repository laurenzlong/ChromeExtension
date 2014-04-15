// this is the event page

var blacklistedIds = ["none"];
var core = {
  "getOptions": function(){
    console.log('getOptions', localStorage);
    return localStorage;
  },
  "authenticated": false
};

window.onload = function(){

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    console.log('eventPage.js got a new message')
    //console.log(this)
    // console.log(sendResponse)
    console.log(request)
    console.log(sender)

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

    if (request.subject == "nymiStatus"){
      if (request.note == "validated"){
        console.log(core["authenticated"])
        core["authenticated"] = true;
        console.log("changed authentication to true")
        console.log(core["authenticated"])
      }
      else
        console.log("authentication not changed")
    }
  });

  chrome.tabs.onRemoved.addListener(function(tabID, removeInfo){
    console.log ('tab closed!')
    //maybe now close the native application
  });

    //listening to Nymi Chrome App
  // chrome.runtime.onMessageExternal.addListener(
  // function(request, sender, sendResponse) {
  //   if (sender.id in blacklistedIds) {
  //     sendResponse({"result":"sorry, could not process your message"});
  //     return;  // don't allow this extension access
  //   } else if (request.myCustomMessage) {
  //     var notification = webkitNotifications.createNotification( 
  //         null,   // icon
  //         'Got message from '+sender.id,  // notification title
  //         request.myCustomMessage  // notification body text
  //       );
  //     notification.show();
  //     if (request.myCustomMessage == "yes"){
  //       core["authenticated"] = true;
  //       console.log('Got authentication from app')
  //     }
  //     else{
  //       core["authenticated"] = false;
  //       console.log('Did not get authentication from app')
  //     }
  //     sendResponse({"result":"Ok, got your message"});
  //   } else {
  //     sendResponse({"result":"Ops, I don't understand this message"});
  //   }
  // });
}

