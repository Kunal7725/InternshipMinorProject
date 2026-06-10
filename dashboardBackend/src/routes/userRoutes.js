const express = require("express");
const { getUsers, getUserById, updateUser, deleteUser } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const { validateUpdateUser } = require("../validators/userValidator");

const router = express.Router();

router.get("/", protect, getUsers);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, validateUpdateUser, updateUser);
router.delete("/:id", protect, adminOnly, deleteUser); // ADMIN only

module.exports = router;
