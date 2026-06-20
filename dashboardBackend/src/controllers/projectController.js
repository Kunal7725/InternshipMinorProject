const Project = require("../models/Project");
const notify  = require("../utils/notify");

// POST /api/projects
const createProject = async (req, res, next) => {
    try {
        const { title, description, priority, techStack, startDate, dueDate, estimatedHours, assignedUsers } = req.body;

        const documents = req.files ? req.files.map(f => ({ name: f.originalname, path: f.filename })) : [];

        const project = await Project.create({
            title, description, priority,
            techStack: techStack ? JSON.parse(techStack) : [],
            startDate, dueDate, estimatedHours,
            assignedUsers: assignedUsers ? JSON.parse(assignedUsers) : [],
            documents,
            admin: req.user._id,
        });

        // Notify each assigned user
        const users = assignedUsers ? JSON.parse(assignedUsers) : [];
        for (const uid of users) {
            await notify(uid, "project_assigned", `You have been assigned to project: ${title}`, `/projects/${project._id}`);
        }

        res.status(201).json({ success: true, data: project });
    } catch (err) { next(err); }
};

// GET /api/projects
const getProjects = async (req, res, next) => {
    try {
        const { status, priority, search, page = 1, limit = 10, sort = "-createdAt" } = req.query;

        const filter = req.user.role === "ADMIN"
            ? { admin: req.user._id }
            : { assignedUsers: req.user._id };

        if (status)   filter.status   = status;
        if (priority) filter.priority = priority;
        if (search)   filter.title    = { $regex: search, $options: "i" };

        const total    = await Project.countDocuments(filter);
        const projects = await Project.find(filter)
            .populate("assignedUsers", "name email")
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({ success: true, total, page: Number(page), data: projects });
    } catch (err) { next(err); }
};

// GET /api/projects/:id
const getProjectById = async (req, res, next) => {
    try {
        const filter = req.user.role === "ADMIN"
            ? { _id: req.params.id, admin: req.user._id }
            : { _id: req.params.id, assignedUsers: req.user._id };

        const project = await Project.findOne(filter).populate("assignedUsers", "name email");
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

        res.json({ success: true, data: project });
    } catch (err) { next(err); }
};

// PUT /api/projects/:id
const updateProject = async (req, res, next) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, admin: req.user._id });
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

        const fields = ["title", "description", "priority", "startDate", "dueDate", "status", "estimatedHours"];
        fields.forEach(f => { if (req.body[f] !== undefined) project[f] = req.body[f]; });

        if (req.body.techStack)     project.techStack     = JSON.parse(req.body.techStack);
        if (req.body.assignedUsers) project.assignedUsers = JSON.parse(req.body.assignedUsers);
        if (req.files?.length)      project.documents.push(...req.files.map(f => ({ name: f.originalname, path: f.filename })));

        await project.save();
        res.json({ success: true, data: project });
    } catch (err) { next(err); }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findOneAndDelete({ _id: req.params.id, admin: req.user._id });
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });
        res.json({ success: true, message: "Project deleted" });
    } catch (err) { next(err); }
};

// GET /api/projects/stats  — admin dashboard analytics
const getProjectStats = async (req, res, next) => {
    try {
        const adminId = req.user._id;
        const [statusGroups, total] = await Promise.all([
            Project.aggregate([
                { $match: { admin: adminId } },
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
            Project.countDocuments({ admin: adminId }),
        ]);

        const stats = { total, Planning: 0, Active: 0, "On Hold": 0, Completed: 0, Archived: 0 };
        statusGroups.forEach(({ _id, count }) => { stats[_id] = count; });

        res.json({ success: true, data: stats });
    } catch (err) { next(err); }
};

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject, getProjectStats };
