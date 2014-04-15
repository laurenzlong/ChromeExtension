// content script
chrome.runtime.sendMessage({
  //sends message to own extension by default, or else add ID here
  "subject": "contentScript",
  "action": "getOptions",
  "condition": "authenticated",
  "args": [], 
  "note": "none"
}, function(response){ //this function is called "sendResponse" in eventPage.js
  // console.log('content script started')
  var queries = {}
  for (var k in response){
    console.log(k)
    if (k.match(/^(query|url|value)-(\d+)/)){
      var type = RegExp.$1;
      var id = RegExp.$2;
      queries[id] = queries[id] || {}
      queries[id][type] = response[k];
    }
  };
  // console.log('queries are: ')
  // console.log(queries)
  for (id in queries){
    var q = queries[id]
    // console.log ('q is')
    // console.log(q)
    // console.log(document.location.href)
    if (document.location.href.match(new RegExp(q['url']))){
      //URL matches
      $(q['query']).val(q['value']); //this line dictates how to make change to DOM
    }
  }
});


