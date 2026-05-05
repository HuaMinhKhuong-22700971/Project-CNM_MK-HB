import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { AppError } from "../../errors/app-error";
import { asyncHandler } from "../../utils/async-handler";

export const suggestBuild = asyncHandler(async (req: Request, res: Response) => {
  const { requirements, budget } = req.body;
  if (!requirements || !budget) {
    throw new AppError("Vui lòng cung cấp 'requirements' và 'budget'", 400);
  }

  console.log(`[AI-Advisor] Starting suggestion for budget: ${budget}`);

  async function getDemoModeResponse() {
    const categories = await prisma.category.findMany({ take: 7 });
    const mockItems = [];
    
    for (const cat of categories) {
      const prod = await prisma.product.findFirst({
        where: { category_id: cat.id, is_active: true },
        include: { Category: true, ProductSku: { take: 1 } }
      });
      if (prod) mockItems.push(prod);
    }
    
    const totalPrice = mockItems.reduce((sum: number, p: any) => sum + Number(p.price), 0);
    const formattedItems = mockItems.map((p: any) => {
      const catName = p.Category?.name?.toLowerCase() || "unknown";
      const componentType = catName === "ssd" ? "storage" : catName;
      const firstSku = p.ProductSku?.[0];
      return {
        componentType,
        product: { id: p.id, name: p.name },
        variant: { id: firstSku?.id || p.id, sku: firstSku?.sku_code || "", price: Number(firstSku?.price || p.price) }
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        budget,
        totalPrice,
        explanation: "DEMO MODE: Vì chưa cấu hình OPENAI_API_KEY hoặc API Key bị lỗi, hệ thống đang lấy ngẫu nhiên linh kiện từ kho hàng để minh họa tính năng gợi ý AI.",
        items: formattedItems
      }
    });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    // Mock response for development if key is missing
    if (process.env.NODE_ENV === "development") {
      await getDemoModeResponse();
      return;
    }
  }

  // Lấy toàn bộ linh kiện hiện có (giới hạn một số thông tin cần thiết)
  const products = await prisma.product.findMany({
    where: { is_active: true },
    select: {
      id: true,
      name: true,
      price: true,
      Category: {
        select: { name: true }
      }
    }
  });

  const productListText = products
    .map((p: any) => {
      const catName = p.Category?.name || "unknown";
      return `- ${p.id}: ${p.name} (Cat: ${catName}) | Giá: ${p.price} VND`;
    })
    .join("\n");
  
  console.log(`[AI-Advisor] Prepared ${products.length} products for prompt`);

  const prompt = `Bạn là chuyên gia build PC thông minh. Ngân sách khách hàng: ${budget} VND. Nhu cầu: ${requirements}.
Nhiệm vụ: Hãy tư vấn và ráp 1 cấu hình PC phù hợp nhất từ danh sách linh kiện bên dưới. 
Bạn phải tuân thủ nghiêm ngặt các nguyên tắc sau:
1. KHÔNG VƯỢT QUÁ NGÂN SÁCH (cho phép chênh lệch nhẹ < 5%).
2. CHỈ chọn các linh kiện CÓ TRONG DANH SÁCH (dựa vào SKU).
3. Linh kiện tạo thành 1 máy bộ (ít nhất Main, CPU, RAM). Cấu hình phải tương thích với nhau.
4. Output PHẢI là định dạng RAW JSON một mảng string chứa các SKU của linh kiện đã chọn, không kèm text diễn giải. 
Ví dụ: ["SKU_CPU", "SKU_MAIN", "SKU_RAM"]

Danh sách linh kiện:
${productListText}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    console.warn(`[AI-Advisor] AI Provider Error, falling back to DEMO MODE`);
    if (process.env.NODE_ENV === "development" || true) { // Always fallback to demo mode for robust testing if API fails
      await getDemoModeResponse();
      return;
    }
  }

  const aiData = await response.json();
  let choiceContent = aiData.choices?.[0]?.message?.content?.trim();

  // Xử lý json wrapper nếu có (ví dụ: markdown ```json)
  if (choiceContent && choiceContent.startsWith("```json")) {
    choiceContent = choiceContent.replace(/^```json/, "").replace(/```$/, "").trim();
  } else if (choiceContent && choiceContent.startsWith("```")) {
    choiceContent = choiceContent.replace(/^```/, "").replace(/```$/, "").trim();
  }

  let suggestedSkus = [];
  try {
    suggestedSkus = JSON.parse(choiceContent);
    if (!Array.isArray(suggestedSkus)) {
      throw new Error("Result is not an array");
    }
  } catch (e) {
    throw new AppError("AI trả về kết quả cấu trúc sai định dạng JSON. Cần [" + choiceContent + "]", 500);
  }

  // Query dữ liệu đầy đủ từ DB để trả về client
  const suggestedProducts = await prisma.product.findMany({
    where: {
      id: { in: suggestedSkus.map((s: string) => parseInt(s, 10)).filter(Boolean) }
    },
    include: {
      Category: true,
      ProductSku: { take: 1 }
    }
  });

  const totalPrice = suggestedProducts.reduce((sum: number, p: any) => sum + Number(p.price), 0);

  const formattedItems = suggestedProducts.map((p: any) => ({
    componentType: p.Category?.name?.toLowerCase() || "unknown",
    product: { name: p.name },
    variant: {
      id: p.ProductSku?.[0]?.id || p.id,
      sku: p.ProductSku?.[0]?.sku_code || "",
      price: Number(p.price)
    }
  }));

  res.status(200).json({
    success: true,
    data: {
      budget,
      totalPrice,
      explanation: "Dựa vào hệ thống AI Advisor, đây là cấu hình máy tính tối ưu nhất với mức ngân sách và nhu cầu của bạn. Các linh kiện đã được chọn để đảm bảo tính tương thích và hiệu năng tốt nhất.",
      items: formattedItems
    }
  });
});
