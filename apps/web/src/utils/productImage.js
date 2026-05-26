const CATEGORY_PLACEHOLDERS = {
  cpu: "CPU",
  mainboard: "Mainboard",
  ram: "RAM",
  gpu: "GPU",
  storage: "Storage",
  ssd: "SSD",
  psu: "PSU",
  case: "Case",
  cooling: "Cooling",
  cooler: "Cooling",
  fan: "Cooling",
  aio: "Cooling",
  laptop: "Laptop",
  default: "PC Mall"
};

const FALLBACK_IMAGES = {
  default: "https://placehold.co/800x800/f8fafc/1e293b?text=PC+Mall",
  cooling: "/assets/products/cooling-real/deepcool-ag400.webp"
};

function pickLabel(categoryName, productName) {
  const key = String(categoryName || productName || "")
    .trim()
    .toLowerCase();
  for (const [token, label] of Object.entries(CATEGORY_PLACEHOLDERS)) {
    if (key.includes(token)) return label;
  }
  return CATEGORY_PLACEHOLDERS.default;
}

function isBrokenImage(url) {
  const value = String(url || "").trim();
  if (!value) return true;
  if (value.startsWith("data:image/svg+xml")) return false;
  if (value.startsWith("data:image") && value.length < 1000) return true;
  if (value.includes("placehold.co") && /0f172a|111827|black/i.test(value)) return true;
  return false;
}

function getProductCategoryKey(product = {}) {
  return String(product?.category_name || product?.category?.name || product?.product_name || product?.name || "")
    .trim()
    .toLowerCase();
}

function isCoolingProduct(product = {}) {
  const key = getProductCategoryKey(product);
  return ["cooling", "cooler", "fan", "aio", "radiator", "tản nhiệt", "tan nhiet"].some((token) => key.includes(token));
}

function getFallbackImage(product = {}, options = {}) {
  if (options.fallbackUrl && !isBrokenImage(options.fallbackUrl)) {
    return options.fallbackUrl;
  }
  if (isCoolingProduct(product) || String(options.label || "").toLowerCase().includes("cool")) {
    return FALLBACK_IMAGES.cooling;
  }
  return FALLBACK_IMAGES.default;
}

/**
 * Resolve a displayable product image URL with sensible fallbacks for guests.
 */
export function resolveProductImage(product = {}, options = {}) {
  const candidates = [
    product?.image_url,
    product?.imageUrl,
    product?.thumbnail,
    product?.thumbnail_url,
    product?.defaultVariant?.imageUrl,
    product?.primaryVariant?.image_url,
    product?.variants?.[0]?.image_url,
    product?.variants?.[0]?.imageUrl,
    product?.skus?.[0]?.image_url,
    product?.skus?.[0]?.imageUrl
  ];

  for (const raw of candidates) {
    const url = String(raw || "").trim();
    if (isBrokenImage(url)) continue;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
      return url;
    }
    if (url.startsWith("assets/") || url.startsWith("media/")) {
      return `/${url}`;
    }
    return `/media/${url}`;
  }

  const categoryFallback = getFallbackImage(product, options);
  if (categoryFallback) return categoryFallback;

  const label = encodeURIComponent(options.label || pickLabel(product?.category_name || product?.category?.name, product?.product_name || product?.name));
  return `https://placehold.co/800x800/f8fafc/334155?text=${label}`;
}
