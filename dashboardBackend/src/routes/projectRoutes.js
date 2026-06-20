const express  = require("express");
const { protect }    = require("../middleware/authMiddleware");
const { adminOnly }  = require("../middleware/adminMiddleware");
const upload         = require("../utils/upload");
const auditLog       = require("../middleware/auditMiddleware");
const { validateCreateProject } = require("../validators/projectValidator");
const {
    createProject, getProjects, getProjectById,
    updateProject, deleteProject, getProjectStats,
} = require("../controllers/projectController");

const router = express.Router();

router.get("/stats",  protect, adminOnly, getProjectStats);
router.get("/",       protect, getProjects);
router.get("/:id",    protect, getProjectById);
router.post("/",      protect, adminOnly, upload.array("documents", 5), validateCreateProject, auditLog("created_project", "Project"), createProject);
router.put("/:id",    protect, adminOnly, upload.array("documents", 5), auditLog("updated_project", "Project"), updateProject);
router.delete("/:id", protect, adminOnly, auditLog("deleted_project", "Project"), deleteProject);

module.exports = router;
