var trim = require("../utils").trim;
var user = require("../models/user")
  , course = require("../models/course")
  , book = require("../models/book");

// logout

exports.logout = function(req,res){
  user = req.session.andrew_id;
  req.session.destroy(function(){
    console.log("Logged out " + user);
    res.send(true);
  });
}


// login

exports.login = function(req,res){
  var andrew_id = req.body.andrew_id;
  console.log('Received '+req.body.andrew_id);
  // will want to do validations on the andrew_id
  andrew_id = trim(andrew_id.toLowerCase());
  user.User.findOne({"andrew_id":andrew_id}).run(function(err,doc){
    if(doc){
      doc.last_login = new Date();
      doc.save(function(err){
        if(err)
          console.log("Error " + err);
        req.session.user = doc;
        req.session.save(function() {
          res.send("<p>Logged in.</p>");
        });
      });
    }
    else{
      /*user.User.create( { "andrew_id":andrew_id
                       , "created_at":new Date()
                       , "last_login":new Date() }
          , function() {*/
              res.send("<p>Not a user's andrew_id in the DB</p>");
           /* });*/
    }
  });
}

// auth pre-filter

exports.requiresAuth = function(req,res,next) {
  if(req.session.user) {
    next();
  } else {
    res.send("<b>Not logged in, please enter your andrew_id</b>");
  }
}
