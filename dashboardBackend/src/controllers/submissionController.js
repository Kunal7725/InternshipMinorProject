const Submission  = require("../models/Submission");
const Assignment  = require("../models/Assignment");
const notify      = require("../utils/notify");

// POST /api/submissions  — user submits work
const createSubmission = async (req, res, next) => {
    try {
        const { assignmentId, githubLink, liveUrl, documentation, notes, progress } = req.body;

        const assignment = await Assignment.findOne({ _id: assignmentId, assignedUsers: req.user._id });
        if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });

        // Prevent duplicate submissions — one per user per assignment
        const exists = await Submission.findOne({ assignment: assignmentId, user: req.user._id });
        if (exists) return res.status(400).json({ success: false, message: "Already submitted. Use update instead." });

        const now    = new Date();
        const isLate = assignment.deadline && now > new Date(assignment.deadline);
        const files  = req.files ? req.files.map(f => ({ name: f.originalname, path: f.filename })) : [];

        const submission = await Submission.create({
            assignment: assignmentId,
            project:    assignment.project,
            user:       req.user._id,
            githubLink, liveUrl, documentation, notes,
            files, progress: progress || "In Progress",
            submittedAt: now,
            isLate,
        });

        // Notify admin
        await notify(assignment.admin, "submission_reviewed",
            `${req.user.name} submitted assignment: ${assignment.title}`,
            `/submissions/${submission._id}`);

        res.status(201).json({ success: true, data: submission });
    } catch (err) { next(err); }
};

// GET /api/submissions — admin sees all their submissions, user sees their own
const getSubmissions = async (req, res, next) => {
    try {
        const { assignmentId, projectId, reviewStatus, page = 1, limit = 20 } = req.query;
        const filter = {};

        if (req.user.role === "USER") {
            filter.user = req.user._id;
        }

        if (assignmentId)  filter.assignment    = assignmentId;
        if (projectId)     filter.project       = projectId;
        if (reviewStatus)  filter.reviewStatus  = reviewStatus;

        const total = await Submission.countDocuments(filter);
        const data  = await Submission.find(filter)
            .populate("user",       "name email")
            .populate("assignment", "title deadline marks")
            .populate("project",    "title")
            .sort("-submittedAt")
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({ success: true, total, data });
    } catch (err) { next(err); }
};

// PUT /api/submissions/:id — user updates progress / content before review
const updateSubmission = async (req, res, next) => {
    try {
        const submission = await Submission.findOne({ _id: req.params.id, user: req.user._id });
        if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

        const fields = ["githubLink", "liveUrl", "documentation", "notes", "progress"];
        fields.forEach(f => { if (req.body[f] !== undefined) submission[f] = req.body[f]; });
        if (req.files?.length) submission.files.push(...req.files.map(f => ({ name: f.originalname, path: f.filename })));

        await submission.save();
        res.json({ success: true, data: submission });
    } catch (err) { next(err); }
};

// PUT /api/submissions/:id/review — admin reviews a submission
const reviewSubmission = async (req, res, next) => {
    try {
        const { reviewStatus, feedback, rating, marksAwarded } = req.body;

        const submission = await Submission.findById(req.params.id).populate("assignment");
        if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

        // Ensure admin owns the assignment
        if (submission.assignment.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        submission.reviewStatus  = reviewStatus  || submission.reviewStatus;
        submission.feedback      = feedback      ?? submission.feedback;
        submission.rating        = rating        ?? submission.rating;
        submission.marksAwarded  = marksAwarded  ?? submission.marksAwarded;
        submission.reviewedAt    = new Date();
        submission.reviewedBy    = req.user._id;

        await submission.save();

        // Notify user
        await notify(submission.user, "feedback_received",
            `Your submission has been reviewed: ${reviewStatus}`,
            `/submissions/${submission._id}`);

        res.json({ success: true, data: submission });
    } catch (err) { next(err); }
};

module.exports = { createSubmission, getSubmissions, updateSubmission, reviewSubmission };
