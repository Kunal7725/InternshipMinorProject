require("dotenv").config();

const http       = require("http");
const { Server } = require("socket.io");
const jwt        = require("jsonwebtoken");
const User       = require("./models/User");
const Message    = require("./models/Message");
const Group      = require("./models/Group");
const app        = require("./app");
const connectDB  = require("./config/db");
const sendDeadlineReminders = require("./utils/deadlineReminder");

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
});

const onlineUsers = new Map(); // userId → socketId

// ── JWT middleware ──
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select("-password");
    if (!user) return next(new Error("User not found"));
    socket.user = user;
    next();
  } catch {
    next(new Error("Auth failed"));
  }
});

io.on("connection", async (socket) => {
  const userId = socket.user._id.toString();

  // Mark online & join personal room
  onlineUsers.set(userId, socket.id);
  socket.join(userId);
  io.emit("online_users", Array.from(onlineUsers.keys()));

  // Join all group rooms this user belongs to
  const userGroups = await Group.find({ members: socket.user._id }).select("_id");
  userGroups.forEach((g) => socket.join(`group:${g._id.toString()}`));

  // ── Direct message ──
  socket.on("send_message", async ({ receiverId, text }) => {
    if (!text?.trim() || !receiverId) return;
    const msg       = await Message.create({ sender: socket.user._id, receiver: receiverId, text: text.trim() });
    const populated = await msg.populate("sender", "name role");
    io.to(receiverId).emit("receive_message", populated);
    socket.emit("receive_message", populated);
  });

  // ── Group message ──
  socket.on("send_group_message", async ({ groupId, text }) => {
    if (!text?.trim() || !groupId) return;

    // Verify sender is a member
    const group = await Group.findOne({ _id: groupId, members: socket.user._id });
    if (!group) return;

    const msg       = await Message.create({ sender: socket.user._id, group: groupId, text: text.trim() });
    const populated = await msg.populate("sender", "name role");

    // Broadcast to everyone in the group room (including sender)
    io.to(`group:${groupId}`).emit("receive_group_message", { groupId, message: populated });
  });

  // ── When a new group is created, make all online members join the room ──
  socket.on("join_group", ({ groupId }) => {
    socket.join(`group:${groupId}`);
  });

  // ── Typing ──
  socket.on("typing",            ({ receiverId })          => io.to(receiverId).emit("user_typing",          { senderId: userId }));
  socket.on("stop_typing",       ({ receiverId })          => io.to(receiverId).emit("user_stop_typing",      { senderId: userId }));
  socket.on("group_typing",      ({ groupId })             => socket.to(`group:${groupId}`).emit("group_user_typing",      { senderId: userId, groupId }));
  socket.on("group_stop_typing", ({ groupId })             => socket.to(`group:${groupId}`).emit("group_user_stop_typing",  { senderId: userId, groupId }));

  // ── Disconnect ──
  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    io.emit("online_users", Array.from(onlineUsers.keys()));
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server + Socket.io running on port ${PORT}`);
  sendDeadlineReminders();
  setInterval(sendDeadlineReminders, 60 * 60 * 1000);
});
