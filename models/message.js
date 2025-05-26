const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, require: true },
    message: { type: String, require: true, trim: true },
    from: { type: String, require: true },
    to: { type: String, require: true },
    type: { type: String, enum: ["text", "audio_call", "video_call"], default: "text" }, // 'text', 'audio_call', 'video_call'
    callStatus: { type: String, enum: ["started", "ended", "missed"], required: false }, // for call logs
    duration: { type: Number, required: false }, // call duration in seconds (optional)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", schema);
