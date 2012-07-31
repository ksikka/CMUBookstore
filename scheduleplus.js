var request = require('request')
  , jsdom   = require('jsdom')
  , url     = require('url');

function isSMan(inputUrl) {
    var a = "https://";
    if (inputUrl.search(a) != 0)
        inputUrl = a + inputUrl;
    var b = "https://scheduleman.org/schedules/"; 
    if (inputUrl.search(b) < 0)
        return false;
    return inputUrl;
}
function isSPlus(inputUrl) {
    var a = "http://";
    if(inputUrl.search(a) != 0)
        input = a + inputUrl;
    var b = "http://scheduleplus.org/schedules/";
    if (inputUrl.search(b) < 0)
        return false;
    return inputUrl.replace("#_=_","");
}

function validateURL(inputUrl) {
  var validInputUrl = isSMan(inputUrl);
  if (! validInputUrl) {
    validInputUrl = isSPlus(inputUrl);
    if (! validInputUrl) {
        return false;
    }
  }
  return validInputUrl;
}

function scrape(inputUrl,callback) {
  if(!inputUrl) {callback([])} else {
  inputUrl = validateURL(inputUrl);
  if (!inputUrl){ callback([]); } else {
  var sman = false;
  if (isSMan(inputUrl)) sman = true;
  request({uri: inputUrl}, function(err, response, body){
    var self = this;
    self.items = new Array();
    //Just a basic error check
    if(err && response.statusCode !== 200){console.log('Request error.');}
    //Send the body param as the HTML code we will parse in jsdom
    //also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
    jsdom.env({
      html: body,
      scripts: ['http://code.jquery.com/jquery-1.6.min.js']
    }, function(err, window){
       //Use jQuery just as in a regular HTML page
       var $ = window.jQuery;
       if (sman) {
         var courseLinks = $('h3.number');
       } else {
         var courseLinks = $('#schedule .number a');
       }
       var courseNumbers = [];
       for(var i=0;i<courseLinks.length;i++){
         // TODO validations
         var cnumber = courseLinks[i].innerHTML.replace('-','').match(/[0-9]+/)[0];
         courseNumbers.push(cnumber);
       }
       callback(courseNumbers);
    });
  });
}}}

exports.scrape = scrape;
