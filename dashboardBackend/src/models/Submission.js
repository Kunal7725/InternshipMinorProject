const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
    {
        assignment:    { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
        project:       { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
        user:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        // Submission content
        githubLink:    { type: String, default: "" },
        liveUrl:       { type: String, default: "" },
        documentation: { type: String, default: "" },
        notes:         { type: String, default: "" },
        files:         [{ name: String, path: String }],

        // Progress tracking
        progress:      { type: String, enum: ["Not Started", "In Progress", "Completed", "Under Review"], default: "Not Started" },

        // Auto-computed
        submittedAt:   { type: Date },
        isLate:        { type: Boolean, default: false },

        // Review
        reviewStatus:  { type: String, enum: ["Pending", "Approved", "Rejected", "Changes Requested"], default: "Pending" },
        feedback:      { type: String, default: "" },
        rating:        { type: Number, min: 0, max: 5, default: null },
        marksAwarded:  { type: Number, default: null },
        reviewedAt:    { type: Date },
        reviewedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
