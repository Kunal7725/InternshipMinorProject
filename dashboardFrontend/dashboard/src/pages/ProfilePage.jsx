import { useAuth } from "../context/AuthContext";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const { user } = useAuth();

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
      </div>
    </div>
  );
};

export default ProfilePage;
