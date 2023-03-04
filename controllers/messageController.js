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
    chat.save((err, result) => {
      if (err) {
        console.log("Failed to save message!")
      } else {
        this.fetchMessages(messageReq, socket); // return all messages after saving the new message
      }
    });
  } catch (error) {
    console.log(error);
  }
};

exports.fetchMessages = (req, socket) => {
  const { chatId } = req;

  const ascSort = { '_id': 1 }; // _id ObjectId in mongo stores timestamp
  try {
    MessageModel.find({ chatId: chatId },
      (err, messages) => {
        socket.emit("fetchMessages", messages);
      },
      (err) => {
        console.log("Failed to fetch Chats");
      }
    ).sort(ascSort);
  } catch (error) {
    console.log(error);
  }
};
