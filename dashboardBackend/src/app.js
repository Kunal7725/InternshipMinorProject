const express  = require("express");
const cors     = require("cors");
const path     = require("path");

const authRoutes         = require("./routes/authRoutes");
const userRoutes         = require("./routes/userRoutes");
const dashboardRoutes    = require("./routes/dashboardRoutes");
const projectRoutes      = require("./routes/projectRoutes");
const assignmentRoutes   = require("./routes/assignmentRoutes");
const submissionRoutes   = require("./routes/submissionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const activityRoutes     = require("./routes/activityRoutes");
const chatRoutes         = require("./routes/chatRoutes");
const errorHandler       = require("./middleware/errorMiddleware");

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// API Routes
app.use("/api/auth",          authRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/dashboard",     dashboardRoutes);
app.use("/api/projects",      projectRoutes);
app.use("/api/assignments",   assignmentRoutes);
app.use("/api/submissions",   submissionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/activity",      activityRoutes);
app.use("/api/chat",          chatRoutes);

app.use(errorHandler);

module.exports = app;
