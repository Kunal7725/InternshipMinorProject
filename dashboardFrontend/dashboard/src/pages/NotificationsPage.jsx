import { useEffect, useState } from "react";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from "../api/notificationApi";
import toast from "react-hot-toast";
import "../styles/NotificationsPage.css";

const iconMap = {
  project_assigned:    "📁",
  assignment_assigned: "📝",
  deadline_reminder:   "⏰",
  feedback_received:   "💬",
  submission_reviewed: "✅",
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]               = useState(0);
  const [loading, setLoading]             = useState(true);

  const load = () => {
    fetchNotifications()
      .then((res) => { setNotifications(res.data); setUnread(res.unreadCount); })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    load();
    toast.success("All marked as read");
  };

  const handleMarkOne = async (id) => {
    await markNotificationRead(id);
    load();
  };

  return (
    <div className="notifications-page">
      <div className="page-header">
        <h2>Notification Center {unread > 0 && <span className="unread-badge">{unread} unread</span>}</h2>
        {unread > 0 && (
          <button className="btn-secondary" onClick={handleMarkAll}>Mark all as read</button>
        )}
      </div>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : notifications.length === 0 ? (
        <div className="empty-notifications">
          <span style={{ fontSize: 48 }}>🔔</span>
          <p>You're all caught up!</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`notification-item${n.isRead ? "" : " unread"}`}
              onClick={() => !n.isRead && handleMarkOne(n._id)}
            >
              <span className="notif-icon">{iconMap[n.type] || "🔔"}</span>
              <div className="notif-body">
                <p className="notif-message">{n.message}</p>
                <p className="notif-time">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && <span className="unread-dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
