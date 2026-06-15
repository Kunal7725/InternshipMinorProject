import { useState } from "react";
import { createUser } from "../api/userApi";
import "../styles/UserManagementPage.css";

const AddUserModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await createUser(form);
      onCreated(); // refresh the user list
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Add New User</h3>

        {error && <div className="error-banner">{error}</div>}

        <div className="form-group">
          <label>Full Name</label>
          <input name="name" placeholder="John Doe" value={form.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" placeholder="user@example.com" value={form.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
