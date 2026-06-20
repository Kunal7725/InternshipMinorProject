const User       = require("../models/User");
const Project    = require("../models/Project");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");

// GET /api/dashboard/stats
const getDashboardStats = async (req, res, next) => {
    try {
        if (req.user.role === "ADMIN") {
            const adminId = req.user._id;

            const [userStats, projectStats, pendingReviews] = await Promise.all([
                User.aggregate([
                    { $match: { createdBy: adminId } },
                    { $group: { _id: "$role", count: { $sum: 1 } } },
                ]),
                Project.aggregate([
                    { $match: { admin: adminId } },
                    { $group: { _id: "$status", count: { $sum: 1 } } },
                ]),
                Submission.countDocuments({
                    reviewStatus: "Pending",
                    project: { $in: await Project.distinct("_id", { admin: adminId }) },
                }),
            ]);

            const users    = { total: 0, admins: 0, normal: 0 };
            const projects = { total: 0, Active: 0, Completed: 0, Planning: 0, "On Hold": 0, Archived: 0 };

            userStats.forEach(({ _id, count }) => {
                users.total += count;
                if (_id === "ADMIN") users.admins = count;
                if (_id === "USER")  users.normal = count;
            });

            projectStats.forEach(({ _id, count }) => {
                projects.total += count;
                projects[_id]   = count;
            });

            return res.json({ success: true, data: { users, projects, pendingReviews } });
        }

        // USER dashboard
        const userId = req.user._id;
        const [assignedProjects, completedProjects, pendingTasks, upcomingDeadlines] = await Promise.all([
            Project.countDocuments({ assignedUsers: userId }),
            Project.countDocuments({ assignedUsers: userId, status: "Completed" }),
            Assignment.countDocuments({ assignedUsers: userId, status: "Open" }),
            Assignment.find({ assignedUsers: userId, deadline: { $gte: new Date() } })
                .sort("deadline").limit(5).select("title deadline priority"),
        ]);

        // Performance score = avg marks awarded on reviewed submissions
        const reviewed = await Submission.find({ user: userId, reviewStatus: "Approved" }).select("marksAwarded");
        const avgScore = reviewed.length
            ? Math.round(reviewed.reduce((s, r) => s + (r.marksAwarded || 0), 0) / reviewed.length)
            : 0;

        res.json({ success: true, data: { assignedProjects, completedProjects, pendingTasks, upcomingDeadlines, performanceScore: avgScore } });
    } catch (err) { next(err); }
};

module.exports = { getDashboardStats };
