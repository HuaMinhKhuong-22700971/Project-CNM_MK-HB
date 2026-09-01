import { useState, useEffect, useRef } from "react";
import { httpClient } from "../../services/http";

const SUGGESTED_QUESTIONS = [
  "🎮 Bộ này chơi được Black Myth Wukong không?",
  "🎬 Dựng phim 4K Premiere có mượt không?",
  "⚡ Nguồn điện đã đủ công suất chưa?",
  "⚖️ Nên nâng GPU hay CPU trước?"
];

/**
 * AIAdvisorPanel — Khung tư vấn AI nhúng trực tiếp trong trang PC Builder
 * Biết rõ ngữ cảnh (Context-Aware) các linh kiện đang được chọn trong Builder.
 * Tự động tạo Proactive AI Warnings khi linh kiện được thêm/thay đổi.
 */
export function AIAdvisorPanel({ selectedItems = {}, totalPrice = 0, budget = "25000000", xaiReport }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Chào bạn! Tôi là Trợ Lý AI PC Mall. Tôi sẽ tự động phân tích và đưa ra cảnh báo kỹ thuật ngay khi bạn chọn linh kiện."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [proactiveAlert, setProactiveAlert] = useState(null);
  const lastNoticeKeyRef = useRef("");

  const safeTotalPrice = Number(totalPrice || 0);
  const selectedCount = Object.keys(selectedItems || {}).length;

  // Proactive AI Warning Generator khi component thay đổi
  useEffect(() => {
    if (!selectedItems || Object.keys(selectedItems).length === 0) {
      setProactiveAlert(null);
      return;
    }

    const alert = generateProactiveNotice(selectedItems, xaiReport);
    if (alert) {
      const noticeKey = `${alert.title}:${alert.text}`;
      if (noticeKey !== lastNoticeKeyRef.current) {
        lastNoticeKeyRef.current = noticeKey;
        setProactiveAlert(alert);
      }
    } else {
      setProactiveAlert(null);
    }
  }, [selectedItems, xaiReport]);

  function generateProactiveNotice(itemsMap, report) {
    const cpu = itemsMap.cpu?.product || itemsMap.cpu;
    const gpu = itemsMap.gpu?.product || itemsMap.gpu;
    const mainboard = itemsMap.mainboard?.product || itemsMap.mainboard;
    const ram = itemsMap.ram?.product || itemsMap.ram;
    const psu = itemsMap.psu?.product || itemsMap.psu;
    const cooling = itemsMap.cooling?.product || itemsMap.cooling;

    const cpuName = String(cpu?.name || cpu?.productName || "").toLowerCase();
    const gpuName = String(gpu?.name || gpu?.productName || "").toLowerCase();
    const mbName = String(mainboard?.name || mainboard?.productName || "").toLowerCase();
    const ramName = String(ram?.name || ram?.productName || "").toLowerCase();
    const psuName = String(psu?.name || psu?.productName || "").toLowerCase();
    const coolingName = String(cooling?.name || cooling?.productName || "").toLowerCase();

    // 1. High-end CPU Thermal warning (i9 / i7 / Ryzen 9 / X3D)
    if (cpuName.includes("14900") || cpuName.includes("13900") || cpuName.includes("7950x") || cpuName.includes("7900x") || cpuName.includes("i9")) {
      if (!cooling || (!coolingName.includes("360") && !coolingName.includes("aio"))) {
        return {
          type: "warning",
          title: "⚠️ AI Proactive Warning: CPU Flagship Tỏa Nhiệt Cao",
          text: `CPU ${cpu?.name || cpu?.productName || "Core i9/Ryzen 9"} tỏa nhiệt rất lớn (>250W). Gợi ý: Hãy chọn Tản nhiệt nước AIO 360mm để tránh tụt xung khi full load.`
        };
      }
    }

    // 2. High-end GPU Power & Clearance warning (RTX 4090 / 4080 / 7900 XTX)
    if (gpuName.includes("4090") || gpuName.includes("4080") || gpuName.includes("7900 xtx")) {
      if (!psu || (!psuName.includes("850") && !psuName.includes("1000") && !psuName.includes("1200"))) {
        return {
          type: "warning",
          title: "⚠️ AI Proactive Warning: GPU Đỉnh Bảng Cần PSU Lớn",
          text: `Card đồ họa ${gpu?.name || gpu?.productName || "RTX 4090/4080"} yêu cầu Nguồn tối thiểu 850W-1000W chuẩn ATX 3.0 có cáp 12VHPWR cắm trực tiếp.`
        };
      }
    }

    // 3. Mainboard vs RAM Socket / Type Mismatch
    if (mbName.includes("ddr5") && ramName && !ramName.includes("ddr5")) {
      return {
        type: "error",
        title: "🔴 AI Proactive Alert: Xung Đột Chuẩn RAM",
        text: "Mainboard hỗ trợ RAM DDR5 nhưng bạn vừa chọn RAM DDR4. Vui lòng đổi sang thanh RAM DDR5 để lắp vừa chân cắm."
      };
    }

    // 4. Report Blocker Warnings
    if (report?.summary?.blockerCount > 0) {
      const firstBlocker = report.checks?.find((c) => c.severity === "BLOCKER");
      return {
        type: "error",
        title: "⛔ AI Proactive Alert: Phát Hiện Lỗi Xung Đột Phân Cấp",
        text: firstBlocker?.explanation?.short || `Phát hiện ${report.summary.blockerCount} xung đột phần cứng nghiêm trọng cần khắc phục trước khi mua.`
      };
    }

    // 5. Positive Combo Insight
    if (cpu && gpu) {
      return {
        type: "success",
        title: "💡 AI Proactive Insight: Cân Bằng Cấu Hình",
        text: `Đã phối hợp CPU ${cpu.name || cpu.productName} + GPU ${gpu.name || gpu.productName}. Cấu hình rất cân bằng cho Gaming 1080p/2K và đồ họa!`
      };
    }

    return null;
  }

  async function handleSend(questionText) {
    const textToSend = questionText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Chuẩn bị ngữ cảnh cấu hình hiện tại
      const buildContext = {
        selectedCount,
        totalPrice: safeTotalPrice,
        budget,
        items: Object.entries(selectedItems || {}).map(([type, item]) => ({
          type: type.toUpperCase(),
          name: item?.product?.name || item?.name || "Linh kiện"
        })),
        xaiScore: xaiReport?.score || 80,
        compatible: xaiReport?.compatible ?? true
      };

      const res = await httpClient.post("/pc-builder/ai-advice", {
        question: textToSend,
        buildContext
      });

      const replyText = res.data?.data?.advice || res.data?.advice || generateSmartFallbackAdvice(textToSend, buildContext);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: replyText }
      ]);
    } catch (_err) {
      // Fallback thông minh dựa trên tri thức có sẵn
      const fallbackText = generateSmartFallbackAdvice(textToSend, {
        selectedCount,
        totalPrice: safeTotalPrice,
        items: Object.entries(selectedItems || {}).map(([type, item]) => ({
          type: type.toUpperCase(),
          name: item?.product?.name || item?.name || "Linh kiện"
        }))
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: fallbackText }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function generateSmartFallbackAdvice(q, ctx) {
    const query = q.toLowerCase();
    const cpuItem = ctx.items?.find((i) => i.type === "CPU");
    const gpuItem = ctx.items?.find((i) => i.type === "GPU");

    if (query.includes("wukong") || query.includes("gta") || query.includes("chơi")) {
      if (gpuItem) {
        return `🎮 Với card đồ họa ${gpuItem.name} và CPU ${cpuItem?.name || "hiện tại"}, bộ PC của bạn đạt mức hiệu năng tối ưu. Bạn có thể chơi mượt các tựa game AAA ở 1080p High Settings (trên 60 FPS).`;
      }
      return "🎮 Để chơi mượt các tựa game nặng như Wukong hay GTA V, bạn nên chọn thêm một Card đồ họa rời (GPU) như RTX 4060 hoặc RX 7600.";
    }

    if (query.includes("render") || query.includes("dựng phim") || query.includes("premiere")) {
      return `🎬 Cho nhu cầu dựng phim 4K: Bộ PC của bạn có tổng giá trị ${(ctx.totalPrice || 0).toLocaleString("vi-VN")}đ. ${cpuItem ? `CPU ${cpuItem.name} xử lý render rất tốt.` : "Nên ưu tiên CPU từ 10 nhân trở lên và 32GB RAM để preview mượt mà."}`;
    }

    if (query.includes("nguồn") || query.includes("điện") || query.includes("psu")) {
      return `⚡ Tổng công suất ước tính của ${ctx.selectedCount} linh kiện hiện tại vào khoảng 350W - 420W. Sử dụng nguồn 600W - 650W 80 Plus sẽ đảm bảo dư tải 30% an toàn tuyệt đối.`;
    }

    return `🤖 Dựa trên cấu hình ${ctx.selectedCount} linh kiện (Tổng tiền: ${(ctx.totalPrice || 0).toLocaleString("vi-VN")}đ), bộ máy của bạn được đánh giá có độ tương thích cao. Bạn có thể tự tin đặt hàng hoặc tinh chỉnh thêm.`;
  }

  function getDynamicSuggestedQuestions(itemsMap) {
    const questions = [];

    const cpu = itemsMap.cpu?.product || itemsMap.cpu;
    const gpu = itemsMap.gpu?.product || itemsMap.gpu;
    const psu = itemsMap.psu?.product || itemsMap.psu;
    const ram = itemsMap.ram?.product || itemsMap.ram;
    const cooling = itemsMap.cooling?.product || itemsMap.cooling;

    const cpuName = String(cpu?.name || cpu?.productName || "").toLowerCase();
    const gpuName = String(gpu?.name || gpu?.productName || "").toLowerCase();
    const ramName = String(ram?.name || ram?.productName || "").toLowerCase();
    const psuName = String(psu?.name || psu?.productName || "").toLowerCase();

    // 1. High-end CPU without separate cooling selected
    if (cpu && (!cooling || (!cooling.name && !cooling.productName))) {
      if (cpuName.includes("k") || cpuName.includes("x") || cpuName.includes("i7") || cpuName.includes("i9") || cpuName.includes("7800x3d")) {
        questions.push(`❄️ CPU ${cpu.name || cpu.productName || "này"} có bắt buộc phải mua tản nhiệt rời không?`);
      } else {
        questions.push(`❄️ CPU này dùng tản kèm hộp hay nên mua thêm tản rời?`);
      }
    }

    // 2. Powerful GPU with low/medium or unselected PSU
    if (gpu) {
      if (!psu || (!psuName.includes("850") && !psuName.includes("1000") && (gpuName.includes("4070") || gpuName.includes("4080") || gpuName.includes("4090")))) {
        questions.push(`⚡ Bộ nguồn hiện tại có đủ điện an toàn cho Card đồ họa chưa?`);
      } else {
        questions.push(`🎮 Card ${gpu.name || gpu.productName || "GPU"} này có chiến mượt Wukong ở 2K không?`);
      }
    } else {
      questions.push("🎮 Chưa chọn Card màn hình, chip này có đồ họa tích hợp chơi game được không?");
    }

    // 3. RAM capacity query
    if (!ram || ramName.includes("8gb") || ramName.includes("16gb")) {
      questions.push("🧠 Cấu hình gaming/đồ họa này có cần nâng cấp thêm RAM không?");
    } else {
      questions.push("⚡ Tốc độ bus RAM này đã tối ưu cho CPU chưa?");
    }

    // 4. Default / General questions
    questions.push("🎬 Dựng phim 4K Premiere Pro với cấu hình này có mượt không?");
    questions.push("⚖️ Nếu muốn tối ưu thêm ngân sách thì nên đổi linh kiện nào?");

    return questions.slice(0, 4);
  }

  const dynamicQuestions = getDynamicSuggestedQuestions(selectedItems);

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.botIcon}>🤖</span>
        <div>
          <h4 style={styles.title}>AI Advisor — Tư Vấn Ngữ Cảnh Build PC</h4>
          <span style={styles.contextBadge}>
            Đang nắm giữ ngữ cảnh ({selectedCount} linh kiện • {safeTotalPrice.toLocaleString("vi-VN")}đ)
          </span>
        </div>
      </div>

      {/* PROACTIVE AI WARNING BANNER */}
      {proactiveAlert && (
        <div style={{
          marginBottom: "14px",
          padding: "12px 16px",
          borderRadius: "14px",
          backgroundColor: proactiveAlert.type === "error" ? "#fff1f2" : proactiveAlert.type === "warning" ? "#fff7ed" : "#f0fdf4",
          border: `1px solid ${proactiveAlert.type === "error" ? "#fecdd3" : proactiveAlert.type === "warning" ? "#ffedd5" : "#bbf7d0"}`,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)"
        }}>
          <strong style={{
            fontSize: "13px",
            display: "block",
            marginBottom: "3px",
            color: proactiveAlert.type === "error" ? "#be123c" : proactiveAlert.type === "warning" ? "#c2410c" : "#15803d"
          }}>
            {proactiveAlert.title}
          </strong>
          <p style={{ margin: 0, fontSize: "12.5px", color: "#334155", lineHeight: "1.5" }}>
            {proactiveAlert.text}
          </p>
        </div>
      )}

      {/* QUICK SUGGESTED QUESTIONS */}
      <div style={styles.quickBar}>
        {dynamicQuestions.map((q, idx) => (
          <button key={idx} style={styles.quickChip} onClick={() => handleSend(q)}>
            {q}
          </button>
        ))}
      </div>

      {/* CHAT MESSAGES */}
      <div style={styles.chatBox}>
        {messages.map((m, idx) => (
          <div key={idx} style={styles.msgRow(m.role === "user")}>
            <div style={styles.bubble(m.role === "user")}>{m.text}</div>
          </div>
        ))}
        {loading && <div style={styles.typing}>🤖 AI đang suy nghĩ câu trả lời...</div>}
      </div>

      {/* INPUT FORM */}
      <form
        style={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi AI về cấu hình đang chọn (ví dụ: 'Bộ này chơi Wukong mượt không?')"
        />
        <button style={styles.sendBtn} type="submit" disabled={loading || !input.trim()}>
          Gửi
        </button>
      </form>
    </div>
  );
}

const styles = {
  panel: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "20px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
    marginBottom: "20px"
  },
  header: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginBottom: "14px"
  },
  botIcon: {
    fontSize: "28px",
    backgroundColor: "#eff6ff",
    padding: "8px",
    borderRadius: "14px"
  },
  title: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a"
  },
  contextBadge: {
    fontSize: "12px",
    color: "#059669",
    fontWeight: "600"
  },
  quickBar: {
    display: "flex",
    gap: "8px",
    overflowX: "auto",
    paddingBottom: "10px",
    marginBottom: "12px"
  },
  quickChip: {
    backgroundColor: "#f8fafc",
    border: "1px solid #cbd5e1",
    borderRadius: "20px",
    padding: "6px 14px",
    fontSize: "12px",
    color: "#334155",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontWeight: "500"
  },
  chatBox: {
    maxHeight: "220px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "14px",
    marginBottom: "12px"
  },
  msgRow: (isUser) => ({
    display: "flex",
    justifyContent: isUser ? "flex-end" : "flex-start"
  }),
  bubble: (isUser) => ({
    maxWidth: "85%",
    padding: "10px 14px",
    borderRadius: isUser ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
    backgroundColor: isUser ? "#1d4ed8" : "#ffffff",
    color: isUser ? "#ffffff" : "#0f172a",
    fontSize: "13px",
    lineHeight: "1.5",
    border: isUser ? "none" : "1px solid #e2e8f0",
    boxShadow: isUser ? "none" : "0 2px 6px rgba(15, 23, 42, 0.03)"
  }),
  typing: {
    fontSize: "12px",
    color: "#64748b",
    fontStyle: "italic",
    padding: "4px"
  },
  form: {
    display: "flex",
    gap: "8px"
  },
  input: {
    flex: 1,
    padding: "10px 16px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "13px"
  },
  sendBtn: {
    backgroundColor: "#1d4ed8",
    color: "#ffffff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer"
  }
};
