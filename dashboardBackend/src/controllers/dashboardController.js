const User = require("../models/User");

// GET /api/dashboard/stats
// Returns stats scoped to the currently logged-in admin's users only
const getDashboardStats = async (req, res, next) => {
    try {
        const stats = await User.aggregate([
            {
                // Only count users belonging to this admin
                $match: { createdBy: req.user._id },
            },
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 },
                },
            },
        ]);

        const result = { totalUsers: 0, totalAdmins: 0, totalNormalUsers: 0 };
        stats.forEach(({ _id, count }) => {
            result.totalUsers += count;
            if (_id === "ADMIN") result.totalAdmins = count;
            if (_id === "USER") result.totalNormalUsers = count;
        });

        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

module.exports = { getDashboardStats };
