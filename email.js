var email = require("mailer");
var credentials = require("./secrets");
var sgusername = credentials.sendgrid_username;
var sgpassword = credentials.sendgrid_password;
exports.send = function(to_address, subject, body, callback) {
 email.send({
    host : "smtp.sendgrid.net",
    port : "587",
    domain : "tartantextbooks.com",
    to : to_address,
    from : "admin@tartantextbooks.com",
    subject : subject + " - Tartan Textbooks",
    html: body,
    authentication : "login",
    username : sgusername,
    password : sgpassword
  },
  function(err, result){
    if(err){
      console.log(err);
    }
    else {
      console.log(result);
      callback();
    }
  }
)};


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
