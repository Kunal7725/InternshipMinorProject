const User = require("../models/User");

// GET /api/dashboard/stats
// Uses a single aggregation pipeline — more efficient than multiple countDocuments calls
const getDashboardStats = async (req, res, next) => {
    try {
        const stats = await User.aggregate([
            {
                $group: {
                    _id: "$role",       // group by role field
                    count: { $sum: 1 }, // count docs per group
                },
            },
        ]);

        // Transform array result into a readable object
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
