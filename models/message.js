const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    chatId: { type: String, require: true },
    message: { type: String, require: true },
    sender: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", schema);
