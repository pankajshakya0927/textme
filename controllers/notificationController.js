const NotificationModel = require("../models/notification");
const utils = require("../utilities/utils");

exports.saveSentNotification = (req, socket) => {
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
        notification.save();
    } catch (error) {
        console.log(error);
    }
};

// Fetch notifications for a specific user
exports.fetchNotifications = (req, res, next) => {
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
exports.markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;  // Get notification ID from request parameters

        const notification = await NotificationModel.findById(id);
        if (!notification) {
            return utils.sendErrorResponse(res, 404, "Error", "Notification not found");
        }

        notification.isRead = true;
        await notification.save();

        return utils.sendSuccessResponse(res, 200, "Notification marked as read", id);
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return utils.sendErrorResponse(res, 500, "Error", "Internal server error");
    }
};
