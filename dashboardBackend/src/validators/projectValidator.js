const { body, query, validationResult } = require("express-validator");

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
        });
    next();
};

const validateCreateProject = [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("priority").optional().isIn(["Low", "Medium", "High"]).withMessage("Invalid priority"),
    body("status").optional().isIn(["Planning", "Active", "On Hold", "Completed", "Archived"]).withMessage("Invalid status"),
    body("estimatedHours").optional().isNumeric().withMessage("Estimated hours must be a number"),
    body("dueDate").optional().isISO8601().withMessage("Invalid due date"),
    handleValidation,
];

const validateCreateAssignment = [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("deadline").notEmpty().isISO8601().withMessage("Valid deadline date is required"),
    body("priority").optional().isIn(["Low", "Medium", "High"]).withMessage("Invalid priority"),
    body("projectId").notEmpty().withMessage("Project ID is required"),
    handleValidation,
];

const validateReviewSubmission = [
    body("reviewStatus").isIn(["Approved", "Rejected", "Changes Requested"]).withMessage("Invalid review status"),
    body("rating").optional().isFloat({ min: 0, max: 5 }).withMessage("Rating must be between 0 and 5"),
    body("marksAwarded").optional().isNumeric().withMessage("Marks must be a number"),
    handleValidation,
];

module.exports = { validateCreateProject, validateCreateAssignment, validateReviewSubmission };
