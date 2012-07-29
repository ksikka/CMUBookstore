var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  _id:Schema.ObjectId,
  andrew_id: {type:String},
  name: String,
  buying_ids: [Number],
  selling_ids:[Number],
  created_at:Date,
  last_login:Date,
  email: [String],
  email_count:Number,
  password: String,
  schedule_urls: [String],
  courses: [String]
});

var User = mongoose.model('User',userSchema);

exports.userSchema = userSchema;
exports.User = User;

console.log("loaded the user model");
