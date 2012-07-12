var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var courseSchema = new Schema({
  _id:String,
  name:String,
  required_book_ids:[Number],
  other_book_ids:[Number]
});
courseSchema.virtual('course_number').get(function(){
  return this.id;
});

var Course = mongoose.model('Course',courseSchema);

exports.courseSchema = courseSchema;
exports.Course = Course;

console.log("loaded the course model");
