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
    from : "info@tartantextbooks.com",
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
      callback();
    }
  }
)};
