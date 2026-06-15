import { useEffect, useState } from "react";
import { fetchAllUsers, deleteUserById } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import EditUserModal from "../components/EditUserModal";
import AddUserModal from "../components/AddUserModal";
import "../styles/UserManagementPage.css";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const { user: currentUser } = useAuth();

  const loadUsers = () => {
    setLoading(true);
    fetchAllUsers()
      .then((res) => setUsers(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUserById(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p className="page-loader">Loading users...</p>;
  if (error)   return <p className="error-text">{error}</p>;

  return (
    <div className="user-management-page">
      <div className="page-header">
        <h2>User Management</h2>
        {currentUser?.role === "ADMIN" && (
          <button className="action-btn add" onClick={() => setShowAddModal(true)}>
            + Add User
          </button>
        )}
      </div>

      <div className="user-table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, index) => (
              <tr key={u._id}>
                <td>{index + 1}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`role-badge ${u.role === "ADMIN" ? "admin" : "user"}`}>
                    {u.role}
                  </span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  {currentUser?.role === "ADMIN" ? (
                    <>
                      <button className="action-btn edit" onClick={() => setEditingUser(u)}>
                        Edit
                      </button>
                      {u._id !== currentUser._id && (
                        <button className="action-btn delete" onClick={() => handleDelete(u._id)}>
                          Delete
                        </button>
                      )}
                    </>
                  ) : (
                    <span style={{ color: "#aaa", fontSize: "13px" }}>No access</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdated={loadUsers}
        />
      )}

      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onCreated={loadUsers}
        />
      )}
    </div>
  );
};

export default UserManagementPage;
