
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
var books = require('./controllers/books');

var user = require('./models/user');
var trim = require('./utils').trim;
// Routes

var book = require('./models/book');

app.get('/', routes.index);

app.post('/andrew',auth.login);
app.all('/log_out',auth.requiresAuth, auth.logout);

app.put('/user/books/selling',auth.requiresAuth, books.addBookToSellList);
app.put('/user/books/buying',auth.requiresAuth, books.addBookToBuyList);

app.del('/user/books/buying',auth.requiresAuth, books.removeBookFromBuyList);
app.del('/user/books/selling',auth.requiresAuth, books.removeBookFromSellList);

app.get('/search',auth.requiresAuth,search.search);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
