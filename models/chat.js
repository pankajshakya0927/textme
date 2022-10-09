const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const schema = mongoose.Schema(
  {
    chatName: { type: String },
    members: { type: Array },
    username: { type: String, require: true },
  },
  { timestamps: true }
);

schema.plugin(uniqueValidator);

module.exports = mongoose.model("Chat", schema);
