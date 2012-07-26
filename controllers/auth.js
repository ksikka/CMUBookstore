var trim = require("../utils").trim;
var user = require("../models/user")
  , course = require("../models/course")
  , book = require("../models/book");

// logout

exports.logout = function(req,res){
  siteUser = req.session.user;
  req.session.destroy(function(err){
    if(err){ console.log(err); }
    else{
      console.log("Logged out " + siteUser);
      res.send(true);
    }
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
          res.send({login:true,andrew:req.session.user.andrew_id});
        });
      });
    }
    else{
      res.send(false);
    }
  });
}

// auth check for api
exports.logincheck = function(req,res) {
  var logged_in = {}
  if(req.session.user) {
    logged_in.login = true;
    logged_in.andrew = req.session.user.andrew_id;
  } else {
    logged_in.login = false;
  }
  res.send(logged_in);
}

// auth pre-filter

exports.requiresAuth = function(req,res,next) {
  if(req.session.user) {
    next();
  } else {
    res.send("<b>Not logged in, please enter your andrew_id</b>",401);
  }
}
