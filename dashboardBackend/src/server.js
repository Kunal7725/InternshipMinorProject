require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const sendDeadlineReminders = require("./utils/deadlineReminder");

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Run deadline reminders every hour
  sendDeadlineReminders();
  setInterval(sendDeadlineReminders, 60 * 60 * 1000);
});