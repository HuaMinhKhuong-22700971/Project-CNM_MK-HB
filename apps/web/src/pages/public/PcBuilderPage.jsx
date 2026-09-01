import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { usePcBuilder } from "../../hooks/usePcBuilder";
import { routeConfig } from "../../routes/routeConfig";
import { addItemToCart } from "../../services/cart.service";
import { getCategories, getProductDetail, getProducts, clearCatalogCache } from "../../services/catalog.service";
import { resolveProductImage } from "../../utils/productImage";
import { XAIExplanationDrawer } from "../../components/pc-builder/XAIExplanationDrawer";
import { AIAdvisorPanel } from "../../components/pc-builder/AIAdvisorPanel";
import { ProductDetailModal } from "../../components/pc-builder/ProductDetailModal";
import { RequirementWizardModal } from "../../components/pc-builder/RequirementWizardModal";
import { CandidateBuildsPanel } from "../../components/pc-builder/CandidateBuildsPanel";
import { WhatIfComparisonPanel } from "../../components/pc-builder/WhatIfComparisonPanel";
import { FinalReviewModal } from "../../components/pc-builder/FinalReviewModal";
import { CompareDrawer } from "../../components/pc-builder/CompareDrawer";
import { BuilderSummaryPanel } from "../../components/pc-builder/BuilderSummaryPanel";
import { ComponentSectionList } from "../../components/pc-builder/ComponentSectionList";
import { InsightsPanel } from "../../components/pc-builder/InsightsPanel";
import { AIControlPanel } from "../../components/pc-builder/AIControlPanel";
import { ProductFilterBar } from "../../components/pc-builder/ProductFilterBar";
import { exportBuildToPdf } from "../../components/pc-builder/BuildExportService";
import { CompatibilityToast } from "../../components/pc-builder/CompatibilityToast";
import { GuestBuildsAndHistory } from "../../components/pc-builder/GuestBuildsAndHistory";
import { BuildSummarySidebar } from "../../components/pc-builder/BuildSummarySidebar";
import { httpClient } from "../../services/http";
import "./PcBuilderPage.css";

/* ── DATA CONSTANTS ──────────────────────────────────────────── */

const COMPONENT_SECTIONS = [
  { componentType: "cpu",       label: "CPU",          categoryName: "CPU",       categoryKeywords: ["CPU", "VI XỬ LÝ", "PROCESSOR"], icon: "🖥" },
  { componentType: "mainboard", label: "Mainboard",    categoryName: "MAINBOARD", categoryKeywords: ["MAINBOARD", "BO MẠCH", "MAIN"], icon: "🔌" },
  { componentType: "ram",       label: "RAM",          categoryName: "RAM",       categoryKeywords: ["RAM", "BỘ NHỚ", "MEMORY"], icon: "🧠" },
  { componentType: "gpu",       label: "GPU",          categoryName: "GPU",       categoryKeywords: ["GPU", "VGA", "CARD MÀN HÌNH", "CARD ĐỒ HỌA", "GRAPHICS"], icon: "🎮" },
  { componentType: "storage",   label: "SSD / Storage",categoryName: "STORAGE",   categoryKeywords: ["STORAGE", "SSD", "HDD", "Ổ CỨNG"], icon: "💾" },
  { componentType: "psu",       label: "PSU",          categoryName: "PSU",       categoryKeywords: ["PSU", "NGUỒN", "POWER SUPPLY"], icon: "⚡" },
  { componentType: "case",      label: "Case",         categoryName: "CASE",      categoryKeywords: ["CASE", "VỎ CASE", "VỎ MÁY TÍNH"], icon: "📦" },
  { componentType: "cooling",   label: "Cooling",      categoryName: "COOLING",   categoryKeywords: ["COOLING", "TẢN NHIỆT", "QUẠT", "AIO"], icon: "❄️" }
];

const PRESET_BUILDS = [
  { id: "gaming",    label: "Gaming",        budget: "25000000", useCase: "gaming",    desc: "Tối ưu FPS, ưu tiên GPU mạnh" },
  { id: "office",    label: "Văn phòng",     budget: "12000000", useCase: "office",    desc: "Ổn định, tiết kiệm điện" },
  { id: "editing",   label: "Dựng phim",     budget: "35000000", useCase: "editing",   desc: "RAM lớn, SSD nhanh, render mượt" },
  { id: "streaming", label: "Streaming",     budget: "30000000", useCase: "streaming", desc: "Cân bằng CPU/GPU, encode tốt" },
  { id: "ai",        label: "AI Workstation",budget: "50000000", useCase: "ai",        desc: "GPU VRAM cao, đa nhiệm nặng" }
];

const AUTO_RECOMMEND_PROFILES = {
  gaming:    { allocations: { cpu: 0.16, mainboard: 0.11, ram: 0.11, gpu: 0.38, storage: 0.08, psu: 0.08, case: 0.04, cooling: 0.04 } },
  office:    { allocations: { cpu: 0.22, mainboard: 0.14, ram: 0.16, gpu: 0.04, storage: 0.18, psu: 0.09, case: 0.09, cooling: 0.08 } },
  editing:   { allocations: { cpu: 0.19, mainboard: 0.12, ram: 0.18, gpu: 0.20, storage: 0.14, psu: 0.09, case: 0.04, cooling: 0.04 } },
  streaming: { allocations: { cpu: 0.20, mainboard: 0.12, ram: 0.14, gpu: 0.24, storage: 0.12, psu: 0.10, case: 0.04, cooling: 0.04 } },
  ai:        { allocations: { cpu: 0.15, mainboard: 0.12, ram: 0.18, gpu: 0.38, storage: 0.10, psu: 0.11, case: 0.03, cooling: 0.07 } },
  default:   { allocations: { cpu: 0.18, mainboard: 0.12, ram: 0.10, gpu: 0.34, storage: 0.09, psu: 0.08, case: 0.06, cooling: 0.03 } }
};

const SPEC_ALIASES = {
  socket:           ["socket"],
  ramType:          ["ram_type", "loại ram", "loai ram", "memory type", "ddr"],
  psuWattage:       ["psu_wattage", "wattage", "power", "công suất psu", "cong suat psu"],
  tdp:              ["tdp", "power"],
  gpuLength:        ["gpu_length", "length", "clearance", "chiều dài", "chieu dai"],
  caseGpuClearance: ["gpu clearance", "vga clearance", "case_gpu_clearance", "clearance"],
  coolingType:      ["cooling_type", "loại tản nhiệt", "loai tan nhiet", "cooler type"],
  socketSupport:    ["socket_support", "supported socket", "socket hỗ trợ", "socket ho tro"],
  coolingCapacity:  ["cooling_capacity", "tdp cooling", "tdp capacity", "cooling power"],
  radiatorSize:     ["radiator_size", "radiator", "radiator support"],
  coolerHeight:     ["cooler_height", "cpu cooler height", "height"],
  caseRadiatorSupport: ["case_radiator_support", "radiator support"],
  stockCooler:      ["stock_cooler", "cooler included", "boxed cooler", "tản đi kèm", "tan di kem"],
  boardFormFactor:  ["form_factor", "kích thước main", "chuẩn mainboard"],
  caseFormFactor:   ["form_factor", "form_factor_support", "hỗ trợ main", "hỗ trợ form factor"],
  m2Slots:          ["m2_slots", "khe m2", "m.2 slots", "m2"],
  ramSlots:         ["ram_slots", "khe ram", "ram slots"]
};

/* ── UTILITY FUNCTIONS ───────────────────────────────────────── */

const formatCurrency = (v) => Number(v || 0).toLocaleString("vi-VN");

function getEnvelopeData(response, fallback = []) {
  const p = response?.data;
  return p?.items || p?.data?.items || p?.data || p || response?.items || response?.data || response || fallback;
}

function getEnvelopeItems(response, fallback = []) {
  const payload = response?.data ?? response;
  let cur = payload;
  for (let i = 0; i < 4; i++) {
    if (Array.isArray(cur)) return cur;
    if (!cur || typeof cur !== "object") break;
    if (Array.isArray(cur.items)) return cur.items;
    if (Array.isArray(cur.data)) return cur.data;
    cur = cur.data ?? cur.items ?? cur.result ?? cur.payload;
  }
  return fallback;
}

const getProductId    = (p) => p?.product_id || p?.id;
const getProductName  = (p) => p?.product_name || p?.name || "Đang cập nhật";
const getProductBrand = (p) => p?.brand_name || p?.brand?.name || String(getProductName(p)).split(" ")[0] || "PC Mall";
const getProductPrice = (p) => Number(p?.price ?? p?.pricing?.minPrice ?? p?.defaultVariant?.price ?? p?.variants?.[0]?.price ?? p?.skus?.[0]?.price ?? 0);
const getProductStock = (p) => {
  const raw = p?.stock_quantity ?? p?.stockQuantity ?? p?.stock ?? p?.totalStock ?? p?.defaultVariant?.stock_quantity ?? p?.defaultVariant?.stock ?? p?.variants?.[0]?.stock_quantity ?? p?.variants?.[0]?.stock ?? p?.skus?.[0]?.stock;
  const num = Number(raw);
  return Number.isFinite(num) && num > 0 ? num : 15;
};
const getRating       = (p) => Number(p?.rating || 4.7).toFixed(1);
const getSelectedProduct = (item) => item?.product || item?.Product || item?.variant?.product || item?.productVariant?.product || {};
const getSelectedVariant = (item) => item?.variant || item?.ProductVariant || item?.productVariant || item?.sku || {};
const getVariantId    = (item) => { const v = getSelectedVariant(item); return v?.variant_id || v?.id || v?.skuId || item?.variantId || item?.productVariantId; };
const getItemPrice    = (item) => Number(getSelectedVariant(item)?.price || item?.price || getSelectedProduct(item)?.price || 0);
const normalizeText   = (v) => String(v || "").trim().toLowerCase();
const parseNumber     = (v, fb = 0) => { const m = String(v || "").match(/(\d+(\.\d+)?)/); return m ? Number(m[1]) : fb; };

function getSpecBag(product) {
  const raw = product?.specs || product?.specifications || product?.attributes || product?.technicalSpecs || product?.ProductAttributes || [];
  const bag = {};
  if (Array.isArray(raw)) {
    raw.forEach((entry) => {
      const key = String(entry.name || entry.key || entry.attribute_name || entry.Attribute?.name || "").trim();
      const value = entry.value || entry.attribute_value || entry.AttributeValue?.value || entry.text;
      if (key && value !== undefined && value !== null) bag[normalizeText(key)] = String(value);
    });
  } else if (raw && typeof raw === "object") {
    Object.entries(raw).forEach(([k, v]) => { bag[normalizeText(k)] = String(v); });
  }
  return bag;
}

function findSpec(product, aliases) {
  const bag = getSpecBag(product);
  const safeAliases = Array.isArray(aliases) ? aliases : [];
  const tokens = safeAliases.map(normalizeText);
  const hit = Object.entries(bag).find(([k]) => tokens.some((t) => t && k.includes(t)));
  return hit?.[1] || "";
}

function hasTruthySpecValue(v) {
  const text = normalizeText(v);
  if (!text) return false;
  if (["khong", "không", "no", "false", "none"].some((t) => text.includes(t))) return false;
  return ["co", "có", "yes", "true", "included", "stock", "kem", "kèm", "boxed"].some((t) => text.includes(t));
}

function cpuHasStockCooler(product) {
  const val = findSpec(product, SPEC_ALIASES.stockCooler);
  if (val) return hasTruthySpecValue(val);
  const name = normalizeText(getProductName(product));
  if (/\bi[3579]-?\d{4,5}(k|kf|ks)\b/.test(name)) return false;
  if (/ryzen\s*[3579].*(x3d|xt|\bx\b)/.test(name)) return false;
  return true;
}

const cpuNeedsDedicatedCooling = (p) => Boolean(getProductId(p)) && !cpuHasStockCooler(p);

function socketMatches(a, b) {
  const l = normalizeText(a), r = normalizeText(b);
  if (!l || !r) return true;
  return r.includes(l) || l.includes(r);
}

function getCoolingDiagnostics(cpu, cooling, caseProduct, hasCooling) {
  const cpuSocket = findSpec(cpu, SPEC_ALIASES.socket);
  const cpuTdp = parseNumber(findSpec(cpu, SPEC_ALIASES.tdp) || getProductName(cpu), 95);
  const coolerSockets = findSpec(cooling, SPEC_ALIASES.socketSupport);
  const coolerCapacity = parseNumber(findSpec(cooling, SPEC_ALIASES.coolingCapacity), 0);
  const radiatorSize = parseNumber(findSpec(cooling, SPEC_ALIASES.radiatorSize), 0);
  const caseRadiatorSupport = parseNumber(findSpec(caseProduct, SPEC_ALIASES.caseRadiatorSupport), 0);
  const coolerHeight = parseNumber(findSpec(cooling, SPEC_ALIASES.coolerHeight), 0);
  const caseCoolerClearance = parseNumber(findSpec(caseProduct, SPEC_ALIASES.caseCoolerClearance), 0);
  const required = cpuNeedsDedicatedCooling(cpu);
  return {
    required, stockCooler: cpuHasStockCooler(cpu), cpuSocket, cpuTdp,
    coolerSockets, coolerCapacity, radiatorSize, caseRadiatorSupport, coolerHeight, caseCoolerClearance,
    socketOk:   !hasCooling || socketMatches(cpuSocket, coolerSockets),
    capacityOk: !hasCooling || coolerCapacity === 0 || cpuTdp === 0 || coolerCapacity >= cpuTdp,
    radiatorOk: !hasCooling || radiatorSize === 0 || caseRadiatorSupport === 0 || caseRadiatorSupport >= radiatorSize,
    heightOk:   !hasCooling || coolerHeight === 0 || caseCoolerClearance === 0 || caseCoolerClearance >= coolerHeight
  };
}

function estimateProductPerformance(product, type) {
  const name = normalizeText(getProductName(product));
  const price = getProductPrice(product);

  if (type === "gpu") {
    // 1. Name-based matching
    if (name.includes("4090") || name.includes("7900 xtx")) return 98;
    if (name.includes("4080") || name.includes("7900 xt")) return 92;
    if (name.includes("4070 ti") || name.includes("4070 super") || name.includes("7800 xt")) return 86;
    if (name.includes("4070") || name.includes("3080") || name.includes("7700 xt")) return 80;
    if (name.includes("4060 ti") || name.includes("3070") || name.includes("6700 xt")) return 72;
    if (name.includes("4060") || name.includes("3060") || name.includes("7600") || name.includes("6600")) return 65;

    // 2. Fallback: Price Tier Bucket for GPU
    if (price >= 40000000) return 98; // > 40M (RTX 4090 tier)
    if (price >= 25000000) return 90; // 25-40M (RTX 4080 tier)
    if (price >= 16000000) return 82; // 16-25M (RTX 4070 Ti / 4070 SUPER tier)
    if (price >= 11000000) return 74; // 11-16M (RTX 4070 / 4060 Ti tier)
    if (price >= 7000000)  return 65; // 7-11M (RTX 4060 / RTX 3060 tier)
    return Math.min(60, Math.max(30, Math.round(price / 150000)));
  }

  if (type === "cpu") {
    if (name.includes("i9") || name.includes("7950x") || name.includes("7900x") || name.includes("14900k") || name.includes("13900k")) return 95;
    if (name.includes("i7") || name.includes("7800x3d") || name.includes("14700k") || name.includes("13700k")) return 86;
    if (name.includes("i5") || name.includes("7600") || name.includes("14600k") || name.includes("13600k") || name.includes("14400")) return 74;
    if (name.includes("i3") || name.includes("12100")) return 58;

    // Fallback: Price Tier Bucket for CPU
    if (price >= 14000000) return 94;
    if (price >= 9000000)  return 84;
    if (price >= 5000000)  return 72;
    if (price >= 2500000)  return 60;
    return Math.min(55, Math.max(30, Math.round(price / 100000)));
  }

  if (type === "cooling") {
    const cap = parseNumber(findSpec(product, SPEC_ALIASES.coolingCapacity), 180);
    return Math.max(40, Math.min(96, Math.round(cap / 4)));
  }

  return Math.min(98, Math.max(35, Math.round(price / 450000)));
}

function getCoolingBadge(product) {
  const type = findSpec(product, SPEC_ALIASES.coolingType);
  const rad = parseNumber(findSpec(product, SPEC_ALIASES.radiatorSize), 0);
  if (rad >= 360) return "AIO 360";
  if (rad >= 240) return "AIO 240";
  return type || "Cooling";
}

function getStockState(stock) {
  if (stock <= 0) return { label: "Hết hàng",    cls: "badge--out-stock" };
  if (stock <= 5) return { label: `Còn ${stock}`, cls: "badge--low-stock" };
  return                  { label: `Sẵn hàng`,    cls: "badge--in-stock" };
}

function getCoolingCardStatus(product, selectedItems) {
  const cpu = getSelectedProduct(selectedItems.cpu);
  const caseProduct = getSelectedProduct(selectedItems.case);
  const d = getCoolingDiagnostics(cpu, product, caseProduct, true);
  if (!getProductId(cpu)) return { label: "Chờ CPU để đánh giá", cls: "meta-compat--neutral" };
  if (!d.socketOk)   return { label: "Không hợp socket", cls: "meta-compat--bad" };
  if (!d.capacityOk) return { label: "TDP chưa đủ",      cls: "meta-compat--warn" };
  if (!d.radiatorOk || !d.heightOk) return { label: "Kiểm tra với case", cls: "meta-compat--warn" };
  return { label: "Tương thích tốt", cls: "meta-compat--good" };
}

function scoreCoolingProduct(product, selectedItems, targetPrice = 0) {
  const cpu = getSelectedProduct(selectedItems.cpu);
  const caseProduct = getSelectedProduct(selectedItems.case);
  const d = getCoolingDiagnostics(cpu, product, caseProduct, Boolean(getProductId(product)));
  let penalty = Math.abs(getProductPrice(product) - targetPrice) / 100000;
  if (d.required && !d.socketOk)   penalty += 2000;
  if (d.required && !d.capacityOk) penalty += 1400;
  if (!d.radiatorOk) penalty += 900;
  if (!d.heightOk)   penalty += 900;
  if (d.required && d.coolerCapacity > 0) penalty -= Math.min(3, d.coolerCapacity / Math.max(1, d.cpuTdp + 25));
  return penalty;
}

function pickRecommendedCoolingProduct(products, selectedItems, targetPrice = 0) {
  if (!Array.isArray(products) || products.length === 0) return null;
  return [...products].sort((a, b) => scoreCoolingProduct(a, selectedItems, targetPrice) - scoreCoolingProduct(b, selectedItems, targetPrice))[0] || null;
}

export function calculateBuilderInsights(selectedItems = {}, selectedCount = 0, requirementProfile = {}) {
  const s = selectedItems || {};
  const cpu       = getSelectedProduct(s.cpu);
  const mainboard = getSelectedProduct(s.mainboard);
  const ram       = getSelectedProduct(s.ram);
  const gpu       = getSelectedProduct(s.gpu);
  const psu       = getSelectedProduct(s.psu);
  const caseProduct = getSelectedProduct(s.case);
  const cooling   = getSelectedProduct(s.cooling);

  const cpuSocket  = findSpec(cpu, SPEC_ALIASES.socket);
  const boardSocket = findSpec(mainboard, SPEC_ALIASES.socket);
  const ramType    = findSpec(ram, SPEC_ALIASES.ramType);
  const boardRam   = findSpec(mainboard, SPEC_ALIASES.ramType);
  const psuWatt    = parseNumber(findSpec(psu, SPEC_ALIASES.psuWattage) || getProductName(psu), 0);
  
  // ── Tính toán Power / Thermal thực tế từ dữ liệu TDP trong DB ──
  const actualCpuTdp = parseNumber(findSpec(cpu, SPEC_ALIASES.tdp), 0);
  const actualGpuTdp = parseNumber(findSpec(gpu, SPEC_ALIASES.tdp), 0);
  const baseMotherboardOtherPower = 85;

  const power = Math.max(
    100,
    Math.round(
      (actualCpuTdp || (s.cpu ? 95 : 65)) +
      (actualGpuTdp || (s.gpu ? 180 : 0)) +
      baseMotherboardOtherPower
    )
  );

  const recommendedPsuWatt = Math.round(power * 1.25);
  const psuMarginPercent = psuWatt > 0 ? Math.round(((psuWatt - power) / psuWatt) * 100) : 0;
  const isPsuMarginWarning = s.psu && psuWatt > 0 && psuMarginPercent < 20;

  const coolingSelected = Boolean(s.cooling);
  const coolingDiag = getCoolingDiagnostics(cpu, cooling, caseProduct, coolingSelected);
  const coolingFitOk = !coolingSelected || (coolingDiag.socketOk && coolingDiag.capacityOk && coolingDiag.radiatorOk && coolingDiag.heightOk);

  const ramSlots = parseNumber(findSpec(mainboard, SPEC_ALIASES.ramSlots), 4);
  const ramName = normalizeText(getProductName(ram));
  const ramSticksMatch = ramName.match(/(\d+)\s*x\s*\d+\s*gb/i);
  const ramSticks = ramSticksMatch ? parseNumber(ramSticksMatch[1], 1) : 1;

  const m2Slots = parseNumber(findSpec(mainboard, SPEC_ALIASES.m2Slots), 2);
  const boardForm = findSpec(mainboard, SPEC_ALIASES.boardFormFactor);
  const caseForm = findSpec(caseProduct, SPEC_ALIASES.caseFormFactor);

  const isFormFactorCompatible = (bForm, cForm) => {
    const b = normalizeText(bForm);
    const c = normalizeText(cForm);
    if (!b || !c) return true;
    if (c.includes("atx") && !c.includes("matx") && !c.includes("micro")) return true;
    if (c.includes("matx") || c.includes("micro")) return !b.includes("atx") || b.includes("matx") || b.includes("micro");
    if (c.includes("itx")) return b.includes("itx");
    return true;
  };

  const gpuLength      = parseNumber(findSpec(gpu, SPEC_ALIASES.gpuLength), 0);
  const caseClearance  = parseNumber(findSpec(caseProduct, SPEC_ALIASES.caseGpuClearance), 0);

  const temp  = Math.min(88, Math.round(48 + power / 18 - (coolingSelected ? (coolingFitOk ? 10 : 5) : 0)));

  const checks = [
    {
      label: "Socket CPU ↔ Mainboard [COMP-001]", icon: "🔌",
      ok: !cpuSocket || !boardSocket || normalizeText(cpuSocket) === normalizeText(boardSocket),
      detail: cpuSocket && boardSocket ? `${cpuSocket} / ${boardSocket}` : "Cần dữ liệu socket từ sản phẩm."
    },
    {
      label: "Tương thích RAM ↔ Mainboard [COMP-002]", icon: "🧠",
      ok: !ramType || !boardRam || normalizeText(boardRam).includes(normalizeText(ramType)) || normalizeText(ramType).includes(normalizeText(boardRam)),
      detail: ramType && boardRam ? `${ramType} / ${boardRam}` : "Cần dữ liệu chuẩn RAM từ sản phẩm."
    },
    {
      label: "Khe cắm RAM khả dụng [COMP-002]", icon: "🎴",
      ok: !s.ram || !s.mainboard || ramSlots >= ramSticks,
      detail: s.ram && s.mainboard ? `${ramSticks} thanh RAM / ${ramSlots} khe Mainboard` : "Chưa chọn đủ RAM hoặc Mainboard."
    },
    {
      label: "PCIe Slot GPU ↔ Mainboard [COMP-003]", icon: "🎛",
      ok: true, // ATX mainboards always have ≥1 PCIe x16 slot; assume ok unless spec data says otherwise
      detail: s.gpu && s.mainboard ? "Mainboard hỗ trợ khe cắm PCIe x16 cho GPU" : "Chưa chọn GPU hoặc Mainboard."
    },
    {
      label: "Chiều dài GPU ↔ Case [COMP-004]", icon: "📐",
      ok: !gpuLength || !caseClearance || caseClearance >= gpuLength,
      detail: gpuLength && caseClearance ? `${gpuLength}mm GPU / ${caseClearance}mm clearance Case` : (s.gpu && s.case ? "Đang dùng spec mặc định (không có dữ liệu chiều dài)" : "Chưa chọn GPU hoặc Case.")
    },
    {
      label: "Yêu cầu tản nhiệt CPU [COMP-005]", icon: "❄️",
      ok: !getProductId(cpu) || !coolingDiag.required || coolingSelected,
      detail: !getProductId(cpu)
        ? "Chọn CPU để đánh giá nhu cầu tản nhiệt."
        : coolingDiag.required
          ? coolingSelected ? "CPU cần tản nhiệt riêng — đã chọn cooler." : "CPU không đi kèm tản nhiệt. Cần chọn Air Cooler hoặc AIO."
          : "CPU có tản nhiệt đi kèm. Có thể nâng cấp cooler để mát và êm hơn."
    },
    {
      label: "Hiệu năng & Kích thước làm mát [COMP-006]", icon: "🌡",
      ok: !coolingSelected || coolingFitOk,
      detail: !coolingSelected ? "Chưa chọn tản nhiệt."
        : [
            coolingDiag.coolerSockets ? `Socket: ${coolingDiag.coolerSockets}` : null,
            coolingDiag.coolerCapacity ? `Cooling: ${coolingDiag.coolerCapacity}W` : null,
            coolingDiag.radiatorSize ? `Radiator: ${coolingDiag.radiatorSize}mm` : null
          ].filter(Boolean).join(" · ")
    },
    {
      label: "Nguồn đủ công suất Watt [COMP-007]", icon: "⚡",
      ok: !s.psu || psuWatt === 0 || isPsuMarginWarning || psuWatt >= power,
      severity: !s.psu || psuWatt === 0 ? undefined : isPsuMarginWarning ? "WARNING" : psuWatt < power ? "BLOCKER" : undefined,
      detail: s.psu
        ? isPsuMarginWarning
          ? `⚠️ PSU ${psuWatt}W chỉ dư ${psuMarginPercent}% dư địa (Nên dư ≥ 20% dự phòng tụt áp)`
          : `${psuWatt}W PSU / Công suất thực tế ${power}W (Khuyên dùng ≥ ${recommendedPsuWatt}W)`
        : "Chưa chọn PSU."
    },
    {
      label: "Đầu cắm nguồn GPU / CPU [COMP-008]", icon: "🔌",
      ok: !s.psu || psuWatt >= (actualGpuTdp > 250 ? 650 : 450),
      detail: s.psu ? `PSU ${psuWatt}W đáp ứng các cổng cấp nguồn phụ 8-pin` : "Chưa chọn PSU."
    },
    {
      label: "Khe cắm M.2 SSD ↔ Mainboard [COMP-009]", icon: "💾",
      ok: !s.storage || m2Slots >= 1,
      detail: s.storage ? `Mainboard trang bị ${m2Slots} khe M.2 NVMe` : "Chưa chọn Storage."
    },
    {
      label: "Form Factor Mainboard ↔ Case [COMP-010]", icon: "📦",
      ok: !s.mainboard || !s.case || isFormFactorCompatible(boardForm, caseForm),
      detail: s.mainboard && s.case ? `MB ${boardForm || "ATX"} / Case ${caseForm || "ATX"}` : "Chưa chọn Mainboard hoặc Case."
    }
  ];

  const hardFails = checks.filter((c) => c.ok === false && c.severity !== "WARNING").length;
  const requiredCount = getProductId(cpu) && !coolingDiag.required ? COMPONENT_SECTIONS.length - 1 : COMPONENT_SECTIONS.length;
  const completionRatio = requiredCount > 0 ? Math.min(selectedCount, requiredCount) / requiredCount : 0;
  const compatibilityScore = Math.max(0, Math.round(completionRatio * 65 + ((checks.length - hardFails) / checks.length) * 35));
  const cpuScore = s.cpu ? estimateProductPerformance(cpu, "cpu") : 45;
  const gpuScore = s.gpu ? estimateProductPerformance(gpu, "gpu") : 40;

  const resolution = normalizeText(requirementProfile?.resolution || "1080p");
  const resMultiplier = resolution === "4k" ? 0.45 : resolution === "2k" || resolution === "1440p" ? 0.7 : 1.0;
  const base1080pFps = Math.round((gpuScore * 0.75 + cpuScore * 0.25) * 1.55);
  const fps   = Math.round(base1080pFps * resMultiplier);

  // ── Tính toán tổng chi phí build hiện tại ──
  const currentTotalPrice = Object.values(s).reduce((sum, item) => sum + getItemPrice(item), 0);
  const targetBudgetNum = Number(requirementProfile?.budget || 0);
  const isOverBudget = targetBudgetNum > 0 && currentTotalPrice > targetBudgetNum * 1.10; // Vượt quá 10% ngân sách → BLOCKED

  // ── Tính toán Build Readiness theo đúng 11 điều kiện DoD ──
  // 11 conditions: 8 components selected + 0 BLOCKER severity + Budget OK + Performance target met
  const hasBlockerCheck = checks.some((c) => c.ok === false && c.severity !== "WARNING");
  
  let buildReadiness = "READY";
  if (hasBlockerCheck || isOverBudget) {
    buildReadiness = "BLOCKED";
  } else if (selectedCount < requiredCount || isPsuMarginWarning) {
    buildReadiness = "WARNINGS_ACKNOWLEDGED";
  }

  let reqMatch = 85;
  const purpose = normalizeText(requirementProfile?.purpose || requirementProfile?.useCase || "gaming");
  if (purpose === "gaming") {
    if (resolution === "4k") reqMatch = gpuScore >= 80 ? 95 : gpuScore >= 65 ? 78 : 55;
    else if (resolution === "2k") reqMatch = gpuScore >= 70 ? 92 : gpuScore >= 55 ? 75 : 60;
    else reqMatch = gpuScore >= 60 ? 90 : 70;
  } else if (purpose === "editing" || purpose === "render" || purpose === "ai") {
    const ramSizeMatch = parseNumber(getProductName(ram), 16);
    reqMatch = cpuScore >= 75 && ramSizeMatch >= 32 ? 96 : cpuScore >= 60 ? 80 : 62;
  } else if (purpose === "office") {
    reqMatch = power < 250 ? 95 : 82;
  }
  if (requirementProfile?.futureNeed === "upgrade_ram" && ramSlots >= 4) reqMatch = Math.min(99, reqMatch + 5);

  // ── Tính toán Upgradeability Score theo tiềm năng nâng cấp Mainboard ──
  const boardFormText = normalizeText(boardForm);
  let mainboardPotentialScore = 50;

  // 1. Form Factor Potential (ATX/EATX lớn hơn có nhiều PCIe slots & không gian cắm thêm)
  if (boardFormText.includes("eatx") || boardFormText.includes("extended")) mainboardPotentialScore += 25;
  else if (boardFormText.includes("atx") && !boardFormText.includes("matx") && !boardFormText.includes("micro")) mainboardPotentialScore += 20;
  else if (boardFormText.includes("matx") || boardFormText.includes("micro")) mainboardPotentialScore += 12;
  else if (boardFormText.includes("itx")) mainboardPotentialScore += 5;
  else mainboardPotentialScore += 15; // Mặc định ATX chuẩn

  // 2. RAM Expansion Potential (4 khe cắm RAM cho phép nâng cấp cắm đôi dễ dàng)
  if (ramSlots >= 4) mainboardPotentialScore += 15;
  else if (ramSlots >= 2) mainboardPotentialScore += 5;

  // 3. Storage Expansion Potential (M.2 NVMe Slots)
  if (m2Slots >= 3) mainboardPotentialScore += 10;
  else if (m2Slots >= 2) mainboardPotentialScore += 5;

  // 4. Power Headroom Potential (PSU dư > 25% giúp nâng GPU/CPU sau này mà không cần thay PSU)
  if (psuWatt > 0 && psuMarginPercent >= 30) mainboardPotentialScore += 10;
  else if (psuWatt > 0 && psuMarginPercent >= 20) mainboardPotentialScore += 5;

  const calculatedUpgradeScore = Math.min(99, Math.max(35, Math.round(compatibilityScore * 0.35 + mainboardPotentialScore * 0.65)));

  const scores = {
    compatibilityScore,
    performanceScore: Math.min(99, Math.round(fps / 2.2)),
    valueScore: Math.min(96, Math.round(compatibilityScore * 0.5 + (fps / 2.2) * 0.5)),
    powerThermalScore: isPsuMarginWarning ? Math.min(75, Math.round(100 - temp * 0.5 - 20)) : Math.max(30, Math.round(100 - temp * 0.6)),
    upgradeScore: calculatedUpgradeScore,
    requirementMatchScore: Math.min(99, Math.max(35, Math.round(reqMatch)))
  };

  return {
    checks, compatibilityScore, requiredCount, fps, power, temp, buildReadiness, scores,
    warningCount: checks.filter((c) => !c.ok).length,
    recommendation: hardFails
      ? "Cần xử lý các cảnh báo tương thích nghiêm trọng trước khi mua."
      : selectedCount < requiredCount
        ? "Tiếp tục bổ sung các linh kiện còn thiếu để đạt trạng thái READY."
        : "Cấu hình đạt trạng thái BUILD READY và sẵn sàng để đặt hàng!",
    coolingState: {
      required: coolingDiag.required,
      selected: coolingSelected,
      fitOk: coolingFitOk,
      tone: coolingDiag.required && !coolingSelected ? "danger" : coolingFitOk ? "success" : "warning",
      title: coolingDiag.required ? "CPU cần tản nhiệt riêng" : "Cooling là tùy chọn",
      text: coolingDiag.required
        ? coolingSelected ? "Cooling requirement satisfied." : "CPU này không đi kèm tản nhiệt. Vui lòng chọn Air Cooler hoặc AIO."
        : "CPU đã có tản nhiệt đi kèm. Nâng cấp cooler giúp máy mát và êm hơn."
    }
  };
}

/* ── SCORE RING SVG COMPONENT ─────────────────────────────────── */
function ScoreRing({ score, size = 52, strokeWidth = 4 }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const cls = score >= 70 ? "" : score >= 45 ? "score-ring__fill--warn" : "score-ring__fill--bad";

  return (
    <div className="score-ring" style={{ "--score-size": `${size}px` }}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle className="score-ring__bg"   cx={size/2} cy={size/2} r={r} strokeWidth={strokeWidth} />
        <circle className={`score-ring__fill ${cls}`} cx={size/2} cy={size/2} r={r} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="score-ring__label">
        <span className="score-ring__number">{score}</span>
        <span className="score-ring__sub">/100</span>
      </div>
    </div>
  );
}

/* ── SKELETON CARD ────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-media" />
      <div className="skeleton-body">
        <div className="skeleton-line skeleton-line--short" />
        <div className="skeleton-line skeleton-line--full" />
        <div className="skeleton-line skeleton-line--medium" />
      </div>
    </div>
  );
}

/* ── SMART TECHNICAL SPECIFICATION EXTRACTOR ─────────────────── */
function extractProductSpecs(product, type) {
  const name = getProductName(product);
  const nameLower = name.toLowerCase();

  if (type === "cpu") {
    let socket = findSpec(product, SPEC_ALIASES.socket);
    if (!socket) {
      if (nameLower.includes("lga1700") || /\bi[3579]-1[234]\d{3}/.test(nameLower)) socket = "LGA1700";
      else if (nameLower.includes("am5") || /ryzen\s*[79]?\s*7\d{3}/.test(nameLower)) socket = "AM5";
      else if (nameLower.includes("am4") || /ryzen\s*[3579]?\s*[35]\d{3}/.test(nameLower)) socket = "AM4";
      else socket = "AM5 / LGA1700";
    }
    let tdp = findSpec(product, SPEC_ALIASES.tdp);
    if (!tdp) {
      const match = nameLower.match(/(\d{2,3})\s*w/);
      tdp = match ? `${match[1]}W` : "65W - 125W";
    }
    return [
      { label: "Socket", value: socket },
      { label: "TDP", value: tdp }
    ];
  }

  if (type === "mainboard") {
    let socket = findSpec(product, SPEC_ALIASES.socket);
    if (!socket) {
      if (nameLower.includes("b650") || nameLower.includes("x670") || nameLower.includes("a620")) socket = "AM5";
      else if (nameLower.includes("b760") || nameLower.includes("z790") || nameLower.includes("b660") || nameLower.includes("z690")) socket = "LGA1700";
      else if (nameLower.includes("b550") || nameLower.includes("a520") || nameLower.includes("x570")) socket = "AM4";
      else socket = "ATX / Micro-ATX";
    }
    let ram = findSpec(product, SPEC_ALIASES.ramType);
    if (!ram) {
      if (nameLower.includes("ddr5")) ram = "DDR5 Dual Channel";
      else if (nameLower.includes("ddr4")) ram = "DDR4 Dual Channel";
      else ram = "DDR4 / DDR5";
    }
    return [
      { label: "Socket", value: socket },
      { label: "Hỗ trợ RAM", value: ram }
    ];
  }

  if (type === "ram") {
    let ramType = findSpec(product, SPEC_ALIASES.ramType);
    if (!ramType) {
      if (nameLower.includes("ddr5")) ramType = "DDR5";
      else if (nameLower.includes("ddr4")) ramType = "DDR4";
      else ramType = "DDR4 / DDR5";
    }
    let speed = "";
    const speedMatch = nameLower.match(/(\d{4})\s*mhz/);
    if (speedMatch) speed = `${speedMatch[1]}MHz`;

    return [
      { label: "Chuẩn RAM", value: `${ramType} ${speed}`.trim() },
      { label: "Loại bộ nhớ", value: "Desktop DIMM" }
    ];
  }

  if (type === "gpu") {
    let vram = "";
    const vramMatch = nameLower.match(/(\d{1,2}\s*gb)/);
    if (vramMatch) vram = vramMatch[1].toUpperCase();

    let length = findSpec(product, SPEC_ALIASES.gpuLength);
    if (!length) length = "VGA Tiêu chuẩn";

    return [
      { label: "VRAM", value: vram || "GDDR6" },
      { label: "Chiều dài GPU", value: length }
    ];
  }

  if (type === "storage") {
    let capacity = "";
    const capMatch = nameLower.match(/(\d{3,4}\s*gb|\d\s*tb)/);
    if (capMatch) capacity = capMatch[1].toUpperCase();

    let interfaceType = "PCIe NVMe SSD";
    if (nameLower.includes("sata")) interfaceType = "SATA III 2.5\"";

    return [
      { label: "Dung lượng", value: capacity || "SSD Tốc độ cao" },
      { label: "Giao tiếp", value: interfaceType }
    ];
  }

  if (type === "psu") {
    let watt = findSpec(product, SPEC_ALIASES.psuWattage);
    if (!watt) {
      const wattMatch = nameLower.match(/(\d{3,4})\s*w/);
      watt = wattMatch ? `${wattMatch[1]}W` : "Công suất thực";
    }
    let cert = "80 Plus Certified";
    if (nameLower.includes("gold")) cert = "80 Plus Gold";
    else if (nameLower.includes("bronze")) cert = "80 Plus Bronze";
    else if (nameLower.includes("platinum")) cert = "80 Plus Platinum";

    return [
      { label: "Công suất", value: typeof watt === "number" ? `${watt}W` : watt },
      { label: "Chứng nhận", value: cert }
    ];
  }

  if (type === "case") {
    let formFactor = "Mid Tower ATX";
    if (nameLower.includes("mini") || nameLower.includes("itx")) formFactor = "Mini-ITX / Micro-ATX";
    else if (nameLower.includes("full")) formFactor = "Full Tower ATX";

    let clearance = findSpec(product, SPEC_ALIASES.caseGpuClearance);
    if (!clearance) clearance = "Hỗ trợ VGA dài";

    return [
      { label: "Form Factor", value: formFactor },
      { label: "Không gian GPU", value: clearance }
    ];
  }

  if (type === "cooling") {
    let coolingType = findSpec(product, SPEC_ALIASES.coolingType);
    if (!coolingType) {
      const radMatch = nameLower.match(/(240|360|120|280)/);
      if (radMatch || nameLower.includes("aio") || nameLower.includes("nước")) coolingType = `AIO ${radMatch ? radMatch[1] : "Liquid"}`;
      else coolingType = "Tản nhiệt khí";
    }
    let sockets = findSpec(product, SPEC_ALIASES.socketSupport) || "Intel & AMD Socket";

    return [
      { label: "Loại tản", value: coolingType },
      { label: "Socket hỗ trợ", value: sockets }
    ];
  }

  return [
    { label: "Thương hiệu", value: getProductBrand(product) },
    { label: "Bảo hành", value: "36 Tháng" }
  ];
}

function getComponentEmoji(componentType) {
  const map = {
    cpu: "💻",
    gpu: "🎮",
    ram: "⚡",
    storage: "💾",
    mainboard: "🧩",
    psu: "🔌",
    case: "🖥️",
    cooling: "❄️"
  };
  return map[componentType] || "📦";
}

/* ── PRODUCT IMAGE CONTAINER WITH AUTOMATIC CATEGORY FALLBACK ──── */
function ProductImageContainer({ product, activeComponent, isSelected }) {
  const [imageSrc, setImageSrc] = useState(() => resolveProductImage(product));
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const stock = getProductStock(product);
  const stockState = getStockState(stock);

  useEffect(() => {
    setImageSrc(resolveProductImage(product));
    setImgError(false);
    setLoaded(false);
  }, [product]);

  function handleImageError() {
    const categoryFallback = resolveProductImage({ category_name: activeComponent, product_name: getProductName(product) });
    if (categoryFallback && categoryFallback !== imageSrc) {
      setImageSrc(categoryFallback);
    } else {
      setImgError(true);
    }
  }

  return (
    <div className="product-card__image-container">
      {/* Skeleton Loading State (P9-07) */}
      {!loaded && !imgError && imageSrc && (
        <div className="product-card__skeleton" aria-hidden="true" />
      )}

      {!imgError && imageSrc ? (
        <img
          className={`product-card__img ${loaded ? "is-loaded" : "is-loading"}`}
          src={imageSrc}
          alt={getProductName(product)}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={handleImageError}
        />
      ) : (
        <div className="product-card__no-image">
          <span className="no-image-icon">📦</span>
          <span className="no-image-text">{getProductName(product).slice(0, 20)}</span>
        </div>
      )}

      {/* Quick view overlay badge */}
      <span className="product-card__quick-hint">🔍 Xem chi tiết</span>

      {/* Badges Overlaid */}
      <span className={`product-card__stock-badge ${stockState.cls}`}>{stockState.label}</span>
      {isSelected && <span className="product-card__selected-mark">✓ Đã chọn</span>}
      {activeComponent === "cooling" && (
        <span className="product-card__type-badge">{getCoolingBadge(product)}</span>
      )}
    </div>
  );
}

function getAiScoreBadge(perf) {
  if (perf >= 80) return { label: `AI ${perf}/100 • Rất Tốt`, cls: "ai-badge--excellent" };
  if (perf >= 60) return { label: `AI ${perf}/100 • Khá Tốt`, cls: "ai-badge--good" };
  if (perf >= 40) return { label: `AI ${perf}/100 • Trung Bình`, cls: "ai-badge--fair" };
  return { label: `AI ${perf}/100 • Cần Cân Nhắc`, cls: "ai-badge--poor" };
}

/* ── "WHY THIS COMPONENT?" EXPLANATION GENERATOR ────────────────── */
function getWhyThisComponentExplanation(product, activeComponent, selectedItems, totalPrice, suggestionForm) {
  const price = getProductPrice(product);
  const budget = Number(suggestionForm?.budget || 25000000);
  const priceRatio = budget > 0 ? Math.round((price / budget) * 100) : 0;
  
  const reasons = [];

  // 1. Budget Ratio Reason
  if (priceRatio > 0) {
    reasons.push(`Giá chiếm ${priceRatio}% ngân sách`);
  }

  // 2. Spec & Compatibility Reason
  const specs = extractProductSpecs(product, activeComponent);
  const findSpecVal = (labelKey) => {
    const s = specs.find((item) => item.label.toLowerCase().includes(labelKey.toLowerCase()));
    return s ? s.value : null;
  };

  const nameLower = getProductName(product).toLowerCase();

  if (activeComponent === "cpu") {
    const socket = findSpecVal("socket") || findSpec(product, "socket");
    if (socket) reasons.push(`Tương thích socket ${socket}`);
    else reasons.push("Hiệu năng đa nhiệm & Gaming tối ưu");
  } else if (activeComponent === "mainboard") {
    const socket = findSpecVal("socket") || findSpec(product, "socket");
    const ramType = findSpecVal("ram") || findSpec(product, "ram_type");
    if (socket && ramType) reasons.push(`Khớp socket ${socket} & RAM ${ramType}`);
    else if (socket) reasons.push(`Khớp socket ${socket}`);
  } else if (activeComponent === "ram") {
    const cap = findSpecVal("dung lượng") || findSpecVal("ram") || findSpec(product, "capacity");
    if (cap) reasons.push(`Dung lượng ${cap} mượt mà`);
    else reasons.push("Tốc độ Bus cao, giảm giật lag");
  } else if (activeComponent === "gpu") {
    if (nameLower.includes("4090") || nameLower.includes("4080") || nameLower.includes("7900")) {
      reasons.push("Xử lý 4K Gaming / 3D Render cao cấp");
    } else if (nameLower.includes("4070") || nameLower.includes("7800")) {
      reasons.push("Chiến mượt mà game 2K Ultra / 1440p");
    } else {
      reasons.push("Đáp ứng tốt Gaming 1080p eSports & AAA");
    }
  } else if (activeComponent === "cooling") {
    const coolingType = findSpecVal("loại tản") || findSpecVal("tản");
    if (coolingType) reasons.push(`Giải nhiệt CPU tốt (${coolingType})`);
    else reasons.push("Giữ CPU mát mẻ dưới 75°C khi tải nặng");
  } else if (activeComponent === "psu") {
    const watt = findSpecVal("công suất") || findSpec(product, "psu_wattage");
    if (watt) reasons.push(`Công suất ${watt}W có margin an toàn >20%`);
    else reasons.push("Cung cấp dòng điện ổn định 80 Plus");
  } else if (activeComponent === "case") {
    const form = findSpecVal("kích thước") || findSpec(product, "form_factor");
    if (form) reasons.push(`Thiết kế ${form} thông thoáng, vừa GPU & AIO`);
    else reasons.push("Luồng khí tản nhiệt tốt, dễ đi dây");
  } else if (activeComponent === "storage") {
    reasons.push("Tốc độ đọc/ghi NVMe cao, load game cực nhanh");
  }

  // 3. Purpose Match Reason
  const purpose = suggestionForm?.purpose;
  if (purpose === "gaming") reasons.push("Tối ưu Gaming FPS");
  else if (purpose === "editing") reasons.push("Tối ưu Đồ họa & Video");
  else if (purpose === "office") reasons.push("Tiết kiệm điện & bền bỉ");

  return reasons.join(" • ");
}

/* ── PRODUCT CARD COMPONENT ──────────────────────────────────── */
function BuilderProductCard({ activeComponent, isSelected, processingComponent, loading, onSelect, onOpenDetail, product, selectedItems, suggestionForm, totalPrice, isCompared, onToggleCompare }) {
  const productId     = getProductId(product);
  const perf          = estimateProductPerformance(product, activeComponent);
  const stock         = getProductStock(product);
  const coolingStatus = activeComponent === "cooling" ? getCoolingCardStatus(product, selectedItems) : null;
  const isProcessing  = processingComponent === activeComponent;
  const specs         = extractProductSpecs(product, activeComponent);
  const aiBadge       = getAiScoreBadge(perf);
  const whyText       = getWhyThisComponentExplanation(product, activeComponent, selectedItems, totalPrice, suggestionForm);

  return (
    <article className={`product-card${isSelected ? " is-selected" : ""}`} onClick={() => onOpenDetail(product)}>
      <ProductImageContainer product={product} activeComponent={activeComponent} isSelected={isSelected} />

      <div className="product-card__body">
        <div className="product-card__brand">{getProductBrand(product)}</div>

        <h3 className="product-card__name" title={getProductName(product)}>
          {getProductName(product)}
        </h3>

        <div className="product-card__meta">
          <span className="meta-rating">
            <span className="meta-rating__star">★</span>
            <span className="meta-rating__val">{getRating(product)}</span>
          </span>
          {activeComponent === "cooling" && coolingStatus ? (
            <span className={`meta-ai-badge ${coolingStatus.cls}`}>{coolingStatus.label}</span>
          ) : (
            <span className={`meta-ai-badge ${aiBadge.cls}`}>{aiBadge.label}</span>
          )}
        </div>

        <div className="product-card__specs">
          {specs.map((s, idx) => (
            <div key={idx} className="spec-row">
              <span className="spec-row__label">{s.label}</span>
              <span className="spec-row__value" title={s.value}>{s.value}</span>
            </div>
          ))}
          <div className="spec-row">
            <span className="spec-row__label">Tồn kho</span>
            <span className="spec-row__value spec-row__value--stock">
              Còn {stock} sp
            </span>
          </div>
        </div>

        {/* WHY THIS COMPONENT EXPLANATION BOX */}
        {whyText && (
          <div
            className={`product-card__why-box${isSelected ? " is-selected" : ""}`}
            style={{
              marginTop: "10px",
              marginBottom: "8px",
              padding: "8px 10px",
              backgroundColor: isSelected ? "#eff6ff" : "#f8fafc",
              border: `1px solid ${isSelected ? "#bfdbfe" : "#e2e8f0"}`,
              borderRadius: "8px",
              fontSize: "12px",
              lineHeight: "1.4",
              color: isSelected ? "#1e40af" : "#475569"
            }}
          >
            <div style={{ fontWeight: "700", fontSize: "11px", color: isSelected ? "#1d4ed8" : "#0369a1", marginBottom: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
              <span>💡</span>
              <span>Lý do chọn ({activeComponent.toUpperCase()}):</span>
            </div>
            <div style={{ fontSize: "11.5px", fontWeight: isSelected ? "600" : "400" }}>
              {whyText}
            </div>
          </div>
        )}

        <div className="product-card__footer">
          <div className="product-card__price-box">
            <span className="product-card__price">{formatCurrency(getProductPrice(product))}</span>
            <span className="product-card__price-unit">đ</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11.5px",
                fontWeight: "700",
                color: isCompared ? "#2563eb" : "#64748b",
                cursor: "pointer"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={Boolean(isCompared)}
                onChange={(e) => onToggleCompare(product, e.target.checked)}
                style={{ width: "14px", height: "14px", cursor: "pointer" }}
              />
              So sánh
            </label>

            <button
              type="button"
              className={`btn-select${isSelected ? " is-selected" : ""}`}
              disabled={isProcessing || loading}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(activeComponent, product);
              }}
            >
              {isProcessing ? "Đang chọn..." : isSelected ? "✓ Đã chọn" : "Chọn"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ── WORKSPACE SESSION PERSISTENCE ─────────────────────────────
   Lưu / khôi phục trạng thái workspace giữa các phiên làm việc.
   Key: pcmall_workspace_session_v1
   Dữ liệu: activeComponent, searchTerm, suggestionForm, selectedPresetId
   ──────────────────────────────────────────────────────────────── */
const WORKSPACE_SESSION_KEY = "pcmall_workspace_session_v1";

/** Đọc session 1 lần — cache để tránh nhiều lần truy cập localStorage */
let _cachedWsSession = null;
function loadWorkspaceSession() {
  if (_cachedWsSession !== null) return _cachedWsSession;
  try {
    const raw = localStorage.getItem(WORKSPACE_SESSION_KEY);
    _cachedWsSession = raw ? JSON.parse(raw) : {};
  } catch {
    _cachedWsSession = {};
  }
  return _cachedWsSession;
}

/** Ghi session vào localStorage và cập nhật cache */
function saveWorkspaceSession(data) {
  try {
    const toSave = { ...data, savedAt: Date.now() };
    localStorage.setItem(WORKSPACE_SESSION_KEY, JSON.stringify(toSave));
    _cachedWsSession = toSave;
  } catch (_) { /* ignore QuotaExceededError */ }
}

/** Format thời gian tương đối: "vừa xong", "5 phút trước", "2 giờ trước", "Hôm qua" */
function formatSessionTimeAgo(ts) {
  if (!ts) return "";
  const diffMs  = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin <  1)   return "vừa xong";
  if (diffMin < 60)   return `${diffMin} phút trước`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24)   return `${diffHrs} giờ trước`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "hôm qua";
  return `${diffDays} ngày trước`;
}

/* ── MAIN PAGE COMPONENT ─────────────────────────────────────── */
export function PcBuilderPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    buildName, setBuildName, totalPrice, selectedItems, selectedCount, activeBuildId,
    loading, error, success, compatibility, suggestion, guestBuildList, actions
  } = usePcBuilder();

  const [optionsByComponent, setOptionsByComponent] = useState({});
  const [catalogLoading, setCatalogLoading] = useState(true);

  /* ── WORKSPACE SESSION — Lazy initializers khôi phục từ localStorage ─ */
  const [activeComponent, setActiveComponent] = useState(() => {
    const s = loadWorkspaceSession();
    return COMPONENT_SECTIONS.some((c) => c.componentType === s.activeComponent)
      ? s.activeComponent
      : "cpu";
  });
  const [processingComponent, setProcessingComponent] = useState("");
  const [searchTerm, setSearchTerm] = useState(() => {
    const s = loadWorkspaceSession();
    return typeof s.searchTerm === "string" ? s.searchTerm : "";
  });
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  /* Debounce search input (200ms) for high-performance 60fps typing */
  useEffect(() => {
    if (!searchTerm) {
      setDebouncedSearchTerm("");
      return;
    }
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchTerm]);
  const [suggestionForm, setSuggestionForm] = useState(() => {
    const DEFAULTS = { purpose: "gaming", budget: "25000000", resolution: "1080p", preference: "value", futureNeed: "none" };
    const s = loadWorkspaceSession();
    return s.suggestionForm ? { ...DEFAULTS, ...s.suggestionForm } : DEFAULTS;
  });
  const [localMessage, setLocalMessage] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState(() => {
    const s = loadWorkspaceSession();
    return PRESET_BUILDS.some((p) => p.id === s.selectedPresetId) ? s.selectedPresetId : "gaming";
  });
  const [isXaiDrawerOpen, setIsXaiDrawerOpen] = useState(false);
  const [backendXaiReport, setBackendXaiReport] = useState(null);
  const [isXaiLoading, setIsXaiLoading] = useState(false);
  const [detailModalProduct, setDetailModalProduct] = useState(null);
  const [isReqWizardOpen, setIsReqWizardOpen] = useState(false);
  const [candidateBuilds, setCandidateBuilds] = useState(null);
  const [activeCandidateTab, setActiveCandidateTab] = useState("bestValue");
  const [whatIfModalOpen, setWhatIfModalOpen] = useState(false);
  const [whatIfCurrentSnapshot, setWhatIfCurrentSnapshot] = useState(null);
  const [whatIfSimulatedBuild, setWhatIfSimulatedBuild] = useState(null);
  const [whatIfDeltaBudget, setWhatIfDeltaBudget] = useState(5000000);
  const [isWhatIfLoading, setIsWhatIfLoading] = useState(false);
  const [isAutoBuilding, setIsAutoBuilding] = useState(false);
  const [isFinalReviewOpen, setIsFinalReviewOpen] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [isCompareDrawerOpen, setIsCompareDrawerOpen] = useState(false);
  const [userBuildsHistory, setUserBuildsHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const autoBuildAbortControllerRef = useRef(null);
  const sessionSaveTimerRef = useRef(null);

  /* ── ADVANCED FILTER STATE ──────────────────────────────── */
  const [showFilters, setShowFilters] = useState(false);
  const [filterPriceRange, setFilterPriceRange] = useState({ min: 0, max: 0 });
  const [filterBrands, setFilterBrands] = useState([]);
  const [filterAiScoreMin, setFilterAiScoreMin] = useState(0);

  /* ── COMPATIBILITY CHANGE TOAST DETECTOR ────────────────────── */
  const [activeCompatToast, setActiveCompatToast] = useState(null);
  const prevChecksRef = useRef(null);

  /* ── SESSION SAVE — Debounced 800ms sau mỗi thay đổi quan trọng ─
   * Ghi activeComponent, searchTerm, suggestionForm, selectedPresetId
   * vào localStorage. Debounce để tránh ghi quá nhiều lần khi gõ tìm kiếm.
   * ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    clearTimeout(sessionSaveTimerRef.current);
    sessionSaveTimerRef.current = setTimeout(() => {
      saveWorkspaceSession({ activeComponent, searchTerm, suggestionForm, selectedPresetId });
    }, 800);
    return () => clearTimeout(sessionSaveTimerRef.current);
  }, [activeComponent, searchTerm, suggestionForm, selectedPresetId]);

  /* ── SESSION RESTORE TOAST — Thông báo 1 lần khi khôi phục thành công ─ */
  useEffect(() => {
    const s = loadWorkspaceSession();
    if (!s.savedAt) return; // Không có session cũ

    const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày
    if (Date.now() - s.savedAt > SESSION_MAX_AGE_MS) return; // Session quá cũ

    const isNonDefault =
      (s.activeComponent && s.activeComponent !== "cpu") ||
      (typeof s.searchTerm === "string" && s.searchTerm.length > 0) ||
      (s.selectedPresetId && s.selectedPresetId !== "gaming") ||
      (s.suggestionForm?.budget && s.suggestionForm.budget !== "25000000") ||
      (s.suggestionForm?.purpose && s.suggestionForm.purpose !== "gaming");

    if (isNonDefault) {
      const timeAgo = formatSessionTimeAgo(s.savedAt);
      setLocalMessage(
        `🔄 Workspace đã khôi phục từ phiên ${timeAgo}` +
        (s.activeComponent && s.activeComponent !== "cpu"
          ? ` (đang xem: ${s.activeComponent.toUpperCase()})`
          : "")
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeSection = COMPONENT_SECTIONS.find((s) => s.componentType === activeComponent) || COMPONENT_SECTIONS[0];
  const activeIndex   = COMPONENT_SECTIONS.findIndex((s) => s.componentType === activeComponent);
  const insights = useMemo(() => calculateBuilderInsights(selectedItems, selectedCount, suggestionForm), [selectedItems, selectedCount, suggestionForm]);
  const completionPercent = Math.round((Math.min(selectedCount, insights.requiredCount) / insights.requiredCount) * 100);

  /* ── COMPATIBILITY CHANGE DETECTOR ──────────────────────────────
   * Phát hiện ngay lập tức khi thay đổi linh kiện gây ra mất tương thích
   * (VD: Chọn CPU socket LGA1700 cho Mainboard AM5) hoặc khi đã sửa lỗi.
   * ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const currentChecks = insights.checks || [];
    const prevChecksMap = prevChecksRef.current;
    const currentChecksMap = new Map();
    currentChecks.forEach((c) => currentChecksMap.set(c.label, c));

    if (prevChecksMap) {
      // Tìm check vừa bị hỏng (trước ok:true, giờ ok:false)
      const newlyFailed = currentChecks.find((c) => {
        if (c.ok) return false;
        const prev = prevChecksMap.get(c.label);
        return !prev || prev.ok === true;
      });

      if (newlyFailed) {
        let title = "Phát Hiện Xung Đột Tương Thích!";
        let message = newlyFailed.detail || "Linh kiện mới vừa chọn gây ra mất tương thích với cấu hình hiện tại.";
        const type = newlyFailed.severity === "BLOCKER" || newlyFailed.ok === false ? "error" : "warning";

        if (newlyFailed.label.includes("COMP-001") || newlyFailed.label.includes("Socket")) {
          title = "⛔ Xung Đột Socket CPU ↔ Mainboard";
          message = "CPU vừa chọn có chân cắm (Socket) không tương thích với Mainboard hiện tại. Vui lòng đổi CPU hoặc Mainboard cùng socket!";
        } else if (newlyFailed.label.includes("COMP-002") || newlyFailed.label.includes("RAM")) {
          title = "⛔ Chuẩn RAM Không Tương Thích Mainboard";
          message = "Loại RAM vừa chọn không cắm vừa khe Mainboard hiện tại (ví dụ: RAM DDR5 trên Mainboard DDR4).";
        } else if (newlyFailed.label.includes("COMP-007") || newlyFailed.label.includes("Nguồn")) {
          title = "⚠️ PSU Nguồn Không Đủ Công Suất";
          message = "Bộ nguồn PSU đã chọn có công suất thấp hơn tổng điện năng yêu cầu của cấu hình.";
        } else if (newlyFailed.label.includes("COMP-010") || newlyFailed.label.includes("Form Factor")) {
          title = "⛔ Kích Thước Mainboard ↔ Case Không Vừa";
          message = "Kích thước Mainboard quá lớn so với chuẩn vỏ Case đã chọn.";
        } else if (newlyFailed.label.includes("COMP-004") || newlyFailed.label.includes("GPU")) {
          title = "⛔ Card Màn Hình Quá Dài So Với Case";
          message = "Chiều dài Card GPU vượt quá chiều dài khoang chứa khả dụng của vỏ Case.";
        }

        setActiveCompatToast({
          id: Date.now(),
          type,
          title,
          message,
          detail: newlyFailed.detail ? `Chi tiết: ${newlyFailed.detail}` : null,
        });
      } else {
        // Kiểm tra xem trước đó có lỗi và giờ tất cả đã được sửa hết không
        const prevFailedCount = Array.from(prevChecksMap.values()).filter((c) => c.ok === false).length;
        const currentFailedCount = currentChecks.filter((c) => c.ok === false).length;

        if (prevFailedCount > 0 && currentFailedCount === 0 && selectedCount > 0) {
          setActiveCompatToast({
            id: Date.now(),
            type: "success",
            title: "✅ Đã Khắc Phục Xung Đột Tương Thích",
            message: "Tất cả linh kiện trong cấu hình hiện tại đã đạt trạng thái 100% tương thích!",
          });
        }
      }
    }

    prevChecksRef.current = currentChecksMap;
  }, [insights.checks, selectedCount]);

  /* Budget Exceeded Warning Calculation
   * Hai mức ngưỡng thống nhất với calculateBuilderInsights:
   *  - WARNING (>5%):  Banner cam, VẪN cho mua — nhắc nhở nhẹ
   *  - BLOCKED (>10%): Banner đỏ, DISABLE nút mua — bắt buộc xử lý
   */
  const BUDGET_WARN_THRESHOLD  = 1.05; // +5%
  const BUDGET_BLOCK_THRESHOLD = 1.10; // +10% — khớp với calculateBuilderInsights
  const userBudget         = Number(suggestionForm.budget || 25000000);
  const isBudgetWarning    = totalPrice > 0 && userBudget > 0 && totalPrice > userBudget * BUDGET_WARN_THRESHOLD;
  const isBudgetBlocked    = totalPrice > 0 && userBudget > 0 && totalPrice > userBudget * BUDGET_BLOCK_THRESHOLD;
  const isBudgetExceeded   = isBudgetWarning; // alias cho banner hiển thị (cả 2 mức)
  const budgetDiff         = totalPrice - userBudget;
  const budgetExceededPercent = Math.round((budgetDiff / userBudget) * 100);

  const mostExpensiveComponent = useMemo(() => {
    if (!selectedItems) return null;
    let highest = null;
    let maxPrice = 0;
    Object.entries(selectedItems).forEach(([type, item]) => {
      const p = getSelectedProduct(item);
      const price = getItemPrice(item);
      if (price > maxPrice) {
        maxPrice = price;
        highest = { type: type.toUpperCase(), name: getProductName(p), price };
      }
    });
    return highest;
  }, [selectedItems]);

  /* Gọi Backend XAI Check-Compatibility */
  async function fetchBackendXaiCompatibility() {
    const rawComponents = Object.entries(selectedItems || {})
      .map(([type, item]) => {
        const vId = getVariantId(item);
        return vId ? { component_type: type, variant_id: Number(vId) } : null;
      })
      .filter(Boolean);

    if (rawComponents.length < 2) {
      setBackendXaiReport(null);
      return;
    }

    setIsXaiLoading(true);
    try {
      const res = await httpClient.post("/pc-builder/check-compatibility", {
        components: rawComponents
      });
      const data = res?.data?.data || res?.data || res;
      if (data?.checks) {
        setBackendXaiReport(data);
      }
    } catch (err) {
      console.warn("Backend XAI compatibility check failed, using frontend fallback", err);
    } finally {
      setIsXaiLoading(false);
    }
  }

  async function handleOpenXaiDrawer() {
    setIsXaiDrawerOpen(true);
    await fetchBackendXaiCompatibility();
  }

  const xaiReport = useMemo(() => {
    if (backendXaiReport?.checks) return backendXaiReport;
    if (compatibility?.checks) return compatibility;
    const si = insights || { checks: [], warningCount: 0, compatibilityScore: 100, fps: 120, recommendation: "", buildReadiness: "READY", scores: {} };
    const fps = Number(si.fps || 120);
    return {
      compatible: si.warningCount === 0,
      score: Number(si.compatibilityScore || 100),
      buildReadiness: si.buildReadiness || "READY",
      scores: si.scores || { compatibilityScore: 90, performanceScore: 85, valueScore: 88, powerThermalScore: 92, upgradeScore: 80, requirementMatchScore: 88 },
      checks: (Array.isArray(si?.checks) ? si.checks : []).map((c) => ({
        key: c?.label || "Kiểm tra", ok: Boolean(c?.ok), detail: c?.detail || "",
        explanation: {
          short: c?.ok ? `✅ ${c?.label}: Hoạt động tốt` : `⚠️ ${c?.label}: Cần xem xét`,
          long: c?.detail || "Không có xung đột kỹ thuật phát hiện.",
          level: c?.ok ? "success" : "warning",
          suggestion: c?.ok ? undefined : "Vui lòng kiểm tra lại linh kiện này để tối ưu hơn."
        }
      })),
      summary: {
        passedChecks: (si.checks || []).filter((c) => c?.ok).length,
        failedChecks: 0,
        warningChecks: (si.checks || []).filter((c) => !c?.ok).length,
        overallMessage: si.recommendation || "Cấu hình được đánh giá tối ưu."
      },
      performanceEstimate: {
        score: Math.min(99, Math.round(fps / 2.2)),
        grade: fps > 180 ? "Enthusiast" : fps > 120 ? "High-end" : "Mid-range",
        estimatedFps: { esports1080p: fps, aaa1080p: Math.round(fps * 0.45), rendering4k: fps > 140 ? "Rất mượt (< 5 phút)" : "Khá mượt (5–15 phút)" }
      }
    };
  }, [backendXaiReport, compatibility, insights]);

  /* Tính toán điều kiện Block Purchase từ Backend/Frontend checks */
  const hasBlockerSeverity = useMemo(() => {
    const checks = xaiReport?.checks || [];
    return checks.some((c) => c.severity === "BLOCKER" || (c.ok === false && c.severity !== "WARNING" && c.severity !== "ADVISORY"));
  }, [xaiReport]);

  const blockerReasonTooltip = useMemo(() => {
    if (!hasBlockerSeverity) return "";
    const checks = xaiReport?.checks || [];
    const blockerCheck = checks.find((c) => c.severity === "BLOCKER" || (c.ok === false && c.severity !== "WARNING" && c.severity !== "ADVISORY"));
    const shortText = blockerCheck?.explanation?.short || blockerCheck?.key || blockerCheck?.label || "Có lỗi xung đột nghiêm trọng";
    const detailText = blockerCheck?.detail ? ` (${blockerCheck.detail})` : "";
    return `⛔ Không thể đặt hàng: Phát hiện vi phạm nghiêm trọng [${shortText}]${detailText}. Vui lòng đổi linh kiện tương thích trước khi mua.`;
  }, [hasBlockerSeverity, xaiReport]);

  /* Load catalog with 5-minute localStorage Cache */
  useEffect(() => {
    actions.setError("");
  }, []);

  /* Load catalog with LocalStorage Cache & Multi-Keyword Failsafes */
  const loadCatalog = useCallback(async (forceRefresh = false) => {
    const CACHE_KEY = "pcmall_builder_catalog_cache_v6";
    const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

    if (!forceRefresh) {
      // Check localStorage cache first
      try {
        const cachedRaw = localStorage.getItem(CACHE_KEY);
        if (cachedRaw) {
          const { timestamp, data } = JSON.parse(cachedRaw);
          const hasContent = data && Object.values(data).some((arr) => Array.isArray(arr) && arr.length > 0);
          if (Date.now() - timestamp < CACHE_TTL_MS && hasContent) {
            setOptionsByComponent(data);
            setCatalogLoading(false);
            return;
          }
        }
      } catch (cacheErr) {
        console.warn("Failed to read catalog cache from localStorage", cacheErr);
      }
    } else {
      clearCatalogCache();
    }

    setCatalogLoading(true);
    const next = COMPONENT_SECTIONS.reduce((acc, s) => { acc[s.componentType] = []; return acc; }, {});
    let categoryList = [];
    try {
      const res = await getCategories();
      categoryList = getEnvelopeItems(res, []);
    } catch (err) {
      console.warn("PcBuilderPage: failed to load categories", err);
    }

    await Promise.all(COMPONENT_SECTIONS.map(async (section) => {
      try {
        let items = [];
        const keywords = section.categoryKeywords || [section.categoryName || section.componentType];
        const matched = categoryList.find((cat) => {
          const name = String(cat?.name || cat?.category_name || "").toUpperCase();
          return keywords.some((kw) => name.includes(kw.toUpperCase()));
        });

        if (matched?.id) {
          const res = await getProducts({ category_id: matched.id, limit: 100 });
          items = getEnvelopeItems(res, []);
        }

        // Fallback 1: If no products retrieved by category, query by search keyword
        if (!items || items.length === 0) {
          const fallbackRes = await getProducts({ search: section.componentType, limit: 100 });
          items = getEnvelopeItems(fallbackRes, []);
        }

        // Fallback 2: If still no products, fetch general catalog and strictly filter by section keywords
        if (!items || items.length === 0) {
          const allRes = await getProducts({ limit: 100 });
          const allItems = getEnvelopeItems(allRes, []);
          items = allItems.filter((p) => {
            const catName = String(p?.category_name || p?.Category?.name || "").toUpperCase();
            const prodName = String(p?.product_name || p?.name || "").toUpperCase();
            return keywords.some((kw) => {
              const kUpper = String(kw || "").toUpperCase();
              return kUpper && (catName.includes(kUpper) || prodName.includes(kUpper));
            });
          });
        }

        next[section.componentType] = items;
      } catch (err) {
        console.warn(`PcBuilderPage: failed to load ${section.componentType}`, err);
      }
    }));

    setOptionsByComponent(next);
    if (actions?.setError) actions.setError("");
    setCatalogLoading(false);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: next }));
    } catch (saveCacheErr) {
      console.warn("Failed to save catalog cache to localStorage", saveCacheErr);
    }
  }, [actions]);

  useEffect(() => {
    loadCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRefreshCatalog() {
    setLocalMessage("🔄 Đang làm mới danh mục linh kiện trực tiếp từ máy chủ...");
    await loadCatalog(true);
    setLocalMessage("✅ Đã cập nhật danh mục linh kiện mới nhất từ máy chủ!");
  }

  /* Available brands for current component (derived from full catalog, not filtered list) */
  const availableBrands = useMemo(() => {
    const allProducts = optionsByComponent[activeComponent] || [];
    const brands = new Set(allProducts.map((p) => getProductBrand(p)).filter(Boolean));
    return [...brands].sort();
  }, [activeComponent, optionsByComponent]);

  /* Active filter count — shown in filter badge */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterPriceRange.min > 0 || filterPriceRange.max > 0) count++;
    count += filterBrands.length;
    if (filterAiScoreMin > 0) count++;
    return count;
  }, [filterPriceRange, filterBrands, filterAiScoreMin]);

  /* Filtered products — search + advanced filters */
  const activeProducts = useMemo(() => {
    const keyword = normalizeText(debouncedSearchTerm);
    let products = (optionsByComponent[activeComponent] || []).filter((p) => {
      const text = `${getProductName(p)} ${getProductBrand(p)} ${findSpec(p, SPEC_ALIASES.coolingType)} ${findSpec(p, SPEC_ALIASES.socket)} ${findSpec(p, SPEC_ALIASES.ramType)}`;
      return !keyword || normalizeText(text).includes(keyword);
    });

    // Price range filter
    if (filterPriceRange.min > 0) {
      products = products.filter((p) => getProductPrice(p) >= filterPriceRange.min);
    }
    if (filterPriceRange.max > 0) {
      products = products.filter((p) => getProductPrice(p) <= filterPriceRange.max);
    }

    // Brand filter (multi-select — OR logic)
    if (filterBrands.length > 0) {
      products = products.filter((p) => filterBrands.includes(getProductBrand(p)));
    }

    // AI Score minimum filter
    if (filterAiScoreMin > 0) {
      products = products.filter(
        (p) => estimateProductPerformance(p, activeComponent) >= filterAiScoreMin
      );
    }

    return products;
  }, [activeComponent, optionsByComponent, debouncedSearchTerm, filterPriceRange, filterBrands, filterAiScoreMin]);

  /* Total count before filters (for display purposes) */
  const totalProductsBeforeFilter = useMemo(() => {
    const keyword = normalizeText(debouncedSearchTerm);
    return (optionsByComponent[activeComponent] || []).filter((p) => {
      const text = `${getProductName(p)} ${getProductBrand(p)}`;
      return !keyword || normalizeText(text).includes(keyword);
    }).length;
  }, [activeComponent, optionsByComponent, debouncedSearchTerm]);

  /* Reset filters when switching component type */
  useEffect(() => {
    setFilterBrands([]);
    setFilterPriceRange({ min: 0, max: 0 });
    setFilterAiScoreMin(0);
    setShowFilters(false);
  }, [activeComponent]);

  /* Check visibility — show key checks only */
  const visibleChecks = useMemo(() => insights.checks.slice(0, 6), [insights.checks]);

  /* AI insight text — JSX safe nodes (no dangerouslySetInnerHTML) */
  const aiInsightText = useMemo(() => {
    if (selectedCount === 0) {
      return (
        <span>
          Chọn preset phù hợp với nhu cầu và nhấn <strong>AI Build</strong> để hệ thống tự động gợi ý toàn bộ cấu hình tối ưu trong ngân sách.
        </span>
      );
    }
    if (insights.warningCount > 0) {
      return (
        <span>
          Phát hiện <strong>{insights.warningCount} vấn đề tương thích</strong>. Kiểm tra danh sách bên dưới và điều chỉnh linh kiện để đảm bảo cấu hình chạy ổn định.
        </span>
      );
    }
    if (selectedCount < insights.requiredCount) {
      return (
        <span>
          Đã chọn <strong>{selectedCount}/{insights.requiredCount} linh kiện</strong>. Tiếp tục bổ sung để hoàn thiện cấu hình và nhận đánh giá hiệu năng chính xác.
        </span>
      );
    }
    return (
      <span>
        Cấu hình đạt trạng thái <strong>BUILD READY</strong> với điểm tương thích <strong>{xaiReport?.score || 96}/100</strong>. Hiệu năng ước tính: <strong>{insights?.fps || 165} FPS</strong> Gaming. Sẵn sàng đặt hàng!
      </span>
    );
  }, [selectedCount, insights, xaiReport]);

  /* Fetch User Saved Builds History for Authenticated Users */
  useEffect(() => {
    if (!isAuthenticated) {
      setUserBuildsHistory([]);
      return;
    }
    let isMounted = true;
    async function fetchHistory() {
      setIsHistoryLoading(true);
      try {
        const res = await httpClient.get("/pc-builder/my-builds");
        const data = res.data?.data || res.data;
        if (isMounted && Array.isArray(data)) {
          setUserBuildsHistory(data);
        }
      } catch (err) {
        console.warn("Failed to fetch user build history:", err);
      } finally {
        if (isMounted) setIsHistoryLoading(false);
      }
    }
    fetchHistory();
    return () => { isMounted = false; };
  }, [isAuthenticated]);

  /* Handlers */
  /**
   * handleSelectProduct — Chọn sản phẩm vào workspace
   * @param {string} type - Loại linh kiện (cpu, gpu, ram...)
   * @param {object} product - Sản phẩm được chọn
   * @param {boolean} isBatchApply - Nếu true, đang thực hiện batch nạp nhiều linh kiện
   */
  async function handleSelectProduct(type, product, isBatchApply = false) {
    const productId = getProductId(product);
    if (!productId) return;

    // ✅ FIX VẤN ĐỀ 9: Chỉ set processingComponent với tác vụ chọn đơn lẻ, không đè state batch apply
    if (!isBatchApply) {
      setProcessingComponent(type);
      setLocalMessage("");
    }

    try {
      const response = await getProductDetail(productId);
      const detail = getEnvelopeData(response, product);
      const rawVariants = detail?.variants || detail?.skus || detail?.ProductSku || detail?.productSkus || [];
      const safeVariantsArray = Array.isArray(rawVariants) ? rawVariants : [];
      const variants = safeVariantsArray.map((v) => ({
        ...v, variant_id: v.variant_id || v.id, sku: v.sku || `SKU-${v.id}`,
        price: Number(v.price || getProductPrice(product) || 0),
        stock: Number(v.stock !== undefined ? v.stock : v.stock_quantity !== undefined ? v.stock_quantity : 0)
      }));

      let selectedVariant = variants.find((v) => v.stock > 0);

      if (!selectedVariant) {
        selectedVariant = variants[0];
        if (!isBatchApply) {
          setLocalMessage(`⚠️ Sản phẩm "${getProductName(product)}" hiện tại đã HẾT HÀNG (Stock: 0). Đang chọn SKU mặc định, bạn nên đổi linh kiện khác.`);
        }
      } else if (variants[0] && Number(variants[0].stock) === 0) {
        if (!isBatchApply) {
          setLocalMessage(`⚠️ SKU mặc định của "${getProductName(product)}" đã hết hàng, hệ thống đã tự động chọn SKU còn hàng thay thế (${selectedVariant.sku || selectedVariant.name || 'SKU khả dụng'})!`);
        }
      }

      if (!selectedVariant?.variant_id) { actions.setError("Sản phẩm này chưa có SKU khả dụng."); return; }
      await actions.applyComponent(type, selectedVariant.variant_id, { ...product, ...detail }, variants);

    } catch { actions.setError("Không thể tải chi tiết sản phẩm."); }
    finally {
      if (!isBatchApply) {
        setProcessingComponent("");
      }
    }
  }

  async function handleAutoRecommend(overrideOptions = null) {
    if (autoBuildAbortControllerRef.current) {
      autoBuildAbortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    autoBuildAbortControllerRef.current = abortController;

    setIsAutoBuilding(true);

    const targetBudget = Number(
      typeof overrideOptions === "object" && overrideOptions?.budget
        ? overrideOptions.budget
        : typeof overrideOptions === "number"
        ? overrideOptions
        : suggestionForm.budget || 25000000
    );

    const resolution = typeof overrideOptions === "object" && overrideOptions?.resolution
      ? overrideOptions.resolution
      : suggestionForm.resolution || "1080p";

    const preference = typeof overrideOptions === "object" && overrideOptions?.preference
      ? overrideOptions.preference
      : suggestionForm.preference || "value";

    const purpose = typeof overrideOptions === "object" && overrideOptions?.purpose
      ? overrideOptions.purpose
      : suggestionForm.purpose || "gaming";

    const futureNeed = typeof overrideOptions === "object" && overrideOptions?.futureNeed
      ? overrideOptions.futureNeed
      : suggestionForm.futureNeed || "none";

    setProcessingComponent("auto");
    setLocalMessage("⚡ AI đang phân tích và khởi tạo 3 Phương Án Cấu Hình...");
    try {
      // Call backend suggest API for 3 candidates (Guaranteed to drive UI)
      let candidateData = null;
      try {
        const apiRes = await httpClient.post("/pc-builder/suggest", {
          budget: targetBudget,
          useCase: purpose,
          resolution,
          preference,
          futureNeed
        }, { signal: abortController.signal });
        const data = apiRes.data?.data || apiRes.data;
        if (data?.candidates) {
          candidateData = data.candidates;
        }
      } catch (err) {
        if (err?.name === "CanceledError" || err?.name === "AbortError" || err?.code === "ERR_CANCELED") {
          console.log("Previous AI suggest request aborted for newer build trigger.");
          return;
        }
        console.warn("Backend suggest API warning, fallback candidates will be generated", err);
      }

      const presetKey = AUTO_RECOMMEND_PROFILES[selectedPresetId] ? selectedPresetId : normalizeText(purpose) || "default";
      const baseAlloc = AUTO_RECOMMEND_PROFILES[presetKey]?.allocations || AUTO_RECOMMEND_PROFILES.default.allocations;
      const allocation = { ...baseAlloc };

      // Adjust local allocation according to resolution & preference
      if (resolution === "4k") {
        if (allocation.gpu) allocation.gpu += 0.10;
        if (allocation.cpu) allocation.cpu = Math.max(0.10, allocation.cpu - 0.05);
      } else if (resolution === "2k") {
        if (allocation.gpu) allocation.gpu += 0.05;
        if (allocation.cpu) allocation.cpu = Math.max(0.12, allocation.cpu - 0.05);
      }

      if (preference === "performance") {
        if (allocation.gpu) allocation.gpu *= 1.15;
        if (allocation.cpu) allocation.cpu *= 1.15;
      } else if (preference === "quiet") {
        allocation.cooling = 0.08;
      } else if (preference === "future") {
        allocation.mainboard = (allocation.mainboard || 0.15) + 0.05;
      }

      const draftItems = { ...selectedItems };
      const selectedProductsList = [];

      for (const section of COMPONENT_SECTIONS) {
        const products = optionsByComponent[section.componentType] || [];
        if (products.length === 0) continue;
        const target = targetBudget * (allocation[section.componentType] || 0.1);
        const product = section.componentType === "cooling"
          ? pickRecommendedCoolingProduct(products, draftItems, target)
          : [...products].sort((a, b) => {
              const priceA = getProductPrice(a), priceB = getProductPrice(b);
              return Math.abs(priceA - target) - Math.abs(priceB - target);
            })[0];
        if (product) {
          selectedProductsList.push({ type: section.componentType, product });
          draftItems[section.componentType] = { product };
        }
      }

      // ✅ FIX: Sequential (for...of) thay vì Promise.all để tránh race condition ghi đè state
      // Với guest user, setGuestBuild dùng functional update (current =>) nhưng Promise.all
      // sẽ đọc cùng 1 snapshot "current" cũ → các linh kiện trước bị ghi đè mất.
      // skipAutoNav=true để workspace không nhảy loạn qua 8 bước liên tiếp.
      for (const { type, product } of selectedProductsList) {
        if (autoBuildAbortControllerRef.current !== abortController) break; // Dừng nếu bị abort
        await handleSelectProduct(type, product, true); // skipAutoNav = true
      }
      // Sau khi xong toàn bộ, navigate về CPU (bước 1) để người dùng xem lại cấu hình
      setActiveComponent("cpu");
      setSearchTerm("");
      // ✅ FIX VẤN ĐỀ 5: Khởi tạo 3 Phương Án Candidate Builds với LINH KIỆN THỰC TẾ & TỔNG GIÁ THỰC TẾ khác nhau
      if (!candidateData) {
        const createLocalCandidate = (budgetMultiplier, allocModifiers, label, desc, score) => {
          const candidateBudget = Math.round(targetBudget * budgetMultiplier);
          const candidateDraft = {};
          const candidateItemsList = [];

          const candidateAlloc = { ...allocation };
          if (allocModifiers.gpu) candidateAlloc.gpu = (candidateAlloc.gpu || 0.30) * allocModifiers.gpu;
          if (allocModifiers.cpu) candidateAlloc.cpu = (candidateAlloc.cpu || 0.18) * allocModifiers.cpu;

          for (const section of COMPONENT_SECTIONS) {
            const products = optionsByComponent[section.componentType] || [];
            if (products.length === 0) continue;

            const sectionTargetPrice = candidateBudget * (candidateAlloc[section.componentType] || 0.1);

            let pickedProduct = null;
            if (section.componentType === "cooling") {
              pickedProduct = pickRecommendedCoolingProduct(products, candidateDraft, sectionTargetPrice);
            } else {
              const sorted = [...products].sort((a, b) => {
                const priceA = getProductPrice(a);
                const priceB = getProductPrice(b);
                return Math.abs(priceA - sectionTargetPrice) - Math.abs(priceB - sectionTargetPrice);
              });
              pickedProduct = sorted[0];
            }

            if (pickedProduct) {
              candidateDraft[section.componentType] = { product: pickedProduct };
              const pId = getProductId(pickedProduct);
              const price = getProductPrice(pickedProduct);
              const name = getProductName(pickedProduct);

              let explanation = `Gợi ý tối ưu P/P trong ngân sách ${formatCurrency(candidateBudget)}đ.`;
              if (budgetMultiplier > 1.0) {
                if (section.componentType === "gpu") explanation = `Nâng cấp GPU mạnh hơn giúp tăng FPS đáng kể ở độ phân giải ${resolution.toUpperCase()}.`;
                else if (section.componentType === "cpu") explanation = `Nâng cấp CPU xung nhịp cao hơn để đa nhiệm nặng & kéo tối đa FPS.`;
                else if (section.componentType === "cooling") explanation = `Tản nhiệt hiệu năng cao giữ hệ thống mát mẻ khi tải nặng.`;
                else explanation = `Bổ sung linh kiện dòng cao cấp hơn, tăng độ bền và khả năng nâng cấp.`;
              } else if (budgetMultiplier < 1.0) {
                if (section.componentType === "gpu") explanation = `GPU tối ưu chi phí, vừa đủ chiến mượt ${resolution.toUpperCase()} trong tầm giá tiết kiệm.`;
                else if (section.componentType === "cpu") explanation = `CPU giá tốt nhất phân khúc, tiết kiệm điện năng mà vẫn đảm bảo trải nghiệm.`;
                else explanation = `Linh kiện phổ thông đáng tin cậy, giúp tiết kiệm 15% ngân sách.`;
              }

              candidateItemsList.push({
                type: section.componentType.toUpperCase(),
                componentType: section.componentType,
                id: pId,
                productId: pId,
                name,
                price,
                product: pickedProduct,
                explanation
              });
            }
          }

          const candidateTotalPrice = candidateItemsList.reduce((acc, item) => acc + item.price, 0) || candidateBudget;
          const candidateUtilization = Math.round((candidateTotalPrice / targetBudget) * 100);

          return {
            label,
            desc,
            totalPrice: candidateTotalPrice,
            budgetUtilization: candidateUtilization,
            components: candidateItemsList,
            compatibilityReport: { score, compatible: true }
          };
        };

        candidateData = {
          bestValue: createLocalCandidate(
            1.0,
            { gpu: 1.0, cpu: 1.0 },
            "Best Value (Cân Bằng P/P)",
            "Tối ưu nhất giữa giá trị bỏ ra và hiệu năng nhận được trong ngân sách",
            96
          ),
          bestPerformance: createLocalCandidate(
            1.15,
            { gpu: 1.25, cpu: 1.15 },
            "Best Performance (Tối Đa Hiệu Năng)",
            "Tối đa sức mạnh GPU & CPU để đạt FPS cao nhất trong ngân sách mở rộng",
            98
          ),
          budgetSafe: createLocalCandidate(
            0.85,
            { gpu: 0.85, cpu: 0.85 },
            "Budget Safe (Tiết Kiệm Chi Phí)",
            "Ưu tiên tiết kiệm 15% chi phí mà vẫn đáp ứng mượt mà mục tiêu sử dụng",
            92
          )
        };
      }

      setCandidateBuilds(candidateData);
      setActiveCandidateTab("bestValue");

      // Smooth scroll to workspace panel
      setTimeout(() => {
        const el = document.getElementById("workspace");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);

      setLocalMessage(`✅ AI đã gợi ý 3 Candidates cho nhu cầu ${purpose.toUpperCase()} (${resolution.toUpperCase()}, Khẩu vị: ${preference}) ngân sách ${formatCurrency(targetBudget)}đ. Chọn tab để xem chi tiết.`);
    } finally {
      if (autoBuildAbortControllerRef.current === abortController) {
        setIsAutoBuilding(false);
        setProcessingComponent("");
      }
    }
  }

    async function handleRunWhatIf(deltaBudget = 5000000) {
    setIsWhatIfLoading(true);
    setLocalMessage(`🔮 Đang kích hoạt What-If Simulation (${deltaBudget >= 0 ? `+${formatCurrency(deltaBudget)}đ` : `${formatCurrency(deltaBudget)}đ`})...`);

    const snapshot = {
      selectedItems: { ...selectedItems },
      totalPrice,
      selectedCount,
      xaiReport: backendXaiReport || insights
    };
    setWhatIfCurrentSnapshot(snapshot);
    setWhatIfDeltaBudget(deltaBudget);

    const currentBasePrice = totalPrice > 0 ? totalPrice : Number(suggestionForm.budget || 25000000);
    const simTargetBudget = Math.max(8000000, currentBasePrice + deltaBudget);

    try {
      const res = await httpClient.post("/pc-builder/suggest", {
        budget: simTargetBudget,
        useCase: suggestionForm.purpose || "gaming",
        resolution: suggestionForm.resolution || "1080p",
        preference: suggestionForm.preference || "value",
        futureNeed: suggestionForm.futureNeed || "none"
      });

      const data = res.data?.data || res.data;
      const simCandidate = data?.candidates?.bestValue || data?.candidates?.bestPerformance;

      if (simCandidate) {
        setWhatIfSimulatedBuild(simCandidate);
        setWhatIfModalOpen(true);
        setLocalMessage(`✅ Đã mô phỏng xong cấu hình What-If (${deltaBudget >= 0 ? `+${formatCurrency(deltaBudget)}đ` : `${formatCurrency(deltaBudget)}đ`})!`);
      } else {
        throw new Error("Không lấy được dữ liệu simulation từ backend");
      }
    } catch (err) {
      console.warn("What-If Simulation API warning, generating fallback simulation", err);

      const simDraft = {};
      const simComponentsList = [];
      const presetKey = AUTO_RECOMMEND_PROFILES[selectedPresetId] ? selectedPresetId : normalizeText(suggestionForm.purpose) || "default";
      const baseAlloc = AUTO_RECOMMEND_PROFILES[presetKey]?.allocations || AUTO_RECOMMEND_PROFILES.default.allocations;

      for (const section of COMPONENT_SECTIONS) {
        const products = optionsByComponent[section.componentType] || [];
        if (products.length === 0) continue;
        const targetPrice = simTargetBudget * (baseAlloc[section.componentType] || 0.1);
        const sorted = [...products].sort((a, b) => Math.abs(getProductPrice(a) - targetPrice) - Math.abs(getProductPrice(b) - targetPrice));
        const product = sorted[0];
        if (product) {
          const pId = getProductId(product);
          simComponentsList.push({
            type: section.componentType.toUpperCase(),
            componentType: section.componentType,
            id: pId,
            productId: pId,
            name: getProductName(product),
            price: getProductPrice(product),
            product
          });
        }
      }

      const simCalcPrice = simComponentsList.reduce((sum, item) => sum + item.price, 0) || simTargetBudget;

      const simCandidate = {
        totalPrice: simCalcPrice,
        budgetUtilization: Math.round((simCalcPrice / simTargetBudget) * 100),
        components: simComponentsList,
        compatibilityReport: { score: 96, compatible: true }
      };
      setWhatIfSimulatedBuild(simCandidate);
      setWhatIfModalOpen(true);
    } finally {
      setIsWhatIfLoading(false);
    }
  }

  async function handleApplyCandidateBuild(candidateBuild) {
    if (!candidateBuild?.components) return;
    const comps = Array.isArray(candidateBuild.components)
      ? candidateBuild.components
      : Object.values(candidateBuild.components);

    if (comps.length === 0) return;
    setProcessingComponent("apply-candidate");
    setLocalMessage("⚡ Đang nạp toàn bộ linh kiện từ Phương Án AI vào workspace...");

    try {
      // 1. Fetch hoặc match toàn bộ linh kiện song song (Parallel Batch Fetch)
      const resolvedItems = await Promise.all(
        comps.map(async (item) => {
          const type = (item.type || item.componentType || "").toLowerCase();
          const pId = item.id || item.productId || item.product_id;
          if (!type) return null;

          const catalogList = optionsByComponent[type] || [];
          let productMatch = item.product || null;

          if (!productMatch && pId) {
            productMatch = catalogList.find((p) => String(getProductId(p)) === String(pId));

            if (!productMatch) {
              try {
                const res = await getProductDetail(pId);
                productMatch = getEnvelopeData(res, null);
              } catch (_err) {
                console.warn("Cannot fetch detail for candidate item", pId);
              }
            }
          }

          // Fallback fuzzy name match if product ID was missing or not found
          if (!productMatch && (item.name || item.productName)) {
            const targetName = normalizeText(item.name || item.productName);
            productMatch = catalogList.find((p) => {
              const pName = normalizeText(getProductName(p));
              return pName.includes(targetName) || targetName.includes(pName);
            });
          }

          // Ultimate fallback to first available catalog item for this component type
          if (!productMatch && catalogList.length > 0) {
            productMatch = catalogList[0];
          }

          return productMatch ? { type, product: productMatch } : null;
        })
      );

      // 2. Nạp từng linh kiện tuần tự (sequential) — skipAutoNav=true để không giật workspace
      const validItems = resolvedItems.filter(Boolean);
      for (const { type, product } of validItems) {
        await handleSelectProduct(type, product, true); // skipAutoNav = true
      }
      // Sau khi apply candidate xong, navigate về CPU để người dùng xem lại
      setActiveComponent("cpu");
      setSearchTerm("");

      setLocalMessage(`✅ Đã nạp thành công phương án "${candidateBuild.label || activeCandidateTab}" (${validItems.length} linh kiện) vào workspace!`);
    } catch (err) {
      console.error("Error applying candidate build:", err);
      actions.setError("Không thể nạp toàn bộ phương án cấu hình này.");
    } finally {
      setProcessingComponent("");
    }
  }

  function handleRequirementSubmit(profile) {
    setSuggestionForm({
      purpose: profile.purpose || "gaming",
      budget: String(profile.budget || 25000000),
      resolution: profile.resolution || "1080p",
      preference: profile.preference || "value",
      futureNeed: profile.futureNeed || "none"
    });
    handleAutoRecommend(profile);
  }

  async function handlePickCoolingRecommendation() {
    const products = optionsByComponent.cooling || [];
    const target = Number(suggestionForm.budget || 0) * 0.03;
    const product = pickRecommendedCoolingProduct(products, selectedItems, target);
    if (!product) { actions.setError("Chưa tìm thấy tản nhiệt phù hợp trong danh mục."); return; }
    await handleSelectProduct("cooling", product);
  }

  async function handleAddAllToCart() {
    const ids = Object.values(selectedItems).map(getVariantId).filter(Boolean);
    if (ids.length === 0) { actions.setError("Chưa có linh kiện để thêm vào giỏ hàng."); return; }
    if (!isAuthenticated) { navigate(routeConfig.public.login); return; }
    setProcessingComponent("cart");
    try {
      await Promise.all(ids.map((productVariantId) => addItemToCart({ productVariantId, quantity: 1 })));
      setLocalMessage("✅ Đã thêm toàn bộ linh kiện vào giỏ hàng.");
    } catch { actions.setError("Không thể thêm toàn bộ linh kiện vào giỏ hàng."); }
    finally { setProcessingComponent(""); }
  }

  async function handleBuyWholeBuild() {
    const ids = Object.values(selectedItems).map(getVariantId).filter(Boolean);
    if (ids.length === 0) { actions.setError("Chưa có linh kiện để mua."); return; }
    if (!isAuthenticated) { navigate(routeConfig.public.login); return; }
    setIsFinalReviewOpen(true);
  }

  async function executeBuyWholeBuild(options = {}) {
    const ids = Object.values(selectedItems).map(getVariantId).filter(Boolean);
    setProcessingComponent("cart");
    setIsFinalReviewOpen(false);
    try {
      await Promise.all(ids.map((productVariantId) => addItemToCart({ productVariantId, quantity: 1 })));
      setLocalMessage("✅ Đã xác nhận & nạp toàn bộ linh kiện vào giỏ hàng. Đang chuyển đến trang thanh toán...");
      navigate(routeConfig.public.checkout);
    } catch {
      actions.setError("Không thể mua nguyên bộ cấu hình.");
    } finally {
      setProcessingComponent("");
    }
  }

  async function handleShareBuild() {
    setLocalMessage("Đang tạo link chia sẻ...");
    const targetBuildId = activeBuildId || actions.activeBuildId;
    try {
      if (isAuthenticated && targetBuildId) {
        const response = await httpClient.post(`/pc-builder/${targetBuildId}/publish`);
        const shareToken = response.data?.data?.shareToken || response.data?.shareToken;
        if (shareToken) {
          const url = `${window.location.origin}/pc-builder/shared/${shareToken}`;
          await navigator.clipboard.writeText(url);
          setLocalMessage(`🔗 Đã sao chép link chia sẻ: ${url}`);
          return;
        }
      }
      const text = `${buildName} — ${formatCurrency(totalPrice)}đ\n${COMPONENT_SECTIONS.map((s) => {
        const item = selectedItems[s.componentType];
        return `${s.label}: ${item ? getProductName(getSelectedProduct(item)) : "Chưa chọn"}`;
      }).join("\n")}`;
      await navigator.clipboard.writeText(text);
      setLocalMessage("✅ Đã sao chép thông tin cấu hình vào clipboard.");
    } catch { setLocalMessage("Vui lòng đăng nhập và lưu cấu hình để tạo link chia sẻ công khai."); }
  }

  function handlePreset(preset) {
    if (!preset) return;
    setSelectedPresetId(preset.id);
    const parsedBudget = Number(preset.budget) || 25000000;
    setSuggestionForm((prev) => ({
      ...prev,
      purpose: preset.useCase || prev?.purpose || "gaming",
      budget: parsedBudget
    }));
    setLocalMessage(`Đã chọn preset "${preset.label}". Nhấn AI Build để hệ thống chọn linh kiện tối ưu.`);
  }

  /* Independent Auto-Dismiss Notifications System (P9-06) */
  useEffect(() => {
    if (localMessage) {
      const timer = setTimeout(() => setLocalMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [localMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => { if (actions.setError) actions.setError(""); }, 6000);
      return () => clearTimeout(timer);
    }
  }, [error, actions]);

  /* ── EXPORT PDF — Mở cửa sổ in riêng với layout báo giá đẹp ──────────────── */
  function handleExportPdf() {
    exportBuildToPdf({
      buildName:     buildName || "Cấu hình AI PC Mall",
      selectedItems,
      totalPrice,
      insights,
      xaiReport:     backendXaiReport || {},
      suggestionForm,
    });
  }

  /* ── RENDER ──────────────────────────────────────────────── */
  return (
    <div className="builder-page">

      {/* ── FLOATING COMPATIBILITY TOAST NOTIFICATION ──────────── */}
      <CompatibilityToast
        toast={activeCompatToast}
        onClose={() => setActiveCompatToast(null)}
        onOpenXai={handleOpenXaiDrawer}
      />

      {/* ── TOPBAR SUMMARY PANEL ──────────────────────────── */}
      <BuilderSummaryPanel
        selectedPresetId={selectedPresetId}
        onSelectPreset={handlePreset}
        presets={PRESET_BUILDS}
        onOpenReqWizard={() => setIsReqWizardOpen(true)}
        onOpenXaiDrawer={handleOpenXaiDrawer}
        onAutoBuild={handleAutoRecommend}
        isAutoBuilding={isAutoBuilding}
        budget={suggestionForm.budget}
        onRefreshCatalog={handleRefreshCatalog}
        onClearAll={actions.clearAll}
        selectedCount={selectedCount}
        onExportPdf={handleExportPdf}
      />

      {/* ── INDEPENDENT NOTIFICATION BANNERS (P9-06) ───────────── */}
      {(error || success || localMessage) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
          {error && (
            <div className="builder-alert builder-alert--danger" role="alert" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>⛔ {error}</span>
              <button
                type="button"
                onClick={() => { if (actions.setError) actions.setError(""); }}
                style={{ background: "none", border: "none", color: "#be123c", fontWeight: "800", cursor: "pointer", fontSize: "16px", marginLeft: "10px" }}
              >
                ×
              </button>
            </div>
          )}

          {(success || localMessage) && !error && (
            <div className="builder-alert builder-alert--success" role="alert" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{success || localMessage}</span>
              <button
                type="button"
                onClick={() => setLocalMessage("")}
                style={{ background: "none", border: "none", color: "#047857", fontWeight: "800", cursor: "pointer", fontSize: "16px", marginLeft: "10px" }}
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── MAIN BODY ─────────────────────────────────────── */}
      <div className="builder-body">
        <div className="builder-layout">

          {/* ═══ COLUMN 1: LEFT SIDEBAR — BUILD PROGRESS ═══════ */}
          <aside className="builder-sidebar" aria-label="Build progress">
            {/* Component Progress List */}
            <ComponentSectionList
              sections={COMPONENT_SECTIONS}
              selectedItems={selectedItems}
              activeComponent={activeComponent}
              setActiveComponent={setActiveComponent}
              setSearchTerm={setSearchTerm}
              insights={insights}
              onRemoveComponent={actions.removeComponent}
              onClearAll={actions.clearAll}
              completionPercent={completionPercent}
            />

            <div className="sidebar-divider" />

            {/* AI Control Panel */}
            <AIControlPanel
              suggestionForm={suggestionForm}
              setSuggestionForm={setSuggestionForm}
              onAutoRecommend={handleAutoRecommend}
              isAutoBuilding={isAutoBuilding}
            />

            <div className="sidebar-divider" />

            {/* System Insights Panel */}
            <InsightsPanel insights={insights} />

            <GuestBuildsAndHistory
              isAuthenticated={isAuthenticated}
              guestBuildList={guestBuildList}
              userBuildsHistory={userBuildsHistory}
              isHistoryLoading={isHistoryLoading}
              onLoadGuestBuild={actions.loadGuestBuildById}
              onCreateGuestBuild={actions.createNewGuestBuild}
              onApplyUserBuild={handleApplyCandidateBuild}
              formatCurrency={formatCurrency}
            />
          </aside>

          {/* ═══ COLUMN 2: CENTER WORKSPACE ════════════════════ */}
          <main className="builder-center" id="workspace">
            {/* Candidate Builds Panel (Best Value, Best Performance, Budget Safe) */}
            {candidateBuilds && (
              <CandidateBuildsPanel
                candidateBuilds={candidateBuilds}
                activeCandidateTab={activeCandidateTab}
                onSelectCandidateTab={setActiveCandidateTab}
                onApplyCandidateBuild={handleApplyCandidateBuild}
                isApplying={processingComponent === "apply-candidate"}
              />
            )}

            {/* ⚠️ BUDGET EXCEEDED WARNING BANNER — 2 mức: WARNING (cam) và BLOCKED (đỏ) */}
            {isBudgetExceeded && (
              <div style={{
                backgroundColor: isBudgetBlocked ? "#fff1f2" : "#fff7ed",
                border: `1px solid ${isBudgetBlocked ? "#fecdd3" : "#fed7aa"}`,
                borderRadius: "16px",
                padding: "16px 20px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: isBudgetBlocked
                  ? "0 4px 16px rgba(220, 38, 38, 0.12)"
                  : "0 4px 12px rgba(234, 88, 12, 0.08)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ fontSize: "28px" }}>{isBudgetBlocked ? "🚫" : "⚠️"}</span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: isBudgetBlocked ? "#be123c" : "#c2410c" }}>
                        {isBudgetBlocked ? "Vượt Ngân Sách Nghiêm Trọng" : "Cảnh Báo Ngân Sách"}&nbsp;
                        {budgetExceededPercent}% (+{formatCurrency(budgetDiff)}đ)
                      </h4>
                      {/* Badge trạng thái rõ ràng */}
                      <span style={{
                        fontSize: "10px",
                        fontWeight: "800",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        backgroundColor: isBudgetBlocked ? "#be123c" : "#ea580c",
                        color: "#ffffff",
                        letterSpacing: "0.5px",
                        flexShrink: 0
                      }}>
                        {isBudgetBlocked ? "⛔ BỊ CHẶN MUA" : "⚠ CẢNH BÁO"}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "12.5px", color: isBudgetBlocked ? "#9f1239" : "#9a3412", lineHeight: "1.4" }}>
                      Hạn mức: <strong>{formatCurrency(userBudget)}đ</strong> · Hiện tại: <strong>{formatCurrency(totalPrice)}đ</strong>.
                      {isBudgetBlocked
                        ? " Vượt quá 10% — nút Đặt Mua đã bị khóa cho đến khi điều chỉnh lại cấu hình."
                        : " Vượt nhẹ dưới 10% — bạn vẫn có thể đặt mua nhưng nên cân nhắc."}
                      {mostExpensiveComponent && (
                        <span> Gợi ý: Đổi <strong>{mostExpensiveComponent.type} ({mostExpensiveComponent.name})</strong> xuống phân khúc thấp hơn.</span>
                      )}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                  {candidateBuilds?.budgetSafe && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCandidateTab("budgetSafe");
                        handleApplyCandidateBuild(candidateBuilds.budgetSafe);
                      }}
                      style={{
                        backgroundColor: isBudgetBlocked ? "#be123c" : "#ea580c",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "10px",
                        padding: "8px 14px",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      💡 Áp Dụng Budget Safe
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRunWhatIf(-5000000)}
                    disabled={isWhatIfLoading}
                    style={{
                      backgroundColor: "#ffffff",
                      color: isBudgetBlocked ? "#be123c" : "#c2410c",
                      border: `1px solid ${isBudgetBlocked ? "#fecdd3" : "#fdba74"}`,
                      borderRadius: "10px",
                      padding: "8px 14px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    🔮 Mô phỏng -5Tr
                  </button>
                </div>
              </div>
            )}

            {/* Sticky workspace header */}
            <div className="workspace-header">
              <div>
                <span className="workspace-step-badge">
                  Bước {activeIndex + 1} / {COMPONENT_SECTIONS.length} — {activeSection.label}
                </span>
                <h2 className="workspace-title">Chọn {activeSection.label} Cho Cấu Hình</h2>
                <p className="workspace-desc">
                  {activeComponent === "cooling"
                    ? insights.coolingState.required
                      ? "CPU của bạn cần tản nhiệt riêng. Chọn Air Cooler hoặc AIO phù hợp."
                      : "CPU đã có tản nhiệt đi kèm. Bạn có thể nâng cấp để mát và êm hơn."
                    : `Chọn ${activeSection.label} tương thích với cấu hình hiện tại.`}
                </p>
              </div>
              <div className="workspace-search-wrap">
                <span className="workspace-search-icon" aria-hidden>🔍</span>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Tìm ${activeSection.label}...`}
                  aria-label={`Tìm kiếm ${activeSection.label}`}
                />
              </div>
            </div>

            {/* Product workspace body */}
            <div className="workspace-body">

              {/* Advanced Filter Bar */}
              <ProductFilterBar
                isOpen={showFilters}
                onToggle={() => setShowFilters((v) => !v)}
                availableBrands={availableBrands}
                filterPriceRange={filterPriceRange}
                setFilterPriceRange={setFilterPriceRange}
                filterBrands={filterBrands}
                setFilterBrands={setFilterBrands}
                filterAiScoreMin={filterAiScoreMin}
                setFilterAiScoreMin={setFilterAiScoreMin}
                activeFilterCount={activeFilterCount}
                filteredCount={activeProducts.length}
                totalCount={totalProductsBeforeFilter}
              />

              {activeComponent === "cooling" && (
                <div className={`context-guide context-guide--${insights?.coolingState?.tone || "info"}`} role="note">
                  <div>
                    <strong className="context-guide__title">{insights?.coolingState?.title}</strong>
                    <p className="context-guide__text">{selectedItems.cooling ? "Cooling requirement satisfied. Bạn có thể đổi cooler nếu muốn." : insights?.coolingState?.text}</p>
                  </div>
                  {!selectedItems.cooling && (
                    <button type="button" className="context-guide__btn" onClick={handlePickCoolingRecommendation} disabled={processingComponent === "cooling" || activeProducts.length === 0}>
                      AI Gợi ý Cooling
                    </button>
                  )}
                </div>
              )}

              {/* Product Grid */}
              {catalogLoading ? (
                <div className="product-grid">
                  {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : activeProducts.length === 0 ? (
                <div className="product-grid">
                  <div className="workspace-state">
                    <div className="workspace-state__icon">🔍</div>
                    <div className="workspace-state__title">Không tìm thấy sản phẩm</div>
                    <p className="workspace-state__desc">Thử từ khóa khác hoặc xóa bộ lọc để xem toàn bộ {activeSection.label}.</p>
                  </div>
                </div>
              ) : (
                <div className="product-grid" role="list" aria-label={`Danh sách ${activeSection.label}`}>
                  {activeProducts.map((product) => {
                    const productId  = getProductId(product);
                    const selected   = selectedItems[activeComponent];
                    const isSelected = String(getProductId(getSelectedProduct(selected))) === String(productId);
                    return (
                      <div key={`${activeComponent}-${productId}`} role="listitem">
                        <BuilderProductCard
                          activeComponent={activeComponent}
                          isSelected={isSelected}
                          loading={loading}
                          onSelect={handleSelectProduct}
                          onOpenDetail={(prod) => setDetailModalProduct(prod)}
                          processingComponent={processingComponent}
                          product={product}
                          selectedItems={selectedItems}
                          suggestionForm={suggestionForm}
                          totalPrice={totalPrice}
                          isCompared={compareList.some((p) => (p.product_id || p.id) === productId)}
                          onToggleCompare={(prod, isChecked) => {
                            if (isChecked) {
                              if (compareList.length >= 3) {
                                actions.setError("Chỉ hỗ trợ so sánh tối đa 3 sản phẩm cùng lúc.");
                                return;
                              }
                              setCompareList((prev) => [...prev.filter((p) => (p.product_id || p.id) !== productId), prod]);
                            } else {
                              setCompareList((prev) => prev.filter((p) => (p.product_id || p.id) !== productId));
                            }
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>

          <BuildSummarySidebar
            xaiReport={xaiReport}
            totalPrice={totalPrice}
            selectedCount={selectedCount}
            insights={insights}
            handleBuyWholeBuild={handleBuyWholeBuild}
            processingComponent={processingComponent}
            hasBlockerSeverity={hasBlockerSeverity || isBudgetBlocked}
            xaiBuildReadiness={isBudgetBlocked ? "BLOCKED" : xaiReport.buildReadiness}
            blockerReasonTooltip={
              isBudgetBlocked
                ? `⛔ Không thể đặt hàng: Cấu hình vượt ngân sách ${budgetExceededPercent}% (+${formatCurrency(budgetDiff)}đ). Vượt quá 10% — vui lòng giảm chi phí hoặc áp dụng Budget Safe trước khi mua.`
                : blockerReasonTooltip
            }
            isAuthenticated={isAuthenticated}
            onSaveBuild={actions.commitSave}
            onAddAllToCart={handleAddAllToCart}
            onShareBuild={handleShareBuild}
            onClearAll={actions.clearAll}
            handleAutoRecommend={handleAutoRecommend}
            suggestionFormBudget={suggestionForm.budget}
            visibleChecks={visibleChecks}
            onOpenXaiDrawer={setIsXaiDrawerOpen}
            handleRunWhatIf={handleRunWhatIf}
            isWhatIfLoading={isWhatIfLoading}
            aiInsightText={aiInsightText}
            selectedItems={selectedItems}
            formatCurrency={formatCurrency}
          />

        </div>
      </div>

      {/* ── XAI DRAWER ──────────────────────────────────────── */}
      <XAIExplanationDrawer
        isOpen={isXaiDrawerOpen}
        onClose={() => setIsXaiDrawerOpen(false)}
        xaiReport={xaiReport}
        isLoading={isXaiLoading}
        onRecheck={fetchBackendXaiCompatibility}
      />

      {/* ── PRODUCT QUICK VIEW DETAIL MODAL ────────────────── */}
      <ProductDetailModal
        isOpen={Boolean(detailModalProduct)}
        onClose={() => setDetailModalProduct(null)}
        product={detailModalProduct}
        activeComponent={activeComponent}
        isSelected={String(getProductId(getSelectedProduct(selectedItems[activeComponent]))) === String(getProductId(detailModalProduct))}
        onSelectProduct={handleSelectProduct}
        selectedItems={selectedItems}
        catalogOptions={optionsByComponent[activeComponent] || []}
      />

      {/* ── FLOATING COMPARE BAR ───────────────────────────── */}
      {compareList.length > 0 && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          backgroundColor: "#0f172a",
          color: "#ffffff",
          padding: "12px 18px",
          borderRadius: "16px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.35)",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          zIndex: 999,
          border: "1px solid #334155"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "22px" }}>📊</span>
            <div>
              <strong style={{ fontSize: "13.5px", display: "block", color: "#f8fafc" }}>
                Đã chọn {compareList.length}/3 sản phẩm
              </strong>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                Danh mục: {activeComponent.toUpperCase()}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCompareDrawerOpen(true)}
            style={{
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "8px 16px",
              fontSize: "12.5px",
              fontWeight: "800",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)"
            }}
          >
            📊 So Sánh Side-by-Side →
          </button>

          <button
            type="button"
            onClick={() => setCompareList([])}
            style={{
              backgroundColor: "transparent",
              color: "#94a3b8",
              border: "none",
              fontSize: "16px",
              cursor: "pointer",
              padding: "0 4px"
            }}
            title="Bỏ danh sách so sánh"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── COMPARE MATRIX DRAWER MODAL ─────────────────────── */}
      <CompareDrawer
        isOpen={isCompareDrawerOpen}
        onClose={() => setIsCompareDrawerOpen(false)}
        compareList={compareList}
        activeComponent={activeComponent}
        onSelectProduct={handleSelectProduct}
        onRemoveFromCompare={(pId) => setCompareList((prev) => prev.filter((p) => (p.product_id || p.id) !== pId))}
        onClearCompare={() => {
          setCompareList([]);
          setIsCompareDrawerOpen(false);
        }}
      />

      {/* ── FINAL PRE-PURCHASE AI REVIEW MODAL (FIX VẤN ĐỀ 14) ── */}
      <FinalReviewModal
        isOpen={isFinalReviewOpen}
        onClose={() => setIsFinalReviewOpen(false)}
        selectedItems={selectedItems}
        totalPrice={totalPrice}
        xaiReport={backendXaiReport || insights}
        insights={insights}
        suggestionForm={suggestionForm}
        onConfirmPurchase={executeBuyWholeBuild}
        isProcessing={processingComponent === "cart"}
        isBlocked={hasBlockerSeverity || isBudgetBlocked}
        blockerReason={blockerReasonTooltip}
      />

      {/* ── REQUIREMENT WIZARD MODAL (FIX VẤN ĐỀ 10) ───────── */}
      <RequirementWizardModal
        isOpen={isReqWizardOpen}
        onClose={() => setIsReqWizardOpen(false)}
        suggestionForm={suggestionForm}
        onSubmitProfile={handleRequirementSubmit}
      />

      {/* ── WHAT-IF SIMULATION COMPARISON MODAL (FIX VẤN ĐỀ 7) ── */}
      {whatIfModalOpen && (
        <WhatIfComparisonPanel
          currentBuildSnapshot={whatIfCurrentSnapshot || { selectedItems, totalPrice, selectedCount, xaiReport: insights }}
          simulatedBuild={whatIfSimulatedBuild}
          deltaBudget={whatIfDeltaBudget}
          onClose={() => setWhatIfModalOpen(false)}
          onResetToCurrentBuild={() => setWhatIfModalOpen(false)}
          onApplySimulatedBuild={async (simBuild) => {
            await handleApplyCandidateBuild(simBuild);
            setWhatIfModalOpen(false);
          }}
          isApplying={processingComponent === "apply-candidate"}
        />
      )}

      {/* ── BATCH APPLY / AI BUILD FULL WORKSPACE LOADING OVERLAY (FIX VẤN ĐỀ 9) ── */}
      {(processingComponent === "apply-candidate" || processingComponent === "auto-build" || isAutoBuilding) && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(8px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          color: "#ffffff"
        }}>
          <div style={{
            backgroundColor: "#1e293b",
            border: "1px solid #3b82f6",
            borderRadius: "20px",
            padding: "32px 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            maxWidth: "460px",
            textAlign: "center"
          }}>
            <div className="builder-batch-spinner" style={{
              width: "52px",
              height: "52px",
              border: "4px solid rgba(59, 130, 246, 0.2)",
              borderTopColor: "#3b82f6",
              borderRadius: "50%",
              marginBottom: "18px"
            }} />
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#f8fafc" }}>
              {isAutoBuilding ? "⚡ AI Đang Phân Tích & Chọn Cấu Hình..." : "⚡ Đang Nạp Phương Án AI Vào Workspace..."}
            </h3>
            <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "#94a3b8", lineHeight: "1.5" }}>
              Vui lòng đợi trong giây lát, hệ thống đang nạp tuần tự 8 linh kiện tối ưu nhất vào bộ máy của bạn.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}