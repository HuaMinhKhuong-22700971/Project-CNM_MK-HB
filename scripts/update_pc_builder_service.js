const fs = require('fs');
const path = require('path');

const serviceFile = path.join(__dirname, '../services/api/src/modules/pc-builder/pc-builder.service.ts');
let code = fs.readFileSync(serviceFile, 'utf8');

const oldMethod = `  async getAiAdvice(payload: any = {}): Promise<any> {
    const question = String(payload.question || "").trim();
    const buildContext = payload.buildContext || {};

    let advice = "";
    const items = buildContext.items || [];
    const totalPrice = Number(buildContext.totalPrice || 0);

    if (question.toLowerCase().includes("wukong") || question.toLowerCase().includes("game") || question.toLowerCase().includes("fps")) {
      const gpu = items.find((i: any) => String(i.type).toUpperCase() === "GPU");
      if (gpu) {
        advice = \`🎮 Với Card đồ họa \${gpu.name} và hệ thống tổng trị giá \${totalPrice.toLocaleString("vi-VN")}đ, PC của bạn có thể chiến tốt các tựa game AAA ở 1080p High Settings trên 60 FPS mượt mà.\`;
      } else {
        advice = "🎮 Bộ PC hiện tại chưa có Card đồ họa rời (GPU). Bạn nên chọn thêm một chiếc GPU như RTX 4060 hoặc RX 7600 để chiến game tốt nhất.";
      }
    } else if (question.toLowerCase().includes("render") || question.toLowerCase().includes("dựng phim") || question.toLowerCase().includes("video")) {
      const cpu = items.find((i: any) => String(i.type).toUpperCase() === "CPU");
      advice = \`🎬 Cho nhu cầu dựng phim & đồ họa: CPU \${cpu?.name || "hiện tại"} đảm nhận vai trò tính toán chính. Hãy chọn RAM tối thiểu 32GB để preview timeline 4K mượt mà.\`;
    } else if (question.toLowerCase().includes("nguồn") || question.toLowerCase().includes("điện") || question.toLowerCase().includes("psu")) {
      advice = \`⚡ Công suất ước tính của \${buildContext.selectedCount || items.length} linh kiện vào khoảng 350W - 420W. Chọn nguồn 600W - 650W 80 Plus sẽ đảm bảo dư tải 30% cực kỳ an toàn.\`;
    } else {
      advice = \`🤖 Dựa trên \${buildContext.selectedCount || items.length} linh kiện đã chọn (Tổng giá trị: \${totalPrice.toLocaleString("vi-VN")}đ), cấu hình của bạn đạt chỉ số tương thích \${buildContext.xaiScore || 85}%. Bộ máy rất cân bằng và sẵn sàng để đặt hàng!\`;
    }

    return { question, advice };
  }`;

const newMethod = `  private generateRuleBasedAdvice(question: string, items: any[], totalPrice: number, buildContext: any): string {
    const qLower = question.toLowerCase();
    const cpu = items.find((i: any) => String(i.type || i.componentType).toUpperCase() === "CPU");
    const gpu = items.find((i: any) => String(i.type || i.componentType).toUpperCase() === "GPU");
    const ram = items.find((i: any) => String(i.type || i.componentType).toUpperCase() === "RAM");
    const psu = items.find((i: any) => String(i.type || i.componentType).toUpperCase() === "PSU");
    const cooling = items.find((i: any) => String(i.type || i.componentType).toUpperCase() === "COOLING");

    if (qLower.includes("wukong") || qLower.includes("game") || qLower.includes("fps") || qLower.includes("chơi")) {
      if (gpu) {
        return \`🎮 **Phân tích hiệu năng Gaming**: Với Card đồ họa **\${gpu.name || gpu.productName}** và CPU **\${cpu?.name || "hiện tại"}**, dàn PC của bạn (Tổng trị giá \${totalPrice.toLocaleString("vi-VN")}đ) sẵn sàng chiến tốt các tựa game eSports & AAA ở độ phân giải 1080p/2K với FPS trên 60+ mượt mà.\`;
      }
      return "🎮 **Tư vấn Gaming**: Cấu hình của bạn hiện chưa có Card đồ họa rời (GPU). Để chiến các game nặng mượt mà, bạn nên bổ sung một chiếc GPU như RTX 4060 hoặc RX 7600.";
    }

    if (qLower.includes("render") || qLower.includes("dựng phim") || qLower.includes("video") || qLower.includes("3d") || qLower.includes("đồ họa")) {
      return \`🎬 **Tư vấn Đồ họa & Video**: Với CPU **\${cpu?.name || "hiện tại"}** và RAM **\${ram?.name || "đã chọn"}**, hệ thống của bạn xử lý tốt các tác vụ chỉnh sửa video 4K, Photoshop, Premiere Pro. Khuyên dùng tối thiểu 32GB RAM để preview mượt mà.\`;
    }

    if (qLower.includes("nguồn") || qLower.includes("điện") || qLower.includes("psu") || qLower.includes("cháy")) {
      return \`⚡ **Phân tích Điện năng (PSU)**: Công suất tiêu thụ ước tính khoảng 350W - 450W. \${psu ? \`Bộ nguồn **\${psu.name}**\` : "Chọn nguồn 650W 80 Plus"} sẽ cung cấp dải an toàn dồi dào > 25%, giúp hệ thống vận hành êm ái.\`;
    }

    if (qLower.includes("tản") || qLower.includes("nhiệt") || qLower.includes("nóng")) {
      return \`🌡️ **Phân tích Tản nhiệt**: \${cooling ? \`Tản nhiệt **\${cooling.name}**\` : "Khuyên dùng Tản nhiệt rời 4 ống đồng hoặc AIO 240mm/360mm"} sẽ giữ nhiệt độ CPU luôn dưới 75°C khi chơi game full load.\`;
    }

    return \`🤖 **Tư vấn Cấu hình Tổng quan**: Dựa trên \${items.length} linh kiện đã chọn (Tổng trị giá: \${totalPrice.toLocaleString("vi-VN")}đ), cấu hình đạt điểm tương thích **\${buildContext.xaiScore || 100}%** (\${buildContext.buildReadiness || "BUILD READY"}). Cấu hình rất cân bằng và sẵn sàng để lắp ráp!\`;
  }

  async getAiAdvice(payload: any = {}): Promise<any> {
    const question = String(payload.question || "").trim() || "Cấu hình này có ổn không và nên lưu ý gì?";
    const buildContext = payload.buildContext || {};
    const items = Array.isArray(buildContext.items) ? buildContext.items : [];
    const totalPrice = Number(buildContext.totalPrice || 0);

    const componentListStr = items.length > 0
      ? items.map((i: any) => \`- \${i.type || 'Linh kiện'}: \${i.name || i.productName} (\${Number(i.price || 0).toLocaleString("vi-VN")}đ)\`).join("\\n")
      : "Chưa chọn linh kiện nào";

    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    let advice = "";
    let providerUsed = "Rule-based Engine (Fallback)";

    // 1. Option A: Google Gemini API (Recommended Tier)
    if (geminiKey) {
      try {
        const promptText = \`Bạn là Chuyên gia Tư vấn Phần cứng PC Mall AI Advisor.
Hãy trả lời câu hỏi của khách hàng bằng tiếng Việt ngắn gọn, súc tích, chuyên nghiệp (dưới 150 từ).

Cấu hình PC hiện tại của khách hàng:
\${componentListStr}
- Tổng giá trị: \${totalPrice.toLocaleString("vi-VN")} VNĐ
- Mức độ tương thích: \${buildContext.xaiScore || 100}% (\${buildContext.buildReadiness || "READY"})

Câu hỏi của khách hàng: "\${question}"

Hãy phân tích và đưa ra lời khuyên kỹ thuật chính xác nhất:\`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=\${geminiKey}\`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 350 }
          })
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data: any = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            advice = candidateText.trim();
            providerUsed = "Google Gemini 1.5 Flash (Live LLM)";
          }
        }
      } catch (err) {
        console.warn("Gemini API call failed or timed out, falling back to OpenAI/Rule Engine:", err);
      }
    }

    // 2. Option B: OpenAI API
    if (!advice && openaiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": \`Bearer \${openaiKey}\`
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "Bạn là Chuyên gia Tư vấn Phần cứng PC Mall AI Advisor. Trả lời bằng tiếng Việt ngắn gọn, súc tích (dưới 150 từ), chuyên nghiệp và thân thiện."
              },
              {
                role: "user",
                content: \`Cấu hình PC:\\n\${componentListStr}\\nTổng giá: \${totalPrice.toLocaleString("vi-VN")}đ.\\nCâu hỏi: "\${question}"\`
              }
            ],
            max_tokens: 350
          })
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data: any = await response.json();
          const text = data?.choices?.[0]?.message?.content;
          if (text) {
            advice = text.trim();
            providerUsed = "OpenAI GPT-4o-mini (Live LLM)";
          }
        }
      } catch (err) {
        console.warn("OpenAI API call failed, falling back to Rule Engine:", err);
      }
    }

    // 3. Fallback: PC Mall XAI Knowledge Rule-Based Engine
    if (!advice) {
      advice = this.generateRuleBasedAdvice(question, items, totalPrice, buildContext);
      providerUsed = "PC Mall XAI Knowledge Engine";
    }

    return { question, advice, provider: providerUsed };
  }`;

if (code.includes(oldMethod)) {
  code = code.replace(oldMethod, newMethod);
  fs.writeFileSync(serviceFile, code, 'utf8');
  console.log('✅ Replaced getAiAdvice with LLM integration successfully!');
} else {
  console.error('❌ Could not match oldMethod in pc-builder.service.ts');
}
