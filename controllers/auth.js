var trim = require("../utils").trim;
var user = require("../models/user")
  , course = require("../models/course")
  , book = require("../models/book");
var email = require("../email.js")
var EMAIL_LIMIT = 4;
/* TODO: refactor some of this code so that it uses "ifAuthElse" */


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
  andrew_id = trim(andrew_id.toLowerCase());
  user.User.findOne({"andrew_id":andrew_id}).run(function(err,doc){
    console.log('is this in the db?');
    if(doc){
      console.log('yes. has it been initialized?');
      if(!doc.created_at) {
        console.log('no. can i send an email?');
        //person has not yet initialized account, send them a confirmation email
        if(doc.email_count <= EMAIL_LIMIT) {
          console.log('yes.');
          email.send(/* TODO fill this out sometime*/);
          doc.email_count++;
          doc.save(function(err){
            if(err){
              console.log(err);
              res.send("error, see logs",500);
            }
            else {
              res.send((EMAIL_LIMIT - doc.email_count).toString());
            }
          });
        } else {
          console.log('no');
          res.send("too many emails sent. sorry.");
        }
      } else {
        console.log('yes');
        //account was already initialized, business as usual
        doc.last_login = new Date();
        doc.save(function(err){
          if(err)
            console.log("Error " + err);
            req.session.user = doc;
            req.session.save(function() {
            res.render('index',{login:true,andrew:req.session.user.andrew_id,title:'Welcome.'});
            //res.send({login:true,andrew:req.session.user.andrew_id});
          });
        });
      }
    }
    else{
      console.log('no');
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

// the right way to do this all
exports.ifAuthElse = function(req,res,cb1,cb2) {
  if(req.session.user) {
    cb1(req,res);
  } else {
    cb2(req,res);
  }
}
