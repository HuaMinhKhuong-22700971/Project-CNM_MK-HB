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
  { componentType: "storage", label: "SSD / Storage", categoryName: "STORAGE", icon: "SSD" },
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
  { id: "gaming", title: "Gaming", icon: "FPS", theme: "violet", budget: "25000000", useCase: "gaming", desc: "FPS cao, ưu tiên GPU và CPU mạnh." },
  { id: "office", title: "Office", icon: "WORK", theme: "emerald", budget: "12000000", useCase: "office", desc: "Ổn định, tiết kiệm điện, dễ nâng cấp." },
  { id: "editing", title: "Editing", icon: "EDIT", theme: "amber", budget: "35000000", useCase: "editing", desc: "Render video, RAM lớn, SSD nhanh." },
  { id: "streaming", title: "Streaming", icon: "LIVE", theme: "rose", budget: "30000000", useCase: "streaming", desc: "Gaming và encode mượt, cân bằng CPU/GPU." },
  { id: "ai", title: "AI Workstation", icon: "AI", theme: "sky", budget: "50000000", useCase: "ai", desc: "GPU VRAM cao, RAM lớn, nguồn dư tải." }
];

const HERO_FEATURES = [
  "Kiểm tra tương thích theo socket, RAM, PSU, case và cooling",
  "Tự đề xuất cấu hình theo ngân sách và nhu cầu sử dụng",
  "Lưu cấu hình, chia sẻ nhanh và thêm toàn bộ vào giỏ hàng"
];

const SPEC_ALIASES = {
  socket: ["socket"],
  ramType: ["ram_type", "loại ram", "loai ram", "memory type", "ddr"],
  psuWattage: ["psu_wattage", "wattage", "power", "công suất psu", "cong suat psu"],
  tdp: ["tdp", "power"],
  gpuLength: ["gpu_length", "length", "clearance", "chiều dài", "chieu dai"],
  caseGpuClearance: ["gpu clearance", "vga clearance", "case_gpu_clearance", "clearance"],
  coolingType: ["cooling_type", "loại tản nhiệt", "loai tan nhiet", "cooler type"],
  socketSupport: ["socket_support", "supported socket", "socket hỗ trợ", "socket ho tro"],
  coolingCapacity: ["cooling_capacity", "tdp cooling", "tdp capacity", "cooling power"],
  radiatorSize: ["radiator_size", "radiator", "radiator support"],
  coolerHeight: ["cooler_height", "cpu cooler height", "height"],
  caseRadiatorSupport: ["case_radiator_support", "radiator support"],
  caseCoolerClearance: ["case_cooler_clearance", "cpu cooler clearance"],
  stockCooler: ["stock_cooler", "cooler included", "boxed cooler", "tản đi kèm", "tan di kem"]
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
  if (stock <= 0) return { label: "Hết hàng", tone: "danger", width: "6%" };
  if (stock <= 5) return { label: `Còn ${stock}`, tone: "warning", width: "32%" };
  if (stock <= 15) return { label: `Còn ${stock}`, tone: "normal", width: "64%" };
  return { label: `Còn ${stock}`, tone: "success", width: "100%" };
}

function getCoolingCardStatus(product, selectedItems) {
  const cpu = getSelectedProduct(selectedItems.cpu);
  const caseProduct = getSelectedProduct(selectedItems.case);
  const diagnostics = getCoolingDiagnostics(cpu, product, caseProduct, true);

  if (!getProductId(cpu)) {
    return { label: "Chờ CPU để đánh giá", tone: "neutral" };
  }
  if (!diagnostics.socketOk) {
    return { label: "Không hợp socket", tone: "danger" };
  }
  if (!diagnostics.capacityOk) {
    return { label: "TDP chưa đủ", tone: "warning" };
  }
  if (!diagnostics.radiatorOk || !diagnostics.heightOk) {
    return { label: "Cần kiểm tra với case", tone: "warning" };
  }
  return { label: "Tương thích tốt", tone: "success" };
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

function getCheckStatus(check) {
  if (check.ok) return { tone: "success", icon: "✓", label: "Ổn định" };
  if (String(check.label || "").toLowerCase().includes("nguồn") || String(check.label || "").toLowerCase().includes("cool")) {
    return { tone: "danger", icon: "!", label: "Cần xử lý" };
  }
  return { tone: "warning", icon: "!", label: "Cảnh báo" };
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
      label: "Tương thích socket",
      ok: !cpuSocket || !boardSocket || normalizeText(cpuSocket) === normalizeText(boardSocket),
      detail: cpuSocket && boardSocket ? `${cpuSocket} / ${boardSocket}` : "Cần dữ liệu socket từ sản phẩm."
    },
    {
      label: "Tương thích RAM",
      ok: !ramType || !boardRam || normalizeText(boardRam).includes(normalizeText(ramType)) || normalizeText(ramType).includes(normalizeText(boardRam)),
      detail: ramType && boardRam ? `${ramType} / ${boardRam}` : "Cần dữ liệu chuẩn RAM từ sản phẩm."
    },
    {
      label: "Nguồn đủ công suất",
      ok: !selectedItems.psu || psuWatt === 0 || psuWatt >= requiredWatt,
      detail: selectedItems.psu ? `${psuWatt || "?"}W PSU / cần khoảng ${requiredWatt}W` : "Chưa chọn PSU."
    },
    {
      label: "GPU vừa case",
      ok: !gpuLength || !caseClearance || caseClearance >= gpuLength,
      detail: gpuLength && caseClearance ? `${gpuLength}mm GPU / ${caseClearance}mm case` : "Cần dữ liệu chiều dài GPU và khoảng trống của case."
    },
    {
      label: "Yêu cầu tản nhiệt",
      ok: !getProductId(cpu) || !coolingDiagnostics.required || coolingSelected,
      detail: !getProductId(cpu)
        ? "Chọn CPU để đánh giá nhu cầu tản nhiệt."
        : coolingDiagnostics.required
          ? coolingSelected
            ? "CPU này không đi kèm tản nhiệt và bạn đã chọn cooler riêng."
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
  const warningCount = checks.filter((check) => !check.ok).length;

  return {
    checks,
    compatibilityScore,
    requiredComponentCount,
    fps,
    power,
    temp,
    warningCount,
    recommendation: hardFails
      ? "Cần xử lý các cảnh báo tương thích trước khi lưu hoặc đặt hàng."
      : selectedCount < requiredComponentCount
        ? "Tiếp tục bổ sung các linh kiện còn thiếu để đánh giá chính xác hơn."
        : "Cấu hình đã đủ linh kiện chính và sẵn sàng lưu hoặc thêm vào giỏ hàng.",
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

function BuilderProductCard({ activeComponent, isSelected, processingComponent, loading, onSelect, product, selectedItems }) {
  const productId = getProductId(product);
  const performance = estimateProductPerformance(product, activeComponent);
  const stock = getProductStock(product);
  const stockState = getStockState(stock);
  const coolingType = activeComponent === "cooling" ? findSpec(product, SPEC_ALIASES.coolingType) : "";
  const coolingSocket = activeComponent === "cooling" ? findSpec(product, SPEC_ALIASES.socketSupport) : "";
  const coolingStatus = activeComponent === "cooling" ? getCoolingCardStatus(product, selectedItems) : null;
  const socket = findSpec(product, SPEC_ALIASES.socket);
  const ramType = findSpec(product, SPEC_ALIASES.ramType);

  return (
    <article className={`builder-product-card ${isSelected ? "is-selected" : ""}`} key={`${activeComponent}-${productId}`}>
      <div className="builder-product-card__media">
        <img
          src={resolveProductImage(product)}
          alt={getProductName(product)}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = resolveProductImage({ category_name: activeComponent === "cooling" ? "COOLING" : getProductBrand(product) });
          }}
        />
        <span className={`stock-pill stock-pill--${stockState.tone}`}>{stockState.label}</span>
        {activeComponent === "cooling" ? <div className="product-type-badge">{getCoolingBadge(product)}</div> : null}
        {isSelected ? <div className="selected-check">Đã chọn</div> : null}
      </div>

      <div className="builder-product-card__body">
        <div className="builder-product-card__eyebrow">
          <span>{getProductBrand(product)}</span>
          <span>{activeComponent.toUpperCase()}</span>
        </div>

        <div className="builder-product-card__heading">
          <h3>{getProductName(product)}</h3>
          <p>{activeComponent === "cooling" ? (coolingType || "Tản nhiệt") : (socket || ramType || "Hiệu năng và độ tương thích theo cấu hình")}</p>
        </div>

        <div className="builder-product-card__meta">
          <span>{getRating(product)} sao</span>
          <span>{performance}/100</span>
          {coolingSocket ? <span>{coolingSocket}</span> : null}
        </div>

        {activeComponent === "cooling" ? (
          <div className="cooling-card__specs">
            <div>
              <span>Loại</span>
              <strong>{coolingType || "Cooling"}</strong>
            </div>
            <div>
              <span>Socket</span>
              <strong>{coolingSocket || "Đang cập nhật"}</strong>
            </div>
            <div>
              <span>Tương thích</span>
              <strong className={`tone-${coolingStatus.tone}`}>{coolingStatus.label}</strong>
            </div>
          </div>
        ) : (
          <div className="product-stat-strip">
            <div>
              <span>Socket</span>
              <strong>{socket || "—"}</strong>
            </div>
            <div>
              <span>RAM</span>
              <strong>{ramType || "—"}</strong>
            </div>
            <div>
              <span>Tồn kho</span>
              <strong>{stock}</strong>
            </div>
          </div>
        )}

        <div className="product-card__footer">
          <div>
            <strong className="price-label">{formatCurrency(getProductPrice(product))}đ</strong>
            <div className="stock-bar">
              <span style={{ width: stockState.width }} />
            </div>
          </div>
          <button type="button" disabled={processingComponent === activeComponent || loading} onClick={() => onSelect(activeComponent, product)}>
            {processingComponent === activeComponent ? "Đang chọn..." : isSelected ? "Đã chọn" : "Chọn linh kiện"}
          </button>
        </div>
      </div>
    </article>
  );
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
  const [selectedPresetId, setSelectedPresetId] = useState("gaming");

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
        actions.setError("Không thể tải danh mục sản phẩm cho PC Builder.");
      }
    }

    loadCatalog();
    return () => {
      mounted = false;
    };
  }, [actions]);

  const activeSection = COMPONENT_SECTIONS.find((section) => section.componentType === activeComponent) || COMPONENT_SECTIONS[0];
  const insights = useMemo(() => calculateBuilderInsights(selectedItems, selectedCount), [selectedItems, selectedCount]);
  const completionPercent = Math.round((Math.min(selectedCount, insights.requiredComponentCount) / insights.requiredComponentCount) * 100);

  const activeProducts = useMemo(() => {
    const keyword = normalizeText(searchTerm);
    return (optionsByComponent[activeComponent] || [])
      .filter((product) => {
        const text = `${getProductName(product)} ${getProductBrand(product)} ${findSpec(product, SPEC_ALIASES.coolingType)} ${findSpec(product, SPEC_ALIASES.socket)} ${findSpec(product, SPEC_ALIASES.ramType)}`;
        return !keyword || normalizeText(text).includes(keyword);
      })
      .slice(0, 12);
  }, [activeComponent, optionsByComponent, searchTerm]);

  const selectedSummaryItems = useMemo(() => (
    COMPONENT_SECTIONS.map((section) => ({
      ...section,
      item: selectedItems[section.componentType]
    }))
  ), [selectedItems]);

  const visibleChecks = useMemo(() => insights.checks.filter((check) => !check.ok || check.label === "Tương thích socket" || check.label === "Tương thích RAM").slice(0, 4), [insights.checks]);

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
        actions.setError("Sản phẩm này chưa có SKU khả dụng để thêm vào cấu hình.");
        return;
      }

      await actions.applyComponent(type, selectedVariant.variant_id, { ...product, ...detail }, variants);
      const currentIndex = COMPONENT_SECTIONS.findIndex((section) => section.componentType === type);
      const nextSection = COMPONENT_SECTIONS[currentIndex + 1];
      if (nextSection) setActiveComponent(nextSection.componentType);
    } catch (_err) {
      actions.setError("Không thể tải chi tiết sản phẩm.");
    } finally {
      setProcessingComponent("");
    }
  }

  async function handleAutoRecommend() {
    const budget = Number(suggestionForm.budget || 0);
    if (!budget) {
      actions.setError("Vui lòng nhập ngân sách để AI Advisor gợi ý cấu hình.");
      return;
    }

    setProcessingComponent("auto");
    setLocalMessage("Đang chọn linh kiện phù hợp ngân sách...");

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

      setLocalMessage("Đã tự động đề xuất cấu hình. Bạn có thể thay từng linh kiện nếu muốn tối ưu thêm.");
    } finally {
      setProcessingComponent("");
    }
  }

  async function handlePickCoolingRecommendation() {
    const products = optionsByComponent.cooling || [];
    const target = Number(suggestionForm.budget || 0) * 0.03;
    const product = pickRecommendedCoolingProduct(products, selectedItems, target);
    if (!product) {
      actions.setError("Chưa tìm thấy tản nhiệt phù hợp trong danh mục hiện tại.");
      return;
    }
    await handleSelectProduct("cooling", product);
  }

  async function handleAddAllToCart() {
    const variantIds = Object.values(selectedItems).map(getVariantId).filter(Boolean);
    if (variantIds.length === 0) {
      actions.setError("Chưa có linh kiện để thêm vào giỏ hàng.");
      return;
    }
    if (!isAuthenticated) {
      navigate(routeConfig.public.login);
      return;
    }

    setProcessingComponent("cart");
    try {
      await Promise.all(variantIds.map((productVariantId) => addItemToCart({ productVariantId, quantity: 1 })));
      setLocalMessage("Đã thêm toàn bộ linh kiện vào giỏ hàng.");
    } catch (_err) {
      actions.setError("Không thể thêm toàn bộ linh kiện vào giỏ hàng.");
    } finally {
      setProcessingComponent("");
    }
  }

  async function handleShareBuild() {
    const text = `${buildName} - ${formatCurrency(totalPrice)}đ\n${COMPONENT_SECTIONS.map((section) => {
      const item = selectedItems[section.componentType];
      return `${section.label}: ${item ? getProductName(getSelectedProduct(item)) : "Chưa chọn"}`;
    }).join("\n")}`;

    try {
      await navigator.clipboard.writeText(text);
      setLocalMessage("Đã sao chép cấu hình để chia sẻ.");
    } catch (_err) {
      setLocalMessage("Trình duyệt không cho sao chép tự động. Bạn có thể dùng Export PDF.");
    }
  }

  function handlePreset(preset) {
    setSelectedPresetId(preset.id);
    setSuggestionForm({ purpose: preset.useCase, budget: preset.budget });
    setLocalMessage(`Đã chọn preset ${preset.title}. Bấm Auto recommend để hệ thống chọn linh kiện.`);
  }

  return (
    <div className="builder-page builder-page--modern">
      <style>{builderStyles}</style>

      <section className="builder-hero">
        <div className="builder-hero__content">
          <span className="builder-eyebrow">AI Builder • PC Mall</span>
          <h1>Trung tâm build PC thông minh cho khách hàng mới và người dùng chuyên sâu</h1>
          <p>Tư vấn cấu hình, soát tương thích, chọn linh kiện thật trong catalog và chốt đơn theo đúng ngân sách.</p>

          <div className="builder-feature-list">
            {HERO_FEATURES.map((feature) => (
              <div key={feature} className="builder-feature-pill">
                <span>•</span>
                <strong>{feature}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="builder-hero__summary">
          <div className="builder-hero__summary-head">
            <div>
              <span>Tên cấu hình</span>
              <input value={buildName} onChange={(event) => setBuildName(event.target.value)} placeholder="Ví dụ: Build gaming 25 triệu" />
            </div>
            <div className="builder-hero__score">
              <span>Tương thích</span>
              <strong>{insights.compatibilityScore}</strong>
            </div>
          </div>

          <div className="builder-hero__stats">
            <article>
              <span>Tổng cấu hình</span>
              <strong>{formatCurrency(totalPrice)}đ</strong>
            </article>
            <article>
              <span>Linh kiện</span>
              <strong>{selectedCount}/{insights.requiredComponentCount}</strong>
            </article>
            <article>
              <span>Công suất</span>
              <strong>{insights.power}W</strong>
            </article>
            <article>
              <span>Cảnh báo</span>
              <strong>{insights.warningCount}</strong>
            </article>
          </div>

          <div className="builder-hero__actions">
            <button type="button" className="hero-action hero-action--primary" onClick={handleAutoRecommend} disabled={processingComponent === "auto"}>
              {processingComponent === "auto" ? "Đang build..." : "Auto recommend"}
            </button>
            <button type="button" className="hero-action hero-action--secondary" onClick={() => actions.getAiSuggestion(suggestionForm.purpose, suggestionForm.budget)} disabled={loading}>
              Gợi ý AI
            </button>
          </div>
        </div>
      </section>

      {(error || success || localMessage) ? (
        <div className={`builder-alert ${error ? "builder-alert--danger" : "builder-alert--success"}`}>
          {error || success || localMessage}
        </div>
      ) : null}

      <section className="preset-row">
        {PRESET_BUILDS.map((preset) => (
          <button
            type="button"
            key={preset.id}
            className={`preset-card preset-card--${preset.theme} ${selectedPresetId === preset.id ? "is-active" : ""}`}
            onClick={() => handlePreset(preset)}
          >
            <div className="preset-card__icon">{preset.icon}</div>
            <div className="preset-card__content">
              <strong>{preset.title}</strong>
              <span>{preset.desc}</span>
              <small>{formatCurrency(preset.budget)}đ</small>
            </div>
          </button>
        ))}
      </section>

      <main className="builder-layout">
        <aside className="builder-sidebar">
          <section className="builder-panel builder-steps">
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
                      <small>{selected ? getProductName(getSelectedProduct(selected)) : section.componentType === "cooling" && !insights.coolingState.required ? "Tùy chọn" : "Chưa chọn"}</small>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="builder-panel builder-status-panel">
            <div className="builder-panel-title">
              <span>Trạng thái build</span>
              <strong>{insights.warningCount > 0 ? "Cần xem lại" : "Ổn định"}</strong>
            </div>

            <div className="builder-status-grid">
              <article>
                <span>FPS dự kiến</span>
                <strong>{insights.fps}</strong>
              </article>
              <article>
                <span>Nhiệt độ</span>
                <strong>{insights.temp}°C</strong>
              </article>
            </div>

            {!isAuthenticated ? (
              <div className="guest-builds">
                <strong>Cấu hình đã lưu trên trình duyệt</strong>
                {guestBuildList.slice(0, 4).map((slot) => (
                  <button type="button" key={slot.id} onClick={() => actions.loadGuestBuildById(slot.id)}>{slot.name}</button>
                ))}
                <button type="button" onClick={() => actions.createNewGuestBuild()}>+ Tạo build mới</button>
              </div>
            ) : null}
          </section>
        </aside>

        <section className="builder-center">
          <div className="component-head">
            <div>
              <span>Component selection</span>
              <h2>{activeSection.label}</h2>
              <p>Chọn linh kiện theo nhu cầu, ngân sách và độ tương thích với cấu hình hiện tại.</p>
            </div>

            <div className="component-head__tools">
              <label>
                <span>Tìm kiếm</span>
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={`Tìm ${activeSection.label}...`} />
              </label>
              <label>
                <span>Ngân sách</span>
                <input type="number" value={suggestionForm.budget} onChange={(event) => setSuggestionForm((prev) => ({ ...prev, budget: event.target.value }))} />
              </label>
            </div>
          </div>

          {activeComponent === "cooling" ? (
            <div className={`cooling-guide cooling-guide--${insights.coolingState.warningTone}`}>
              <div className="cooling-guide__icon">COOL</div>
              <div className="cooling-guide__content">
                <strong>{insights.coolingState.warningTitle}</strong>
                <p>{selectedItems.cooling ? insights.coolingState.helperText : insights.coolingState.warningText}</p>
              </div>
              {!selectedItems.cooling ? (
                <button type="button" onClick={handlePickCoolingRecommendation} disabled={processingComponent === "cooling" || activeProducts.length === 0}>
                  Chọn tản nhiệt phù hợp
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="product-card-grid">
            {activeProducts.length === 0 ? (
              <div className="builder-empty">
                <div className="builder-empty__icon">{activeComponent === "cooling" ? "❄" : "PC"}</div>
                <h3>{activeComponent === "cooling" ? "❄️ Chưa chọn tản nhiệt" : "Chưa có sản phẩm cho nhóm này"}</h3>
                <p>{activeComponent === "cooling" ? "Tản nhiệt giúp CPU hoạt động ổn định, giảm nóng và tránh tụt hiệu năng." : "Danh mục này hiện chưa có dữ liệu khả dụng. Bạn có thể chọn nhóm linh kiện khác trước."}</p>
              </div>
            ) : (
              activeProducts.map((product) => {
                const productId = getProductId(product);
                const selected = selectedItems[activeComponent];
                const isSelected = String(getProductId(getSelectedProduct(selected))) === String(productId);
                return (
                  <BuilderProductCard
                    key={`${activeComponent}-${productId}`}
                    activeComponent={activeComponent}
                    isSelected={isSelected}
                    loading={loading}
                    onSelect={handleSelectProduct}
                    processingComponent={processingComponent}
                    product={product}
                    selectedItems={selectedItems}
                  />
                );
              })
            )}
          </div>
        </section>

        <aside className="builder-summary">
          <section className="summary-card summary-card--hero">
            <div className="summary-card__header">
              <div>
                <span>Tổng cấu hình</span>
                <strong>{formatCurrency(totalPrice)}đ</strong>
              </div>
              <div className={`summary-score summary-score--${insights.warningCount > 0 ? "warning" : "success"}`}>
                <span>{insights.compatibilityScore}</span>
              </div>
            </div>

            <div className="summary-highlights">
              <div>
                <span>Công suất dự kiến</span>
                <strong>{insights.power}W</strong>
              </div>
              <div>
                <span>Cooling</span>
                <strong>{selectedItems.cooling ? "Đã chọn" : insights.coolingState.required ? "Còn thiếu" : "Tùy chọn"}</strong>
              </div>
            </div>

            <div className="summary-actions">
              <button type="button" onClick={actions.commitSave}>{isAuthenticated ? "Lưu build" : "Lưu local"}</button>
              <button type="button" onClick={handleShareBuild}>Chia sẻ</button>
              <button type="button" onClick={() => window.print()}>Export PDF</button>
              <button type="button" onClick={handleAddAllToCart} disabled={processingComponent === "cart"}>
                {processingComponent === "cart" ? "Đang thêm..." : "Add all to cart"}
              </button>
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
              {visibleChecks.map((check) => {
                const status = getCheckStatus(check);
                return (
                  <div key={check.label} className={`compat-card compat-card--${status.tone}`}>
                    <div className="compat-card__icon">{status.icon}</div>
                    <div>
                      <strong>{check.label}</strong>
                      <span>{check.detail}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button type="button" className="ghost-action" disabled={selectedCount < 2 || loading} onClick={actions.checkCompatibility}>
              Kiểm tra tương thích
            </button>
            {compatibility ? <p className="api-result">{compatibility.compatible ? "API xác nhận cấu hình đang tương thích." : "API phát hiện cấu hình cần kiểm tra lại."}</p> : null}
          </section>

          <section className="summary-card">
            <div className="builder-panel-title">
              <span>Hiệu năng dự kiến</span>
              <strong>{insights.fps} FPS</strong>
            </div>

            <div className="metric-grid">
              <div><span>Gaming</span><strong>{insights.fps}</strong></div>
              <div><span>Power</span><strong>{insights.power}W</strong></div>
              <div><span>Nhiệt độ</span><strong>{insights.temp}°C</strong></div>
            </div>

            <div className={`cooling-summary-banner cooling-summary-banner--${insights.coolingState.warningTone}`}>
              <strong>{insights.coolingState.selected && insights.coolingState.fitOk ? "Cooling requirement satisfied" : insights.coolingState.warningTitle}</strong>
              <p>{insights.coolingState.selected ? insights.coolingState.helperText : insights.coolingState.warningText}</p>
            </div>

            <div className="bottleneck">
              <strong>Khuyến nghị</strong>
              <p>{insights.recommendation}</p>
            </div>
          </section>

          <section className="summary-card ai-card">
            <div className="builder-panel-title">
              <span>AI Advisor</span>
              <strong>{suggestionForm.budget ? `${formatCurrency(suggestionForm.budget)}đ` : "—"}</strong>
            </div>
            <label>
              <span>Ngân sách</span>
              <input type="number" value={suggestionForm.budget} onChange={(event) => setSuggestionForm((prev) => ({ ...prev, budget: event.target.value }))} />
            </label>
            <label>
              <span>Nhu cầu</span>
              <select value={suggestionForm.purpose} onChange={(event) => setSuggestionForm((prev) => ({ ...prev, purpose: event.target.value }))}>
                {PURPOSE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={() => actions.getAiSuggestion(suggestionForm.purpose, suggestionForm.budget)} disabled={loading}>Lấy gợi ý AI</button>
            <button type="button" className="ghost-action" onClick={handleAutoRecommend} disabled={processingComponent === "auto"}>{processingComponent === "auto" ? "Đang build..." : "Tự chọn cấu hình"}</button>
            {suggestion ? <p className="api-result">AI đã tạo gợi ý. Dùng Auto recommend để áp cấu hình vào catalog hiện tại.</p> : null}
          </section>

          <section className="summary-card picked-list">
            <div className="builder-panel-title">
              <span>Linh kiện đã chọn</span>
              <strong>{selectedCount}</strong>
            </div>

            {selectedSummaryItems.map((section) => {
              const optionalCooling = section.componentType === "cooling" && !insights.coolingState.required;
              return (
                <div key={section.componentType} className="picked-item">
                  <div>
                    <span>{section.label}</span>
                    {section.item ? (
                      <>
                        <strong>{getProductName(getSelectedProduct(section.item))}</strong>
                        <small>{formatCurrency(getItemPrice(section.item))}đ</small>
                      </>
                    ) : (
                      <small>{optionalCooling ? "Tùy chọn" : "Chưa chọn"}</small>
                    )}
                  </div>

                  {section.item ? (
                    <button type="button" onClick={() => actions.removeComponent(section.componentType)}>Xóa</button>
                  ) : (
                    <button type="button" onClick={() => setActiveComponent(section.componentType)}>{optionalCooling ? "Bỏ qua" : "Chọn"}</button>
                  )}
                </div>
              );
            })}
          </section>

          {!isAuthenticated ? (
            <Link className="register-cloud" to={routeConfig.public.register}>Đăng ký để đồng bộ cấu hình lên tài khoản</Link>
          ) : null}
        </aside>
      </main>
    </div>
  );
}

const builderStyles = `
.builder-page--modern {
  display: grid;
  gap: 22px;
  min-height: 100vh;
  padding: 20px 0 40px;
  font-family: "Inter", "Be Vietnam Pro", "Segoe UI", system-ui, sans-serif;
  background:
    radial-gradient(circle at top left, rgba(191, 219, 254, 0.45), transparent 28%),
    linear-gradient(180deg, #f8fbff 0%, #f8fafc 46%, #ffffff 100%);
}

.builder-alert,
.preset-row,
.builder-layout,
.builder-hero {
  width: min(1536px, calc(100% - 64px));
  margin: 0 auto;
}

.builder-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 420px);
  gap: 28px;
  padding: 30px 34px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 32px;
  color: #f8fafc;
  background:
    radial-gradient(circle at top right, rgba(96, 165, 250, 0.22), transparent 28%),
    linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(22, 44, 96, 0.96) 62%, rgba(37, 99, 235, 0.82) 100%);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.16);
  backdrop-filter: blur(20px);
}

.builder-eyebrow,
.component-head span,
.builder-panel-title span {
  color: #bfdbfe;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.builder-hero__content h1 {
  margin: 10px 0 10px;
  max-width: 760px;
  font-size: clamp(30px, 3.6vw, 48px);
  line-height: 1.08;
  letter-spacing: 0;
}

.builder-hero__content p {
  max-width: 720px;
  margin: 0;
  color: rgba(241, 245, 249, 0.82);
  font-size: 15px;
  line-height: 1.75;
}

.builder-feature-list {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.builder-feature-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  max-width: 100%;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.86);
}

.builder-feature-pill span {
  color: #7dd3fc;
  font-size: 16px;
  line-height: 1;
}

.builder-feature-pill strong {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
}

.builder-hero__summary {
  display: grid;
  gap: 16px;
  align-self: stretch;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 26px;
  background: rgba(15, 23, 42, 0.28);
  backdrop-filter: blur(18px);
}

.builder-hero__summary-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 88px;
  gap: 14px;
  align-items: start;
}

.builder-hero__summary-head span,
.builder-hero__score span,
.builder-hero__stats span {
  display: block;
  color: rgba(226, 232, 240, 0.8);
  font-size: 12px;
  font-weight: 700;
}

.builder-hero__summary input {
  width: 100%;
  min-height: 46px;
  margin-top: 8px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 14px;
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.builder-hero__score {
  display: grid;
  place-items: center;
  gap: 2px;
  min-height: 88px;
  padding: 10px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
}

.builder-hero__score strong {
  font-size: 32px;
  line-height: 1;
}

.builder-hero__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.builder-hero__stats article {
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
}

.builder-hero__stats strong {
  display: block;
  margin-top: 8px;
  color: #fff;
  font-size: 22px;
  font-weight: 800;
}

.builder-hero__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.hero-action,
.summary-actions button,
.ghost-action,
.ai-card button,
.picked-item button,
.builder-product-card button,
.cooling-guide button,
.guest-builds button {
  min-height: 42px;
  border: 0;
  border-radius: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
}

.hero-action:hover,
.summary-actions button:hover,
.ghost-action:hover,
.ai-card button:hover,
.picked-item button:hover,
.builder-product-card button:hover,
.cooling-guide button:hover,
.guest-builds button:hover,
.preset-card:hover,
.step-item:hover,
.builder-product-card:hover {
  transform: translateY(-2px);
}

.hero-action--primary,
.builder-product-card button,
.ai-card button {
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 14px 34px rgba(37, 99, 235, 0.22);
}

.hero-action--secondary,
.ghost-action {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.builder-alert {
  padding: 14px 16px;
  border-radius: 18px;
  font-weight: 700;
}

.builder-alert--success {
  color: #0f766e;
  border: 1px solid #99f6e4;
  background: #ecfeff;
}

.builder-alert--danger {
  color: #b91c1c;
  border: 1px solid #fecaca;
  background: #fef2f2;
}

.preset-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 18px;
}

.preset-card {
  display: grid;
  grid-template-columns: 62px minmax(0, 1fr);
  gap: 14px;
  padding: 18px;
  border: 1px solid #dbe7f5;
  border-radius: 22px;
  text-align: left;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.06);
}

.preset-card.is-active {
  border-color: #60a5fa;
  box-shadow: 0 20px 44px rgba(37, 99, 235, 0.14);
}

.preset-card__icon {
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  border-radius: 18px;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.preset-card--violet .preset-card__icon { color: #5b21b6; background: #ede9fe; }
.preset-card--emerald .preset-card__icon { color: #047857; background: #d1fae5; }
.preset-card--amber .preset-card__icon { color: #b45309; background: #fef3c7; }
.preset-card--rose .preset-card__icon { color: #be123c; background: #ffe4e6; }
.preset-card--sky .preset-card__icon { color: #0369a1; background: #e0f2fe; }

.preset-card__content {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.preset-card__content strong {
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
}

.preset-card__content span,
.preset-card__content small {
  color: #64748b;
  line-height: 1.6;
}

.preset-card__content small {
  color: #2563eb;
  font-weight: 700;
}

.builder-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 340px;
  gap: 28px;
  align-items: start;
}

.builder-sidebar,
.builder-summary {
  position: sticky;
  top: 18px;
  display: grid;
  gap: 16px;
}

.builder-panel,
.builder-center,
.summary-card {
  padding: 22px;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.06);
}

.builder-panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.builder-panel-title strong,
.summary-card h3,
.component-head h2,
.step-item strong,
.builder-product-card h3,
.summary-card__header strong,
.picked-item strong {
  color: #0f172a;
}

.builder-progress-track,
.stock-bar {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
}

.builder-progress-track span,
.stock-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(135deg, #2563eb, #0f172a);
}

.step-list,
.guest-builds,
.compat-list,
.builder-summary,
.picked-list {
  display: grid;
  gap: 10px;
}

.step-item {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 12px;
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.step-item > span {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  color: #1d4ed8;
  background: #eff6ff;
  font-size: 12px;
  font-weight: 900;
}

.step-item small,
.component-head p,
.api-result,
.builder-empty p,
.compat-card span,
.cooling-guide__content p,
.cooling-summary-banner p,
.bottleneck p,
.picked-item span,
.picked-item small,
.builder-status-grid span {
  color: #64748b;
  line-height: 1.6;
}

.step-item.is-active {
  border-color: #93c5fd;
  box-shadow: 0 12px 30px rgba(59, 130, 246, 0.12);
}

.step-item.is-done > span {
  color: #fff;
  background: linear-gradient(135deg, #0f766e, #10b981);
}

.builder-status-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.builder-status-grid article {
  padding: 12px;
  border-radius: 18px;
  background: #f8fafc;
}

.builder-status-grid strong {
  display: block;
  margin-top: 6px;
  color: #0f172a;
  font-size: 20px;
}

.guest-builds {
  margin-top: 4px;
}

.guest-builds strong {
  color: #0f172a;
  font-size: 14px;
}

.guest-builds button {
  padding: 0 12px;
  color: #0f172a;
  background: #f8fafc;
  border: 1px solid #dbe4f0;
  text-align: left;
}

.component-head {
  display: grid;
  gap: 18px;
  margin-bottom: 22px;
}

.component-head h2 {
  margin: 6px 0 6px;
  font-size: 32px;
  line-height: 1.12;
}

.component-head__tools {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(220px, 280px);
  gap: 14px;
}

.component-head__tools label,
.ai-card label {
  display: grid;
  gap: 6px;
}

.component-head__tools label span,
.ai-card label span {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.component-head__tools input,
.ai-card input,
.ai-card select {
  min-height: 48px;
  padding: 0 16px;
  border: 1px solid #dbe4f0;
  border-radius: 14px;
  background: #f8fafc;
}

.cooling-guide {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  margin-bottom: 18px;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid #dbeafe;
  background: linear-gradient(135deg, #eff6ff, #ffffff);
}

.cooling-guide--danger {
  border-color: #fdba74;
  background: linear-gradient(135deg, #fff7ed, #fffbeb);
}

.cooling-guide--warning {
  border-color: #fde68a;
  background: linear-gradient(135deg, #fffbeb, #fff7ed);
}

.cooling-guide--success {
  border-color: #86efac;
  background: linear-gradient(135deg, #ecfdf5, #ffffff);
}

.cooling-guide__icon,
.builder-empty__icon {
  display: grid;
  place-items: center;
  width: 76px;
  height: 76px;
  border-radius: 22px;
  color: #1d4ed8;
  background: rgba(255, 255, 255, 0.88);
  font-size: 13px;
  font-weight: 900;
}

.cooling-guide__content strong,
.cooling-summary-banner strong,
.builder-empty h3,
.compat-card strong,
.bottleneck strong {
  color: #0f172a;
}

.cooling-guide button {
  min-width: 188px;
  padding: 0 16px;
  color: #fff;
  background: linear-gradient(135deg, #0f172a, #2563eb);
}

.product-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.builder-product-card {
  display: grid;
  overflow: hidden;
  border: 1px solid #dbe7f5;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.builder-product-card.is-selected {
  border-color: #60a5fa;
  box-shadow: 0 20px 44px rgba(37, 99, 235, 0.14);
}

.builder-product-card__media {
  position: relative;
  min-height: 220px;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(191, 219, 254, 0.82), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.builder-product-card__media img {
  width: 100%;
  height: 220px;
  object-fit: contain;
  padding: 20px;
  transition: transform 180ms ease;
}

.builder-product-card:hover .builder-product-card__media img {
  transform: scale(1.03);
}

.stock-pill,
.product-type-badge,
.selected-check {
  position: absolute;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
}

.stock-pill { top: 12px; left: 12px; }
.stock-pill--success { color: #047857; background: #ecfdf5; }
.stock-pill--normal { color: #1d4ed8; background: #eff6ff; }
.stock-pill--warning { color: #b45309; background: #fffbeb; }
.stock-pill--danger { color: #b91c1c; background: #fef2f2; }

.product-type-badge {
  right: 12px;
  bottom: 12px;
  color: #fff;
  background: linear-gradient(135deg, #0f172a, #2563eb);
}

.selected-check {
  top: 12px;
  right: 12px;
  color: #fff;
  background: linear-gradient(135deg, #0f766e, #10b981);
}

.builder-product-card__body {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.builder-product-card__eyebrow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.builder-product-card__heading h3 {
  min-height: 50px;
  margin: 0;
  font-size: 16px;
  line-height: 1.45;
}

.builder-product-card__heading p {
  min-height: 40px;
  margin: 8px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.55;
}

.builder-product-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.builder-product-card__meta span {
  padding: 6px 10px;
  border-radius: 999px;
  color: #475569;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 700;
}

.product-stat-strip,
.cooling-card__specs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.product-stat-strip div,
.cooling-card__specs div,
.metric-grid div,
.summary-highlights div {
  padding: 12px;
  border-radius: 16px;
  background: #f8fafc;
}

.product-stat-strip span,
.cooling-card__specs span,
.metric-grid span,
.summary-highlights span {
  display: block;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
}

.product-stat-strip strong,
.cooling-card__specs strong,
.metric-grid strong,
.summary-highlights strong {
  display: block;
  margin-top: 6px;
  color: #0f172a;
  font-size: 13px;
  line-height: 1.4;
}

.price-label {
  color: #2563eb;
  font-size: 24px;
  font-weight: 800;
}

.product-card__footer {
  display: grid;
  gap: 12px;
}

.product-card__footer button {
  width: 100%;
  color: #fff;
  background: linear-gradient(135deg, #0f172a, #2563eb);
}

.summary-card {
  display: grid;
  gap: 14px;
}

.summary-card--hero {
  color: #e2e8f0;
  border-color: transparent;
  background: linear-gradient(145deg, #0f172a, #172554);
}

.summary-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.summary-card__header span {
  display: block;
  color: rgba(226, 232, 240, 0.76);
  font-size: 12px;
  font-weight: 800;
}

.summary-card__header strong {
  display: block;
  margin-top: 8px;
  color: #fff;
  font-size: 30px;
}

.summary-score {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 20px;
  color: #fff;
  font-size: 28px;
  font-weight: 800;
}

.summary-score--success { background: linear-gradient(135deg, #0f766e, #10b981); }
.summary-score--warning { background: linear-gradient(135deg, #d97706, #f59e0b); }

.summary-highlights {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.summary-highlights strong {
  color: #0f172a;
  font-size: 15px;
}

.summary-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.summary-actions button {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.score-ring {
  display: grid;
  place-items: center;
  width: 132px;
  height: 132px;
  margin: 0 auto;
  border-radius: 999px;
  background: conic-gradient(#2563eb var(--score), #dbeafe 0);
}

.score-ring::before {
  content: "";
  grid-area: 1 / 1;
  width: 96px;
  height: 96px;
  border-radius: 999px;
  background: #fff;
}

.score-ring strong,
.score-ring span {
  grid-area: 1 / 1;
  position: relative;
  z-index: 1;
}

.score-ring strong {
  color: #0f172a;
  font-size: 34px;
}

.score-ring span {
  margin-top: 52px;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.compat-list {
  display: grid;
  gap: 10px;
}

.compat-card {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  padding: 12px;
  border-radius: 16px;
}

.compat-card--success { background: #ecfdf5; }
.compat-card--warning { background: #fffbeb; }
.compat-card--danger { background: #fef2f2; }

.compat-card__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  color: #0f172a;
  background: rgba(255, 255, 255, 0.7);
  font-weight: 900;
}

.ghost-action {
  width: 100%;
  color: #0f172a;
  background: #eff6ff;
  border: 1px solid #cfe0ff;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.metric-grid strong {
  color: #2563eb;
  font-size: 21px;
}

.cooling-summary-banner,
.bottleneck,
.picked-item {
  display: grid;
  gap: 4px;
  padding: 12px;
  border-radius: 16px;
  background: #f8fafc;
}

.cooling-summary-banner--success { background: #ecfdf5; }
.cooling-summary-banner--warning { background: #fffbeb; }
.cooling-summary-banner--danger { background: #fff7ed; }

.picked-item {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
}

.picked-item button {
  min-width: 74px;
  padding: 0 12px;
  color: #0f172a;
  background: #eff6ff;
  border: 1px solid #cfe0ff;
}

.register-cloud {
  display: inline-flex;
  justify-content: center;
  padding: 14px 16px;
  border-radius: 16px;
  color: #047857;
  background: #ecfdf5;
  font-weight: 800;
  text-align: center;
}

.builder-empty {
  display: grid;
  justify-items: center;
  grid-column: 1 / -1;
  gap: 10px;
  padding: 42px 28px;
  border: 1px dashed #bfdbfe;
  border-radius: 24px;
  background: #f8fbff;
  text-align: center;
}

.tone-success { color: #047857 !important; }
.tone-warning { color: #b45309 !important; }
.tone-danger { color: #b91c1c !important; }
.tone-neutral { color: #334155 !important; }

@media (max-width: 1320px) {
  .builder-alert,
  .preset-row,
  .builder-layout,
  .builder-hero {
    width: min(100%, calc(100% - 40px));
  }

  .builder-layout {
    grid-template-columns: 260px minmax(0, 1fr);
  }

  .builder-summary {
    position: static;
    grid-column: 1 / -1;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1024px) {
  .builder-hero,
  .builder-layout {
    grid-template-columns: 1fr;
  }

  .builder-sidebar,
  .builder-summary {
    position: static;
  }

  .builder-summary,
  .product-card-grid,
  .preset-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .builder-hero {
    padding: 26px 28px;
  }

  .component-head__tools {
    grid-template-columns: 1fr;
  }

  .cooling-guide {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .builder-alert,
  .preset-row,
  .builder-layout,
  .builder-hero {
    width: min(100%, calc(100% - 24px));
  }

  .builder-page--modern {
    gap: 18px;
    padding-top: 14px;
  }

  .builder-hero,
  .builder-panel,
  .builder-center,
  .summary-card {
    padding: 18px;
    border-radius: 20px;
  }

  .preset-row,
  .product-card-grid,
  .builder-summary,
  .metric-grid,
  .product-stat-strip,
  .cooling-card__specs,
  .builder-hero__stats,
  .summary-highlights,
  .summary-actions {
    grid-template-columns: 1fr;
  }

  .preset-card,
  .builder-hero__summary-head,
  .compat-card,
  .picked-item {
    grid-template-columns: 1fr;
  }

  .component-head h2 {
    font-size: 28px;
  }

  .builder-product-card__media,
  .builder-product-card__media img {
    min-height: 210px;
    height: 210px;
  }

  .builder-summary {
    position: static;
  }
}

@media print {
  .preset-row,
  .builder-sidebar,
  .component-head__tools,
  .builder-product-card button,
  .summary-actions,
  .ai-card,
  .register-cloud,
  .cooling-guide button {
    display: none !important;
  }

  .builder-page--modern {
    background: #fff;
  }

  .builder-layout,
  .builder-summary {
    display: block;
    width: 100%;
  }

  .summary-card,
  .builder-center,
  .builder-hero {
    break-inside: avoid;
    margin-bottom: 12px;
    box-shadow: none;
  }
}
`;
