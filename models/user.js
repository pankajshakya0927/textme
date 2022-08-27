const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const schema = mongoose.Schema({
  firstName: { type: String},
  lastName: { type: String},
  userId: { type: String, require: true, unique: true },
  password: { type: String, require: true },
  securityQ: { type: Number},
  securityA: { type: String}
},
{ timestamps: true}
);

schema.plugin(uniqueValidator);

module.exports = mongoose.model("User", schema);
