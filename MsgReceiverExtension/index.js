(function(context){
  
  // var logField = document.getElementById("log");
  // var sendText=document.getElementById("sendText");
  // var send=document.getElementById("send");

  var port = chrome.runtime.connectNative('com.nymi.nativemsg');
  var background = chrome.extension.getBackgroundPage();

  port.onMessage.addListener(function(msg) {
    if (msg.target == "console")
      console.log("Received: " + msg.text);

    if (msg.target == "extension"){
      var msgArray = msg.text.split(" ");
      var message = msgArray[0];

      if (message == "ncl-done-init"){
        port.postMessage("getprovisions");
      }
      else if ( message=="ncl-run-fail"){
        $('div').css('display', 'none');
        $('.ncl-fail').css('display','inline-block');
      }
      else if ( message=="no-saved-provisions"){
        $('div').css('display', 'none');
        $('.no-stored').css('display','inline-block');
        $('.add-new-nymi').css('display','inline-block');
      }
      else if ( message=="found-saved-provisions"){
        $('div').css('display', 'none');
        $('.looking-for-nymi').css('display','inline-block');
        $('.loader').css('display','inline-block');
        $('.add-new-nymi').css('display','inline-block');
        port.postMessage("validate");
      }
      else if ( message =="PATTERN"){
        var led = msgArray[1];
        $('div').css('display', 'none');
        $('.led-pattern').text(led);
        $('.led-pattern').css('display','inline-block');
        $('.provision-confirm').css('display','inline-block');
        $('.yes-no').css('display','block');
      }
      else if ( message =="provision-done"){
        $('div').css('display', 'none');
        $('.provision-done').css('display','inline-block');
        $('.add-new-nymi').css('display','inline-block');
      }
      else if (message == "VALIDATED"){
        $('.looking-for-nymi').css('display','none');
        $('.loader').css('display','none');
        $('.nymi-validated').css('display','inline-block');
        background.core["authenticated"] = true;
      }
      else if (message == "unexpected-disconnect"){
        $('div').css('display', 'none');
        $('.reopen-popup').css('display','inline-block');
      }
      else
        console.log("extension received unexpected message: "+msg.text);
    }
  });

  $('.add-new-nymi').click(function(){
    $('div').css('display', 'none');
    $('.provision-start').css('display','inline-block');
    $('.loader').css('display','inline-block');
    port.postMessage('setup');
  });

  $('.button-yes').click(function(){
    $('div').css('display', 'none');
    $('.loader').css('display','block');
    port.postMessage('agree');
  });

  $('.button-no').click(function(){
    $('div').css('display', 'none');
    $('.provision-start').css('display','block');
    $('.provision-restart').css('display','block');
    $('.loader').css('display','block');
    port.postMessage('reject');
  });

  port.onDisconnect.addListener(function() {
    console.log("Disconnected");
    $('div').css('display', 'none');
    $('.reopen-popup').css('display','block');
  });


  // var appendLog = function(message) {
  //   logField.innerText+="\n"+message;
  // }

  // context.appendLog = appendLog;

  // chrome.runtime.onSuspend.addListener(function(){
  //   console.log('runtime on suspend listener worked')
  //   alert('runtime on suspend listener worked')
  // });

  // send.addEventListener('click', function() {
  //   //appendLog("sending message.... ");
  //   console.log('sending message' + sendText.value)
  //   port.postMessage(sendText.value);
  //   sendText.value = "";
  // });

  // sendText.onkeypress = function (e) {
  //   var code = e.keyCode || e.which;
  //   //console.log(code)
  //   if (code == 13) { //the enter key
  //     console.log('sending message' + sendText.value)
  //     port.postMessage(sendText.value);
  //     sendText.value = "";
  //   }
  // };

})(window)
