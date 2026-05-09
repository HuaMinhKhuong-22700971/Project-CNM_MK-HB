export const MAX_COMPARE_ITEMS = 4;

const COMPARE_STORAGE_KEY = "pcmall.compare.ids";

export function normalizeCompareIds(ids) {
  const rawIds = Array.isArray(ids) ? ids : String(ids || "").split(",");
  const uniqueIds = [];

  rawIds
    .map((id) => String(id || "").trim())
    .filter(Boolean)
    .forEach((id) => {
      if (!uniqueIds.includes(id) && uniqueIds.length < MAX_COMPARE_ITEMS) {
        uniqueIds.push(id);
      }
    });

  return uniqueIds;
}

export function getStoredCompareIds() {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(COMPARE_STORAGE_KEY) || "[]");
    return normalizeCompareIds(Array.isArray(parsed) ? parsed : []);
  } catch (_error) {
    return [];
  }
}

export function storeCompareIds(ids) {
  const normalizedIds = normalizeCompareIds(ids);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(normalizedIds));
  }
  return normalizedIds;
}

export function addStoredCompareId(id) {
  return storeCompareIds([...getStoredCompareIds(), id]);
}

export function buildCompareUrl(ids) {
  const normalizedIds = normalizeCompareIds(ids);
  return normalizedIds.length > 0 ? `/compare?ids=${normalizedIds.join(",")}` : "/compare";
}
