(function(context){

  // document.getElementById("appid").value=chrome.runtime.id;  
  var logField = document.getElementById("log");
  var sendText=document.getElementById("sendText");
  //var sendId=document.getElementById("sendId");
  var send=document.getElementById("send");

  var port = chrome.runtime.connectNative('com.nymi.nativemsg');

  send.addEventListener('click', function() {
    appendLog("sending message.... ");
    // chrome.runtime.sendMessage(
    //   sendId.value, 
    //   {myCustomMessage: sendText.value}, 
    //   function(response) { 
    //     appendLog("response: "+JSON.stringify(response));
    //   })
    
    //port.postMessage({ text: sendText.value });
    port.postMessage(sendText.value);
  });

  port.onMessage.addListener(function(msg) {
    console.log("Received: " + msg.text);
    appendLog("Received: " + msg.text);
    // port.postMessage('Got your message');

    if (msg.text == "VALIDATED"){
      chrome.runtime.sendMessage({
        //sends message to own extension (eventPage.js) by default, or else add ID here
          "subject": "nymiStatus",
          "action": "none",
          "condition": "none",
          "args": [], 
          "note": "validated"
      }, function(response){ //this function is called "sendResponse" in eventPage.js
        
      });
    }
  });

  port.onDisconnect.addListener(function() {
    console.log("Disconnected");
  });


  var appendLog = function(message) {
    logField.innerText+="\n"+message;
  }

  context.appendLog = appendLog;

  chrome.runtime.onSuspend.addListener(function(){
    console.log('runtime on suspend listener worked')
    alert('runtime on suspend listener worked')


  });

})(window)
