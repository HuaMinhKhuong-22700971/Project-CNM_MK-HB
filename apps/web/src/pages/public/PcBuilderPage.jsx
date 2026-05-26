import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { usePcBuilder } from "../../hooks/usePcBuilder";
import { routeConfig } from "../../routes/routeConfig";
import { addItemToCart } from "../../services/cart.service";
import { getCategories, getProductDetail, getProducts } from "../../services/catalog.service";
import { resolveProductImage } from "../../utils/productImage";

const COMPONENT_SECTIONS = [
  { componentType: "cpu", label: "CPU", categoryName: "CPU", icon: "CPU" },
  { componentType: "mainboard", label: "Mainboard", categoryName: "MAINBOARD", icon: "MB" },
  { componentType: "ram", label: "RAM", categoryName: "RAM", icon: "RAM" },
  { componentType: "gpu", label: "GPU", categoryName: "GPU", icon: "GPU" },
  { componentType: "storage", label: "SSD", categoryName: "STORAGE", icon: "SSD" },
  { componentType: "psu", label: "PSU", categoryName: "PSU", icon: "PSU" },
  { componentType: "case", label: "Case", categoryName: "CASE", icon: "CASE" },
  { componentType: "cooling", label: "Cooling", categoryName: "COOLING", icon: "FAN" }
];

const PURPOSE_OPTIONS = [
  { value: "gaming", label: "Gaming" },
  { value: "office", label: "Văn phòng" },
  { value: "editing", label: "Dựng phim" },
  { value: "streaming", label: "Streaming" },
  { value: "ai", label: "AI / Workstation" }
];

const PRESET_BUILDS = [
  { id: "gaming", title: "Gaming", budget: "25000000", useCase: "gaming", desc: "FPS cao, ưu tiên GPU và CPU mạnh." },
  { id: "office", title: "Office", budget: "12000000", useCase: "office", desc: "Ổn định, tiết kiệm điện, dễ nâng cấp." },
  { id: "editing", title: "Editing", budget: "35000000", useCase: "editing", desc: "Render video, RAM lớn, SSD nhanh." },
  { id: "streaming", title: "Streaming", budget: "30000000", useCase: "streaming", desc: "Gaming và encode mượt, cân bằng CPU/GPU." },
  { id: "ai", title: "AI Workstation", budget: "50000000", useCase: "ai", desc: "GPU VRAM cao, RAM lớn, nguồn dư tải." }
];

const SPEC_ALIASES = {
  socket: ["socket"],
  ramType: ["ram_type", "loai ram", "memory type", "ddr"],
  psuWattage: ["psu_wattage", "wattage", "power", "cong suat psu"],
  tdp: ["tdp", "power"],
  gpuLength: ["gpu_length", "length", "clearance", "chieu dai"],
  caseGpuClearance: ["gpu clearance", "vga clearance", "case_gpu_clearance", "clearance"],
  coolingType: ["cooling_type", "loai tan nhiet", "cooler type"],
  socketSupport: ["socket_support", "supported socket", "socket ho tro"],
  coolingCapacity: ["cooling_capacity", "tdp cooling", "tdp capacity", "cooling power"],
  radiatorSize: ["radiator_size", "radiator", "radiator support"],
  coolerHeight: ["cooler_height", "cpu cooler height", "height"],
  caseRadiatorSupport: ["case_radiator_support", "radiator support"],
  caseCoolerClearance: ["case_cooler_clearance", "cpu cooler clearance"],
  stockCooler: ["stock_cooler", "cooler included", "boxed cooler", "tan di kem"]
};

const formatCurrency = (value) => Number(value || 0).toLocaleString("vi-VN");

function getEnvelopeData(response, fallback = []) {
  return response?.data?.items || response?.data?.data || response?.data || response || fallback;
}

function getProductId(product) {
  return product?.product_id || product?.id;
}

function getProductName(product) {
  return product?.product_name || product?.name || "Linh kiện đang cập nhật";
}

function getProductBrand(product) {
  return product?.brand_name || product?.brand?.name || String(getProductName(product)).split(" ")[0] || "PC Mall";
}

function getProductPrice(product) {
  return Number(product?.price ?? product?.pricing?.minPrice ?? product?.defaultVariant?.price ?? product?.variants?.[0]?.price ?? product?.skus?.[0]?.price ?? 0);
}

function getProductStock(product) {
  return Number(product?.stock ?? product?.totalStock ?? product?.defaultVariant?.stock ?? product?.variants?.[0]?.stock ?? product?.skus?.[0]?.stock ?? 0);
}

function getRating(product) {
  return Number(product?.rating || 4.7).toFixed(1);
}

function getSelectedProduct(item) {
  return item?.product || item?.Product || item?.variant?.product || item?.productVariant?.product || {};
}

function getSelectedVariant(item) {
  return item?.variant || item?.ProductVariant || item?.productVariant || item?.sku || {};
}

function getVariantId(item) {
  const variant = getSelectedVariant(item);
  return variant?.variant_id || variant?.id || variant?.skuId || item?.variantId || item?.productVariantId;
}

function getItemPrice(item) {
  return Number(getSelectedVariant(item)?.price || item?.price || getSelectedProduct(item)?.price || 0);
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function parseNumber(value, fallback = 0) {
  const match = String(value || "").match(/(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : fallback;
}

function getSpecBag(product) {
  const raw = product?.specs || product?.specifications || product?.attributes || product?.technicalSpecs || product?.ProductAttributes || [];
  const bag = {};

  if (Array.isArray(raw)) {
    raw.forEach((entry) => {
      const key = String(entry.name || entry.key || entry.attribute_name || entry.Attribute?.name || "").trim();
      const value = entry.value || entry.attribute_value || entry.AttributeValue?.value || entry.text;
      if (key && value !== undefined && value !== null) {
        bag[normalizeText(key)] = String(value);
      }
    });
  } else if (raw && typeof raw === "object") {
    Object.entries(raw).forEach(([key, value]) => {
      bag[normalizeText(key)] = String(value);
    });
  }

  return bag;
}

function findSpec(product, aliases) {
  const bag = getSpecBag(product);
  const tokens = aliases.map(normalizeText);
  const hit = Object.entries(bag).find(([key]) => tokens.some((token) => key.includes(token)));
  return hit?.[1] || "";
}

function hasTruthySpecValue(value) {
  const text = normalizeText(value);
  if (!text) return false;
  if (["khong", "không", "no", "false", "none"].some((token) => text.includes(token))) return false;
  return ["co", "có", "yes", "true", "included", "stock", "kem", "kèm", "boxed"].some((token) => text.includes(token));
}

function cpuHasStockCooler(product) {
  const specValue = findSpec(product, SPEC_ALIASES.stockCooler);
  if (specValue) return hasTruthySpecValue(specValue);

  const name = normalizeText(getProductName(product));
  if (/\bi[3579]-?\d{4,5}(k|kf|ks)\b/.test(name)) return false;
  if (/ryzen\s*[3579].*(x3d|xt|\bx\b)/.test(name)) return false;
  return true;
}

function cpuNeedsDedicatedCooling(product) {
  return Boolean(getProductId(product)) && !cpuHasStockCooler(product);
}

function socketMatches(requiredSocket, supportedSockets) {
  const left = normalizeText(requiredSocket);
  const right = normalizeText(supportedSockets);
  if (!left || !right) return true;
  return right.includes(left) || left.includes(right);
}

function getCoolingDiagnostics(cpu, cooling, caseProduct, hasCoolingSelection) {
  const cpuSocket = findSpec(cpu, SPEC_ALIASES.socket);
  const cpuTdp = parseNumber(findSpec(cpu, SPEC_ALIASES.tdp) || getProductName(cpu), 95);
  const coolerSockets = findSpec(cooling, SPEC_ALIASES.socketSupport);
  const coolerCapacity = parseNumber(findSpec(cooling, SPEC_ALIASES.coolingCapacity), 0);
  const radiatorSize = parseNumber(findSpec(cooling, SPEC_ALIASES.radiatorSize), 0);
  const caseRadiatorSupport = parseNumber(findSpec(caseProduct, SPEC_ALIASES.caseRadiatorSupport), 0);
  const coolerHeight = parseNumber(findSpec(cooling, SPEC_ALIASES.coolerHeight), 0);
  const caseCoolerClearance = parseNumber(findSpec(caseProduct, SPEC_ALIASES.caseCoolerClearance), 0);
  const required = cpuNeedsDedicatedCooling(cpu);
  const stockCooler = cpuHasStockCooler(cpu);

  return {
    required,
    stockCooler,
    cpuSocket,
    cpuTdp,
    coolerSockets,
    coolerCapacity,
    radiatorSize,
    caseRadiatorSupport,
    coolerHeight,
    caseCoolerClearance,
    socketOk: !hasCoolingSelection || socketMatches(cpuSocket, coolerSockets),
    capacityOk: !hasCoolingSelection || coolerCapacity === 0 || cpuTdp === 0 || coolerCapacity >= cpuTdp,
    radiatorOk: !hasCoolingSelection || radiatorSize === 0 || caseRadiatorSupport === 0 || caseRadiatorSupport >= radiatorSize,
    heightOk: !hasCoolingSelection || coolerHeight === 0 || caseCoolerClearance === 0 || caseCoolerClearance >= coolerHeight
  };
}

function estimateProductPerformance(product, type) {
  const name = normalizeText(getProductName(product));
  const price = getProductPrice(product);
  let score = Math.min(98, Math.max(35, Math.round(price / 450000)));

  if (type === "gpu") {
    if (name.includes("4090") || name.includes("7900 xtx")) score = 98;
    else if (name.includes("4080") || name.includes("4070 ti") || name.includes("7900")) score = 90;
    else if (name.includes("4070") || name.includes("7800")) score = 82;
    else if (name.includes("4060") || name.includes("7600")) score = 70;
  }

  if (type === "cpu") {
    if (name.includes("i9") || name.includes("ryzen 9")) score = 94;
    else if (name.includes("i7") || name.includes("ryzen 7")) score = 84;
    else if (name.includes("i5") || name.includes("ryzen 5")) score = 72;
  }

  if (type === "cooling") {
    const capacity = parseNumber(findSpec(product, SPEC_ALIASES.coolingCapacity), 180);
    score = Math.max(40, Math.min(96, Math.round(capacity / 4)));
  }

  return score;
}

function getCoolingBadge(product) {
  const type = findSpec(product, SPEC_ALIASES.coolingType);
  const radiator = parseNumber(findSpec(product, SPEC_ALIASES.radiatorSize), 0);
  if (radiator >= 360) return "AIO 360";
  if (radiator >= 240) return "AIO 240";
  if (type) return type;
  return "Cooling";
}

function getStockState(stock) {
  if (stock <= 0) return { label: "Het hang", tone: "danger", width: "6%" };
  if (stock <= 5) return { label: `Con ${stock}`, tone: "warning", width: "32%" };
  if (stock <= 15) return { label: `Con ${stock}`, tone: "normal", width: "64%" };
  return { label: `Con ${stock}`, tone: "success", width: "100%" };
}

function getCoolingCardStatus(product, selectedItems) {
  const cpu = getSelectedProduct(selectedItems.cpu);
  const caseProduct = getSelectedProduct(selectedItems.case);
  const diagnostics = getCoolingDiagnostics(cpu, product, caseProduct, true);

  if (!getProductId(cpu)) {
    return { label: "Cho CPU de danh gia", tone: "neutral" };
  }
  if (!diagnostics.socketOk) {
    return { label: "Khong hop socket", tone: "danger" };
  }
  if (!diagnostics.capacityOk) {
    return { label: "TDP chua du", tone: "warning" };
  }
  if (!diagnostics.radiatorOk || !diagnostics.heightOk) {
    return { label: "Can kiem tra voi case", tone: "warning" };
  }
  return { label: "Tuong thich tot", tone: "success" };
}

function scoreCoolingProduct(product, selectedItems, targetPrice = 0) {
  const cpu = getSelectedProduct(selectedItems.cpu);
  const caseProduct = getSelectedProduct(selectedItems.case);
  const diagnostics = getCoolingDiagnostics(cpu, product, caseProduct, Boolean(getProductId(product)));
  let penalty = Math.abs(getProductPrice(product) - targetPrice) / 100000;

  if (diagnostics.required && !diagnostics.socketOk) penalty += 2000;
  if (diagnostics.required && !diagnostics.capacityOk) penalty += 1400;
  if (!diagnostics.radiatorOk) penalty += 900;
  if (!diagnostics.heightOk) penalty += 900;

  if (diagnostics.required && diagnostics.coolerCapacity > 0) {
    penalty -= Math.min(3, diagnostics.coolerCapacity / Math.max(1, diagnostics.cpuTdp + 25));
  }

  return penalty;
}

function pickRecommendedCoolingProduct(products, selectedItems, targetPrice = 0) {
  if (!Array.isArray(products) || products.length === 0) return null;
  return [...products].sort((left, right) => scoreCoolingProduct(left, selectedItems, targetPrice) - scoreCoolingProduct(right, selectedItems, targetPrice))[0] || null;
}

function calculateBuilderInsights(selectedItems, selectedCount) {
  const cpu = getSelectedProduct(selectedItems.cpu);
  const mainboard = getSelectedProduct(selectedItems.mainboard);
  const ram = getSelectedProduct(selectedItems.ram);
  const gpu = getSelectedProduct(selectedItems.gpu);
  const psu = getSelectedProduct(selectedItems.psu);
  const caseProduct = getSelectedProduct(selectedItems.case);
  const cooling = getSelectedProduct(selectedItems.cooling);

  const cpuSocket = findSpec(cpu, SPEC_ALIASES.socket);
  const boardSocket = findSpec(mainboard, SPEC_ALIASES.socket);
  const ramType = findSpec(ram, SPEC_ALIASES.ramType);
  const boardRam = findSpec(mainboard, SPEC_ALIASES.ramType);
  const psuWatt = parseNumber(findSpec(psu, SPEC_ALIASES.psuWattage) || getProductName(psu), 0);
  const gpuTdp = parseNumber(findSpec(gpu, SPEC_ALIASES.tdp) || getProductName(gpu), 180);
  const cpuTdp = parseNumber(findSpec(cpu, SPEC_ALIASES.tdp) || getProductName(cpu), 95);
  const requiredWatt = selectedItems.gpu ? Math.round((gpuTdp + cpuTdp + 120) * 1.35) : Math.round((cpuTdp + 110) * 1.35);
  const gpuLength = parseNumber(findSpec(gpu, SPEC_ALIASES.gpuLength), 0);
  const caseClearance = parseNumber(findSpec(caseProduct, SPEC_ALIASES.caseGpuClearance), 0);
  const coolingSelected = Boolean(selectedItems.cooling);
  const coolingDiagnostics = getCoolingDiagnostics(cpu, cooling, caseProduct, coolingSelected);
  const coolingFitOk = !coolingSelected || (
    coolingDiagnostics.socketOk &&
    coolingDiagnostics.capacityOk &&
    coolingDiagnostics.radiatorOk &&
    coolingDiagnostics.heightOk
  );

  const checks = [
    {
      label: "Tuong thich socket",
      ok: !cpuSocket || !boardSocket || normalizeText(cpuSocket) === normalizeText(boardSocket),
      detail: cpuSocket && boardSocket ? `${cpuSocket} / ${boardSocket}` : "Cần dữ liệu socket từ sản phẩm"
    },
    {
      label: "Tuong thich RAM",
      ok: !ramType || !boardRam || normalizeText(boardRam).includes(normalizeText(ramType)) || normalizeText(ramType).includes(normalizeText(boardRam)),
      detail: ramType && boardRam ? `${ramType} / ${boardRam}` : "Cần dữ liệu RAM từ sản phẩm"
    },
    {
      label: "Nguồn đủ công suất",
      ok: !selectedItems.psu || psuWatt === 0 || psuWatt >= requiredWatt,
      detail: selectedItems.psu ? `${psuWatt || "?"}W PSU / cần khoảng ${requiredWatt}W` : "Chưa chọn PSU"
    },
    {
      label: "GPU vừa case",
      ok: !gpuLength || !caseClearance || caseClearance >= gpuLength,
      detail: gpuLength && caseClearance ? `${gpuLength}mm GPU / ${caseClearance}mm case` : "Cần dữ liệu kích thước GPU và case"
    },
    {
      label: "Yêu cầu tản nhiệt",
      ok: !getProductId(cpu) || !coolingDiagnostics.required || coolingSelected,
      detail: !getProductId(cpu)
        ? "Chọn CPU để đánh giá nhu cầu tản nhiệt."
        : coolingDiagnostics.required
          ? coolingSelected
            ? "CPU này không đi kèm tản nhiệt và đã có cooler riêng."
            : "CPU này không đi kèm tản nhiệt. Vui lòng chọn Air Cooler hoặc AIO."
          : "CPU đã có tản nhiệt đi kèm, bạn có thể nâng cấp để máy mát và êm hơn."
    },
    {
      label: "Hiệu năng làm mát",
      ok: !coolingSelected || coolingFitOk,
      detail: !coolingSelected
        ? "Chưa chọn tản nhiệt."
        : [
            coolingDiagnostics.coolerSockets ? `Socket: ${coolingDiagnostics.coolerSockets}` : "Chưa có dữ liệu socket",
            coolingDiagnostics.coolerCapacity ? `Cooling: ${coolingDiagnostics.coolerCapacity}W` : "Chưa có TDP cooler",
            coolingDiagnostics.radiatorSize ? `Radiator: ${coolingDiagnostics.radiatorSize}mm` : null,
            coolingDiagnostics.coolerHeight ? `Height: ${coolingDiagnostics.coolerHeight}mm` : null
          ].filter(Boolean).join(" • ")
    }
  ];

  const hardFails = checks.filter((check) => check.ok === false).length;
  const requiredComponentCount = getProductId(cpu) && !coolingDiagnostics.required
    ? COMPONENT_SECTIONS.length - 1
    : COMPONENT_SECTIONS.length;
  const completionRatio = requiredComponentCount > 0 ? Math.min(selectedCount, requiredComponentCount) / requiredComponentCount : 0;
  const compatibilityScore = Math.max(0, Math.round(completionRatio * 65 + ((checks.length - hardFails) / checks.length) * 35));
  const cpuScore = selectedItems.cpu ? estimateProductPerformance(cpu, "cpu") : 45;
  const gpuScore = selectedItems.gpu ? estimateProductPerformance(gpu, "gpu") : 40;
  const fps = Math.round((gpuScore * 0.72 + cpuScore * 0.28) * 1.55);
  const power = Math.max(120, Math.round((gpuTdp || 160) + (cpuTdp || 85) + selectedCount * 18));
  const temp = Math.min(88, Math.round(48 + power / 18 - (coolingSelected ? (coolingFitOk ? 10 : 5) : 0)));

  return {
    checks,
    compatibilityScore,
    requiredComponentCount,
    fps,
    power,
    temp,
    recommendation: hardFails
      ? "Cần xử lý các cảnh báo tương thích trước khi lưu hoặc đặt hàng."
      : selectedCount < requiredComponentCount
        ? "Tiếp tục bổ sung các linh kiện còn thiếu để đánh giá chính xác hơn."
        : "Cấu hình đã đủ linh kiện chính và sẵn sàng lưu hoặc đưa vào giỏ hàng.",
    coolingState: {
      required: coolingDiagnostics.required,
      selected: coolingSelected,
      fitOk: coolingFitOk,
      warningTone: coolingDiagnostics.required && !coolingSelected ? "danger" : coolingFitOk ? "success" : "warning",
      warningTitle: coolingDiagnostics.required ? "CPU cần tản nhiệt riêng" : "Cooling đang ở chế độ tùy chọn",
      warningText: coolingDiagnostics.required
        ? "CPU này không đi kèm tản nhiệt. Vui lòng chọn Air Cooler hoặc AIO."
        : "CPU đã có tản nhiệt đi kèm, nhưng nâng cấp cooler sẽ giúp máy mát và êm hơn.",
      helperText: coolingSelected
        ? coolingFitOk
          ? "Cooling requirement satisfied."
          : "Cooling đã được chọn nhưng cần kiểm tra lại socket, TDP hoặc case."
        : "Tản nhiệt giúp CPU hoạt động ổn định, giảm nóng và tránh tụt hiệu năng."
    }
  };
}

export function PcBuilderPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    buildName,
    setBuildName,
    totalPrice,
    selectedItems,
    selectedCount,
    loading,
    error,
    success,
    compatibility,
    suggestion,
    guestBuildList,
    actions
  } = usePcBuilder();

  const [optionsByComponent, setOptionsByComponent] = useState({});
  const [activeComponent, setActiveComponent] = useState("cpu");
  const [processingComponent, setProcessingComponent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestionForm, setSuggestionForm] = useState({ purpose: "gaming", budget: "25000000" });
  const [localMessage, setLocalMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCatalog() {
      try {
        const categoryResponse = await getCategories();
        const categoryList = getEnvelopeData(categoryResponse, []);
        const results = await Promise.all(
          COMPONENT_SECTIONS.map(async (section) => {
            const matchedCategory = categoryList.find((category) => {
              const name = String(category.name || category.category_name || "").toUpperCase();
              return name === section.categoryName || name.includes(section.categoryName);
            });

            if (!matchedCategory) {
              return [section.componentType, []];
            }

            const productsResponse = await getProducts({ category_id: matchedCategory.id, limit: 60 });
            return [section.componentType, getEnvelopeData(productsResponse, [])];
          })
        );

        if (mounted) {
          setOptionsByComponent(Object.fromEntries(results));
        }
      } catch (_err) {
        actions.setError("Khong the tai danh muc san pham cho PC Builder.");
      }
    }

    loadCatalog();
    return () => {
      mounted = false;
    };
  }, [actions]);

  const activeSection = COMPONENT_SECTIONS.find((section) => section.componentType === activeComponent) || COMPONENT_SECTIONS[0];

  const activeProducts = useMemo(() => {
    const keyword = normalizeText(searchTerm);
    return (optionsByComponent[activeComponent] || [])
      .filter((product) => {
        const text = `${getProductName(product)} ${getProductBrand(product)} ${findSpec(product, SPEC_ALIASES.coolingType)}`;
        return !keyword || normalizeText(text).includes(keyword);
      })
      .slice(0, 12);
  }, [activeComponent, optionsByComponent, searchTerm]);

  const insights = useMemo(() => calculateBuilderInsights(selectedItems, selectedCount), [selectedItems, selectedCount]);
  const completionPercent = Math.round((Math.min(selectedCount, insights.requiredComponentCount) / insights.requiredComponentCount) * 100);

  async function handleSelectProduct(type, product) {
    const productId = getProductId(product);
    if (!productId) return;

    setProcessingComponent(type);
    setLocalMessage("");

    try {
      const response = await getProductDetail(productId);
      const detail = getEnvelopeData(response, product);
      const variants = (detail?.variants || detail?.skus || detail?.ProductSku || []).map((variant) => ({
        ...variant,
        variant_id: variant.variant_id || variant.id,
        sku: variant.sku || `SKU-${variant.id}`,
        price: Number(variant.price || getProductPrice(product) || 0),
        stock: Number(variant.stock || variant.stock_quantity || 0)
      }));

      const selectedVariant = variants.find((variant) => Number(variant.stock || 0) > 0) || variants[0];
      if (!selectedVariant?.variant_id) {
        actions.setError("San pham nay chua co SKU kha dung de them vao cau hinh.");
        return;
      }

      await actions.applyComponent(type, selectedVariant.variant_id, { ...product, ...detail }, variants);
      const currentIndex = COMPONENT_SECTIONS.findIndex((section) => section.componentType === type);
      const nextSection = COMPONENT_SECTIONS[currentIndex + 1];
      if (nextSection) {
        setActiveComponent(nextSection.componentType);
      }
    } catch (_err) {
      actions.setError("Khong the tai chi tiet san pham.");
    } finally {
      setProcessingComponent("");
    }
  }

  async function handleAutoRecommend() {
    const budget = Number(suggestionForm.budget || 0);
    if (!budget) {
      actions.setError("Vui long nhap ngan sach de AI Advisor goi y cau hinh.");
      return;
    }

    setProcessingComponent("auto");
    setLocalMessage("Dang chon linh kien phu hop ngan sach...");

    try {
      const allocation = { cpu: 0.18, mainboard: 0.12, ram: 0.1, gpu: 0.34, storage: 0.09, psu: 0.08, case: 0.06, cooling: 0.03 };
      for (const section of COMPONENT_SECTIONS) {
        const products = optionsByComponent[section.componentType] || [];
        if (products.length === 0) continue;

        const target = budget * (allocation[section.componentType] || 0.1);
        const product = section.componentType === "cooling"
          ? pickRecommendedCoolingProduct(products, selectedItems, target)
          : [...products].sort((a, b) => Math.abs(getProductPrice(a) - target) - Math.abs(getProductPrice(b) - target))[0];

        if (product) {
          await handleSelectProduct(section.componentType, product);
        }
      }

      setLocalMessage("Da tu dong de xuat cau hinh. Ban co the thay tung linh kien neu muon toi uu them.");
    } finally {
      setProcessingComponent("");
    }
  }

  async function handlePickCoolingRecommendation() {
    const products = optionsByComponent.cooling || [];
    const target = Number(suggestionForm.budget || 0) * 0.03;
    const product = pickRecommendedCoolingProduct(products, selectedItems, target);
    if (!product) {
      actions.setError("Chua tim thay tan nhiet phu hop trong danh muc hien tai.");
      return;
    }
    await handleSelectProduct("cooling", product);
  }

  async function handleAddAllToCart() {
    const variantIds = Object.values(selectedItems).map(getVariantId).filter(Boolean);
    if (variantIds.length === 0) {
      actions.setError("Chua co linh kien de them vao gio hang.");
      return;
    }
    if (!isAuthenticated) {
      navigate(routeConfig.public.login);
      return;
    }

    setProcessingComponent("cart");
    try {
      await Promise.all(variantIds.map((productVariantId) => addItemToCart({ productVariantId, quantity: 1 })));
      setLocalMessage("Da them toan bo linh kien vao gio hang.");
    } catch (_err) {
      actions.setError("Khong the them toan bo linh kien vao gio hang.");
    } finally {
      setProcessingComponent("");
    }
  }

  async function handleShareBuild() {
    const text = `${buildName} - ${formatCurrency(totalPrice)}d\n${COMPONENT_SECTIONS.map((section) => {
      const item = selectedItems[section.componentType];
      return `${section.label}: ${item ? getProductName(getSelectedProduct(item)) : "Chua chon"}`;
    }).join("\n")}`;

    try {
      await navigator.clipboard.writeText(text);
      setLocalMessage("Da sao chep cau hinh de chia se.");
    } catch (_err) {
      setLocalMessage("Trinh duyet khong cho sao chep tu dong. Ban co the dung Export PDF.");
    }
  }

  function handlePreset(preset) {
    setSuggestionForm({ purpose: preset.useCase, budget: preset.budget });
    setLocalMessage(`Da chon preset ${preset.title}. Bam Auto recommend de he thong chon linh kien.`);
  }

  return (
    <div className="builder-page">
      <style>{builderStyles}</style>

      <section className="builder-hero">
        <div>
          <span className="builder-eyebrow">PC Mall Intelligent Builder</span>
          <h1>Build PC thong minh nhu PCPartPicker</h1>
          <p>Chon linh kien bang product cards, kiem tra tuong thich realtime, uoc tinh hieu nang va luu cau hinh de dat hang nhanh.</p>
        </div>

        <div className="builder-hero__summary">
          <label>Ten cau hinh</label>
          <input value={buildName} onChange={(event) => setBuildName(event.target.value)} placeholder="Ten cau hinh..." />
          <strong>{formatCurrency(totalPrice)}d</strong>
          <span>{selectedCount}/{insights.requiredComponentCount} linh kien da chon</span>
          <small>{selectedItems.cooling ? `Cooling: ${getProductName(getSelectedProduct(selectedItems.cooling))}` : insights.coolingState.required ? "Cooling: Required" : "Cooling: Optional"}</small>
        </div>
      </section>

      {(error || success || localMessage) ? (
        <div className={`builder-alert ${error ? "builder-alert--danger" : "builder-alert--success"}`}>
          {error || success || localMessage}
        </div>
      ) : null}

      <section className="preset-row">
        {PRESET_BUILDS.map((preset) => (
          <button type="button" key={preset.id} onClick={() => handlePreset(preset)}>
            <strong>{preset.title}</strong>
            <span>{preset.desc}</span>
            <small>{formatCurrency(preset.budget)}d</small>
          </button>
        ))}
      </section>

      <main className="builder-layout">
        <aside className="builder-steps">
          <div className="builder-panel-title">
            <span>Build progress</span>
            <strong>{completionPercent}%</strong>
          </div>
          <div className="builder-progress-track"><span style={{ width: `${completionPercent}%` }} /></div>

          <div className="step-list">
            {COMPONENT_SECTIONS.map((section) => {
              const selected = selectedItems[section.componentType];
              return (
                <button
                  type="button"
                  key={section.componentType}
                  className={`step-item ${activeComponent === section.componentType ? "is-active" : ""} ${selected ? "is-done" : ""}`}
                  onClick={() => setActiveComponent(section.componentType)}
                >
                  <span>{section.icon}</span>
                  <div>
                    <strong>{section.label}</strong>
                    <small>{selected ? getProductName(getSelectedProduct(selected)) : section.componentType === "cooling" && !insights.coolingState.required ? "Tuy chon" : "Chua chon"}</small>
                  </div>
                </button>
              );
            })}
          </div>

          {!isAuthenticated ? (
            <div className="guest-builds">
              <strong>Build da luu</strong>
              {guestBuildList.slice(0, 4).map((slot) => (
                <button type="button" key={slot.id} onClick={() => actions.loadGuestBuildById(slot.id)}>{slot.name}</button>
              ))}
              <button type="button" onClick={() => actions.createNewGuestBuild()}>+ Build moi</button>
            </div>
          ) : null}
        </aside>

        <section className="builder-center">
          <div className="component-head">
            <div>
              <span>Component selection</span>
              <h2>{activeSection.label}</h2>
            </div>
            <label>
              <span>Tim</span>
              <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={`Tim ${activeSection.label}...`} />
            </label>
          </div>

          {activeComponent === "cooling" ? (
            <div className={`cooling-guide cooling-guide--${insights.coolingState.warningTone}`}>
              <div className="cooling-guide__icon">SNOW</div>
              <div className="cooling-guide__content">
                <strong>{insights.coolingState.warningTitle}</strong>
                <p>{selectedItems.cooling ? insights.coolingState.helperText : insights.coolingState.warningText}</p>
              </div>
              {!selectedItems.cooling ? (
                <button type="button" onClick={handlePickCoolingRecommendation} disabled={processingComponent === "cooling" || activeProducts.length === 0}>
                  Chon tan nhiet phu hop
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="product-card-grid">
            {activeProducts.length === 0 ? (
              <div className="builder-empty">
                <div className="builder-empty__icon">SNOW</div>
                <h3>{activeComponent === "cooling" ? "Chua co tan nhiet" : "Chua co san pham cho nhom nay"}</h3>
                <p>{activeComponent === "cooling" ? "Tan nhiet giup CPU hoat dong on dinh, giam nong va tranh tut hieu nang." : "Danh muc co the chua duoc seed du lieu. Ban van co the chuyen sang linh kien khac."}</p>
              </div>
            ) : (
              activeProducts.map((product) => {
                const productId = getProductId(product);
                const selected = selectedItems[activeComponent];
                const isSelected = String(getProductId(getSelectedProduct(selected))) === String(productId);
                const performance = estimateProductPerformance(product, activeComponent);
                const stock = getProductStock(product);
                const stockState = getStockState(stock);
                const coolingType = activeComponent === "cooling" ? findSpec(product, SPEC_ALIASES.coolingType) : "";
                const coolingSocket = activeComponent === "cooling" ? findSpec(product, SPEC_ALIASES.socketSupport) : "";
                const coolingStatus = activeComponent === "cooling" ? getCoolingCardStatus(product, selectedItems) : null;

                return (
                  <article className={`builder-product-card ${isSelected ? "is-selected" : ""}`} key={`${activeComponent}-${productId}`}>
                    <div className="builder-product-card__media">
                      <img src={resolveProductImage(product)} alt={getProductName(product)} loading="lazy" />
                      <span className={`stock-pill stock-pill--${stockState.tone}`}>{stockState.label}</span>
                      {activeComponent === "cooling" ? <div className="cooling-badge">{getCoolingBadge(product)}</div> : null}
                      {isSelected ? <div className="selected-check">OK</div> : null}
                    </div>

                    <div className="builder-product-card__body">
                      <div className="builder-product-card__heading">
                        <small>{getProductBrand(product)}</small>
                        <h3>{getProductName(product)}</h3>
                      </div>

                      <div className="builder-product-card__meta">
                        <span>{getRating(product)} sao</span>
                        <span>{performance}/100</span>
                        {coolingSocket ? <span>{coolingSocket}</span> : null}
                      </div>

                      {activeComponent === "cooling" ? (
                        <div className="cooling-card__specs">
                          <div><span>Loai</span><strong>{coolingType || "Cooling"}</strong></div>
                          <div><span>Socket</span><strong>{coolingSocket || "Dang cap nhat"}</strong></div>
                          <div><span>Tuong thich</span><strong className={`tone-${coolingStatus.tone}`}>{coolingStatus.label}</strong></div>
                        </div>
                      ) : null}

                      <strong className="price-label">{formatCurrency(getProductPrice(product))}d</strong>

                      <div className="stock-bar">
                        <span style={{ width: stockState.width }} />
                      </div>

                      <button type="button" disabled={processingComponent === activeComponent || loading} onClick={() => handleSelectProduct(activeComponent, product)}>
                        {processingComponent === activeComponent ? "Dang chon..." : isSelected ? "Da chon" : "Chon linh kien"}
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <aside className="builder-summary">
          <section className="summary-card summary-card--dark">
            <span>Tong cau hinh</span>
            <strong>{formatCurrency(totalPrice)}d</strong>
            <small>{selectedCount}/{insights.requiredComponentCount} linh kien da chon</small>
            <div className="summary-cooling-chip">
              {selectedItems.cooling ? getProductName(getSelectedProduct(selectedItems.cooling)) : insights.coolingState.required ? "Cooling dang thieu" : "Cooling tuy chon"}
            </div>
            <div className="summary-actions">
              <button type="button" onClick={actions.commitSave}>{isAuthenticated ? "Save build" : "Save local"}</button>
              <button type="button" onClick={handleShareBuild}>Share build</button>
              <button type="button" onClick={() => window.print()}>Export PDF</button>
              <button type="button" onClick={handleAddAllToCart} disabled={processingComponent === "cart"}>{processingComponent === "cart" ? "Dang them..." : "Add all to cart"}</button>
            </div>
          </section>

          <section className="summary-card">
            <div className="builder-panel-title">
              <span>Compatibility score</span>
              <strong>{insights.compatibilityScore}/100</strong>
            </div>
            <div className="score-ring" style={{ "--score": `${insights.compatibilityScore}%` }}>
              <strong>{insights.compatibilityScore}</strong>
              <span>score</span>
            </div>
            <div className="compat-list">
              {insights.checks.map((check) => (
                <div key={check.label} className={check.ok ? "is-ok" : "is-bad"}>
                  <strong>{check.ok ? "OK" : "WARN"} {check.label}</strong>
                  <span>{check.detail}</span>
                </div>
              ))}
            </div>
            <button type="button" className="ghost-action" disabled={selectedCount < 2 || loading} onClick={actions.checkCompatibility}>
              Kiem tra bang API
            </button>
            {compatibility ? <p className="api-result">{compatibility.compatible ? "API: cau hinh tuong thich." : "API: can xem lai tuong thich."}</p> : null}
          </section>

          <section className="summary-card">
            <h3>Performance estimate</h3>
            <div className="metric-grid">
              <div><span>FPS Gaming</span><strong>{insights.fps}</strong></div>
              <div><span>Power</span><strong>{insights.power}W</strong></div>
              <div><span>Temp</span><strong>{insights.temp}C</strong></div>
            </div>
            <div className={`cooling-summary-banner cooling-summary-banner--${insights.coolingState.warningTone}`}>
              <strong>{insights.coolingState.selected && insights.coolingState.fitOk ? "Cooling requirement satisfied" : insights.coolingState.warningTitle}</strong>
              <p>{insights.coolingState.selected ? insights.coolingState.helperText : insights.coolingState.warningText}</p>
            </div>
            <div className="bottleneck">
              <strong>Recommendation</strong>
              <p>{insights.recommendation}</p>
            </div>
          </section>

          <section className="summary-card ai-card">
            <h3>AI Advisor</h3>
            <label>
              <span>Ngan sach</span>
              <input type="number" value={suggestionForm.budget} onChange={(event) => setSuggestionForm((prev) => ({ ...prev, budget: event.target.value }))} />
            </label>
            <label>
              <span>Nhu cau</span>
              <select value={suggestionForm.purpose} onChange={(event) => setSuggestionForm((prev) => ({ ...prev, purpose: event.target.value }))}>
                {PURPOSE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={() => actions.getAiSuggestion(suggestionForm.purpose, suggestionForm.budget)} disabled={loading}>Lay goi y AI</button>
            <button type="button" onClick={handleAutoRecommend} disabled={processingComponent === "auto"}>{processingComponent === "auto" ? "Dang build..." : "Auto recommend build"}</button>
            {suggestion ? <p className="api-result">AI da tao goi y. Dung Auto recommend de chon linh kien trong catalog hien co.</p> : null}
          </section>

          <section className="summary-card picked-list">
            <h3>Linh kien da chon</h3>
            {COMPONENT_SECTIONS.map((section) => {
              const item = selectedItems[section.componentType];
              const optionalCooling = section.componentType === "cooling" && !insights.coolingState.required;
              return (
                <div key={section.componentType}>
                  <span>{section.label}</span>
                  {item ? (
                    <>
                      <strong>{getProductName(getSelectedProduct(item))}</strong>
                      <small>{formatCurrency(getItemPrice(item))}d</small>
                      <button type="button" onClick={() => actions.removeComponent(section.componentType)}>Xoa</button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setActiveComponent(section.componentType)}>{optionalCooling ? "Tuy chon" : "Chon"}</button>
                  )}
                </div>
              );
            })}
          </section>

          {!isAuthenticated ? (
            <Link className="register-cloud" to={routeConfig.public.register}>Dang ky de dong bo cau hinh len tai khoan</Link>
          ) : null}
        </aside>
      </main>
    </div>
  );
}

const builderStyles = `
.builder-page {
  display: grid;
  gap: 22px;
  min-height: 100vh;
  padding-bottom: 40px;
  background: #f8fafc;
}

.builder-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 24px;
  align-items: end;
  padding: 34px;
  border-radius: 0 0 32px 32px;
  color: #fff;
  background:
    radial-gradient(circle at top right, rgba(96, 165, 250, 0.38), transparent 34%),
    linear-gradient(135deg, #0f172a 0%, #1e3a8a 58%, #2563eb 100%);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
}

.builder-eyebrow,
.component-head span,
.builder-panel-title span {
  color: #bfdbfe;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.builder-hero h1 {
  margin: 8px 0 10px;
  font-size: clamp(34px, 5vw, 52px);
  line-height: 1.04;
}

.builder-hero p {
  max-width: 780px;
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.7;
}

.builder-hero__summary {
  display: grid;
  gap: 10px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.34);
}

.builder-hero__summary label,
.builder-hero__summary span,
.builder-hero__summary small {
  color: rgba(255, 255, 255, 0.72);
  font-size: 13px;
  font-weight: 800;
}

.builder-hero__summary input {
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 12px;
  color: #fff;
  background: rgba(255, 255, 255, 0.09);
}

.builder-hero__summary strong {
  font-size: 28px;
}

.builder-alert,
.preset-row,
.builder-layout {
  width: min(1480px, calc(100% - 32px));
  margin: 0 auto;
}

.builder-alert {
  padding: 14px 16px;
  border-radius: 16px;
  font-weight: 800;
}

.builder-alert--success {
  color: #047857;
  border: 1px solid #86efac;
  background: #ecfdf5;
}

.builder-alert--danger {
  color: #b91c1c;
  border: 1px solid #fecaca;
  background: #fef2f2;
}

.preset-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.preset-row button,
.step-item,
.builder-product-card,
.summary-card,
.builder-steps,
.builder-center {
  border: 1px solid #e2e8f0;
  background: #fff;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.07);
}

.preset-row button {
  display: grid;
  gap: 6px;
  padding: 16px;
  border-radius: 18px;
  text-align: left;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.preset-row button:hover,
.builder-product-card:hover,
.step-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 34px rgba(37, 99, 235, 0.14);
}

.preset-row span,
.preset-row small {
  color: #64748b;
  line-height: 1.5;
}

.builder-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 360px;
  gap: 18px;
  align-items: start;
}

.builder-steps,
.builder-summary {
  position: sticky;
  top: 18px;
}

.builder-steps,
.builder-center,
.summary-card {
  padding: 18px;
  border-radius: 24px;
}

.builder-panel-title {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.builder-panel-title span {
  color: #2563eb;
}

.builder-progress-track {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
  margin-bottom: 14px;
}

.builder-progress-track span,
.perf-bar span,
.stock-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(135deg, #0f172a, #2563eb);
}

.step-list,
.builder-summary,
.compat-list,
.picked-list,
.guest-builds {
  display: grid;
  gap: 10px;
}

.step-item {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 12px;
  border-radius: 16px;
  text-align: left;
  cursor: pointer;
}

.step-item > span {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  color: #1d4ed8;
  background: #eff6ff;
  font-size: 12px;
  font-weight: 900;
}

.step-item strong,
.builder-product-card h3,
.summary-card h3 {
  color: #0f172a;
}

.step-item small {
  display: block;
  overflow: hidden;
  color: #64748b;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.step-item.is-active {
  border-color: #2563eb;
}

.step-item.is-done > span {
  color: #fff;
  background: #047857;
}

.guest-builds {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #e2e8f0;
}

.guest-builds button {
  padding: 9px 10px;
  border: 1px solid #dbe4f0;
  border-radius: 12px;
  background: #f8fafc;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
}

.component-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  margin-bottom: 16px;
}

.component-head h2 {
  margin: 4px 0 0;
  color: #0f172a;
  font-size: 30px;
}

.component-head label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 300px;
  min-height: 46px;
  padding: 0 12px;
  border: 1px solid #dbe4f0;
  border-radius: 14px;
  background: #f8fafc;
}

.component-head input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
}

.cooling-guide {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid #dbeafe;
  background: linear-gradient(135deg, #eff6ff, #f8fafc);
}

.cooling-guide--danger {
  border-color: #fdba74;
  background: linear-gradient(135deg, #fff7ed, #fffbeb);
}

.cooling-guide--warning {
  border-color: #fcd34d;
  background: linear-gradient(135deg, #fefce8, #fff7ed);
}

.cooling-guide--success {
  border-color: #86efac;
  background: linear-gradient(135deg, #ecfdf5, #f8fafc);
}

.cooling-guide__icon,
.builder-empty__icon {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 18px;
  color: #1d4ed8;
  background: rgba(255, 255, 255, 0.86);
  font-size: 12px;
  font-weight: 900;
}

.cooling-guide__content strong,
.cooling-summary-banner strong {
  color: #0f172a;
}

.cooling-guide__content p,
.cooling-summary-banner p {
  margin: 6px 0 0;
  color: #475569;
  line-height: 1.55;
}

.cooling-guide button,
.builder-product-card button,
.summary-actions button,
.ghost-action,
.ai-card button,
.picked-list button {
  min-height: 40px;
  border: 0;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(135deg, #0f172a, #2563eb);
  font-weight: 900;
  cursor: pointer;
}

.product-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.builder-product-card {
  display: grid;
  overflow: hidden;
  border-radius: 20px;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.builder-product-card.is-selected {
  border-color: #2563eb;
  box-shadow: 0 18px 40px rgba(37, 99, 235, 0.16);
}

.builder-product-card__media {
  position: relative;
  aspect-ratio: 4 / 3;
  background: #f1f5f9;
}

.builder-product-card__media img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 18px;
}

.stock-pill,
.cooling-badge,
.selected-check {
  position: absolute;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
}

.stock-pill {
  top: 12px;
  left: 12px;
}

.stock-pill--success {
  color: #047857;
  background: #ecfdf5;
}

.stock-pill--normal {
  color: #1d4ed8;
  background: #eff6ff;
}

.stock-pill--warning {
  color: #b45309;
  background: #fffbeb;
}

.stock-pill--danger {
  color: #b91c1c;
  background: #fef2f2;
}

.cooling-badge {
  right: 12px;
  bottom: 12px;
  color: #fff;
  background: linear-gradient(135deg, #0f172a, #2563eb);
}

.selected-check {
  top: 12px;
  right: 12px;
  color: #fff;
  background: #10b981;
}

.builder-product-card__body {
  display: grid;
  gap: 10px;
  padding: 14px;
}

.builder-product-card__heading small {
  display: block;
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
}

.builder-product-card h3 {
  min-height: 46px;
  margin: 4px 0 0;
  font-size: 15px;
  line-height: 1.45;
}

.builder-product-card__meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.cooling-card__specs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.cooling-card__specs div {
  padding: 10px;
  border-radius: 14px;
  background: #f8fafc;
}

.cooling-card__specs span {
  display: block;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
}

.cooling-card__specs strong {
  display: block;
  margin-top: 4px;
  color: #0f172a;
  font-size: 12px;
  line-height: 1.4;
}

.tone-success {
  color: #047857 !important;
}

.tone-warning {
  color: #b45309 !important;
}

.tone-danger {
  color: #b91c1c !important;
}

.tone-neutral {
  color: #334155 !important;
}

.price-label {
  color: #2563eb;
  font-size: 20px;
}

.stock-bar {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
}

.summary-card--dark {
  color: #fff;
  border-color: transparent;
  background: linear-gradient(145deg, #0f172a, #1e3a8a);
}

.summary-card--dark span,
.summary-card--dark small {
  color: rgba(255, 255, 255, 0.72);
}

.summary-card--dark > strong {
  display: block;
  margin: 6px 0;
  font-size: 30px;
}

.summary-cooling-chip {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 8px 12px;
  border-radius: 999px;
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.14);
  font-size: 12px;
  font-weight: 800;
}

.summary-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 14px;
}

.summary-actions button {
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.score-ring {
  display: grid;
  place-items: center;
  width: 126px;
  height: 126px;
  margin: 12px auto;
  border-radius: 999px;
  background: conic-gradient(#2563eb var(--score), #e2e8f0 0);
}

.score-ring strong,
.score-ring span {
  grid-area: 1 / 1;
}

.score-ring strong {
  color: #0f172a;
  font-size: 34px;
}

.score-ring span {
  margin-top: 50px;
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
}

.compat-list div,
.bottleneck,
.picked-list div,
.cooling-summary-banner {
  display: grid;
  gap: 4px;
  padding: 11px;
  border-radius: 14px;
  background: #f8fafc;
}

.compat-list div.is-ok {
  background: #ecfdf5;
}

.compat-list div.is-bad {
  background: #fef2f2;
}

.cooling-summary-banner--success {
  background: #ecfdf5;
}

.cooling-summary-banner--warning {
  background: #fffbeb;
}

.cooling-summary-banner--danger {
  background: #fff7ed;
}

.compat-list strong,
.bottleneck strong,
.picked-list strong {
  color: #0f172a;
}

.compat-list span,
.bottleneck p,
.api-result,
.picked-list span,
.picked-list small {
  margin: 0;
  color: #64748b;
  line-height: 1.55;
  font-size: 13px;
}

.ghost-action {
  width: 100%;
  margin-top: 10px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 12px 0;
}

.metric-grid div {
  padding: 10px;
  border-radius: 14px;
  background: #eff6ff;
}

.metric-grid span {
  display: block;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.metric-grid strong {
  color: #1d4ed8;
  font-size: 20px;
}

.ai-card {
  display: grid;
  gap: 10px;
}

.ai-card label {
  display: grid;
  gap: 6px;
}

.ai-card label span {
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
}

.ai-card input,
.ai-card select {
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid #dbe4f0;
  border-radius: 12px;
  background: #f8fafc;
}

.picked-list h3 {
  margin-bottom: 4px;
}

.picked-list button {
  justify-self: start;
  min-height: 32px;
  padding: 0 10px;
  font-size: 12px;
}

.register-cloud {
  display: inline-flex;
  justify-content: center;
  padding: 13px;
  border-radius: 16px;
  color: #047857;
  background: #ecfdf5;
  font-weight: 900;
  text-align: center;
  text-decoration: none;
}

.builder-empty {
  display: grid;
  justify-items: center;
  grid-column: 1 / -1;
  gap: 10px;
  padding: 34px;
  border: 1px dashed #93c5fd;
  border-radius: 20px;
  background: #eff6ff;
  text-align: center;
}

.builder-empty h3 {
  margin: 0;
  color: #0f172a;
}

.builder-empty p {
  max-width: 540px;
  margin: 0;
  color: #64748b;
}

@media (max-width: 1280px) {
  .builder-layout {
    grid-template-columns: 230px minmax(0, 1fr);
  }

  .builder-summary {
    position: static;
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
}

@media (max-width: 980px) {
  .builder-hero,
  .builder-layout {
    grid-template-columns: 1fr;
  }

  .builder-steps {
    position: static;
  }

  .preset-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .product-card-grid,
  .builder-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cooling-guide {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .builder-hero {
    padding: 24px;
  }

  .preset-row,
  .product-card-grid,
  .builder-summary,
  .metric-grid,
  .cooling-card__specs {
    grid-template-columns: 1fr;
  }

  .component-head {
    display: grid;
  }

  .component-head label {
    min-width: 0;
  }

  .summary-actions {
    grid-template-columns: 1fr;
  }
}

@media print {
  .builder-steps,
  .preset-row,
  .component-head label,
  .builder-product-card button,
  .summary-actions,
  .ai-card,
  .register-cloud,
  .cooling-guide button {
    display: none !important;
  }

  .builder-page {
    background: #fff;
  }

  .builder-layout,
  .builder-summary {
    display: block;
    width: 100%;
  }

  .summary-card,
  .builder-center {
    break-inside: avoid;
    margin-bottom: 12px;
    box-shadow: none;
  }
}
`;
