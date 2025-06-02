const mongoose = require('mongoose');

const UsedUsernameSchema = new mongoose.Schema({
  username: { type: String, required: true },
  token: { type: String, required: true }
}, { _id: false });

const MessageSchema = new mongoose.Schema({
  type: { type: String, enum: ['group', 'private'], required: true },
  from: { type: String, required: true },
  to: { type: String }, // Only for private messages
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const ChatRoomSchema = new mongoose.Schema({
  roomName: { type: String, required: true, unique: true },
  usedUsernames: [UsedUsernameSchema],
  messages: [MessageSchema]
});

module.exports = mongoose.model('ChatRoom', ChatRoomSchema);
