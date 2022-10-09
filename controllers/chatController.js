const ChatModel = require("../models/chat");
const utils = require("../utilities/utils");

exports.createChat = (req, res, next) => {
  const { chatName, members } = req.body;
  const currentUser = req.currentUser;

  ChatModel.findOne({ chatName: chatName }).then((chat) => {
    if (chat) utils.sendSuccessResponse(res, 200, "Existing chat fetched successfully!", chat);
    else {
      const chat = new ChatModel({
        chatName: chatName,
        members: members,
        username: currentUser.username,
      });

      chat.save((err, result) => {
        if (err) {
          utils.sendErrorResponse(res, 400, err.name, err.message);
        } else {
          utils.sendSuccessResponse(res, 200, "Chat created successfully!", result);
        }
      });
    }
  });
};

exports.fetchChats = (req, res, next) => {
  const currentUser = req.currentUser;

  const descSort = {'_id': -1}; // _id ObjectId in mongo stores timestamp
  try {
    ChatModel.find(
      { username: currentUser.username },
      (err, chats) => {
        utils.sendSuccessResponse(res, 200, "Chats fetched successfully", chats);
      },
      (err) => {
        utils.sendErrorResponse(res, 400, "Error", "Failed to fetch chats");
      }
    ).sort(descSort);
  } catch (error) {
    console.log(error);
  }
};
