import { useEffect, useState } from "react";
import { fetchAssignments, createAssignment, updateAssignment, deleteAssignment } from "../api/assignmentApi";
import { fetchProjects } from "../api/projectApi";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";
import "../styles/AssignmentsPage.css";

const emptyForm = {
  title: "", description: "", deadline: "", priority: "Medium",
  status: "Open", marks: "", projectId: "", assignedUsers: [],
};

const AssignmentsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [assignments, setAssignments] = useState([]);
  const [projects, setProjects]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [editing, setEditing]         = useState(null);
  const [form, setForm]               = useState(emptyForm);
  const [files, setFiles]             = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterProject, setFilterProject] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const LIMIT = 15;

  // Users for the selected project
  const selectedProject = projects.find((p) => p._id === form.projectId);

  const load = () => {
    setLoading(true);
    const params = { page, limit: LIMIT };
    if (filterProject)  params.projectId = filterProject;
    if (filterPriority) params.priority  = filterPriority;

    fetchAssignments(params)
      .then((res) => { setAssignments(res.data); setTotal(res.total); })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, filterProject, filterPriority]);
  useEffect(() => {
    fetchProjects({ limit: 100 }).then((r) => setProjects(r.data)).catch(() => {});
  }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFiles([]); setShowForm(true); };
  const openEdit   = (a) => {
    setEditing(a);
    setForm({
      title: a.title, description: a.description,
      deadline: a.deadline?.slice(0, 10) || "",
      priority: a.priority, status: a.status, marks: a.marks || "",
      projectId: a.project?._id || a.project || "",
      assignedUsers: (a.assignedUsers || []).map((u) => u._id || u),
    });
    setFiles([]);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "assignedUsers") fd.append(k, JSON.stringify(form.assignedUsers));
      else if (v !== "") fd.append(k, v);
    });
    files.forEach((f) => fd.append("files", f));

    try {
      if (editing) { await updateAssignment(editing._id, fd); toast.success("Assignment updated"); }
      else         { await createAssignment(fd); toast.success("Assignment created"); }
      setShowForm(false);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async () => {
    try {
      await deleteAssignment(deleteTarget._id);
      toast.success("Assignment deleted");
      setDeleteTarget(null);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const toggleUser = (id) => {
    setForm((prev) => ({
      ...prev,
      assignedUsers: prev.assignedUsers.includes(id)
        ? prev.assignedUsers.filter((u) => u !== id)
        : [...prev.assignedUsers, id],
    }));
  };

  const totalPages = Math.ceil(total / LIMIT);
  const isOverdue  = (deadline) => new Date(deadline) < new Date();

  return (
    <div className="assignments-page">
      <div className="page-header">
        <h2>Assignments</h2>
        {isAdmin && <button className="btn-primary" onClick={openCreate}>+ New Assignment</button>}
      </div>

      <div className="filters-bar">
        <select value={filterProject} onChange={(e) => { setFilterProject(e.target.value); setPage(1); }}>
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
        <select value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}>
          <option value="">All Priorities</option>
          {["Low","Medium","High"].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="loading-text">Loading assignments...</p>
      ) : assignments.length === 0 ? (
        <p className="empty-text">No assignments found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Project</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Marks</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {assignments.map((a, i) => (
                <tr key={a._id}>
                  <td>{(page - 1) * LIMIT + i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{a.title}</td>
                  <td>{a.project?.title || "—"}</td>
                  <td><StatusBadge label={a.priority} /></td>
                  <td><StatusBadge label={a.status} /></td>
                  <td>
                    <span style={{ color: isOverdue(a.deadline) ? "#dc2626" : "#1e293b", fontWeight: isOverdue(a.deadline) ? 700 : 400 }}>
                      {new Date(a.deadline).toLocaleDateString()}
                      {isOverdue(a.deadline) && <span style={{ marginLeft: 4, fontSize: 11 }}>⚠️ Overdue</span>}
                    </span>
                  </td>
                  <td>{a.marks ?? "—"}</td>
                  {isAdmin && (
                    <td>
                      <button className="btn-sm edit"   onClick={() => openEdit(a)}>Edit</button>
                      <button className="btn-sm delete" onClick={() => setDeleteTarget(a)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹ Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next ›</button>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-box wide">
            <div className="modal-header">
              <h3>{editing ? "Edit Assignment" : "Create Assignment"}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="project-form">
              <div className="form-row">
                <label>Title *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Project *</label>
                <select required value={form.projectId}
                  onChange={(e) => {
                    const proj = projects.find((p) => p._id === e.target.value);
                    const allUserIds = (proj?.assignedUsers || []).map((u) => u._id || u);
                    setForm({ ...form, projectId: e.target.value, assignedUsers: allUserIds });
                  }}>
                  <option value="">Select a project</option>
                  {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
              </div>
              <div className="form-2col">
                <div className="form-row">
                  <label>Deadline *</label>
                  <input required type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                </div>
                <div className="form-row">
                  <label>Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    {["Low","Medium","High"].map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-2col">
                <div className="form-row">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option>Open</option>
                    <option>Closed</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Total Marks</label>
                  <input type="number" min="0" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} />
                </div>
              </div>
              {selectedProject?.assignedUsers?.length > 0 && (
                <div className="form-row">
                  <label>Assign to (all project users selected by default)</label>
                  <div className="user-checkboxes">
                    {selectedProject.assignedUsers.map((u) => (
                      <label key={u._id || u} className="user-checkbox-item">
                        <input
                          type="checkbox"
                          checked={form.assignedUsers.includes(u._id || u)}
                          onChange={() => toggleUser(u._id || u)}
                        />
                        {u.name || u}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="form-row">
                <label>Reference Files</label>
                <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editing ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`Delete assignment "${deleteTarget.title}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default AssignmentsPage;
