import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from "../api/notificationApi";
import "../styles/DashboardLayout.css";

const ICON_MAP = {
  project_assigned: "📁",
  assignment_assigned: "📝",
  deadline_reminder: "⏰",
  feedback_received: "💬",
  submission_reviewed: "✅",
};

const NavItem = ({ to, icon, label, badge, collapsed, end, onNavigate }) => (
  <li>
    <NavLink to={to} end={end} onClick={onNavigate} className={({ isActive }) => isActive ? "active" : ""}>
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
      {badge > 0 && !collapsed && <span className="nav-badge">{badge > 9 ? "9+" : badge}</span>}
    </NavLink>
  </li>
);

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === "ADMIN";

  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const notifRef = useRef(null);

  const loadNotifs = () => {
    fetchNotifications()
      .then((res) => { setNotifications(res.data); setUnread(res.unreadCount); })
      .catch(() => {});
  };

  useEffect(() => { loadNotifs(); const t = setInterval(loadNotifs, 60000); return () => clearInterval(t); }, []);

  useEffect(() => {
    const h = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen((p) => !p);
    } else {
      setCollapsed((p) => !p);
    }
  };

  const pageTitle = () => {
    const p = location.pathname;
    if (p.endsWith("/dashboard")) return "Dashboard";
    if (p.includes("projects")) return "Projects";
    if (p.includes("assignments")) return "Assignments";
    if (p.includes("submissions")) return "Submissions";
    if (p.includes("users")) return "User Management";
    if (p.includes("activity")) return "Activity Logs";
    if (p.includes("notifications")) return "Notifications";
    if (p.includes("chat")) return "Chat";
    if (p.includes("calendar")) return "Calendar";
    if (p.includes("reports")) return "Reports";
    if (p.includes("profile")) return "Profile";
    return "Dashboard";
  };

  return (
    <div className={`dashboard-layout${collapsed ? " sidebar-collapsed" : ""}`}>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon">⚡</div>
          <span className="brand-text">Dash<span>Pro</span></span>
        </div>

        {/* Nav */}
        <ul className="sidebar-nav">
          <li className="nav-section-label">Main</li>
          <NavItem to="/dashboard" end icon="📊" label="Overview" collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
          <NavItem to="/dashboard/projects" icon="📁" label="Projects" collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
          <NavItem to="/dashboard/assignments" icon="📝" label="Assignments" collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
          <NavItem to="/dashboard/submissions" icon="📤" label="Submissions" collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />

          {isAdmin && (
            <>
              <li className="nav-section-label">Management</li>
              <NavItem to="/dashboard/users" icon="👥" label="Users" collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
              <NavItem to="/dashboard/activity" icon="🕵️" label="Activity Logs" collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
            </>
          )}

          <li className="nav-section-label">Workspace</li>
          <NavItem to="/dashboard/chat" icon="💬" label="Chat" collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
          <NavItem to="/dashboard/calendar" icon="📅" label="Calendar" collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
          <NavItem to="/dashboard/reports" icon="📈" label="Reports" collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
          <NavItem to="/dashboard/notifications" icon="🔔" label="Notifications" badge={unread} collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />

          <li className="nav-section-label">Account</li>
          <NavItem to="/dashboard/profile" icon="👤" label="Profile" collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
        </ul>

        {/* Profile card */}
        <div className="sidebar-profile">
          <div className="sidebar-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">{user?.name}</div>
            <div className="sidebar-profile-role">{user?.role}</div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Logout">🚪</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="collapse-btn" onClick={toggleSidebar}>
              <span /><span /><span />
            </button>
            <div className="topbar-breadcrumb">
              <span>Home</span>
              <span>›</span>
              <span className="current">{pageTitle()}</span>
            </div>
          </div>

          <div className="topbar-search">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search anything..." />
          </div>

          <div className="topbar-right">
            <button className="topbar-icon-btn" onClick={toggleTheme} title="Toggle theme">
              {isDark ? "☀️" : "🌙"}
            </button>

            {/* Notification bell */}
            <div ref={notifRef} style={{ position: "relative" }}>
              <button className="topbar-icon-btn" onClick={() => setNotifOpen((p) => !p)}>
                🔔
                {unread > 0 && (
                  <span style={{
                    position: "absolute", top: -4, right: -4,
                    background: "var(--danger)", color: "#fff",
                    borderRadius: "50%", fontSize: 10, fontWeight: 700,
                    width: 18, height: 18,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{unread > 9 ? "9+" : unread}</span>
                )}
              </button>
              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <strong>Notifications {unread > 0 && <span style={{ color: "var(--danger)" }}>({unread})</span>}</strong>
                    {unread > 0 && (
                      <button className="notif-mark-all" onClick={() => { markAllNotificationsRead(); loadNotifs(); }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">🎉 You're all caught up!</div>
                    ) : notifications.map((n) => (
                      <div key={n._id} className={`notif-item${n.isRead ? "" : " unread"}`}
                        onClick={() => { if (!n.isRead) { markNotificationRead(n._id); loadNotifs(); } }}>
                        <span className="notif-icon">{ICON_MAP[n.type] || "🔔"}</span>
                        <div className="notif-body">
                          <p>{n.message}</p>
                          <span>{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                        {!n.isRead && <span className="notif-dot" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="topbar-divider" />

            <div className="topbar-user">
              <div className="topbar-user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <div className="topbar-user-info">
                <div className="topbar-user-name">{user?.name}</div>
                <div className="topbar-user-role">{user?.role}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
