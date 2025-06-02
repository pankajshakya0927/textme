const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chatController");
const checkAuth = require("../middlewares/checkAuth");

router.post("/createChat", checkAuth, chatController.createChat);
router.get("/fetchChats", checkAuth, chatController.fetchChats);

module.exports = router;
