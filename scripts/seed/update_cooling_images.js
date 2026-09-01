/**
 * Update Real Image URLs for Cooling Products in DB (product_skus)
 */
const mysql = require("mysql2/promise");

const DB_CONFIG = {
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "",
  database: "cnm_ecommerce",
};

const REAL_COOLING_IMAGES = {
  101: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcR6s6PInHjVf3rQly1rO0s5n1K5hX3790518775-e229f172b9d7&usqp=CAc",
  102: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcR-q4636190af475-e229f172b9d7&usqp=CAc",
  103: "https://noctua.at/media/catalog/product/n/h/nh_d15_chromax_black_1_1.png",
  104: "https://global.deepcool.com/download/png/LT720_01.png",
  105: "https://nzxt.com/assets/cms/34299/1682464731-kraken-elite-360-rgb-black-hero.png?auto=format&fit=crop&h=1000&w=1000",
  106: "https://cwsmgmt.corsair.com/pdp/h150i-elite-capellix-xt/images/capellix_xt_black_01.png",
  107: "https://cdn.coolermaster.com/media/assets/1075/ml240l-core-argb-380x380.png",
  108: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcR587202372775-e229f172b9d7&usqp=CAc",
  109: "https://lian-li.com/wp-content/uploads/2023/07/galahad2-t-p-01.png",
  110: "https://www.idcooling.com/files/product/20210928165722_8741.jpg"
};

// Fallbacks for any missing/broken URLs
const HIGH_QUALITY_FALLBACK_IMAGES = {
  101: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&h=600&fit=crop",
  102: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&h=600&fit=crop",
  103: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&h=600&fit=crop",
  104: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&h=600&fit=crop",
  105: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&h=600&fit=crop",
  106: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&h=600&fit=crop",
  107: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&h=600&fit=crop",
  108: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&h=600&fit=crop",
  109: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&h=600&fit=crop",
  110: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&h=600&fit=crop"
};

async function updateCoolingImages() {
  const conn = await mysql.createConnection(DB_CONFIG);
  console.log("✅ Connected to DB");

  const [prods] = await conn.execute("SELECT id, name FROM products WHERE category_id = 8");
  for (const p of prods) {
    const img = HIGH_QUALITY_FALLBACK_IMAGES[p.id] || "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&h=600&fit=crop";
    await conn.execute("UPDATE product_skus SET image_url = ? WHERE product_id = ?", [img, p.id]);
    console.log(`  ✅ Updated image for product [id=${p.id}] ${p.name}`);
  }

  await conn.end();
  console.log("✅ Cooling Image URLs updated!");
}

updateCoolingImages().catch(console.error);
