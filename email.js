var email = require("mailer");
var credentials = require("./secrets");
var user = require("./models/user.js");
var sgusername = credentials.sendgrid_username;
var sgpassword = credentials.sendgrid_password;
function send(to_address, subject, body, callback) {
  /*console.log('To: '+ to_address);
  console.log('Subject: ' + subject);
  console.log('Body: ' + body);*/
  email.send({
    host : "smtp.sendgrid.net",
    port : "587",
    domain : "tartantextbooks.com",
    to : "" + to_address,
    from : "admin@tartantextbooks.com",
    subject : subject + " - Tartan Textbooks",
    html: "" + body,
    authentication : "login",
    username : sgusername,
    password : sgpassword
  },
  function(err, result){
    if(err){
      console.log("Error: "+err);
      console.log("Result: "+result);
    }
    else {
      console.log("Result: "+result);
      console.log("Sent an email to " + to_address);
      if(callback)
        callback();
    }
  });
}
exports.send = send;

function incrementalEmail(action, user, book, matchingUser,callback){
  var to_address = user.email;
  var buying = (action === "buy") ? true : false;
  var subject = buying ? "Someone wants to buy your book" : "Someone listed a book";
  var name = user.name;
  var body = "";
  if(buying) {
    body = "Hey "+ name + ",<br>"+
             "<br>" + matchingUser.name + " may be interested in buying your textbook: "+
             book.title + ". You can contact " + matchingUser.andrew_id + " by email at " +
             matchingUser.email + " or wait for him or her to contact you."+"<br><br>"+
             "Cheers,<br>Tartan Textbooks";
  } else {
    body = "Hey "+ name + ",<br>"+
             "<br>" + matchingUser.andrew_id + " may be interested in selling a textbook to you: "+
             book.title + ". You can contact " + matchingUser.andrew_id + " by email at " +
             matchingUser.email + " or wait for him or her to contact you."+"<br><br>"+
             "Cheers,<br>Tartan Textbooks";
  }
  send(""+to_address, ""+subject, ""+body, callback);
}

function initialEmail(action, currentUser, book, matching_users,callback){
  var to_address = currentUser.email;
  var buying = (action === "buy") ? true : false;
  var subject = "Your textbook listing";
  var name = currentUser.name;
  function oneLine(u) { return u.name + ": " + u.email; }
  function allLines(us) {
    var s = "";
    for(var i = 0; i < us.length; i++) { s += oneLine(us[i]) + "<br>" ; }
    return s;
  }
  var body = "";
  if (matching_users.length === 0 && buying) {
    body = "Thanks for listing " + book.title + ". We'll send you an email as soon as " +
           "people list this book for sale within your price range. Good luck!" + "<br><br>" +
           "Cheers, <br>Tartan Textbooks";
  } else if (matching_users.length > 0 && buying) {
    body = "You listed that you're in the market for " + book.title + ". The following students " + 
           "are interested in selling this textbook within your price range: " + "<br><br>" +
           allLines(matching_users) + "<br>" +
           "Cheers, Tartan Textbooks";
  } else if (matching_users.length === 0 && !buying) {
    body = "Thanks for listing " + book.title + ". We'll send you an email as soon as " +
           "someone wants to buy it above your minimum selling price. Good luck!" + "<br><br>" +
           "Cheers, <br>Tartan Textbooks";
  } else if (matching_users.length > 0 && !buying) {
    body = "You listed that you're selling " + book.title + ". The following students " + 
           "are interested in buying this textbook above your min. selling price: " + "<br><br>" +
           allLines(matching_users) + "<br>" +
           "Cheers, Tartan Textbooks";
  }
  send(to_address, subject, body, callback);
}

exports.notifyUsers = function(currentUser,action,book,price) {
  var isbn = book._id;
  //assumes buying action
  // find users who have book AND price in range
  var mongoQuery = {};
  otherAction = action === "buy" ? "sell" : "buy";
  mongoQuery[otherAction+"ing_ids"] = isbn;
  user.User.find(mongoQuery,function(err,matching_users){
    if(!matching_users) matching_users = [];
    //console.log("matching users: "+matching_users);
    var filtered_users = [];
    for(var i = 0; i < matching_users.length; i++) {
      var user = matching_users[i];
      //console.log(user);
      var bookIndex = user[otherAction+"ing_ids"].indexOf(isbn);
      var matching_price = user[otherAction+"ing_prices"][bookIndex];
      //console.log(matching_price);
      var userCares = action == "buy" ? matching_price <= price : matching_price >= price;
      if(userCares) {
        // send an email asynchronously
        //console.log("care");
        incrementalEmail(action, user, book, currentUser);
        filtered_users.push(user);
      } else {
        //console.log("doesn't care");
      }
    }

    initialEmail(action, currentUser, book, filtered_users);
  });
}

exports.body = function(link_string) {
  body_string = ("" +
  "Welcome to Tartan Textbooks, the best way to buy and sell textbooks online!"+"<br>"+
  "Now you can get email notifications when someone on campus lists a book that you want to buy or sell."+"<br>"+
  ""+"<br>"+
  "Click the link below to set your account password:"+"<br>"+
  ""+"<br>"+
  link_string+"<br>"+
  ""+"<br>"+
  "Note: While this is not required, it is recommended since without a password,"+"<br>"+
  "you could be the victim of a ton of email spam."+"<br>"+
  ""+"<br>"+
  "From the Tartan Textbooks team, we hope you enjoy the site. Feel free to reply with suggestions or feature requests."+"<br>"+
  "And remember, buy low, sell high :)");
  return body_string;
}
