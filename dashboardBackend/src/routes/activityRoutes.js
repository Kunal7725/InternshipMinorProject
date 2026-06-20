const express = require("express");
const { protect }    = require("../middleware/authMiddleware");
const { adminOnly }  = require("../middleware/adminMiddleware");
const { getActivityLogs } = require("../controllers/activityController");

const router = express.Router();

router.get("/", protect, adminOnly, getActivityLogs);

module.exports = router;
