const ActivityLog = require("../models/ActivityLog");

// GET /api/activity — admin sees their own actions, paginated
const getActivityLogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 30, entity } = req.query;
        const filter = { actor: req.user._id };
        if (entity) filter.entity = entity;

        const total = await ActivityLog.countDocuments(filter);
        const logs  = await ActivityLog.find(filter)
            .sort("-createdAt")
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({ success: true, total, page: Number(page), data: logs });
    } catch (err) { next(err); }
};

module.exports = { getActivityLogs };
