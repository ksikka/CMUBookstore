
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/textbooks');

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

// Importing models
var book = require('./book')
  , course = require('./course');

// Search

// An object for the typical search query
var Query = function(course_number,course_name,textbook_name) {
  this.course_number = course_number;
  this.course_name = course_name;
  this.textbook_name = textbook_name;
}

// Takes in a string, returns an escaped string ready for regex
// Source : http://stackoverflow.com/questions/6300183/sanitize-string-of-regex-characters-before-regexp-build
function sanitizeForRegex(s) {
  return s.replace(/[#-.]|[[-^]|[?|{}]/, '\\$&');
}

function trim(string) {
  if(!string) return "";
  return string.replace(/^\s*|\s*$/g, '');
}
function trimQuery(q) {
  q.course_name = trim(q.course_name);
  q.course_number = trim(q.course_number);
  q.textbook_name = trim(q.textbook_name);
}
function blankQuery(q) {
  return q.course_name == "" && q.course_number == "" && q.textbook_name == "";
}

/* Find q with regex to the db */
//Input: Valid query, callback function which takes in (docs)
//Output: List of matching docs
var search = function(query,callback) {
  trimQuery(query);
  if(blankQuery(query)) { callback(null,{"books":[]}) };
  course.Course.find({})
    .regex('_id', new RegExp("^" + sanitizeForRegex(query.course_number) + ".*","i"))
    .regex('name', new RegExp(".*" + sanitizeForRegex(query.course_name) + ".*","i"))
    .exec(function(err,courses){
      if(err) {
        console.log("There's an error but I haven't figured out how to propagate it yet.")
      }
      else {
        var course_ids = [];
        var course_dictionary = {};

        /* Build array of course_ids */
        courses.forEach(function(course){ course_ids.push(course._id) });
        /* Build course_dictionary where key is course_id and value is course */
        courses.forEach(function(course){ course_dictionary[course._id] = course; });

        book.Book.find({"course_ids":{"$in":course_ids }})
          .regex('title', new RegExp(".*" + sanitizeForRegex(query.textbook_name) + ".*","i"))
          .limit(10)
          .exec(function(err,books) {
            callback(err,{"books":books,"course_dictionary":course_dictionary})
          });
      }
    });
}

// Routes

app.get('/', routes.index);

app.put('/andrew',function(req,res){
  res.send('<p>Received '+req.body.andrew_id+'</p>');
});

app.get('/search',function(req,res){
  search(req.query,
         function(err,docs){
           res.partial("books",docs)
         });
  //log the input
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
