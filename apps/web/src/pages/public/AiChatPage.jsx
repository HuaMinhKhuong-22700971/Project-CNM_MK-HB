import { useMemo, useRef, useState } from "react";
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

export function AiChatPage() {
  const textareaRef = useRef(null);
  const [messages, setMessages] = useState([
    createMessage(
      "assistant",
      "Xin chào. Bạn có thể hỏi về build PC gaming, khả năng tương thích CPU - mainboard, RAM, PSU hoặc gợi ý linh kiện theo ngân sách."
    )
  ]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const canSend = useMemo(() => String(question || "").trim().length > 0 && !loading, [loading, question]);

  function handleChange(event) {
    setQuestion(event.target.value);
    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedQuestion = String(question || "").trim();
    if (!trimmedQuestion || loading) {
      return;
    }

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

      const response = await sendAiChat({
        message: trimmedQuestion,
        context
      });

      const reply =
        String(response?.data?.reply || "").trim() ||
        "Tôi chưa có câu trả lời phù hợp. Bạn hãy bổ sung thêm ngân sách, mục đích sử dụng hoặc linh kiện đang nhắm tới.";

      setMessages((prevState) => [...prevState, createMessage("assistant", reply)]);
      textareaRef.current?.focus();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể nhận phản hồi từ trợ lý AI."));
      setQuestion(trimmedQuestion);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="market-chat">
      <section className="market-builder__hero">
        <div className="market-builder__hero-top">
          <div>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--market-primary-dark)" }}>
              Trợ lý mua sắm công nghệ
            </div>
            <h1 style={{ margin: "8px 0 10px", fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 0.96 }}>
              AI tư vấn linh kiện theo cách dễ hiểu như đang chat Messenger.
            </h1>
            <p style={{ margin: 0, maxWidth: 780, color: "var(--market-muted)", fontSize: 17, lineHeight: 1.7 }}>
              Hỏi về cấu hình gaming, hiệu năng làm việc, khả năng nâng cấp hoặc mức tương thích giữa CPU, mainboard,
              RAM, GPU và nguồn để chọn đúng sản phẩm trước khi mua.
            </p>
          </div>
        </div>
      </section>

      {errorMessage ? <div className="market-empty" style={{ color: "#b91c1c" }}>{errorMessage}</div> : null}

      <section className="market-chat__shell">
        <div className="market-chat__messages">
          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div key={message.id} className={`market-chat__row${isUser ? " market-chat__row--user" : ""}`}>
                <div className={`market-chat__bubble${isUser ? " market-chat__bubble--user" : ""}`}>
                  <div className="market-chat__author">{isUser ? "Bạn" : "Trợ lý AI"}</div>
                  <div>{message.content}</div>
                </div>
              </div>
            );
          })}

          {loading ? (
            <div className="market-chat__row">
              <div className="market-chat__bubble">
                <div className="market-chat__author">Trợ lý AI</div>
                <div>Đang phân tích yêu cầu và chuẩn bị câu trả lời phù hợp...</div>
              </div>
            </div>
          ) : null}
        </div>

        <form className="market-chat__composer" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className="market-textarea"
            value={question}
            onChange={handleChange}
            rows={4}
            placeholder="Ví dụ: Nên build PC gaming 20 triệu như thế nào để chơi AAA mượt 1080p?"
          />
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ color: "var(--market-muted)", fontSize: 14 }}>
              Gợi ý: hỏi về CPU - mainboard, công suất PSU, RAM tối ưu hoặc cấu hình theo ngân sách.
            </div>
            <button className="market-btn market-btn--primary" type="submit" disabled={!canSend}>
              {loading ? "Đang gửi..." : "Gửi câu hỏi"}
            </button>
          </div>
        </form>
      </section>

      <div className="market-chat__dock">💬 AI Chat</div>
    </div>
  );
}
