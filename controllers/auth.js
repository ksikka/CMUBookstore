var trim = require("../utils").trim;
var user = require("../models/user")
  , course = require("../models/course")
  , book = require("../models/book");
var email = require("../email.js")
var EMAIL_LIMIT = 4;
var routes = require("../routes")
var bcrypt = require('bcrypt');
var baseUrl = require('../secrets').baseUrl;
/* TODO: refactor some of this code so that it uses "ifAuthElse" */


// logout

exports.logout = function(req,res){
  siteUser = req.session.user;
  req.session.user = null;
  req.session.save(function(err){
    if(err){ console.log(err); }
    else{
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
    var conf_url = baseUrl+"/confirm/"+doc.andrew_id+"/"+doc._id.toString();
    var link_string = "<a href=\""+conf_url+"\">"+conf_url+"</a>";
    email.send( ""+doc.email, "Welcome! Set your password.", email.body(link_string),function(er){
      console.log("Email error:" + er);
      doc.email_count++;
      doc.created_at = new Date();
      doc.save(function(err){
        if(err){
          console.log(err);
          res.send("error, see logs",500);
        }
        else {
          req.firstTime = true;
          authorize(doc,req,res);
        }
      });
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
  if(!password) password = "";
  andrew_id = trim(andrew_id.toLowerCase());
  user.User.findOne({"andrew_id":andrew_id}).run(function(err,doc){
    if(doc){
      if(!doc.created_at) {
        handleEmail(req,res,doc);
      } else {
        //account was already initialized, now check password
        if (!doc.password){
          authorize(doc,req,res);
        } else {
          bcrypt.compare(password, doc.password, function(err, equality) {
            if (err) {console.log(err); req.flash('error','server error, see logs'); res.redirect('home'); } else {
              if(!equality) {
                res.send({success:false, flash:"Wrong password", password:true})
              } else {
                authorize(doc,req,res);
              }
            }
          });
        }
      }
    }
    else{
      res.send({success:false, flash:"Andrew ID error"});
    }
  });
}

function authorize(doc,req,res) {
  doc.last_login = new Date();
  doc.save(function(err){
    if(err)
      console.log("Error " + err);
    req.session.user = doc;
    req.session.firstTime = req.firstTime;
    req.session.save(function() {
      res.send({success:true, redirect: '/'});
    });
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
