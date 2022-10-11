const ChatModel = require("../models/chat");
const utils = require("../utilities/utils");

exports.createChat = (req, res, next) => {
  const { members } = req.body;

  ChatModel.find({ members: { $all: members } }).then((chat) => {
    if (chat && chat.length) utils.sendSuccessResponse(res, 200, "Existing chat fetched successfully!", chat[0]);
    else {
      const chat = new ChatModel({
        members: members,
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
  const { username } = req.currentUser;

  const descSort = { _id: -1 }; // _id ObjectId in mongo stores timestamp
  try {
    ChatModel.find(
      { members: { $in: [username] } },
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
