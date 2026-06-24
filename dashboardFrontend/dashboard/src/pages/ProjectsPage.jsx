import { useEffect, useState } from "react";
import { fetchProjects, createProject, updateProject, deleteProject } from "../api/projectApi";
import { fetchAllUsers } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";
import "../styles/ProjectsPage.css";

const emptyForm = {
  title: "", description: "", priority: "Medium", techStack: "",
  startDate: "", dueDate: "", status: "Planning", estimatedHours: "",
  assignedUsers: [],
};

const ProjectsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [projects, setProjects]     = useState([]);
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [files, setFiles]           = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const LIMIT = 10;

  const load = () => {
    setLoading(true);
    const params = { page, limit: LIMIT };
    if (search)         params.search   = search;
    if (filterStatus)   params.status   = filterStatus;
    if (filterPriority) params.priority = filterPriority;

    fetchProjects(params)
      .then((res) => { setProjects(res.data); setTotal(res.total); })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, filterStatus, filterPriority]);
  useEffect(() => {
    if (isAdmin) fetchAllUsers().then((r) => {
      setUsers(r.data);
    }).catch(() => {});
  }, [isAdmin]);

  const openCreate = () => {
    // Pre-select all users by default
    fetchAllUsers().then((r) => {
      const allIds = r.data.map((u) => u._id);
      setUsers(r.data);
      setEditing(null);
      setForm({ ...emptyForm, assignedUsers: allIds });
      setFiles([]);
      setShowForm(true);
    }).catch(() => {
      setEditing(null); setForm(emptyForm); setFiles([]); setShowForm(true);
    });
  };
  const openEdit   = (p) => {
    setEditing(p);
    setForm({
      title: p.title, description: p.description, priority: p.priority,
      techStack: (p.techStack || []).join(", "), startDate: p.startDate?.slice(0, 10) || "",
      dueDate: p.dueDate?.slice(0, 10) || "", status: p.status,
      estimatedHours: p.estimatedHours || "",
      assignedUsers: (p.assignedUsers || []).map((u) => u._id || u),
    });
    setFiles([]);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "techStack") fd.append(k, JSON.stringify(v.split(",").map((s) => s.trim()).filter(Boolean)));
      else if (k === "assignedUsers") fd.append(k, JSON.stringify(form.assignedUsers));
      else if (v !== "") fd.append(k, v);
    });
    files.forEach((f) => fd.append("documents", f));

    try {
      if (editing) { await updateProject(editing._id, fd); toast.success("Project updated"); }
      else         { await createProject(fd); toast.success("Project created"); }
      setShowForm(false);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(deleteTarget._id);
      toast.success("Project deleted");
      setDeleteTarget(null);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleArchive = async (p) => {
    const fd = new FormData();
    fd.append("status", "Archived");
    try { await updateProject(p._id, fd); toast.success("Project archived"); load(); }
    catch (err) { toast.error(err.message); }
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

  return (
    <div className="projects-page">
      <div className="page-header">
        <h2>Projects</h2>
        {isAdmin && <button className="btn-primary" onClick={openCreate}>+ New Project</button>}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input
          className="search-input"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); load(); } }}
        />
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {["Planning","Active","On Hold","Completed","Archived"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}>
          <option value="">All Priorities</option>
          {["Low","Medium","High"].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="loading-text">Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className="empty-text">No projects found.</p>
      ) : (
        <div className="project-grid">
          {projects.map((p) => (
            <div key={p._id} className="project-card">
              <div className="project-card-header">
                <h3>{p.title}</h3>
                <StatusBadge label={p.priority} />
              </div>
              <p className="project-desc">{p.description || "No description"}</p>
              <div className="project-meta">
                <StatusBadge label={p.status} />
                {p.dueDate && (
                  <span className="due-date">Due: {new Date(p.dueDate).toLocaleDateString()}</span>
                )}
              </div>
              {p.techStack?.length > 0 && (
                <div className="tech-stack">
                  {p.techStack.map((t) => <span key={t} className="tech-tag">{t}</span>)}
                </div>
              )}
              <div className="project-users">
                👥 {p.assignedUsers?.length || 0} user(s)
              </div>
              {isAdmin && (
                <div className="project-actions">
                  <button className="btn-sm edit"   onClick={() => openEdit(p)}>Edit</button>
                  {p.status !== "Archived" && (
                    <button className="btn-sm archive" onClick={() => handleArchive(p)}>Archive</button>
                  )}
                  <button className="btn-sm delete" onClick={() => setDeleteTarget(p)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹ Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next ›</button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-box wide">
            <div className="modal-header">
              <h3>{editing ? "Edit Project" : "Create Project"}</h3>
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
              <div className="form-2col">
                <div className="form-row">
                  <label>Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    {["Low","Medium","High"].map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {["Planning","Active","On Hold","Completed","Archived"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-2col">
                <div className="form-row">
                  <label>Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="form-row">
                  <label>Due Date</label>
                  <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="form-2col">
                <div className="form-row">
                  <label>Estimated Hours</label>
                  <input type="number" min="0" value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })} />
                </div>
                <div className="form-row">
                  <label>Tech Stack (comma separated)</label>
                  <input value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} placeholder="React, Node.js, MongoDB" />
                </div>
              </div>
              {users.length > 0 && (
                <div className="form-row">
                  <label>Assign Users</label>
                  <div className="user-checkboxes">
                    {users.map((u) => (
                      <label key={u._id} className="user-checkbox-item">
                        <input
                          type="checkbox"
                          checked={form.assignedUsers.includes(u._id)}
                          onChange={() => toggleUser(u._id)}
                        />
                        {u.name} <span style={{ color: "#94a3b8", fontSize: 12 }}>({u.email})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="form-row">
                <label>Attach Documents</label>
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
          message={`Delete project "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
