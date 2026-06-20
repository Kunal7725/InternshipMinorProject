import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import "../styles/ReportsPage.css";

const COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6"];

const REPORT_TYPES = [
  { id: "user",       icon: "👥", title: "User Performance",  desc: "Analyze user activity, scores and completion rates" },
  { id: "project",    icon: "📁", title: "Project Report",    desc: "Track project progress and status distribution" },
  { id: "assignment", icon: "📝", title: "Assignment Report", desc: "Assignment completion and submission rates" },
  { id: "submission", icon: "📤", title: "Submission Report", desc: "Review submissions and feedback trends" },
];

const USER_DATA = [
  { name: "Alex J.", score: 95, tasks: 28 },
  { name: "Sarah C.", score: 91, tasks: 24 },
  { name: "Mike T.", score: 87, tasks: 21 },
  { name: "Priya P.", score: 83, tasks: 19 },
  { name: "James L.", score: 78, tasks: 17 },
];

const SUBMISSION_DATA = [
  { month: "Jan", submitted: 8, approved: 6, rejected: 2 },
  { month: "Feb", submitted: 12, approved: 10, rejected: 2 },
  { month: "Mar", submitted: 9, approved: 8, rejected: 1 },
  { month: "Apr", submitted: 15, approved: 13, rejected: 2 },
  { month: "May", submitted: 11, approved: 9, rejected: 2 },
  { month: "Jun", submitted: 18, approved: 16, rejected: 2 },
];

const STATUS_DATA = [
  { name: "Completed", value: 12 },
  { name: "Active",    value: 8 },
  { name: "Planning",  value: 5 },
  { name: "On Hold",   value: 3 },
];

const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState("user");
  const [exporting, setExporting] = useState(false);

  const handleExport = (format) => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert(`✅ ${format.toUpperCase()} report exported successfully! (demo)`);
    }, 1200);
  };

  return (
    <div className="reports-page">
      {/* Report type selector */}
      <div className="reports-selector">
        {REPORT_TYPES.map((r) => (
          <div key={r.id} className={`report-type-card${activeReport === r.id ? " active" : ""}`}
            onClick={() => setActiveReport(r.id)}>
            <div className="report-type-icon">{r.icon}</div>
            <div className="report-type-info">
              <div className="report-type-title">{r.title}</div>
              <div className="report-type-desc">{r.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Export bar */}
      <div className="reports-export-bar">
        <div className="reports-export-title">
          <span>📊</span>
          <strong>{REPORT_TYPES.find(r => r.id === activeReport)?.title}</strong>
          <span className="reports-export-date">Generated: {new Date().toLocaleDateString()}</span>
        </div>
        <div className="reports-export-btns">
          <button className="export-btn pdf"  onClick={() => handleExport("pdf")}  disabled={exporting}>📄 PDF</button>
          <button className="export-btn xlsx" onClick={() => handleExport("excel")} disabled={exporting}>📊 Excel</button>
          <button className="export-btn csv"  onClick={() => handleExport("csv")}  disabled={exporting}>📋 CSV</button>
        </div>
      </div>

      {/* Charts */}
      <div className="reports-charts">
        {(activeReport === "user") && (
          <div className="reports-grid">
            <div className="report-chart-card">
              <div className="report-chart-title">User Performance Scores</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={USER_DATA} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }} />
                  <Bar dataKey="score" name="Score %" radius={[6,6,0,0]}>
                    {USER_DATA.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="report-chart-card">
              <div className="report-chart-title">Tasks Completed per User</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={USER_DATA} layout="vertical" barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }} />
                  <Bar dataKey="tasks" name="Tasks" fill="var(--primary)" radius={[0,6,6,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {(activeReport === "project") && (
          <div className="reports-grid">
            <div className="report-chart-card">
              <div className="report-chart-title">Project Status Distribution</div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={STATUS_DATA} cx="50%" cy="50%" innerRadius={80} outerRadius={120}
                    dataKey="value" nameKey="name" paddingAngle={3}>
                    {STATUS_DATA.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="report-summary-card">
              <div className="report-chart-title">Project Summary</div>
              {STATUS_DATA.map((s, i) => (
                <div key={s.name} className="report-summary-row">
                  <div className="report-summary-dot" style={{ background: COLORS[i] }} />
                  <span className="report-summary-name">{s.name}</span>
                  <span className="report-summary-val">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeReport === "submission" || activeReport === "assignment") && (
          <div className="report-chart-card full">
            <div className="report-chart-title">Monthly Submission Trends</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={SUBMISSION_DATA} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="submitted" name="Submitted" fill="#2563EB" radius={[4,4,0,0]} />
                <Bar dataKey="approved"  name="Approved"  fill="#22C55E" radius={[4,4,0,0]} />
                <Bar dataKey="rejected"  name="Rejected"  fill="#EF4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
