const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
  }}>
    <div style={{
      background: "#fff", borderRadius: 12, padding: "32px 28px",
      maxWidth: 400, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    }}>
      <p style={{ fontSize: 15, color: "#1e293b", marginBottom: 24, lineHeight: 1.6 }}>{message}</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{
          padding: "8px 20px", borderRadius: 8, border: "1.5px solid #e2e8f0",
          background: "#f8fafc", cursor: "pointer", fontWeight: 600, fontSize: 13,
        }}>Cancel</button>
        <button onClick={onConfirm} style={{
          padding: "8px 20px", borderRadius: 8, border: "none",
          background: "#dc2626", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13,
        }}>Confirm</button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;
