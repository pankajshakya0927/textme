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

      chat.save()
      .then((result) => utils.sendSuccessResponse(res, 200, "Chat created successfully!", null))
      .catch((err) => utils.sendErrorResponse(res, 400, err.name, err.message));
    }
  });
};

exports.fetchChats = (req, res, next) => {
  const { username } = req.currentUser;

  const descSort = { _id: -1 }; // _id ObjectId in mongo stores timestamp
  try {
    ChatModel.find({ members: { $in: [username] } })
    .then((chats) => utils.sendSuccessResponse(res, 200, "Chats fetched successfully", chats))
    .catch((err) => utils.sendErrorResponse(res, 400, "Error", "Failed to fetch chats"))
    //.sort(descSort);
  } catch (error) {
    console.log(error);
  }
};

exports.fetchChatDetails = (req, res) => {
  const { chatId } = req;

  try {
    return ChatModel.find({ _id: chatId });
  } catch (error) {
    console.log(error);
  }
};
