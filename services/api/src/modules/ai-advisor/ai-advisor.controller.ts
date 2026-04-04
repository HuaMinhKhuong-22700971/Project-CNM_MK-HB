import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { AppError } from "../../errors/app-error";
import { asyncHandler } from "../../utils/async-handler";

export const suggestBuild = asyncHandler(async (req: Request, res: Response) => {
  const { requirements, budget } = req.body;
  if (!requirements || !budget) {
    throw new AppError("Vui lòng cung cấp 'requirements' và 'budget'", 400);
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    throw new AppError("Gateway AI chưa được kích hoạt. Thiếu OPENAI_API_KEY.", 503);
  }

  // Lấy toàn bộ linh kiện hiện có (giới hạn một số thông tin cần thiết)
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      sku: true,
      name: true,
      price: true,
      category: {
        select: { slug: true }
      }
    }
  });

  const productListText = products
    .map((p: any) => `- ${p.sku}: ${p.name} (Cat: ${p.category.slug}) | Giá: ${p.price} VND`)
    .join("\n");

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
    const errObj = await response.json();
    throw new AppError("Lỗi từ AI Provider: " + errObj.error?.message, 502);
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
      sku: { in: suggestedSkus }
    },
    include: {
      category: true,
      attributes: true
    }
  });

  const totalPrice = suggestedProducts.reduce((sum: number, p: any) => sum + Number(p.price), 0);

  const formattedItems = suggestedProducts.map((p: any) => ({
    componentType: p.category.slug.toLowerCase(),
    product: { name: p.name },
    variant: {
      id: p.id, // Frontend uses productVariantId
      sku: p.sku,
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
