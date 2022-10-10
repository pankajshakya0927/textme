const express = require("express");
const router = express.Router();

const messageController = require("../controllers/messageController");
const checkAuth = require("../middlewares/checkAuth");

router.post("/send", checkAuth, messageController.sendMessage);
router.get("/fetchAll", checkAuth, messageController.fetchMessages);

module.exports = router;
