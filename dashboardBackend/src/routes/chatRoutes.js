const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getChatUsers, getMessages, markRead,
  createGroup, getGroups, getGroupMessages, updateGroup, deleteGroup, markGroupRead,
} = require("../controllers/chatController");

const router = express.Router();
router.use(protect);

// Direct messages
router.get("/users",                  getChatUsers);
router.get("/messages/:userId",       getMessages);
router.put("/messages/:userId/read",  markRead);

// Groups
router.post("/groups",                      createGroup);
router.get("/groups",                       getGroups);
router.get("/groups/:groupId/messages",     getGroupMessages);
router.put("/groups/:groupId",              updateGroup);
router.delete("/groups/:groupId",           deleteGroup);
router.put("/groups/:groupId/read",         markGroupRead);

module.exports = router;
