const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notificationController");
const checkAuth = require("../middlewares/checkAuth");

router.get("/", checkAuth, notificationController.fetchNotificationsForUser); 
router.patch("/:id/mark-as-read", checkAuth, notificationController.markNotificationAsRead); 

module.exports = router;