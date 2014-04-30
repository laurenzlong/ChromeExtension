(function(context){
  
  var logField = document.getElementById("log");
  var sendText=document.getElementById("sendText");
  var send=document.getElementById("send");

  var port = chrome.runtime.connectNative('com.nymi.nativemsg');
  var background = chrome.extension.getBackgroundPage();

  send.addEventListener('click', function() {
    //appendLog("sending message.... ");
    console.log('sending message' + sendText.value)
    port.postMessage(sendText.value);
    sendText.value = "";
  });

  sendText.onkeypress = function (e) {
    var code = e.keyCode || e.which;
    console.log(code)
    if (code == 13) { //the enter key
      console.log('sending message' + sendText.value)
      port.postMessage(sendText.value);
      sendText.value = "";
    }
  };

  port.onMessage.addListener(function(msg) {
    if (msg.target == "console")
      console.log("Received: " + msg.text);
    if (msg.target == "user")
      appendLog(msg.text);

    if (msg.text == "VALIDATED"){
      background.core["authenticated"] = true;
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
