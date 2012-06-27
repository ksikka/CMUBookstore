var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  _id:Schema.ObjectId,
  andrew_id: {type:String},
  buying_ids: [Number],
  selling_ids:[Number],
  created_at:Date,
  last_login:Date
});

var User = mongoose.model('User',userSchema);

exports.userSchema = userSchema;
exports.User = User;

console.log("loaded the user model");
