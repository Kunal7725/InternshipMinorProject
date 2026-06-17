const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateAdminCode } = require("../models/User");
const generateToken = require("../utils/generateToken");

// POST /api/auth/register
const register = async (req, res, next) => {
    const { name, email, password, role, adminCode } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ success: false, message: "Email already in use" });

        const hashed = await bcrypt.hash(password, 10);

        let createdBy = null;
        let userAdminCode = null;

        if (req.user && req.user.role === "ADMIN") {
            // Case 1: A logged-in Admin is creating this user from the dashboard
            createdBy = req.user._id;
        } else if (adminCode) {
            // Case 2: Self-registering user provided an admin invite code
            const adminOwner = await User.findOne({ adminCode: adminCode.toUpperCase(), role: "ADMIN" });
            if (!adminOwner) {
                return res.status(400).json({ success: false, message: "Invalid Admin Code. Please check and try again." });
            }
            createdBy = adminOwner._id;
        }

        // Case 3: No token, no adminCode → registering as a new independent Admin
        // Generate a unique adminCode for ADMIN accounts
        if (role === "ADMIN" || (!role && !createdBy)) {
            let code;
            let attempts = 0;
            do {
                code = generateAdminCode();
                attempts++;
                // Safety: avoid infinite loop
                if (attempts > 20) break;
            } while (await User.findOne({ adminCode: code })); // ensure uniqueness
            userAdminCode = code;
        }

        const finalRole = role || (createdBy ? "USER" : "ADMIN");

        const user = await User.create({
            name,
            email,
            password: hashed,
            role: finalRole,
            createdBy,
            ...(userAdminCode && { adminCode: userAdminCode }),
        });

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                adminCode: user.adminCode,
                createdBy: user.createdBy,
            },
            token: generateToken(user._id, user.role),
        });
    } catch (err) {
        next(err);
    }
};

// POST /api/auth/login
const login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(401).json({ success: false, message: "Invalid credentials" });

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                adminCode: user.adminCode,
                createdBy: user.createdBy,
            },
            token: generateToken(user._id, user.role),
        });
    } catch (err) {
        next(err);
    }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login, getMe };
