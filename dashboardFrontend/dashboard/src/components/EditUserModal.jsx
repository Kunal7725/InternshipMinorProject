import { useState } from "react";
import { updateUserById } from "../api/userApi";
import "../styles/UserManagementPage.css";

const EditUserModal = ({ user, onClose, onUpdated }) => {
  const [form, setForm] = useState({ name: user.name, email: user.email, role: user.role });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateUserById(user._id, form);
      onUpdated();
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
        <h3>Edit User</h3>

        {error && <div className="error-banner">{error}</div>}

        <div className="form-group">
          <label>Full Name</label>
          <input name="name" value={form.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} />
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
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
