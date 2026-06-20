const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
    {
        actor:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        action:     { type: String, required: true },   // e.g. "created_project", "reviewed_submission"
        entity:     { type: String, required: true },   // e.g. "Project", "Submission"
        entityId:   { type: mongoose.Schema.Types.ObjectId },
        meta:       { type: mongoose.Schema.Types.Mixed, default: {} },
        ip:         { type: String, default: "" },
    },
    { timestamps: true }
);

activityLogSchema.index({ actor: 1, createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
