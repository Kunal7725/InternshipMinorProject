const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET /api/users — ADMIN sees only their own users, USER sees only themselves
const getUsers = async (req, res, next) => {
    try {
        let users;
        if (req.user.role === "ADMIN") {
            // Return only users this admin created
            users = await User.find({ createdBy: req.user._id }).select("-password");
        } else {
            // Regular user can only see their own record
            users = await User.find({ _id: req.user._id }).select("-password");
        }
        res.json({ success: true, count: users.length, data: users });
    } catch (err) {
        next(err);
    }
};

// GET /api/users/:id
const getUserById = async (req, res, next) => {
    try {
        let user;
        if (req.user.role === "ADMIN") {
            // Admin can only fetch users they own
            user = await User.findOne({ _id: req.params.id, createdBy: req.user._id }).select("-password");
        } else {
            // User can only fetch their own profile
            if (req.user._id.toString() !== req.params.id) {
                return res.status(403).json({ success: false, message: "Unauthorized access" });
            }
            user = await User.findById(req.params.id).select("-password");
        }

        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

// PUT /api/users/:id
const updateUser = async (req, res, next) => {
    try {
        let user;
        if (req.user.role === "ADMIN") {
            // Admin can only update users they own
            user = await User.findOne({ _id: req.params.id, createdBy: req.user._id });
        } else {
            // User can only update themselves
            if (req.user._id.toString() !== req.params.id) {
                return res.status(403).json({ success: false, message: "Unauthorized access" });
            }
            user = await User.findById(req.params.id);
        }

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const { name, email, password, role } = req.body;
        if (name) user.name = name;
        if (email) user.email = email;
        // Only admins are allowed to change roles
        if (role && req.user.role === "ADMIN") user.role = role;
        if (password) user.password = await bcrypt.hash(password, 10);

        const updated = await user.save();
        res.json({
            success: true,
            data: { _id: updated._id, name: updated.name, email: updated.email, role: updated.role },
        });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/users/:id — ADMIN only, enforced at route level + ownership check here
const deleteUser = async (req, res, next) => {
    try {
        // Admin can only delete users they own
        const user = await User.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!user) return res.status(404).json({ success: false, message: "User not found or not authorized" });

        await user.deleteOne();
        res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        next(err);
    }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser };
