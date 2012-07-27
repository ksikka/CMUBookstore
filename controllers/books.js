var user = require('../models/user'),
    book = require('../models/book');


var getBookList = function(req,res,action){
  var listName = action+"ing_ids";
  userFromSession = req.session.user;
  user.User.findOne({"andrew_id":userFromSession.andrew_id},function(err,siteUser){
    if(err) { console.log(err); }
    else {
      listOfIds = siteUser[listName];
      book.Book.find({"_id":{"$in":listOfIds}}).run(function(err,books){
        if(err){console.log(err);} else{
        res.partial("book_list",{list:books,action:action},function(err,htmlString){
          res.json({html:htmlString});
        });}
      });
    }
  });
}

exports.getBuyList = function(req,res){getBookList(req,res,"buy")};
exports.getSellList = function(req,res){getBookList(req,res,"sell")};

var removeFromBookList = function(req,res,action){
  var listName = action+"ing_ids";
  siteUser = req.session.user;
  book_id = parseInt(req.body.book_id);
  book.Book.findOne({"_id":book_id}).run(function(err,doc) {
    if(!doc) {
      res.send("Not a valid book",500);
    } else if(siteUser[listName].indexOf(book_id)==-1) {
      res.send("You can't remove this book if it's not on your "+action+" list.",409);
    } else {
      var indexOfBook = siteUser[listName].indexOf(book_id);
      siteUser[listName] = siteUser[listName].slice(0,indexOfBook).concat(siteUser[listName].slice(indexOfBook+1,siteUser[listName].length));
      updateDict = {};
      updateDict[listName] = siteUser[listName];
      user.User.update({"andrew_id":siteUser.andrew_id}, updateDict,function(err){
        if(err) { console.log(err); }
        else {
          getBookList(req,res,action);
        }
      });
    }
  });
}

var addToBookList = function(req,res,action){
  var listName = action+"ing_ids";
  siteUser = req.session.user;
  book_id = parseInt(req.body.book_id);
  book.Book.findOne({"_id":book_id}).run(function(err,doc) {
    if(!doc) {
      res.send("Not a valid book",500);
    } else if(siteUser[listName].indexOf(book_id)!=-1) {
      res.send("You already have this book on your "+action+" list.",409);
    } else {
      siteUser[listName].push(book_id);
      updateDict = {};
      updateDict[listName] = siteUser[listName];
      user.User.update({"andrew_id":siteUser.andrew_id}, updateDict,function(err){
        if(err) { console.log(err); }
        else {
          console.log("about to call this allmighty function")
          getBookList(req,res,action);
        }
      });
    }
  });
}

var getBuyListHTML = function(){}

exports.addBookToBuyList = function(req,res) {
  addToBookList(req,res,"buy");
}

exports.addBookToSellList = function(req,res) {
  addToBookList(req,res,"sell");
}

exports.removeBookFromBuyList = function(req,res) {
  removeFromBookList(req,res,"buy");
}

exports.removeBookFromSellList = function(req,res) {
  removeFromBookList(req,res,"sell");
}
