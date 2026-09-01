/**
 * Assign Model-Exact Local Image Paths to Cooling Products (Target 8 Products)
 */
const mysql = require("mysql2/promise");

const DB_CONFIG = {
  host: "127.0.0.1",
  port: "3306",
  user: "root",
  password: "",
  database: "cnm_ecommerce",
};

// Target 8 Cooling Products Image Mapping
const PRODUCT_IMAGE_MAP = {
  101: "/assets/products/cooling-real/peerless-120.png",              // Thermalright Peerless Assassin 120 SE
  102: "/assets/products/cooling-real/deepcool-ak620-digital.jpg",     // Deepcool AK620 Digital ARGB
  103: "/assets/products/cooling-real/noctua-d15.png",                // Noctua NH-D15 chromax.black
  104: "/assets/products/cooling-real/deepcool-lt720-360.jpg",         // Deepcool LT720 360mm AIO ARGB
  105: "/assets/products/cooling-real/aio-360.png",                  // NZXT Kraken Elite 360 RGB Black (IMAGE_REVIEW_REQUIRED)
  106: "/assets/products/cooling-real/corsair-h150i-elite-capellix-xt.webp", // Corsair iCUE H150i Elite Capellix XT
  107: "/assets/products/cooling-real/cooler-master-240l-core.png",   // Cooler Master MasterLiquid 240L Core ARGB
  108: "/assets/products/cooling-real/thermalright-aqua-elite-240.jpg" // Thermalright Aqua Elite 240 V3 ARGB
};

async function updateUniqueCoolingImages() {
  const conn = await mysql.createConnection(DB_CONFIG);
  console.log("✅ Connected to DB");

  for (const [productId, imagePath] of Object.entries(PRODUCT_IMAGE_MAP)) {
    await conn.execute("UPDATE product_skus SET image_url = ? WHERE product_id = ?", [imagePath, productId]);
    console.log(`  ✅ Assigned exact image '${imagePath}' to product [id=${productId}]`);
  }

  await conn.end();
  console.log("✅ All target 8 Cooling products assigned exact image assets!");
}

updateUniqueCoolingImages().catch(console.error);
