const express = require("express");
const { protect }   = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const upload        = require("../utils/upload");
const auditLog      = require("../middleware/auditMiddleware");
const { validateCreateAssignment } = require("../validators/projectValidator");
const {
    createAssignment, getAssignments, getAssignmentById,
    updateAssignment, deleteAssignment,
} = require("../controllers/assignmentController");

const router = express.Router();

router.get("/",       protect, getAssignments);
router.get("/:id",    protect, getAssignmentById);
router.post("/",      protect, adminOnly, upload.array("files", 5), validateCreateAssignment, auditLog("created_assignment", "Assignment"), createAssignment);
router.put("/:id",    protect, adminOnly, upload.array("files", 5), auditLog("updated_assignment", "Assignment"), updateAssignment);
router.delete("/:id", protect, adminOnly, auditLog("deleted_assignment", "Assignment"), deleteAssignment);

module.exports = router;
