const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validateRegister } = require("../validators/authValidator");

const router = express.Router();

// Public self-registration (no token) → becomes Admin with createdBy = null
// Called by a logged-in Admin → creates User with createdBy = admin._id
// optionalProtect allows both cases on the same route
router.post("/register", optionalProtect, validateRegister, register);
router.post("/login", login);
router.get("/me", protect, getMe);

// Attaches req.user if a valid token is present, but does NOT block if missing
function optionalProtect(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return next(); // no token, continue as guest
    const jwt = require("jsonwebtoken");
    const User = require("../models/User");
    jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET, async (err, decoded) => {
        if (!err && decoded) {
            req.user = await User.findById(decoded.id).select("-password");
        }
        next();
    });
}

module.exports = router;
