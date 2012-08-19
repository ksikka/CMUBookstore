
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
var search = require('./controllers/search')
  , auth = require('./controllers/auth')
  , books = require('./controllers/books')
  , users = require('./controllers/users');
//only for dev purposes
var schedplus = require('./scheduleplus.js');

// Routes
/*
app.post('/extract',function(req,res){
    var surl = req.body.surl;
    console.log(surl);
    schedplus.scrape(surl,res);
});*/

app.get('/',function(req,res){
  auth.ifAuthElse(req,res
    , routes.index // logged in
    , routes.prettysplash // not logged in
    );
});

app.post('/andrew',auth.login);
//deprecated
app.all('/logincheck',auth.logincheck);
app.all('/logout',auth.requiresAuth, auth.logout);

app.all('/confirm/:andrew_id/:account_id',users.create_page);
app.post('/user',users.set_password);

app.get('/search',auth.requiresAuth,search.search);

app.get('/user/books/buying',auth.requiresAuth, books.getBuyList);
app.get('/user/books/selling',auth.requiresAuth, books.getSellList);

app.put('/user/books/buying',auth.requiresAuth, books.addBookToBuyList);
app.put('/user/books/selling',auth.requiresAuth, books.addBookToSellList);

app.del('/user/books/buying',auth.requiresAuth, books.removeBookFromBuyList);
app.del('/user/books/selling',auth.requiresAuth, books.removeBookFromSellList);

app.get('/books/:isbn',books.expandedView);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
