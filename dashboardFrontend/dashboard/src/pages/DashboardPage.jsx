import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { fetchDashboardStats, fetchProjectStats } from "../api/dashboardApi";
import { fetchActivityLogs } from "../api/activityApi";
import { useAuth } from "../context/AuthContext";
import "../styles/DashboardPage.css";

/* ── Helpers ── */
const hour = new Date().getHours();
const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

const COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

const ACTIVITY_ICON = {
  login: "🔑", logout: "🚪", project_created: "📁", project_updated: "📝",
  assignment_created: "📋", submission_created: "📤", submission_updated: "✅",
  user_created: "👤", feedback_given: "💬",
};

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

/* ── KPI Card ── */
const KpiCard = ({ icon, label, value, sub, trend, trendUp, color, delay }) => (
  <div className={`kpi-card ${color}`} style={{ animationDelay: delay }}>
    <div className="kpi-header">
      <div className="kpi-icon">{icon}</div>
      {trend && (
        <div className={`kpi-trend ${trendUp ? "up" : "down"}`}>
          {trendUp ? "↑" : "↓"} {trend}
        </div>
      )}
    </div>
    <div className="kpi-value">{value ?? 0}</div>
    <div className="kpi-label">{label}</div>
    {sub && <div className="kpi-sub">{sub}</div>}
  </div>
);

/* ── Quick Action ── */
const QuickActionBtn = ({ icon, label, onClick }) => (
  <button className="quick-action-btn" onClick={onClick}>
    <span className="qa-icon">{icon}</span>
    {label}
  </button>
);

/* ── ADMIN DASHBOARD ── */
const AdminDashboard = ({ stats, projStats, activity }) => {
  const total = stats.users?.total ?? 0;
  const totalProj = stats.projects?.total ?? 0;
  const active = stats.projects?.Active ?? 0;
  const completed = stats.projects?.Completed ?? 0;
  const onHold = stats.projects?.["On Hold"] ?? 0;

  // Chart data
  const projectChartData = [
    { name: "Planning", value: projStats?.Planning || 0 },
    { name: "Active",   value: projStats?.Active || 0 },
    { name: "On Hold",  value: projStats?.["On Hold"] || 0 },
    { name: "Completed",value: projStats?.Completed || 0 },
    { name: "Archived", value: projStats?.Archived || 0 },
  ];

  const monthlyData = [
    { month: "Jan", submissions: 4, assignments: 6, projects: 2 },
    { month: "Feb", submissions: 7, assignments: 9, projects: 3 },
    { month: "Mar", submissions: 5, assignments: 8, projects: 4 },
    { month: "Apr", submissions: 10, assignments: 12, projects: 5 },
    { month: "May", submissions: 8, assignments: 10, projects: 3 },
    { month: "Jun", submissions: 14, assignments: 15, projects: 6 },
  ];

  // Leaderboard (mock from stats)
  const leaders = stats.topPerformers || [
    { name: "Alex Johnson", score: 95, tasks: 28 },
    { name: "Sarah Chen", score: 91, tasks: 24 },
    { name: "Mike Torres", score: 87, tasks: 21 },
    { name: "Priya Patel", score: 83, tasks: 19 },
    { name: "James Lee", score: 78, tasks: 17 },
  ];

  // Deadlines
  const deadlines = stats.upcomingDeadlines || [];
  const getDeadlineClass = (days) => {
    if (days < 0) return "overdue";
    if (days <= 2) return "near";
    return "safe";
  };
  const getDeadlineLabel = (days) => {
    if (days < 0) return `Overdue by ${Math.abs(days)}d`;
    if (days === 0) return "Due Today";
    if (days === 1) return "Due Tomorrow";
    return `Due in ${days}d`;
  };

  return (
    <>
      {/* Welcome Header */}
      <div className="welcome-header">
        <div className="welcome-title">{greeting}, {stats.adminName || "Admin"} 👋</div>
        <div className="welcome-subtitle">Here's what's happening with your workspace today.</div>
        <div className="welcome-pills">
          <span className="welcome-pill">📁 {active} Active Projects</span>
          <span className="welcome-pill">📝 {stats.pendingReviews ?? 0} Pending Reviews</span>
          <span className="welcome-pill">👥 {total} Active Users</span>
          <span className="welcome-pill">📊 {totalProj} Total Projects</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard icon="👥" label="Total Users"        value={total}     color="blue"   trend="+12%" trendUp sub="this month"  delay="0.05s" />
        <KpiCard icon="📁" label="Total Projects"     value={totalProj} color="purple" trend="+5%"  trendUp sub="this week"   delay="0.1s" />
        <KpiCard icon="⚡" label="Active Projects"    value={active}    color="green"  trend="+3%"  trendUp sub="in progress" delay="0.15s" />
        <KpiCard icon="✅" label="Completed"          value={completed} color="cyan"   trend="+8%"  trendUp sub="all time"    delay="0.2s" />
        <KpiCard icon="⏳" label="Pending Reviews"    value={stats.pendingReviews ?? 0} color="orange" trend="-2%" sub="needs action" delay="0.25s" />
        <KpiCard icon="⏸️" label="On Hold"            value={onHold}    color="red"    sub="paused"  delay="0.3s" />
      </div>

      {/* Charts Row 1 */}
      <div className="dash-grid" style={{ marginBottom: 20 }}>
        {/* Area Chart */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">📈 Monthly Activity Trend</span>
          </div>
          <div className="dash-card-body chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="submissions" stroke="#2563EB" fill="url(#gBlue)" strokeWidth={2} name="Submissions" />
                <Area type="monotone" dataKey="assignments" stroke="#22C55E" fill="url(#gGreen)" strokeWidth={2} name="Assignments" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">📊 Project Status</span>
          </div>
          <div className="dash-card-body chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={projectChartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13 }} />
                <Bar dataKey="value" name="Projects" radius={[6, 6, 0, 0]}>
                  {projectChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 + Activity + Deadlines */}
      <div className="dash-grid-3" style={{ marginBottom: 20 }}>
        {/* Activity Feed */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">🕐 Recent Activity</span>
            <button className="dash-card-action">View all</button>
          </div>
          <div className="activity-list">
            {activity.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No recent activity</div>
            ) : activity.slice(0, 8).map((a, i) => (
              <div key={a._id || i} className="activity-item">
                <div className="activity-icon-wrap">{ACTIVITY_ICON[a.action] || "📌"}</div>
                <div className="activity-body">
                  <div className="activity-desc">{a.description || a.action?.replace(/_/g, " ")}</div>
                  <div className="activity-meta">
                    <span>{a.user?.name || "System"}</span>
                    <span className="dot" />
                    <span>{timeAgo(a.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deadlines */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">📅 Deadlines</span>
          </div>
          <div className="deadline-list">
            {deadlines.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No upcoming deadlines</div>
            ) : deadlines.map((d, i) => {
              const days = Math.ceil((new Date(d.deadline) - new Date()) / 86400000);
              const cls = getDeadlineClass(days);
              return (
                <div key={d._id || i} className="deadline-item">
                  <div className={`deadline-bar ${cls}`} />
                  <div className="deadline-info">
                    <div className="deadline-name">{d.title}</div>
                    <div className="deadline-date">{new Date(d.deadline).toLocaleDateString()}</div>
                  </div>
                  <span className={`deadline-badge ${cls}`}>{getDeadlineLabel(days)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions + AI */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="dash-card">
            <div className="dash-card-header">
              <span className="dash-card-title">⚡ Quick Actions</span>
            </div>
            <div className="dash-card-body">
              <div className="quick-actions-grid">
                <QuickActionBtn icon="📁" label="New Project" />
                <QuickActionBtn icon="📝" label="New Assignment" />
                <QuickActionBtn icon="👤" label="Invite User" />
                <QuickActionBtn icon="📤" label="Review Submission" />
                <QuickActionBtn icon="📈" label="Generate Report" />
                <QuickActionBtn icon="📊" label="View Analytics" />
              </div>
            </div>
          </div>

          <div className="ai-widget">
            <div className="ai-widget-title">🤖 AI Assistant</div>
            <div className="ai-widget-desc">Let AI help you manage your workspace smarter and faster.</div>
            <div className="ai-actions">
              <button className="ai-action-btn">✍️ Generate Assignment</button>
              <button className="ai-action-btn">📋 Write Project Brief</button>
              <button className="ai-action-btn">📊 Create Report</button>
              <button className="ai-action-btn">💡 Suggest Improvements</button>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard + Pie Chart */}
      <div className="dash-grid">
        {/* Leaderboard */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">🏆 Team Leaderboard</span>
            <button className="dash-card-action">View all</button>
          </div>
          <div className="leaderboard-list">
            {leaders.map((l, i) => (
              <div key={i} className="leader-item">
                <div className="leader-rank">{["🥇","🥈","🥉","4️⃣","5️⃣"][i] || `${i+1}`}</div>
                <div className="leader-avatar">{l.name?.charAt(0)}</div>
                <div className="leader-info">
                  <div className="leader-name">{l.name}</div>
                  <div className="leader-bar-wrap">
                    <div className="leader-bar-fill" style={{ width: `${l.score}%` }} />
                  </div>
                </div>
                <div className="leader-score">{l.score}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart — Project distribution */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">🍩 Project Distribution</span>
          </div>
          <div className="dash-card-body chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={projectChartData} cx="50%" cy="50%" innerRadius={70} outerRadius={110}
                  dataKey="value" nameKey="name" paddingAngle={3}>
                  {projectChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

/* ── USER DASHBOARD ── */
const UserDashboard = ({ stats }) => {
  const deadlines = stats.upcomingDeadlines || [];

  const getDeadlineClass = (days) => {
    if (days < 0) return "overdue";
    if (days <= 2) return "near";
    return "safe";
  };
  const getDeadlineLabel = (days) => {
    if (days < 0) return `Overdue by ${Math.abs(days)}d`;
    if (days === 0) return "Due Today";
    if (days === 1) return "Due Tomorrow";
    return `Due in ${days}d`;
  };

  const completionData = [
    { name: "Completed", value: stats.completedProjects || 0 },
    { name: "Pending",   value: stats.pendingTasks || 0 },
    { name: "Active",    value: stats.assignedProjects || 0 },
  ];

  return (
    <>
      <div className="welcome-header">
        <div className="welcome-title">{greeting}, {stats.userName || "there"} 👋</div>
        <div className="welcome-subtitle">Here's a summary of your work progress.</div>
        <div className="welcome-pills">
          <span className="welcome-pill">📁 {stats.assignedProjects ?? 0} Assigned Projects</span>
          <span className="welcome-pill">✅ {stats.completedProjects ?? 0} Completed</span>
          <span className="welcome-pill">⏳ {stats.pendingTasks ?? 0} Pending Tasks</span>
          <span className="welcome-pill">🎯 {stats.performanceScore ?? 0}% Score</span>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard icon="📁" label="Assigned Projects"  value={stats.assignedProjects}  color="blue"   delay="0.05s" />
        <KpiCard icon="✅" label="Completed Projects" value={stats.completedProjects} color="green"  delay="0.1s" />
        <KpiCard icon="⏳" label="Pending Tasks"      value={stats.pendingTasks}      color="orange" delay="0.15s" />
        <KpiCard icon="🎯" label="Performance Score"  value={`${stats.performanceScore ?? 0}%`} color="purple" delay="0.2s" />
      </div>

      <div className="dash-grid">
        {/* Completion pie */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">🎯 My Progress Overview</span>
          </div>
          <div className="dash-card-body chart-container">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={completionData} cx="50%" cy="50%" outerRadius={100}
                  dataKey="value" nameKey="name" paddingAngle={3}>
                  {completionData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deadlines */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">📅 Upcoming Deadlines</span>
          </div>
          <div className="deadline-list">
            {deadlines.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                🎉 No upcoming deadlines!
              </div>
            ) : deadlines.map((d, i) => {
              const days = Math.ceil((new Date(d.deadline) - new Date()) / 86400000);
              const cls = getDeadlineClass(days);
              return (
                <div key={d._id || i} className="deadline-item">
                  <div className={`deadline-bar ${cls}`} />
                  <div className="deadline-info">
                    <div className="deadline-name">{d.title}</div>
                    <div className="deadline-date">{new Date(d.deadline).toLocaleDateString()}</div>
                  </div>
                  <span className={`deadline-badge ${cls}`}>{getDeadlineLabel(days)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

/* ── Main Component ── */
const DashboardPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [stats, setStats]       = useState(null);
  const [projStats, setProjStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    const calls = [
      fetchDashboardStats().then((r) => setStats(r.data)),
      ...(isAdmin ? [
        fetchProjectStats().then((r) => setProjStats(r.data)),
        fetchActivityLogs({ limit: 10 }).then((r) => setActivity(r.data || r.logs || [])),
      ] : []),
    ];
    Promise.all(calls)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (loading) return <div className="loading-text">Loading your dashboard...</div>;
  if (error)   return <div className="error-text">⚠️ {error}</div>;
  if (!stats)  return null;

  return isAdmin
    ? <AdminDashboard stats={stats} projStats={projStats} activity={activity} />
    : <UserDashboard stats={stats} />;
};

export default DashboardPage;
