const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    members: { type: Array },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", schema);
