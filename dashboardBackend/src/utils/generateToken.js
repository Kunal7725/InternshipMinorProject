const jwt = require("jsonwebtoken");

// Include role in payload so middleware can do role checks without extra DB queries
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

module.exports = generateToken;
