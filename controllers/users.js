// Importing controllers
var auth = require('../controllers/auth');
var user = require('../models/user.js');
var bcrypt = require('bcrypt');

exports.create_page = function(req,res){
  var accountId = req.params.account_id;
  var andrewId = req.params.andrew_id;
  // see if it's in the db
  user.User.findOne({_id:accountId,andrew_id:andrewId}).run(function(err,doc){
    if(err) {
      console.log(err);
      res.send("404: not a real page",404);
    }
    else {
      if(doc) {
        //success
        if(!doc.password) {
          // give the user a chance to fill out all their settings
          res.render('user_settings',{user:doc, title: "Create a new account"});
        } else {
          req.flash('error','Please login');
          res.redirect('/');
        }
      } else {
        //wrong conf code, log this event.
        console.log("failed attempt to guess conf code from email.");
        console.log(andrewId+", "+accountId);
        res.send("404: not a real page",404);
      }
    }
  });
}

exports.set_password = function(req,res){
  id = req.body.emailconf;
  password = req.body.password;
  // do validations on the password
  // store the password in the database
  user.User.findOne({_id:id},function(err,user){
    if(err) {
      console.log(err);
      res.send("",500);
    } else {
      if(user && user.created_at && !user.password) {
        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(password, salt, function(err, hash) {
            // Store hash
            user.password = hash;
            user.created_at = new Date();
            user.selling_ids = [];
            user.buying_ids = []
            user.last_login = null;
            user.save(function(){
              req.body.andrew_id = user.andrew_id;
              req.body.password = password;
              auth.login(req,res);
            });
          });
        });
      } else {
        res.send("Sorry.",404);
      }
    }
  });
}
