import { useEffect, useState } from "react";
import { fetchSubmissions, createSubmission, updateSubmission, reviewSubmission } from "../api/submissionApi";
import { fetchAssignments } from "../api/assignmentApi";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import toast from "react-hot-toast";
import "../styles/SubmissionsPage.css";

const PROGRESS_OPTIONS = ["Not Started", "In Progress", "Completed", "Under Review"];

const SubmissionsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [submissions, setSubmissions]   = useState([]);
  const [assignments, setAssignments]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [filterReview, setFilterReview] = useState("");
  const [page, setPage]                 = useState(1);
  const [total, setTotal]               = useState(0);
  const LIMIT = 15;

  const [submitForm, setSubmitForm] = useState({
    assignmentId: "", githubLink: "", liveUrl: "",
    documentation: "", notes: "", progress: "In Progress",
  });
  const [submitFiles, setSubmitFiles] = useState([]);

  const [reviewForm, setReviewForm] = useState({
    reviewStatus: "Approved", feedback: "", rating: "", marksAwarded: "",
  });

  const load = () => {
    setLoading(true);
    const params = { page, limit: LIMIT };
    if (filterReview) params.reviewStatus = filterReview;

    fetchSubmissions(params)
      .then((res) => { setSubmissions(res.data); setTotal(res.total); })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, filterReview]);
  useEffect(() => {
    if (!isAdmin) {
      fetchAssignments({ limit: 100 }).then((r) => setAssignments(r.data)).catch(() => {});
    }
  }, [isAdmin]);

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(submitForm).forEach(([k, v]) => { if (v) fd.append(k, v); });
    submitFiles.forEach((f) => fd.append("files", f));
    try {
      await createSubmission(fd);
      toast.success("Work submitted successfully!");
      setShowSubmitForm(false);
      setSubmitForm({ assignmentId: "", githubLink: "", liveUrl: "", documentation: "", notes: "", progress: "In Progress" });
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleUpdateProgress = async (submissionId, progress) => {
    const fd = new FormData();
    fd.append("progress", progress);
    try {
      await updateSubmission(submissionId, fd);
      toast.success("Progress updated");
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await reviewSubmission(reviewTarget._id, reviewForm);
      toast.success("Review submitted");
      setReviewTarget(null);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="submissions-page">
      <div className="page-header">
        <h2>Submissions</h2>
        {!isAdmin && (
          <button className="btn-primary" onClick={() => setShowSubmitForm(true)}>+ Submit Work</button>
        )}
      </div>

      <div className="filters-bar">
        <select value={filterReview} onChange={(e) => { setFilterReview(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {["Pending","Approved","Rejected","Changes Requested"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="loading-text">Loading submissions...</p>
      ) : submissions.length === 0 ? (
        <p className="empty-text">No submissions found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                {isAdmin && <th>User</th>}
                <th>Assignment</th>
                <th>Project</th>
                <th>Progress</th>
                <th>Review</th>
                <th>Late?</th>
                <th>Submitted</th>
                <th>Marks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s, i) => (
                <tr key={s._id}>
                  <td>{(page - 1) * LIMIT + i + 1}</td>
                  {isAdmin && <td>{s.user?.name}</td>}
                  <td style={{ fontWeight: 600 }}>{s.assignment?.title}</td>
                  <td>{s.project?.title}</td>
                  <td>
                    {isAdmin ? (
                      <StatusBadge label={s.progress} />
                    ) : (
                      <select
                        value={s.progress}
                        onChange={(e) => handleUpdateProgress(s._id, e.target.value)}
                        style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6 }}
                      >
                        {PROGRESS_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    )}
                  </td>
                  <td><StatusBadge label={s.reviewStatus} /></td>
                  <td>
                    {s.isLate
                      ? <span style={{ color: "#dc2626", fontWeight: 700 }}>⚠️ Late</span>
                      : <span style={{ color: "#166534" }}>✓ On time</span>}
                  </td>
                  <td>{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : "—"}</td>
                  <td>{s.marksAwarded ?? "—"} {s.assignment?.marks ? `/ ${s.assignment.marks}` : ""}</td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {/* Links */}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {s.githubLink && <a href={s.githubLink} target="_blank" rel="noreferrer" className="link-chip">GitHub</a>}
                        {s.liveUrl    && <a href={s.liveUrl}    target="_blank" rel="noreferrer" className="link-chip">Live</a>}
                      </div>
                      {isAdmin && s.reviewStatus === "Pending" && (
                        <button className="btn-sm edit" onClick={() => {
                          setReviewTarget(s);
                          setReviewForm({ reviewStatus: "Approved", feedback: "", rating: "", marksAwarded: "" });
                        }}>Review</button>
                      )}
                      {isAdmin && s.reviewStatus !== "Pending" && s.feedback && (
                        <span style={{ fontSize: 11, color: "#64748b" }}>✓ Reviewed</span>
                      )}
                    </div>
                  </td>
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

      {/* Submit Work Modal */}
      {showSubmitForm && (
        <div className="modal-overlay">
          <div className="modal-box wide">
            <div className="modal-header">
              <h3>Submit Work</h3>
              <button className="modal-close" onClick={() => setShowSubmitForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmitWork} className="project-form">
              <div className="form-row">
                <label>Assignment *</label>
                <select required value={submitForm.assignmentId} onChange={(e) => setSubmitForm({ ...submitForm, assignmentId: e.target.value })}>
                  <option value="">Select assignment</option>
                  {assignments.map((a) => <option key={a._id} value={a._id}>{a.title}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label>Progress</label>
                <select value={submitForm.progress} onChange={(e) => setSubmitForm({ ...submitForm, progress: e.target.value })}>
                  {PROGRESS_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-2col">
                <div className="form-row">
                  <label>GitHub Repository URL</label>
                  <input type="url" value={submitForm.githubLink} onChange={(e) => setSubmitForm({ ...submitForm, githubLink: e.target.value })} placeholder="https://github.com/..." />
                </div>
                <div className="form-row">
                  <label>Live Project URL</label>
                  <input type="url" value={submitForm.liveUrl} onChange={(e) => setSubmitForm({ ...submitForm, liveUrl: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div className="form-row">
                <label>Documentation</label>
                <textarea rows={3} value={submitForm.documentation} onChange={(e) => setSubmitForm({ ...submitForm, documentation: e.target.value })} placeholder="Describe your implementation..." />
              </div>
              <div className="form-row">
                <label>Notes</label>
                <textarea rows={2} value={submitForm.notes} onChange={(e) => setSubmitForm({ ...submitForm, notes: e.target.value })} placeholder="Any additional notes..." />
              </div>
              <div className="form-row">
                <label>Attach Files (source code, docs)</label>
                <input type="file" multiple onChange={(e) => setSubmitFiles(Array.from(e.target.files))} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowSubmitForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Work</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewTarget && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Review Submission</h3>
              <button className="modal-close" onClick={() => setReviewTarget(null)}>✕</button>
            </div>
            <div className="review-info">
              <p><strong>Assignment:</strong> {reviewTarget.assignment?.title}</p>
              <p><strong>User:</strong> {reviewTarget.user?.name}</p>
              {reviewTarget.githubLink && <p><strong>GitHub:</strong> <a href={reviewTarget.githubLink} target="_blank" rel="noreferrer">{reviewTarget.githubLink}</a></p>}
              {reviewTarget.liveUrl    && <p><strong>Live:</strong>   <a href={reviewTarget.liveUrl}    target="_blank" rel="noreferrer">{reviewTarget.liveUrl}</a></p>}
              {reviewTarget.documentation && <p><strong>Docs:</strong> {reviewTarget.documentation}</p>}
              {reviewTarget.notes         && <p><strong>Notes:</strong> {reviewTarget.notes}</p>}
            </div>
            <form onSubmit={handleReview} className="project-form">
              <div className="form-row">
                <label>Decision *</label>
                <select value={reviewForm.reviewStatus} onChange={(e) => setReviewForm({ ...reviewForm, reviewStatus: e.target.value })}>
                  <option>Approved</option>
                  <option>Rejected</option>
                  <option>Changes Requested</option>
                </select>
              </div>
              <div className="form-2col">
                <div className="form-row">
                  <label>Rating (0-5)</label>
                  <input type="number" min="0" max="5" step="0.5" value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })} />
                </div>
                <div className="form-row">
                  <label>Marks Awarded</label>
                  <input type="number" min="0" value={reviewForm.marksAwarded} onChange={(e) => setReviewForm({ ...reviewForm, marksAwarded: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <label>Feedback / Comments</label>
                <textarea rows={4} value={reviewForm.feedback} onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })} placeholder="Provide detailed feedback..." />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setReviewTarget(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsPage;
