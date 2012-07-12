
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

var user = require('./models/user');
var trim = require('./utils').trim;
// Routes

app.get('/', routes.index);

app.all('/log_out',function(req,res){
  req.session.destroy(function(){
    console.log(req.session);
    res.send("done");
  });
});

app.post('/andrew',function(req,res){
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
          res.send("<p>Found you!</p>");
        });
      });
    }
    else{
      /*user.User.create( { "andrew_id":andrew_id
                       , "created_at":new Date()
                       , "last_login":new Date() }
          , function() {*/
              res.send("<p>Didn't find you...</p>");
           /* });*/
    }
  });
});
/*
app.post('/books/:book_id/buy',function(req,res){
  andrew_id = "ksikka"; //normally you'd get the user_id from session
  //get book_id from URL
  if(ksikka is not authenticated) {
    res.send("Not authenticated");
  } else {
    book.Book.findOne({"_id":book_id}).run(function(err,doc){
      if(!doc) {
        res.send("Not a valid book");
      } else {
        user.User.findOne({"andrew_id":andrew_id}).run(function(err,site_user){
          if(site_user.buying_ids.contains(book_id)) {
            res.send("You already have this book on your buy list.");
          } else {
            site_user.buying_ids.push(book_id);
            site_user.save(function(err){
              res.send("Added to purchase list.");
            });
          }
        });
      }
    });
  }
});
*/
app.get('/search',search.search);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
