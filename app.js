
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/textbooks');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');

  app.use(express.cookieParser());
  app.use(express.session({ secret: "a super secretive secret" }));

  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Importing controllers
var search = require('./controllers/search');
var auth = require('./controllers/auth');

var user = require('./models/user');
var trim = require('./utils').trim;
// Routes

var book = require('./models/book');

app.get('/', routes.index);
app.all('/log_out',auth.logout);
app.post('/andrew',auth.login);

//app.put('/user/books/buying/');
//app.del('/user/books/buying/');

app.put('/user/books/selling/',function(req,res){
  siteUser = req.session.user;
  book_id = parseInt(req.body.book_id);
  book.Book.findOne({"_id":book_id}).run(function(err,doc) {
    if(!doc) {
      res.send("Not a valid book",500);
    } else if(siteUser['selling_ids'].indexOf(book_id)!=-1) {
      res.send("You already have this book on your sell list.",409);
    } else {
      siteUser['selling_ids'].push(book_id);
      user.User.update({andrew_id:siteUser.andrew_id},{ selling_ids:siteUser['selling_ids'] },function(err){
        if(err) { console.log(err); }
        else { res.send("Added to purchase list."); }
      });
    }
  });
});
//app.del('/user/books/selling')
app.get('/search',auth.requiresAuth,search.search);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
