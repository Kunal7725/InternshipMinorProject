import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(user.adminCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="profile-page">
      <h2>My Profile</h2>
      <div className="profile-card">
        <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>

        <div className="profile-field">
          <label>Full Name</label>
          <p>{user?.name}</p>
        </div>
        <div className="profile-field">
          <label>Email Address</label>
          <p>{user?.email}</p>
        </div>
        <div className="profile-field">
          <label>Role</label>
          <p>
            <span className={`role-badge ${user?.role === "ADMIN" ? "admin" : "user"}`}>
              {user?.role}
            </span>
          </p>
        </div>
        <div className="profile-field">
          <label>Account Created</label>
          <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</p>
        </div>

        {/* Show Admin Code only for ADMIN accounts */}
        {user?.role === "ADMIN" && user?.adminCode && (
          <div className="profile-field">
            <label>Your Admin Code <span className="code-hint">share this with users to join your workspace</span></label>
            <div className="admin-code-box">
              <span className="admin-code-text">{user.adminCode}</span>
              <button className="copy-btn" onClick={handleCopy}>
                {copied ? "✅ Copied!" : "📋 Copy"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
