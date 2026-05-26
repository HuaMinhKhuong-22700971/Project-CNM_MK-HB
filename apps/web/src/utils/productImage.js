const CATEGORY_PLACEHOLDERS = {
  cpu: "CPU",
  mainboard: "Mainboard",
  ram: "RAM",
  gpu: "GPU",
  storage: "Storage",
  ssd: "SSD",
  psu: "PSU",
  case: "Case",
  laptop: "Laptop",
  default: "PC Mall"
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
  if (value.startsWith("data:image") && value.length < 1000) return true;
  return false;
}

/**
 * Resolve a displayable product image URL with sensible fallbacks for guests.
 */
export function resolveProductImage(product = {}, options = {}) {
  const candidates = [
    product?.image_url,
    product?.imageUrl,
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

  const label = encodeURIComponent(options.label || pickLabel(product?.category_name || product?.category?.name, product?.product_name || product?.name));
  return `https://placehold.co/600x400/f1f5f9/334155?text=${label}`;
}
