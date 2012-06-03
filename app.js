
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

var Schema = mongoose.Schema;

var book = new Schema({
  title:String,
  author:String,
  isbn:String,
  requirement:String
});
var Book = mongoose.model('Book',book);
var textbook = new Schema({
  course_number:String,
  books:[Book]
});
var Textbook = mongoose.model('Textbook',textbook);


// Search

/* Validation of Query */
// Input: q is an object with course_number, course_name, and textbook_name fields
// Output: [true,null] if valid, [false, c] where c is the invalid character
function validQuery(q) {
  var blackList = [ '{', '}', '(', ')', '[', ']', '\\', '*', '+', '?', '.', '^', '$', '|', '-'];
  var safe = function(str,list) {
    for(var i = 0; i < str.length; i++){
      for(var j = 0; j < list.length; j++){
        if(str.charAt(i) === list[j]) return [false,list[j]];
      }
    }
    return [true,null];
  }
  var a = safe(q.course_number,blacklist);
  var b = safe(q.course_name,blacklist);
  var c = safe(q.textbook_name,blacklist);
  if(a[0])
    if(b[0])
      return c;
    else
      return b;
  else
    return a;
}

/* Find q with regex to the db */
//Input: Valid q
//Output: List of matching docs


// Routes

app.get('/', routes.index);

app.post('/suscribe',function(req,res) {
  Textbook.find({"books.requirement" : req.body.inq},function(err,docs){
    if(err) {
      console.log(err);
      res.send(err);
    }
    else {
      if(docs) {
        res.partial('books',{docs:docs});
      }
      else {
        res.send("doh");
      }
    }
  });
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
