const Assignment = require("../models/Assignment");
const notify     = require("./notify");

/**
 * Sends deadline reminder notifications for assignments due within the next 24 hours.
 * Call this on a schedule (e.g. every hour via setInterval or a cron job).
 */
const sendDeadlineReminders = async () => {
    try {
        const now   = new Date();
        const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const upcoming = await Assignment.find({
            deadline: { $gte: now, $lte: in24h },
            status:   "Open",
        });

        for (const assignment of upcoming) {
            for (const uid of assignment.assignedUsers) {
                await notify(
                    uid,
                    "deadline_reminder",
                    `Reminder: Assignment "${assignment.title}" is due within 24 hours.`,
                    `/assignments/${assignment._id}`
                );
            }
        }

        if (upcoming.length) console.log(`[Deadline Reminders] Sent for ${upcoming.length} assignment(s).`);
    } catch (err) {
        console.error("[Deadline Reminders] Error:", err.message);
    }
};

module.exports = sendDeadlineReminders;
