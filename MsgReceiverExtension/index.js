(function(context){

  // document.getElementById("appid").value=chrome.runtime.id;  
  var logField = document.getElementById("log");
  var sendText=document.getElementById("sendText");
  //var sendId=document.getElementById("sendId");
  var send=document.getElementById("send");

  var port = chrome.runtime.connectNative('com.nymi.nativemsg');

  send.addEventListener('click', function() {
    //appendLog("sending message.... ");

    console.log('sending message' + sendText.value)
    port.postMessage(sendText.value);
    sendText.value = "";
  });

  // doesn't work yet:
  // sendText.onkeypress = function (e) {
  //   if (e.keyCode == 13) {
  //     console.log('enter key pressed')
  //     console.log('sending message' + sendText.value)
  //     port.postMessage(sendText.value);
  //     sendText.value = "";
  //   }
  // };

  port.onMessage.addListener(function(msg) {
    if (msg.target == "console")
      console.log("Received: " + msg.text);
    if (msg.target == "user")
      appendLog(msg.text);
    // port.postMessage('Got your message');

    if (msg.text == "VALIDATED"){
      chrome.runtime.sendMessage({
        //sends message to own extension (eventPage.js) by default, or else add ID here
          "subject": "nymiStatus",
          "action": "none",
          "condition": "none",
          "args": [], 
          "note": "validated"
      }, function(response){ 

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

  // chrome.runtime.onSuspend.addListener(function(){
  //   console.log('runtime on suspend listener worked')
  //   alert('runtime on suspend listener worked')
  // });

})(window)
