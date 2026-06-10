const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validateRegister } = require("../validators/authValidator");

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", login);
router.get("/me", protect, getMe); // protected — requires valid JWT

module.exports = router;
