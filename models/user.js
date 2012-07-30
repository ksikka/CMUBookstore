var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  _id:Schema.ObjectId,
  andrew_id: {type:String},
  name: String,
  email: [String],
  email_count:Number,

  created_at:Date,
  last_login:Date,
  password: String,

  buying_ids: [Number],
  selling_ids:[Number],
  buying_prices: [Number],
  selling_prices:[Number],
  schedule_urls: [String],
  courses: [String]
});

var User = mongoose.model('User',userSchema);

exports.userSchema = userSchema;
exports.User = User;

console.log("loaded the user model");
