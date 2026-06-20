const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
    {
        title:       { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        deadline:    { type: Date, required: true },
        priority:    { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
        status:      { type: String, enum: ["Open", "Closed"], default: "Open" },
        marks:       { type: Number, default: 0 },
        files:       [{ name: String, path: String }],

        // Parent project
        project:     { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },

        // Admin who created it
        admin:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        // Specific users assigned (subset of project's assignedUsers)
        assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
