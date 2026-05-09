import { Request, Response } from "express";

import { prisma } from "../../config/prisma";
import { AppError } from "../../errors/app-error";
import { asyncHandler } from "../../utils/async-handler";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pcBuilderService = require("../pc-builder/pc-builder.service.js");

function normalizeComponentType(categoryName: string | null | undefined) {
  const normalized = String(categoryName || "").trim().toLowerCase();
  return normalized === "ssd" ? "storage" : (normalized || "unknown");
}

function mapSuggestedProduct(product: any) {
  const firstSku = product.ProductSku?.[0];

  return {
    componentType: normalizeComponentType(product.Category?.name),
    product: {
      id: product.id,
      name: product.name
    },
    variant: {
      id: firstSku?.id || product.id,
      sku: firstSku?.sku || "",
      price: Number(firstSku?.price || product.price || 0)
    }
  };
}

function buildPrompt(products: any[], budget: number, requirements: string) {
  const productListText = products
    .map((product) => {
      const firstSku = product.ProductSku?.[0];
      const price = Number(firstSku?.price || product.price || 0);
      const categoryName = product.Category?.name || "unknown";
      return `- PRODUCT_ID=${product.id} | ${product.name} | Cat=${categoryName} | Price=${price} VND`;
    })
    .join("\n");

  return `Ban la chuyen gia build PC thong minh. Ngan sach khach hang: ${budget} VND. Nhu cau: ${requirements}.
Nhiem vu: Hay tu van va rap 1 cau hinh PC phu hop nhat tu danh sach linh kien ben duoi.
Ban phai tuan thu nghiem ngat cac nguyen tac sau:
1. KHONG VUOT QUA NGAN SACH (cho phep chenh lech nhe < 5%).
2. CHI chon cac linh kien CO TRONG DANH SACH.
3. Linh kien tao thanh 1 may bo (it nhat Main, CPU, RAM). Cau hinh phai tuong thich voi nhau.
4. Output PHAI la dinh dang RAW JSON mot mang so nguyen chua cac PRODUCT_ID da chon, khong kem text dien giai.
Vi du: [12, 25, 31]

Danh sach linh kien:
${productListText}`;
}

async function getDemoModeData(budget: number, requirements: string) {
  try {
    const suggested = await pcBuilderService.suggestBuild({
      purpose: String(requirements || "gaming").trim().toLowerCase(),
      budget
    });

    return {
      budget,
      totalPrice: Number(suggested.totalPrice || 0),
      explanation: "DEMO MODE: He thong dang dung bo goi y noi bo de tra cau hinh trong ngan sach.",
      items: Array.isArray(suggested.items) ? suggested.items : []
    };
  } catch (_error) {
    // Fall through to a simple DB-backed demo response.
  }

  const categories = await prisma.category.findMany({ take: 7 });
  const mockItems = [];

  for (const category of categories) {
    const product = await prisma.product.findFirst({
      where: { category_id: category.id, is_active: true },
      include: {
        Category: true,
        ProductSku: { take: 1, orderBy: { id: "asc" } }
      }
    });

    if (product) {
      mockItems.push(product);
    }
  }

  const items = mockItems.map(mapSuggestedProduct);
  const totalPrice = items.reduce((sum, item) => sum + Number(item.variant.price || 0), 0);

  return {
    budget,
    totalPrice,
    explanation: "DEMO MODE: He thong dang lay linh kien mau tu kho hang de minh hoa tinh nang goi y AI.",
    items
  };
}

export const suggestBuild = asyncHandler(async (req: Request, res: Response) => {
  const { requirements, budget } = req.body;
  const numericBudget = Number(budget);

  if (!requirements || !Number.isFinite(numericBudget) || numericBudget <= 0) {
    throw new AppError("Please provide valid 'requirements' and 'budget'", 400);
  }

  const openAiApiKey = process.env.OPENAI_API_KEY;
  const products = await prisma.product.findMany({
    where: { is_active: true },
    include: {
      Category: {
        select: { name: true }
      },
      ProductSku: {
        take: 1,
        orderBy: { id: "asc" }
      }
    }
  });

  if (!openAiApiKey) {
    res.status(200).json({
      success: true,
      data: await getDemoModeData(numericBudget, String(requirements))
    });
    return;
  }

  let response: globalThis.Response;

  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "user", content: buildPrompt(products, numericBudget, String(requirements)) }],
        temperature: 0.2
      })
    });
  } catch (_error) {
    res.status(200).json({
      success: true,
      data: await getDemoModeData(numericBudget, String(requirements))
    });
    return;
  }

  if (!response.ok) {
    res.status(200).json({
      success: true,
      data: await getDemoModeData(numericBudget, String(requirements))
    });
    return;
  }

  const aiData = await response.json();
  let choiceContent = aiData.choices?.[0]?.message?.content?.trim();

  if (choiceContent && choiceContent.startsWith("```json")) {
    choiceContent = choiceContent.replace(/^```json/, "").replace(/```$/, "").trim();
  } else if (choiceContent && choiceContent.startsWith("```")) {
    choiceContent = choiceContent.replace(/^```/, "").replace(/```$/, "").trim();
  }

  let suggestedProductIds: number[] = [];

  try {
    const parsed = JSON.parse(choiceContent);
    if (!Array.isArray(parsed)) {
      throw new Error("Result is not an array");
    }

    suggestedProductIds = parsed
      .map((value: unknown) => Number(value))
      .filter((value: number) => Number.isInteger(value) && value > 0);
  } catch (_error) {
    throw new AppError(`AI returned invalid JSON payload: ${choiceContent}`, 500);
  }

  if (suggestedProductIds.length === 0) {
    throw new AppError("AI did not return any valid PRODUCT_ID values", 500);
  }

  const suggestedProducts = await prisma.product.findMany({
    where: {
      id: { in: suggestedProductIds }
    },
    include: {
      Category: true,
      ProductSku: { take: 1, orderBy: { id: "asc" } }
    }
  });

  if (suggestedProducts.length === 0) {
    throw new AppError("AI suggestion did not match any active products", 500);
  }

  const orderedProducts = suggestedProductIds
    .map((id) => suggestedProducts.find((product) => product.id === id))
    .filter(Boolean);

  const items = orderedProducts.map(mapSuggestedProduct);
  const totalPrice = items.reduce((sum, item) => sum + Number(item.variant.price || 0), 0);

  res.status(200).json({
    success: true,
    data: {
      budget: numericBudget,
      totalPrice,
      explanation: "AI Advisor da chon cau hinh toi uu dua tren ngan sach va nhu cau su dung.",
      items
    }
  });
});
