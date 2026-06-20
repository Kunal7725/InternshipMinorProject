import { useEffect, useRef, useState } from "react";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from "../api/notificationApi";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const load = () => {
    fetchNotifications()
      .then((res) => {
        setNotifications(res.data);
        setUnread(res.unreadCount);
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    load();
  };

  const handleMarkOne = async (id) => {
    await markNotificationRead(id);
    load();
  };

  const iconMap = {
    project_assigned: "📁",
    assignment_assigned: "📝",
    deadline_reminder: "⏰",
    feedback_received: "💬",
    submission_reviewed: "✅",
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen((p) => !p)} style={{
        position: "relative", background: "none", border: "none",
        cursor: "pointer", fontSize: 22, padding: "2px 6px",
      }}>
        🔔
        {unread > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            background: "#dc2626", color: "#fff",
            borderRadius: "50%", fontSize: 10, fontWeight: 700,
            width: 18, height: 18, display: "flex",
            alignItems: "center", justifyContent: "center",
            lineHeight: 1,
          }}>{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 10px)",
          width: 340, background: "#fff", borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)", zIndex: 1000,
          border: "1px solid #e2e8f0", overflow: "hidden",
        }}>
          <div style={{
            padding: "14px 16px", borderBottom: "1px solid #e2e8f0",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#1e3a5f" }}>
              Notifications {unread > 0 && <span style={{ color: "#dc2626" }}>({unread})</span>}
            </span>
            {unread > 0 && (
              <button onClick={handleMarkAll} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12, color: "#0369a1", fontWeight: 600,
              }}>Mark all read</button>
            )}
          </div>

          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <p style={{ padding: "20px 16px", color: "#94a3b8", fontSize: 13, textAlign: "center" }}>
                No notifications
              </p>
            ) : notifications.map((n) => (
              <div key={n._id} onClick={() => !n.isRead && handleMarkOne(n._id)} style={{
                padding: "12px 16px",
                background: n.isRead ? "#fff" : "#f0f9ff",
                borderBottom: "1px solid #f1f5f9",
                cursor: n.isRead ? "default" : "pointer",
                display: "flex", gap: 10, alignItems: "flex-start",
              }}>
                <span style={{ fontSize: 18 }}>{iconMap[n.type] || "🔔"}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#1e293b", lineHeight: 1.5 }}>{n.message}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.isRead && (
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#0369a1", flexShrink: 0, marginTop: 4,
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
