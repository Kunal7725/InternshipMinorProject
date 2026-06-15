const { body, validationResult } = require("express-validator");

// Reusable middleware to check validation results and return errors
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
        });
    }
    next();
};

const validateRegister = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
    body("role")
        .optional()
        .isIn(["ADMIN", "USER"])
        .withMessage("Role must be ADMIN or USER"),
    body("adminCode")
        .optional()
        .isString()
        .trim()
        .withMessage("Admin Code must be a valid string"),
    handleValidation,
];

module.exports = { validateRegister };
