import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import {
  fetchChatUsers, fetchMessages, markMessagesRead,
  fetchGroups, createGroup, fetchGroupMessages, updateGroup, deleteGroup, markGroupRead,
} from "../api/chatApi";
import { fetchAllUsers } from "../api/userApi";
import "../styles/ChatPage.css";

const SOCKET_URL = "http://localhost:5000";

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const fmtTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// ── Active chat can be a user (DM) or a group
// activeChat = { type: "dm", data: userObj } | { type: "group", data: groupObj }

const ChatPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [chatUsers, setChatUsers]   = useState([]);
  const [groups, setGroups]         = useState([]);
  const [allUsers, setAllUsers]     = useState([]); // for group member picker
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [onlineIds, setOnlineIds]   = useState([]);
  const [typingFrom, setTypingFrom] = useState(null);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  // Group modal state
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup]     = useState(null);
  const [groupForm, setGroupForm]           = useState({ name: "", description: "", memberIds: [] });
  const [groupSaving, setGroupSaving]       = useState(false);

  const socketRef   = useRef(null);
  const bottomRef   = useRef(null);
  const typingTimer = useRef(null);

  // ── Socket setup ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("online_users", (ids) => setOnlineIds(ids));

    // DM incoming
    socket.on("receive_message", (msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    // Group incoming
    socket.on("receive_group_message", ({ groupId, message }) => {
      setActiveChat((cur) => {
        if (cur?.type === "group" && cur.data._id === groupId) {
          setMessages((prev) => {
            if (prev.find((m) => m._id === message._id)) return prev;
            return [...prev, message];
          });
        } else {
          // Update unread badge
          setGroups((prev) =>
            prev.map((g) => g._id === groupId ? { ...g, unread: (g.unread || 0) + 1 } : g)
          );
        }
        return cur;
      });
    });

    // Typing
    socket.on("user_typing",           ({ senderId }) => setTypingFrom(senderId));
    socket.on("user_stop_typing",      ({ senderId }) => setTypingFrom((p) => p === senderId ? null : p));
    socket.on("group_user_typing",     ({ senderId, groupId }) => {
      setActiveChat((cur) => {
        if (cur?.type === "group" && cur.data._id === groupId) setTypingFrom(senderId);
        return cur;
      });
    });
    socket.on("group_user_stop_typing", ({ senderId }) =>
      setTypingFrom((p) => p === senderId ? null : p)
    );

    return () => socket.disconnect();
  }, []);

  // ── Load sidebar data ──
  const loadSidebar = useCallback(() => {
    fetchChatUsers().then((r) => setChatUsers(r.data)).catch(() => {});
    fetchGroups().then((r) => setGroups(r.data)).catch(() => {});
  }, []);

  useEffect(() => { loadSidebar(); }, [loadSidebar]);

  useEffect(() => {
    if (isAdmin) fetchAllUsers().then((r) => setAllUsers(r.data)).catch(() => {});
  }, [isAdmin]);

  // ── Load messages when activeChat changes ──
  useEffect(() => {
    if (!activeChat) return;
    setLoadingMsgs(true);
    setMessages([]);
    setTypingFrom(null);

    if (activeChat.type === "dm") {
      fetchMessages(activeChat.data._id)
        .then((r) => setMessages(r.data))
        .catch(() => {})
        .finally(() => setLoadingMsgs(false));
      markMessagesRead(activeChat.data._id).catch(() => {});
      setChatUsers((prev) =>
        prev.map((u) => (u._id === activeChat.data._id ? { ...u, unread: 0 } : u))
      );
    } else {
      fetchGroupMessages(activeChat.data._id)
        .then((r) => setMessages(r.data))
        .catch(() => {})
        .finally(() => setLoadingMsgs(false));
      markGroupRead(activeChat.data._id).catch(() => {});
      setGroups((prev) =>
        prev.map((g) => (g._id === activeChat.data._id ? { ...g, unread: 0 } : g))
      );
    }
  }, [activeChat]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingFrom]);

  // ── Send ──
  const send = useCallback(() => {
    if (!input.trim() || !activeChat || !socketRef.current) return;

    if (activeChat.type === "dm") {
      socketRef.current.emit("send_message",       { receiverId: activeChat.data._id, text: input.trim() });
      socketRef.current.emit("stop_typing",        { receiverId: activeChat.data._id });
    } else {
      socketRef.current.emit("send_group_message", { groupId: activeChat.data._id, text: input.trim() });
      socketRef.current.emit("group_stop_typing",  { groupId: activeChat.data._id });
    }
    setInput("");
    clearTimeout(typingTimer.current);
  }, [input, activeChat]);

  // ── Typing ──
  const handleInput = (e) => {
    setInput(e.target.value);
    if (!activeChat || !socketRef.current) return;
    if (activeChat.type === "dm") {
      socketRef.current.emit("typing",        { receiverId: activeChat.data._id });
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => socketRef.current.emit("stop_typing", { receiverId: activeChat.data._id }), 1500);
    } else {
      socketRef.current.emit("group_typing",  { groupId: activeChat.data._id });
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => socketRef.current.emit("group_stop_typing", { groupId: activeChat.data._id }), 1500);
    }
  };

  // ── Group modal ──
  const openCreateGroup = () => {
    setEditingGroup(null);
    setGroupForm({ name: "", description: "", memberIds: allUsers.map((u) => u._id) });
    setShowGroupModal(true);
  };

  const openEditGroup = (g, e) => {
    e.stopPropagation();
    setEditingGroup(g);
    setGroupForm({
      name: g.name,
      description: g.description || "",
      memberIds: g.members.map((m) => m._id || m),
    });
    setShowGroupModal(true);
  };

  const handleDeleteGroup = async (g, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete group "${g.name}"?`)) return;
    try {
      await deleteGroup(g._id);
      setGroups((prev) => prev.filter((x) => x._id !== g._id));
      if (activeChat?.type === "group" && activeChat.data._id === g._id) setActiveChat(null);
    } catch (err) { alert(err.message); }
  };

  const toggleMember = (id) => {
    setGroupForm((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(id)
        ? prev.memberIds.filter((m) => m !== id)
        : [...prev.memberIds, id],
    }));
  };

  const saveGroup = async () => {
    if (!groupForm.name.trim()) return;
    setGroupSaving(true);
    try {
      let saved;
      if (editingGroup) {
        const res = await updateGroup(editingGroup._id, groupForm);
        saved = res.data;
        setGroups((prev) => prev.map((g) => g._id === saved._id ? { ...g, ...saved } : g));
        if (activeChat?.type === "group" && activeChat.data._id === saved._id)
          setActiveChat({ type: "group", data: saved });
      } else {
        const res = await createGroup(groupForm);
        saved = res.data;
        setGroups((prev) => [{ ...saved, unread: 0 }, ...prev]);
        // Tell socket to join the new room
        socketRef.current?.emit("join_group", { groupId: saved._id });
      }
      setShowGroupModal(false);
    } catch (err) { alert(err.message); }
    finally { setGroupSaving(false); }
  };

  const isOnline    = (id) => onlineIds.includes(id?.toString());
  const totalUnread = [...chatUsers, ...groups].reduce((s, x) => s + (x.unread || 0), 0);

  // Header info for active chat
  const chatTitle  = activeChat?.type === "dm" ? activeChat.data.name : activeChat?.data.name;
  const chatSub    = activeChat?.type === "dm"
    ? (typingFrom === activeChat.data._id ? "✏️ typing..." : isOnline(activeChat.data._id) ? "🟢 Online" : "⚫ Offline")
    : (typingFrom ? "✏️ someone is typing..." : `${activeChat?.data.members?.length || 0} members`);

  return (
    <div className="chat-page">
      {/* ── Sidebar ── */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <span className="chat-sidebar-title">💬 Messages</span>
          <span className="chat-online-count">{onlineIds.length} online</span>
        </div>

        {/* Direct Messages */}
        <div className="chat-section-label">Direct Messages</div>
        <div className="chat-user-list">
          {chatUsers.length === 0 && <div className="chat-no-users">No contacts yet.</div>}
          {chatUsers.map((u) => (
            <div key={u._id}
              className={`chat-user-item${activeChat?.type === "dm" && activeChat.data._id === u._id ? " active" : ""}`}
              onClick={() => setActiveChat({ type: "dm", data: u })}>
              <div className="chat-avatar-wrap">
                <div className="chat-avatar">{getInitials(u.name)}</div>
                <div className={`online-dot${isOnline(u._id) ? " online" : ""}`} />
              </div>
              <div className="chat-user-info">
                <span className="chat-user-name">{u.name}</span>
                <span className="chat-user-role">{u.role}</span>
              </div>
              {u.unread > 0 && <span className="chat-unread">{u.unread}</span>}
            </div>
          ))}
        </div>

        {/* Groups */}
        <div className="chat-section-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Groups</span>
          {isAdmin && (
            <button className="chat-new-group-btn" onClick={openCreateGroup} title="Create Group">+</button>
          )}
        </div>
        <div className="chat-user-list">
          {groups.length === 0 && <div className="chat-no-users">No groups yet.</div>}
          {groups.map((g) => (
            <div key={g._id}
              className={`chat-user-item${activeChat?.type === "group" && activeChat.data._id === g._id ? " active" : ""}`}
              onClick={() => setActiveChat({ type: "group", data: g })}>
              <div className="chat-avatar-wrap">
                <div className="chat-avatar group-avatar">#</div>
              </div>
              <div className="chat-user-info">
                <span className="chat-user-name">{g.name}</span>
                <span className="chat-user-role">{g.members?.length || 0} members</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {g.unread > 0 && <span className="chat-unread">{g.unread}</span>}
                {isAdmin && g.createdBy?._id === user._id && (
                  <>
                    <button className="group-action-btn" onClick={(e) => openEditGroup(g, e)} title="Edit">✏️</button>
                    <button className="group-action-btn" onClick={(e) => handleDeleteGroup(g, e)} title="Delete">🗑️</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chat Window ── */}
      <div className="chat-window">
        {!activeChat ? (
          <div className="chat-empty" style={{ flex: 1 }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <p>Select a conversation or group to start chatting</p>
            {totalUnread > 0 && (
              <span style={{ fontSize: 13, color: "var(--primary)" }}>
                You have {totalUnread} unread message{totalUnread > 1 ? "s" : ""}
              </span>
            )}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="chat-header">
              <div className="chat-avatar-wrap">
                {activeChat.type === "dm" ? (
                  <>
                    <div className="chat-avatar">{getInitials(activeChat.data.name)}</div>
                    <div className={`online-dot${isOnline(activeChat.data._id) ? " online" : ""}`} />
                  </>
                ) : (
                  <div className="chat-avatar group-avatar">#</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div className="chat-header-name">{chatTitle}</div>
                <div className="chat-header-status">{chatSub}</div>
              </div>
              {/* Group members preview */}
              {activeChat.type === "group" && (
                <div className="group-members-preview">
                  {(activeChat.data.members || []).slice(0, 5).map((m) => (
                    <div key={m._id || m} className="group-member-chip" title={m.name}>
                      {getInitials(m.name || "?")}
                    </div>
                  ))}
                  {(activeChat.data.members?.length || 0) > 5 && (
                    <div className="group-member-chip more">+{activeChat.data.members.length - 5}</div>
                  )}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {loadingMsgs ? (
                <div className="chat-empty"><div className="page-loader" /></div>
              ) : messages.length === 0 ? (
                <div className="chat-empty">
                  <div style={{ fontSize: 36 }}>{activeChat.type === "group" ? "👥" : "👋"}</div>
                  <p>{activeChat.type === "group" ? `Welcome to #${activeChat.data.name}!` : `Say hello to ${activeChat.data.name}!`}</p>
                </div>
              ) : messages.map((m) => {
                const senderId = m.sender?._id || m.sender;
                const isMe = senderId === user._id || senderId?.toString() === user._id?.toString();
                return (
                  <div key={m._id} className={`chat-msg${isMe ? " me" : ""}`}>
                    {!isMe && (
                      <div className="chat-avatar sm" title={m.sender?.name}>
                        {getInitials(m.sender?.name || "?")}
                      </div>
                    )}
                    <div className="chat-bubble-wrap">
                      {!isMe && activeChat.type === "group" && (
                        <div className="chat-sender-name">{m.sender?.name}</div>
                      )}
                      <div className="chat-bubble">{m.text}</div>
                      <div className="chat-time">{fmtTime(m.createdAt)}</div>
                    </div>
                  </div>
                );
              })}

              {typingFrom && (
                <div className="chat-msg">
                  <div className="chat-avatar sm">...</div>
                  <div className="chat-bubble typing"><span /><span /><span /></div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="chat-input-bar">
              <input
                className="chat-input"
                type="text"
                placeholder={activeChat.type === "group" ? `Message #${activeChat.data.name}...` : `Message ${activeChat.data.name}...`}
                value={input}
                onChange={handleInput}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button className="chat-send-btn" onClick={send} disabled={!input.trim()}>➤</button>
            </div>
          </>
        )}
      </div>

      {/* ── Create / Edit Group Modal ── */}
      {showGroupModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{editingGroup ? "Edit Group" : "Create Group"}</h3>

            <div className="form-group">
              <label>Group Name *</label>
              <input
                type="text"
                placeholder="e.g. Frontend Team"
                value={groupForm.name}
                onChange={(e) => setGroupForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                placeholder="What is this group about?"
                value={groupForm.description}
                onChange={(e) => setGroupForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Members ({groupForm.memberIds.length} selected)</label>
              <div className="group-member-list">
                {allUsers.map((u) => (
                  <label key={u._id} className="group-member-check">
                    <input
                      type="checkbox"
                      checked={groupForm.memberIds.includes(u._id)}
                      onChange={() => toggleMember(u._id)}
                    />
                    <div className="chat-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                      {getInitials(u.name)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.email}</div>
                    </div>
                  </label>
                ))}
                {allUsers.length === 0 && (
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No users available.</div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setShowGroupModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveGroup} disabled={groupSaving || !groupForm.name.trim()}>
                {groupSaving ? "Saving..." : editingGroup ? "Update" : "Create Group"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
