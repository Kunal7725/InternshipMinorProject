const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        type:       { type: String, enum: ["project_assigned", "assignment_assigned", "deadline_reminder", "feedback_received", "submission_reviewed"], required: true },
        message:    { type: String, required: true },
        link:       { type: String, default: "" },
        isRead:     { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
