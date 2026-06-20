import { useState, useRef, useEffect } from "react";
import "../styles/ChatPage.css";

const MOCK_USERS = [
  { id: 1, name: "Admin", role: "Admin", online: true, avatar: "A", unread: 0 },
  { id: 2, name: "Alex Johnson", role: "Intern", online: true, avatar: "AJ", unread: 2 },
  { id: 3, name: "Sarah Chen", role: "Intern", online: false, avatar: "SC", unread: 0 },
  { id: 4, name: "Mike Torres", role: "Intern", online: true, avatar: "MT", unread: 1 },
  { id: 5, name: "Priya Patel", role: "Intern", online: false, avatar: "PP", unread: 0 },
];

const MOCK_MESSAGES = {
  2: [
    { id: 1, from: 2, text: "Hey! Can I get feedback on my project submission?", time: "10:30 AM" },
    { id: 2, from: "me", text: "Sure! I'll review it by EOD today.", time: "10:32 AM" },
    { id: 3, from: 2, text: "Thank you so much! 🙏", time: "10:33 AM" },
  ],
  3: [
    { id: 1, from: 3, text: "The assignment deadline is tomorrow, right?", time: "9:15 AM" },
    { id: 2, from: "me", text: "Yes, please submit by 11:59 PM.", time: "9:20 AM" },
  ],
  4: [
    { id: 1, from: 4, text: "Hi Admin, I have a question about the project requirements.", time: "2:00 PM" },
  ],
  5: [],
};

const ChatPage = () => {
  const [activeUser, setActiveUser] = useState(MOCK_USERS[1]);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeUser]);

  const send = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), from: "me", text: input, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages((prev) => ({ ...prev, [activeUser.id]: [...(prev[activeUser.id] || []), newMsg] }));
    setInput("");
    // Simulate typing reply
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply = { id: Date.now() + 1, from: activeUser.id, text: "Got it! I'll get back to you shortly. 👍", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
      setMessages((prev) => ({ ...prev, [activeUser.id]: [...(prev[activeUser.id] || []), reply] }));
    }, 2000);
  };

  const msgs = messages[activeUser.id] || [];

  return (
    <div className="chat-page">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <span className="chat-sidebar-title">💬 Messages</span>
          <span className="chat-online-count">{MOCK_USERS.filter(u => u.online).length} online</span>
        </div>
        <div className="chat-user-list">
          {MOCK_USERS.filter(u => u.id !== 1).map((u) => (
            <div key={u.id} className={`chat-user-item${activeUser.id === u.id ? " active" : ""}`}
              onClick={() => setActiveUser(u)}>
              <div className="chat-avatar-wrap">
                <div className="chat-avatar">{u.avatar}</div>
                <div className={`online-dot${u.online ? " online" : ""}`} />
              </div>
              <div className="chat-user-info">
                <span className="chat-user-name">{u.name}</span>
                <span className="chat-user-role">{u.role}</span>
              </div>
              {u.unread > 0 && <span className="chat-unread">{u.unread}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="chat-window">
        {/* Chat header */}
        <div className="chat-header">
          <div className="chat-avatar-wrap">
            <div className="chat-avatar">{activeUser.avatar}</div>
            <div className={`online-dot${activeUser.online ? " online" : ""}`} />
          </div>
          <div>
            <div className="chat-header-name">{activeUser.name}</div>
            <div className="chat-header-status">{activeUser.online ? "🟢 Online" : "⚫ Offline"}</div>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {msgs.length === 0 ? (
            <div className="chat-empty">
              <div style={{ fontSize: 40 }}>💬</div>
              <p>Start the conversation with {activeUser.name}</p>
            </div>
          ) : (
            msgs.map((m) => {
              const isMe = m.from === "me";
              return (
                <div key={m.id} className={`chat-msg${isMe ? " me" : ""}`}>
                  {!isMe && <div className="chat-avatar sm">{activeUser.avatar}</div>}
                  <div className="chat-bubble-wrap">
                    <div className="chat-bubble">{m.text}</div>
                    <div className="chat-time">{m.time}</div>
                  </div>
                </div>
              );
            })
          )}
          {typing && (
            <div className="chat-msg">
              <div className="chat-avatar sm">{activeUser.avatar}</div>
              <div className="chat-bubble typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chat-input-bar">
          <button className="chat-attach-btn" title="Attach file">📎</button>
          <input
            className="chat-input"
            type="text"
            placeholder={`Message ${activeUser.name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button className="chat-emoji-btn" title="Emoji">😊</button>
          <button className="chat-send-btn" onClick={send} disabled={!input.trim()}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
