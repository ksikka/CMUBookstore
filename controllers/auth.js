var trim = require("../utils").trim;
var user = require("../models/user")
  , course = require("../models/course")
  , book = require("../models/book");
var email = require("../email.js")
var EMAIL_LIMIT = 4;
var routes = require("../routes")
var bcrypt = require('bcrypt');

/* TODO: refactor some of this code so that it uses "ifAuthElse" */


// logout

exports.logout = function(req,res){
  siteUser = req.session.user;
  req.session.user = null;
  req.session.save(function(err){
    if(err){ console.log(err); }
    else{
      console.log("Logged out " + siteUser);
      req.flash('info','Logged out successfully');
      res.redirect('home');
    }
  });
}

function handleEmail(req,res,doc) {
  console.log('no. can i send an email?');
  //person has not yet initialized account, send them a confirmation email
  if(doc.email_count <= EMAIL_LIMIT) {
    console.log('yes.');
    email.send(/* TODO integrate sendgrid */);
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
}

// login

exports.login = function(req,res){
  var andrew_id = req.body.andrew_id;
  var password = req.body.password;
  console.log('Received '+req.body.andrew_id);
  andrew_id = trim(andrew_id.toLowerCase());
  user.User.findOne({"andrew_id":andrew_id}).run(function(err,doc){
    console.log('is this in the db?');
    if(doc){
      console.log('yes. has it been initialized?');
      if(!doc.created_at) {
        handleEmail(req,res,doc);
      } else {
        console.log('yes');
        //account was already initialized, now check password
        bcrypt.compare(password, doc.password, function(err, equality) {
          if (err) {console.log(err); req.flash('error','server error, see logs'); res.redirect('home'); } else {
            if(!equality) {
              console.log('password doesnt match');
              req.flash('error','Wrong password');
              res.redirect('home');
            } else {
              doc.last_login = new Date();
              doc.save(function(err){
                if(err)
                  console.log("Error " + err);
                  req.session.user = doc;
                  req.session.save(function() {
                    res.redirect('home');
                });
              });
            }
          }
        });
      }
    }
    else{
      console.log('no');
      req.flash('error',"Login failed");
      res.redirect('home');
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
    req.flash('error',"Not Logged in");
    res.redirect('home');
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
