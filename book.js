var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var bookSchema = new Schema({
  _id:String,
  title:String,
  author:String,
  isbn_old:String,
  course_ids:[String]
});
// isbn number is used as the id
bookSchema.virtual('isbn').get(function(){
  return this.id;
});

var Book = mongoose.model('Book',bookSchema);


exports.bookSchema = bookSchema;
exports.Book = Book;

console.log("loaded the book model");
