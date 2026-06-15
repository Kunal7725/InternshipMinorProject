const express = require("express");
const { getUsers, getUserById, updateUser, deleteUser } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const { validateUpdateUser } = require("../validators/userValidator");

const router = express.Router();

// GET all — ADMIN sees their users, USER sees only themselves (handled in controller)
router.get("/", protect, getUsers);
// GET by id — ownership enforced in controller
router.get("/:id", protect, getUserById);
// PUT — ownership enforced in controller
router.put("/:id", protect, validateUpdateUser, updateUser);
// DELETE — ADMIN only at route level + ownership check in controller
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;
