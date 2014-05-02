(function(context){
  
  var background = chrome.extension.getBackgroundPage();
  //tells background page to open port and start Nymi native app
  background.popupLoaded();
  var validated = false;
  var port = background.port;

  port.onMessage.addListener(function(msg) {
    if (msg.target == "console")
      console.log("Received: " + msg.text);

    if (msg.target == "extension"){
      var msgArray = msg.text.split("  ");
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
        //start looking for Nymi
        $('div').css('display', 'none');
        $('.looking-for-nymi').css('display','inline-block');
        $('.loader').css('display','inline-block');
        //$('.add-new-nymi').css('display','inline-block');
        port.postMessage("validate");
        setTimeout(function() {
          if (!validated){
            port.postMessage("disconnect");
            $('.looking-for-nymi').css('display','none');
            $('.loader').css('display','none');
            $('.no-nymis-found').css('display','inline-block'); 
            $('.add-new-nymi').css('display','inline-block');
          }  
        }, 5000);
      }
      else if ( message =="PATTERN"){
        var led = msgArray[1];
        console.log(led)
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
        validated = true;
        $('.looking-for-nymi').css('display','none');
        $('.loader').css('display','none');
        $('.nymi-validated').css('display','inline-block');
        $('.add-new-nymi').css('display','inline-block');
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
    $('.loader').css('display','inline-block');
    port.postMessage('agree');
  });

  $('.button-no').click(function(){
    $('div').css('display', 'none');
    $('.provision-start').css('display','block');
    $('.provision-restart').css('display','block');
    $('.loader').css('display','inline-block');
    port.postMessage('reject');
  });

  port.onDisconnect.addListener(function() {
    $('div').css('display', 'none');
    $('.reopen-popup').css('display','block');
  });

addEventListener("unload", function (event) {
  //when popup is closed, tells background page to close the port
  //and properly exit the native program by calling nclFinish()
    background.popupUnloaded();
}, true);

})(window)
