const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        title:          { type: String, required: true, trim: true },
        description:    { type: String, default: "" },
        priority:       { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
        techStack:      [{ type: String, trim: true }],
        startDate:      { type: Date },
        dueDate:        { type: Date },
        status:         { type: String, enum: ["Planning", "Active", "On Hold", "Completed", "Archived"], default: "Planning" },
        estimatedHours: { type: Number, default: 0 },
        documents:      [{ name: String, path: String }],

        // Admin who created this project
        admin:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        // Users assigned to this project
        assignedUsers:  [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
