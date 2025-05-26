const MessageModel = require("../models/message");

exports.saveMessage = (messageReq, socket) => {
  // Destructure all possible fields for text and call log messages
  const { chatId, message, from, to, type, callStatus, duration } = messageReq;

  // Build the message object, including call log fields if present
  const chat = new MessageModel({
    chatId,
    message,
    from,
    to,
    type: type || "text",
    callStatus,
    duration
  });

  try {
    chat.save()
    .then(() => this.fetchMessages(messageReq, socket)) // return all messages after saving the new message
    .catch((err) => console.log("Failed to save message!"))
  } catch (error) {
    console.log(error);
  }
};

exports.fetchMessages = (req, socket) => {
  const { chatId } = req;
  const ascSort = { '_id': 1 };
  try {
    MessageModel.find({ chatId: chatId }).sort(ascSort)
    .then((messages) => socket.emit("fetchMessages", messages))
    .catch((err) => console.log("Failed to fetch Chats"))
  } catch (error) {
    console.log(error);
  }
};
