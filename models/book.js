var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var bookSchema = new Schema({
  _id:Number,
  title:String,
  author:String,
  isbn_old:String,
  course_ids:[String],
  pricing:Array
});
// isbn number is used as the id
bookSchema.virtual('isbn').get(function(){
  return this.id;
});

var Book = mongoose.model('Book',bookSchema);


exports.bookSchema = bookSchema;
exports.Book = Book;

console.log("loaded the book model");
