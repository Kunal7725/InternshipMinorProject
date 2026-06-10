const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET /api/users — all users (admin or protected)
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select("-password");
        res.json({ success: true, count: users.length, data: users });
    } catch (err) {
        next(err);
    }
};

// GET /api/users/:id
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, data: user });
    } catch (err) {
        next(err); // CastError (bad ObjectId) handled by global error handler
    }
};

// PUT /api/users/:id
const updateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const { name, email, password, role } = req.body;
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;

        // If password is being updated, hash it before saving
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

// DELETE /api/users/:id — ADMIN only (enforced at route level)
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        await user.deleteOne();
        res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        next(err);
    }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser };
