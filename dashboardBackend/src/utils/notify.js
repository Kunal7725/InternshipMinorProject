const Notification = require("../models/Notification");

const notify = async (recipientId, type, message, link = "") => {
    try {
        await Notification.create({ recipient: recipientId, type, message, link });
    } catch (err) {
        // Notifications are non-critical — log and continue
        console.error("Notification error:", err.message);
    }
};

module.exports = notify;
