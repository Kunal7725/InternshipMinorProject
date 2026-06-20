const express = require("express");
const { protect }   = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const upload        = require("../utils/upload");
const auditLog      = require("../middleware/auditMiddleware");
const { validateReviewSubmission } = require("../validators/projectValidator");
const {
    createSubmission, getSubmissions, updateSubmission, reviewSubmission,
} = require("../controllers/submissionController");

const router = express.Router();

router.get("/",                    protect, getSubmissions);
router.post("/",                   protect, upload.array("files", 5), auditLog("created_submission", "Submission"), createSubmission);
router.put("/:id",                 protect, upload.array("files", 5), updateSubmission);
router.put("/:id/review",          protect, adminOnly, validateReviewSubmission, auditLog("reviewed_submission", "Submission"), reviewSubmission);

module.exports = router;
