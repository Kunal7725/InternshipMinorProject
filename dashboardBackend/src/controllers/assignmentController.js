const Assignment = require("../models/Assignment");
const Project    = require("../models/Project");
const notify     = require("../utils/notify");

// POST /api/assignments
const createAssignment = async (req, res, next) => {
    try {
        const { title, description, deadline, priority, marks, projectId, assignedUsers } = req.body;

        const project = await Project.findOne({ _id: projectId, admin: req.user._id });
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

        const files = req.files ? req.files.map(f => ({ name: f.originalname, path: f.filename })) : [];
        // If no users explicitly selected, use all users already on the project
        const users = assignedUsers ? JSON.parse(assignedUsers) : project.assignedUsers.map(id => id.toString());

        const assignment = await Assignment.create({
            title, description, deadline, priority, marks,
            files, project: projectId,
            admin: req.user._id,
            assignedUsers: users,
        });

        for (const uid of users) {
            await notify(uid, "assignment_assigned", `New assignment: ${title}`, `/assignments/${assignment._id}`);
        }

        res.status(201).json({ success: true, data: assignment });
    } catch (err) { next(err); }
};

// GET /api/assignments?projectId=xxx
const getAssignments = async (req, res, next) => {
    try {
        const { projectId, status, priority, page = 1, limit = 20 } = req.query;

        const filter = req.user.role === "ADMIN"
            ? { admin: req.user._id }
            : { assignedUsers: req.user._id };

        if (projectId) filter.project  = projectId;
        if (status)    filter.status   = status;
        if (priority)  filter.priority = priority;

        const total = await Assignment.countDocuments(filter);
        const data  = await Assignment.find(filter)
            .populate("project", "title")
            .sort("-createdAt")
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({ success: true, total, data });
    } catch (err) { next(err); }
};

// GET /api/assignments/:id
const getAssignmentById = async (req, res, next) => {
    try {
        const filter = req.user.role === "ADMIN"
            ? { _id: req.params.id, admin: req.user._id }
            : { _id: req.params.id, assignedUsers: req.user._id };

        const assignment = await Assignment.findOne(filter).populate("project", "title dueDate");
        if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });

        res.json({ success: true, data: assignment });
    } catch (err) { next(err); }
};

// PUT /api/assignments/:id
const updateAssignment = async (req, res, next) => {
    try {
        const assignment = await Assignment.findOne({ _id: req.params.id, admin: req.user._id });
        if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });

        const fields = ["title", "description", "deadline", "priority", "status", "marks"];
        fields.forEach(f => { if (req.body[f] !== undefined) assignment[f] = req.body[f]; });
        if (req.files?.length) assignment.files.push(...req.files.map(f => ({ name: f.originalname, path: f.filename })));

        await assignment.save();
        res.json({ success: true, data: assignment });
    } catch (err) { next(err); }
};

// DELETE /api/assignments/:id
const deleteAssignment = async (req, res, next) => {
    try {
        const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, admin: req.user._id });
        if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });
        res.json({ success: true, message: "Assignment deleted" });
    } catch (err) { next(err); }
};

module.exports = { createAssignment, getAssignments, getAssignmentById, updateAssignment, deleteAssignment };
