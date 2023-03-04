const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, require: true },
    message: { type: String, require: true, trim: true },
    from: { type: String, require: true },
    to: { type: String, require: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", schema);
