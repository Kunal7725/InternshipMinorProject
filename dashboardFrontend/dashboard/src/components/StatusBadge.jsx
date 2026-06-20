const colorMap = {
  // Project status
  Planning: { bg: "#e0f2fe", color: "#0369a1" },
  Active: { bg: "#dcfce7", color: "#166534" },
  "On Hold": { bg: "#fef9c3", color: "#854d0e" },
  Completed: { bg: "#d1fae5", color: "#065f46" },
  Archived: { bg: "#f1f5f9", color: "#64748b" },
  // Priority
  Low: { bg: "#dcfce7", color: "#166534" },
  Medium: { bg: "#fef9c3", color: "#854d0e" },
  High: { bg: "#fee2e2", color: "#991b1b" },
  // Review
  Pending: { bg: "#fef9c3", color: "#854d0e" },
  Approved: { bg: "#dcfce7", color: "#166534" },
  Rejected: { bg: "#fee2e2", color: "#991b1b" },
  "Changes Requested": { bg: "#ede9fe", color: "#5b21b6" },
  // Progress
  "Not Started": { bg: "#f1f5f9", color: "#64748b" },
  "In Progress": { bg: "#e0f2fe", color: "#0369a1" },
  "Under Review": { bg: "#ede9fe", color: "#5b21b6" },
  // Assignment status
  Open: { bg: "#dcfce7", color: "#166534" },
  Closed: { bg: "#f1f5f9", color: "#64748b" },
};

const StatusBadge = ({ label }) => {
  const style = colorMap[label] || { bg: "#f1f5f9", color: "#64748b" };
  return (
    <span style={{
      background: style.bg,
      color: style.color,
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 700,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
};

export default StatusBadge;
