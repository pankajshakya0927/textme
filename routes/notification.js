const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notificationController");
const checkAuth = require("../middlewares/checkAuth");

router.get("/", checkAuth, notificationController.fetchNotifications); 
router.patch("/:id/markAsRead", checkAuth, notificationController.markNotificationAsRead); 

module.exports = router;