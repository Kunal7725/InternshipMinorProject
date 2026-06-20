const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getNotifications, markAllRead, markOneRead } = require("../controllers/notificationController");

const router = express.Router();

router.get("/",              protect, getNotifications);
router.put("/read-all",      protect, markAllRead);
router.put("/:id/read",      protect, markOneRead);

module.exports = router;
