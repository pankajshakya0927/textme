const MessageModel = require("../models/message");
const utils = require("../utilities/utils");

exports.sendMessage = (req, res, next) => {
  const { chatId, message } = req.body;
  const { username } = req.currentUser;

  const chat = new MessageModel({
    chatId: chatId,
    sender: username,
    message: message,
  });

  chat.save((err, result) => {
    if (err) {
      utils.sendErrorResponse(res, 400, err.name, err.message);
    } else {
      utils.sendSuccessResponse(res, 200, "Message sent successfully!", null);
    }
  });
};

exports.fetchMessages = (req, res, next) => {
  const { chatId } = req.query;

  const ascSort = {'_id': 1}; // _id ObjectId in mongo stores timestamp
  try {
    MessageModel.find(
      { chatId: chatId },
      (err, messages) => {
        utils.sendSuccessResponse(res, 200, "Messages fetched successfully", messages);
      },
      (err) => {
        utils.sendErrorResponse(res, 400, "Error", "Failed to fetch chats");
      }
    ).sort(ascSort);
  } catch (error) {
    console.log(error);
  }
};
