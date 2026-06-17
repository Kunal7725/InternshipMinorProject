import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "../styles/DashboardLayout.css";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);


  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`dashboard-layout${sidebarOpen ? "" : " sidebar-collapsed"}`}>
      <aside className={`sidebar${sidebarOpen ? "" : " closed"}`}>
        <div className="sidebar-brand">
          {sidebarOpen && <span>Dash<span>Board</span></span>}
        </div>
        <ul className="sidebar-nav">
          <li>
            <NavLink to="/dashboard" end className={({ isActive }) => isActive ? "active" : ""}>
              📊 Overview
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/users" className={({ isActive }) => isActive ? "active" : ""}>
              👥 Users
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/profile" className={({ isActive }) => isActive ? "active" : ""}>
              👤 My Profile
            </NavLink>
          </li>
        </ul>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="hamburger-btn" onClick={() => setSidebarOpen((p) => !p)}>
              <span /><span /><span />
            </button>
            <span className="topbar-title">Dashboard</span>
          </div>
          <div className="topbar-user">
            <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <span>{user?.name}</span>
            <span className={`role-badge ${user?.role === "ADMIN" ? "admin" : "user"}`}>
              {user?.role}
            </span>
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
