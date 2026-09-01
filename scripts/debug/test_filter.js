const normalizeText = (v) => String(v || '').trim().toLowerCase();

function getSpecBag(product) {
  const raw = product?.specs || product?.specifications || product?.attributes || product?.technicalSpecs || product?.ProductAttributes || [];
  const bag = {};
  if (Array.isArray(raw)) {
    raw.forEach((entry) => {
      const key = String(entry.name || entry.key || entry.attribute_name || entry.Attribute?.name || '').trim();
      const value = entry.value || entry.attribute_value || entry.AttributeValue?.value || entry.text;
      if (key && value !== undefined && value !== null) bag[normalizeText(key)] = String(value);
    });
  } else if (raw && typeof raw === 'object') {
    Object.entries(raw).forEach(([k, v]) => { bag[normalizeText(k)] = String(v); });
  }
  return bag;
}

function findSpec(product, aliases) {
  const bag = getSpecBag(product);
  const safeAliases = Array.isArray(aliases) ? aliases : [];
  const tokens = safeAliases.map(normalizeText);
  const hit = Object.entries(bag).find(([k]) => tokens.some((t) => t && k.includes(t)));
  return hit?.[1] || '';
}

const SPEC_ALIASES = {
  coolingType: ['cooling_type', 'loại tản nhiệt', 'loai tan nhiet', 'cooler type'],
  socket: ['socket'],
  ramType: ['ram_type', 'loại ram', 'loai ram', 'memory type', 'ddr']
};

const getProductName = (p) => p?.product_name || p?.name || 'Đang cập nhật';
const getProductBrand = (p) => p?.brand_name || p?.brand?.name || String(getProductName(p)).split(' ')[0] || 'PC Mall';

const p = { product_id: 50, product_name: 'ROG STRIX X670E-F GAMING WIFI', brand_name: 'ASUS' };
const text = `${getProductName(p)} ${getProductBrand(p)} ${findSpec(p, SPEC_ALIASES.coolingType)} ${findSpec(p, SPEC_ALIASES.socket)} ${findSpec(p, SPEC_ALIASES.ramType)}`;
console.log('Resulting text string:', JSON.stringify(text));
console.log('NormalizeText(text):', JSON.stringify(normalizeText(text)));
