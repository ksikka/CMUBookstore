var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  _id:Schema.ObjectId,
  andrew_id: {type:String, required:true},
  name: {type:String, required:true},
  email: {type:[String], required:true},
  email_count: {type:Number, default:0},

  created_at: {type:Date, default:null},
  last_login: {type:Date, default:null},
  password: {type:String, default:null},

  buying_ids: {type:[Number], default: []},
  selling_ids:{type:[Number], default: []},
  buying_prices: {type:[Number], default: []},
  selling_prices:{type:[Number], default: []},
  courses: {type:[String], default: []},

  departments: {type:[String], default: []},
  year: {type:String, default: null}
});

var User = mongoose.model('User',userSchema);

exports.userSchema = userSchema;
exports.User = User;

console.log("loaded the user model");
