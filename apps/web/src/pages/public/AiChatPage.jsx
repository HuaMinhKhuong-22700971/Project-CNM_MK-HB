import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { sendAiChat } from "../../services/ai.service";

function createMessage(role, content) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString()
  };
}

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }
  return error.message || fallbackMessage;
}

const QUICK_PROMPTS = [
  "Build PC gaming 20 triệu 🎮",
  "CPU Intel vs AMD khác nhau gì?",
  "RAM 16GB hay 32GB cho lập trình?",
  "GPU nào chơi được 4K?",
];

export function AiChatPage() {
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    createMessage(
      "assistant",
      "Xin chào! Tôi là **AI Tư Vấn PC** của PC Mall. 🤖\n\nTôi có thể giúp bạn:\n• Gợi ý cấu hình PC theo ngân sách\n• Tư vấn khả năng tương thích linh kiện\n• So sánh CPU, GPU, RAM, Mainboard\n• Giải thích thông số kỹ thuật\n\nBạn muốn hỏi về điều gì?"
    )
  ]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const canSend = useMemo(() => String(question || "").trim().length > 0 && !loading, [loading, question]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleChange(event) {
    setQuestion(event.target.value);
    setErrorMessage("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) handleSubmit(e);
    }
  }

  async function handleSubmit(event) {
    event?.preventDefault();
    const trimmedQuestion = String(question || "").trim();
    if (!trimmedQuestion || loading) return;

    const userMessage = createMessage("user", trimmedQuestion);
    const nextMessages = [...messages, userMessage];

    try {
      setLoading(true);
      setErrorMessage("");
      setMessages(nextMessages);
      setQuestion("");

      const context = {
        recent_messages: nextMessages.slice(-6).map((message) => ({
          role: message.role,
          content: message.content
        }))
      };

      const response = await sendAiChat({ message: trimmedQuestion, context });
      const reply =
        String(response?.data?.reply || response?.reply || "").trim() ||
        "Tôi chưa có câu trả lời phù hợp. Bạn hãy mô tả thêm nhu cầu nhé!";

      setMessages((prev) => [...prev, createMessage("assistant", reply)]);
      textareaRef.current?.focus();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể kết nối với trợ lý AI. Vui lòng thử lại."));
      setQuestion(trimmedQuestion);
    } finally {
      setLoading(false);
    }
  }

  function renderContent(content) {
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  }

  return (
    <div style={{ minHeight: "calc(100vh - 140px)", display: "flex", flexDirection: "column", padding: "32px 0 0" }}>
      {/* Header */}
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 50, padding: "8px 20px", marginBottom: 16
        }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, letterSpacing: "0.04em", textTransform: "uppercase" }}>AI Tư Vấn PC</span>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite" }} />
        </div>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, margin: "0 0 8px", lineHeight: 1.1 }}>
          Tư vấn thông minh,{" "}
          <span style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            tức thì
          </span>
        </h1>
        <p style={{ color: "var(--market-muted)", fontSize: 16, margin: 0, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
          Hỏi về build PC, tương thích linh kiện, ngân sách — AI trả lời ngay lập tức.
        </p>
      </div>

      {/* Quick Prompts */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 24 }}>
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => { setQuestion(prompt); textareaRef.current?.focus(); }}
            style={{
              padding: "8px 16px", borderRadius: 50,
              border: "1.5px solid #e2e8f0",
              background: "#fff",
              color: "#475569",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#667eea"; e.currentTarget.style.color = "#667eea"; e.currentTarget.style.background = "#f5f3ff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; e.currentTarget.style.background = "#fff"; }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div style={{
        flex: 1,
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(20px)",
        borderRadius: 28,
        border: "1px solid rgba(255,255,255,0.8)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 420,
        maxHeight: "calc(100vh - 380px)"
      }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div
                key={message.id}
                style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                  gap: 12,
                  alignItems: "flex-end"
                }}
              >
                {!isUser && (
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, boxShadow: "0 2px 8px rgba(102,126,234,0.3)"
                  }}>🤖</div>
                )}
                <div style={{ maxWidth: "72%" }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: isUser ? "rgba(255,255,255,0.7)" : "#94a3b8",
                    marginBottom: 6,
                    textAlign: isUser ? "right" : "left",
                    textTransform: "uppercase", letterSpacing: "0.05em"
                  }}>
                    {isUser ? "Bạn" : "AI Tư Vấn"}
                  </div>
                  <div style={{
                    padding: "14px 18px",
                    borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                    background: isUser
                      ? "linear-gradient(135deg, #667eea, #764ba2)"
                      : "#fff",
                    color: isUser ? "#fff" : "#1e293b",
                    fontSize: 15,
                    lineHeight: 1.7,
                    boxShadow: isUser
                      ? "0 4px 20px rgba(102,126,234,0.3)"
                      : "0 2px 12px rgba(0,0,0,0.06)",
                    border: isUser ? "none" : "1px solid #f1f5f9"
                  }}
                    dangerouslySetInnerHTML={{ __html: renderContent(message.content) }}
                  />
                </div>
                {isUser && (
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg, #0f172a, #1e293b)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, color: "#fff", fontWeight: 800
                  }}>B</div>
                )}
              </div>
            );
          })}

          {loading && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
              }}>🤖</div>
              <div style={{
                padding: "14px 20px", borderRadius: "20px 20px 20px 4px",
                background: "#fff", border: "1px solid #f1f5f9",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                display: "flex", gap: 6, alignItems: "center"
              }}>
                {[0, 0.2, 0.4].map((delay, i) => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#667eea",
                    animation: `bounce 1.4s ease-in-out ${delay}s infinite`
                  }} />
                ))}
              </div>
            </div>
          )}

          {errorMessage && (
            <div style={{
              padding: "12px 18px", borderRadius: 14, background: "#fef2f2",
              border: "1px solid #fca5a5", color: "#dc2626", fontSize: 14, fontWeight: 600
            }}>
              ⚠️ {errorMessage}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          padding: "16px 20px", borderTop: "1px solid rgba(0,0,0,0.06)",
          background: "rgba(255,255,255,0.9)"
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <textarea
              ref={textareaRef}
              value={question}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder="Nhập câu hỏi... (Enter để gửi, Shift+Enter để xuống dòng)"
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 16,
                border: "1.5px solid #e2e8f0",
                fontSize: 15,
                lineHeight: 1.6,
                resize: "none",
                outline: "none",
                fontFamily: "inherit",
                background: "#f8fafc",
                transition: "border-color 0.2s ease",
                color: "#1e293b"
              }}
              onFocus={(e) => { e.target.style.borderColor = "#667eea"; e.target.style.background = "#fff"; }}
              onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; }}
            />
            <button
              type="submit"
              disabled={!canSend}
              style={{
                width: 52, height: 52,
                borderRadius: 16,
                background: canSend
                  ? "linear-gradient(135deg, #667eea, #764ba2)"
                  : "#e2e8f0",
                border: "none",
                color: canSend ? "#fff" : "#94a3b8",
                cursor: canSend ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.2s ease",
                boxShadow: canSend ? "0 4px 16px rgba(102,126,234,0.4)" : "none"
              }}
            >
              {loading ? (
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 1s linear infinite" }} />
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </form>
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#94a3b8" }}>
            Powered by GPT-4o-mini · PC Mall AI Advisor
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
