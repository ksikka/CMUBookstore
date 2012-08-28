var user = require('../models/user'),
    book = require('../models/book');
    email = require('../email.js');

exports.expandedView = function(req,res,action){
  var book_id = req.params.isbn;
  book.Book.findOne({_id:book_id},function(err,doc){
    if(err) {
      console.log(err);
      res.send("No such book in the DB",500);
    } else {
      res.partial('expanded_book',{book:doc});
    }
  });
};

// zips the lists in a dictionary
function buildPriceDict(book_ids,prices) {
  var priceDict = {};
  for(var i = 0; i < book_ids.length; i++) {
    priceDict[book_ids[i].toString()] = prices[i];
  }
  return priceDict;
}

// returns a json with the html of the list
var getBookList = function(req,res,action,callback){
  var listName = action+"ing_ids";
  var list2Name = action+"ing_prices";
  userFromSession = req.session.user;
  user.User.findOne({"andrew_id":userFromSession.andrew_id},function(err,siteUser){
    if(err) { console.log(err); }
    else {
      var listOfIds = siteUser[listName];
      var listOfPrices = siteUser[list2Name];
      var priceDict = buildPriceDict(listOfIds,listOfPrices);
      console.log(priceDict);
      book.Book.find({"_id":{"$in":listOfIds}}).run(function(err,books){
        if(err){console.log(err);} else{
          res.partial("book_list",{list:books,priceDict:priceDict,action:action},function(err,htmlString){
            if(callback)
              callback({html:htmlString});
            else
              res.json({html:htmlString});
          });
        }
      });
    }
  });
}

exports.getBuyList = function(req,res){getBookList(req,res,"buy")};
exports.getSellList = function(req,res){getBookList(req,res,"sell")};

//bad code. this all needs refactoring. but i'll do it later.
function getAllList(req,res){
  getBookList(req,res,"buy",function(b){
    getBookList(req,res,"sell",function(s){
      res.send({ html: (b.html+s.html) });
    });
  });
}
exports.getAllList = getAllList;

var removeFromBookList = function(req,res,action){
  var listName = action+"ing_ids";
  var list2Name = action+"ing_prices";
  // TODO validate price
  var siteUser = req.session.user;
  var book_id = parseInt(req.body.book_id);
  book.Book.findOne({"_id":book_id}).run(function(err,doc) {
    if(!doc) {
      res.send("Not a valid book",500);
    } else if(siteUser[listName].indexOf(book_id)==-1) {
      res.send("You can't remove this book if it's not on your "+action+" list.",409);
    } else {
      var indexOfBook = siteUser[listName].indexOf(book_id);
      siteUser[listName].splice(indexOfBook,1);
      siteUser[list2Name].splice(indexOfBook,1);
      updateDict = {};
      updateDict[listName] = siteUser[listName];
      updateDict[list2Name] = siteUser[list2Name];
      user.User.update({"andrew_id":siteUser.andrew_id}, updateDict,function(err){
        if(err) { console.log(err); }
        else {
          // could be done more efficiently, but whatever, not too expensive
          getAllList(req,res);
        }
      });
    }
  });
}

var addToBookList = function(req,res,action){
  var listName = action+"ing_ids";
  var list2Name = action+"ing_prices";
  // TODO validate price
  var siteUser = req.session.user;
  var book_id = parseInt(req.body.book_id);
  var minmaxprice = parseInt(req.body.price,10);
  book.Book.findOne({"_id":book_id}).run(function(err,doc) {
    if(!doc) {
      res.send("Not a valid book",500);
    } else if(siteUser[listName].indexOf(book_id)!=-1) {
      res.send("You already have this book on your "+action+" list.",409);
    } else {
      siteUser[listName].push(book_id);
      siteUser[list2Name].push(minmaxprice);
      updateDict = {};
      updateDict[listName] = siteUser[listName];
      updateDict[list2Name] = siteUser[list2Name];
      user.User.update({"andrew_id":siteUser.andrew_id}, updateDict,function(err){
        if(err) { console.log(err); }
        else {
          // could be done more efficiently, but whatever, not too expensive
          email.notifyUsers(siteUser,action,doc,minmaxprice);
          getAllList(req,res);
        }
      });
    }
  });
}

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

