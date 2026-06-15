import { useEffect, useState } from "react";
import { fetchDashboardStats } from "../api/dashboardApi";
import "../styles/DashboardPage.css";

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats()
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading-text">Loading stats...</p>;
  if (error)   return <p className="error-text">{error}</p>;

  return (
    <div className="dashboard-page">
      <h2>Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Users</span>
          <span className="stat-value">{stats.totalUsers}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Admins</span>
          <span className="stat-value">{stats.totalAdmins}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Normal Users</span>
          <span className="stat-value">{stats.totalNormalUsers}</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
