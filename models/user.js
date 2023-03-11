const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const schema = mongoose.Schema({
  firstName: { type: String},
  lastName: { type: String},
  username: { type: String, require: true, unique: true, lowercase: true, trim: true },
  password: { type: String, require: true },
  securityQ: { type: Number},
  securityA: { type: String},
  friends: { type: Array }
},
{ timestamps: true },
);

schema.plugin(uniqueValidator);

module.exports = mongoose.model("User", schema);
