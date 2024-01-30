const MessageModel = require("../models/message");

exports.saveMessage = (messageReq, socket) => {
  const { chatId, message, from, to } = messageReq;

  const chat = new MessageModel({
    chatId,
    message,
    from,
    to,
  });

  try {
    chat.save()
    .then((chats) => this.fetchMessages(messageReq, socket)) // return all messages after saving the new message
    .catch((err) => console.log("Failed to save message!"))
  } catch (error) {
    console.log(error);
  }
};

exports.fetchMessages = (req, socket) => {
  const { chatId } = req;

  const ascSort = { '_id': 1 }; // _id ObjectId in mongo stores timestamp
  try {
    MessageModel.find({ chatId: chatId })
    .then((messages) => socket.emit("fetchMessages", messages))
    .catch((err) => console.log("Failed to fetch Chats"))
  } catch (error) {
    console.log(error);
  }
};
