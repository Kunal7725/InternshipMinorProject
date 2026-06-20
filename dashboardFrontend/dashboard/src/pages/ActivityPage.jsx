import { useEffect, useState } from "react";
import { fetchActivityLogs } from "../api/activityApi";
import toast from "react-hot-toast";
import "../styles/ActivityPage.css";

const actionLabels = {
  created_project:     { label: "Created Project",     color: "#166534", bg: "#dcfce7" },
  updated_project:     { label: "Updated Project",     color: "#0369a1", bg: "#e0f2fe" },
  deleted_project:     { label: "Deleted Project",     color: "#991b1b", bg: "#fee2e2" },
  created_assignment:  { label: "Created Assignment",  color: "#166534", bg: "#dcfce7" },
  updated_assignment:  { label: "Updated Assignment",  color: "#0369a1", bg: "#e0f2fe" },
  deleted_assignment:  { label: "Deleted Assignment",  color: "#991b1b", bg: "#fee2e2" },
  created_submission:  { label: "Submitted Work",      color: "#5b21b6", bg: "#ede9fe" },
  reviewed_submission: { label: "Reviewed Submission", color: "#854d0e", bg: "#fef9c3" },
};

const ActivityPage = () => {
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [filterEntity, setFilterEntity] = useState("");
  const LIMIT = 30;

  const load = () => {
    setLoading(true);
    const params = { page, limit: LIMIT };
    if (filterEntity) params.entity = filterEntity;

    fetchActivityLogs(params)
      .then((res) => { setLogs(res.data); setTotal(res.total); })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, filterEntity]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="activity-page">
      <div className="page-header">
        <h2>Activity Log & Audit Trail</h2>
        <span className="total-badge">{total} total events</span>
      </div>

      <div className="filters-bar">
        <select value={filterEntity} onChange={(e) => { setFilterEntity(e.target.value); setPage(1); }}>
          <option value="">All Entities</option>
          <option value="Project">Projects</option>
          <option value="Assignment">Assignments</option>
          <option value="Submission">Submissions</option>
        </select>
      </div>

      {loading ? (
        <p className="loading-text">Loading activity...</p>
      ) : logs.length === 0 ? (
        <p className="empty-text">No activity recorded yet.</p>
      ) : (
        <div className="activity-timeline">
          {logs.map((log) => {
            const meta = actionLabels[log.action] || { label: log.action, color: "#64748b", bg: "#f1f5f9" };
            return (
              <div key={log._id} className="activity-item">
                <div className="activity-dot" style={{ background: meta.color }} />
                <div className="activity-content">
                  <div className="activity-top">
                    <span className="activity-action" style={{ background: meta.bg, color: meta.color }}>
                      {meta.label}
                    </span>
                    <span className="activity-entity">{log.entity}</span>
                    {log.entityId && (
                      <span className="activity-id">#{log.entityId.toString().slice(-6)}</span>
                    )}
                  </div>
                  <div className="activity-meta">
                    <span>{log.meta?.method} {log.meta?.path}</span>
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                    {log.ip && <span>IP: {log.ip}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹ Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next ›</button>
        </div>
      )}
    </div>
  );
};

export default ActivityPage;
