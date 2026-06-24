const Message = require("../models/Message");
const User    = require("../models/User");
const Group   = require("../models/Group");

// ── DIRECT MESSAGES ──

// GET /api/chat/users
const getChatUsers = async (req, res) => {
  try {
    const me = req.user;
    let users;
    if (me.role === "ADMIN") {
      users = await User.find({ createdBy: me._id, role: "USER" }).select("name email role");
    } else {
      users = await User.find({ _id: me.createdBy }).select("name email role");
    }

    const withUnread = await Promise.all(
      users.map(async (u) => {
        const unread = await Message.countDocuments({ sender: u._id, receiver: me._id, read: false });
        return { ...u.toObject(), unread };
      })
    );
    res.json({ data: withUnread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/chat/messages/:userId
const getMessages = async (req, res) => {
  try {
    const me    = req.user._id;
    const other = req.params.userId;
    const messages = await Message.find({
      group: null,
      $or: [
        { sender: me,    receiver: other },
        { sender: other, receiver: me    },
      ],
    }).sort({ createdAt: 1 }).populate("sender", "name role");
    res.json({ data: messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/chat/messages/:userId/read
const markRead = async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, read: false },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GROUPS ──

// POST /api/chat/groups  — admin only
const createGroup = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ message: "Only admins can create groups" });

    const { name, description, memberIds } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Group name is required" });

    // Always include the admin as a member
    const members = [...new Set([req.user._id.toString(), ...(memberIds || [])])];

    const group = await Group.create({
      name: name.trim(),
      description: description || "",
      createdBy: req.user._id,
      members,
    });

    const populated = await group.populate("members", "name email role");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/chat/groups  — returns groups the current user belongs to
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate("members", "name email role")
      .populate("createdBy", "name")
      .sort("-createdAt");

    // Attach unread count per group
    const withUnread = await Promise.all(
      groups.map(async (g) => {
        const unread = await Message.countDocuments({
          group: g._id,
          sender: { $ne: req.user._id },
          read: false,
        });
        return { ...g.toObject(), unread };
      })
    );
    res.json({ data: withUnread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/chat/groups/:groupId/messages
const getGroupMessages = async (req, res) => {
  try {
    // Verify the user is a member
    const group = await Group.findOne({ _id: req.params.groupId, members: req.user._id });
    if (!group) return res.status(403).json({ message: "Not a member of this group" });

    const messages = await Message.find({ group: req.params.groupId })
      .sort({ createdAt: 1 })
      .populate("sender", "name role");

    res.json({ data: messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/chat/groups/:groupId  — admin only: update name/description/members
const updateGroup = async (req, res) => {
  try {
    const group = await Group.findOne({ _id: req.params.groupId, createdBy: req.user._id });
    if (!group) return res.status(404).json({ message: "Group not found or not authorized" });

    if (req.body.name)        group.name        = req.body.name.trim();
    if (req.body.description !== undefined) group.description = req.body.description;
    if (req.body.memberIds)   group.members     = [...new Set([req.user._id.toString(), ...req.body.memberIds])];

    await group.save();
    const populated = await group.populate("members", "name email role");
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/chat/groups/:groupId  — admin only
const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findOneAndDelete({ _id: req.params.groupId, createdBy: req.user._id });
    if (!group) return res.status(404).json({ message: "Group not found or not authorized" });
    // Also delete all group messages
    await Message.deleteMany({ group: req.params.groupId });
    res.json({ success: true, message: "Group deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/chat/groups/:groupId/read
const markGroupRead = async (req, res) => {
  try {
    await Message.updateMany(
      { group: req.params.groupId, sender: { $ne: req.user._id }, read: false },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getChatUsers, getMessages, markRead,
  createGroup, getGroups, getGroupMessages, updateGroup, deleteGroup, markGroupRead,
};
