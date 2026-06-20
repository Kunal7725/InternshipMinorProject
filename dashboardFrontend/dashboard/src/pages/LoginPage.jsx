import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser(email, password);
      login(res.data, res.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Brand Panel */}
      <div className="login-brand-panel">
        <div className="login-brand-logo">
          <div className="login-brand-icon">⚡</div>
          <span className="login-brand-name">Dash<span>Pro</span></span>
        </div>
        <div className="login-brand-headline">
          Manage your internship workspace effortlessly
        </div>
        <div className="login-brand-sub">
          A modern enterprise dashboard for managing projects, assignments, submissions, and team performance.
        </div>
        <div className="login-brand-features">
          <div className="login-feature-item"><span>📁</span><span>Project & Assignment Management</span></div>
          <div className="login-feature-item"><span>📊</span><span>Real-time Analytics & Reports</span></div>
          <div className="login-feature-item"><span>💬</span><span>Built-in Team Chat</span></div>
          <div className="login-feature-item"><span>🔔</span><span>Smart Notifications & Reminders</span></div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="login-form-panel">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Welcome back 👋</h2>
            <p>Sign in to your DashPro account</p>
          </div>

          {error && <div className="error-banner">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
