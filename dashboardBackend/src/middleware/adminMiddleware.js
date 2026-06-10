// Only ADMIN role can access protected routes
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "ADMIN") return next();
    res.status(403).json({ message: "Access denied. Admins only." });
};

module.exports = { adminOnly };
