const NotificationModel = require("../models/notification");
const utils = require("../utilities/utils");

exports.saveNotification = (req, res, next) => {
    const { receiver, sender, message, type } = req;

    // Create a new notification instance
    const notification = new NotificationModel({
        receiver,
        sender,
        message,
        type, // e.g., 'message', 'friend request', etc.
        isRead: false, // default to unread
    });

    // Save the notification to the database
    try {
        notification.save()
            .then((savedNotification) => {
                // After saving, fetch notifications for the user and emit them back to the client
                this.fetchNotificationsForUser(req, res, next);
            })
            .catch((err) => utils.sendErrorResponse(res, 400, "Error", "Failed to save notifications"))
    } catch (error) {
        console.log(error);
    }
};

// Fetch notifications for a specific user
exports.fetchNotificationsForUser = (req, res, next) => {
    const { username } = req.currentUser;

    try {
        NotificationModel.find({ receiver: username })
            .sort({ createdAt: -1 })
            .then((notifications) => utils.sendSuccessResponse(res, 200, "Notifications fetched successfully", notifications))
            .catch((err) => utils.sendErrorResponse(res, 400, "Error", "Failed to fetch notifications"))
    } catch (error) {
        console.log(error);
    }
};

// Mark notification as read
exports.markNotificationAsRead = (notificationId) => {
    NotificationModel.findById(notificationId)
        .then((notification) => {
            if (notification) {
                notification.isRead = true;
                notification.save()
                    .then(() => utils.sendSuccessResponse(res, 200, "Notification marked as read: ", notificationId))
                    .catch((err) => utils.sendErrorResponse(res, 400, "Error", "Error marking notification as read"))

            }
        })
        .catch((err) => {
            console.log(err);
        });
};