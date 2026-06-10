const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const register = async (req, res, next) => {
    const { name, email, password, role } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ success: false, message: "Email already in use" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed, role });

        res.status(201).json({
            success: true,
            data: { _id: user._id, name: user.name, email: user.email, role: user.role },
            token: generateToken(user._id),
        });
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(401).json({ success: false, message: "Invalid credentials" });

        res.json({
            success: true,
            data: { _id: user._id, name: user.name, email: user.email, role: user.role },
            token: generateToken(user._id),
        });
    } catch (err) {
        next(err);
    }
};

// GET /api/auth/me — returns the currently logged-in user from JWT
const getMe = async (req, res, next) => {
    try {
        // req.user is attached by the protect middleware
        const user = await User.findById(req.user._id).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login, getMe };
