// Search

// Importing models
var book = require('../models/book')
  , course = require('../models/course')
  , user = require('../models/user');

var utils = require('../utils');

// An object for the typical search query
var Query = function(course_number,course_name,textbook_name) {
  this.course_number = course_number;
  this.course_name = course_name;
  this.textbook_name = textbook_name;
};

function trimQuery(q) {
  q.course_name = utils.trim(q.course_name);
  q.course_number = utils.trim(q.course_number);
  q.textbook_name = utils.trim(q.textbook_name);
}
function blankQuery(q) {
  return q.course_name == "" && q.course_number == "" && q.textbook_name == "";
}

//Input: Valid query, callback function which takes in (docs)
//Output: List of matching docs, order not yet determined
var search = function(query,callback) {
  trimQuery(query);
  query.course_number = query.course_number.replace("-",""); // strips hyphens
  query.course_number = utils.sanitizeForRegex(query.course_number);
  query.course_name = utils.sanitizeForRegex(query.course_name);
  query.textbook_name = utils.sanitizeForRegex(query.textbook_name);
  if(blankQuery(query)) { return callback(null,{"books":[]}); };
  course.Course.find({})
    .regex('_id', new RegExp("^" + query.course_number + ".*","i")) //prefix match
    .regex('name', new RegExp(".*" + query.course_name + ".*","i"))
    .exec(function(err,courses){
      if(err) { console.log("There's an error, with the query "+query); }
      else {
        var course_ids = [];
        var course_dictionary = {};

        /* Build array of course_ids */
        courses.forEach(function(course){ course_ids.push(course._id) });
        /* Build course_dictionary where key is course_id and value is course */
        courses.forEach(function(course){ course_dictionary[course._id] = course; });

        book.Book.find({"course_ids":{"$in":course_ids }})
          .regex('title', new RegExp(".*" + query.textbook_name + ".*","i"))
          .limit(10)
          .exec(function(err,books) {
            callback(err,{"books":books,"course_dictionary":course_dictionary})
          });
      }
    });
}

exports.search = function(req,res){
  search(req.query,
         function(err,docs){
           res.partial("books",docs)
         });
  //log the input
}
