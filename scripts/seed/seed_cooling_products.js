/**
 * Seed Cooling Category & Products
 * Bổ sung danh mục COOLING (id=8) và 10 sản phẩm Tản Nhiệt (Air / AIO) vào DB cnm_ecommerce.
 */
const mysql = require("mysql2/promise");

const DB_CONFIG = {
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "",
  database: "cnm_ecommerce",
};

const COOLING_PRODUCTS = [
  {
    name: "Thermalright Peerless Assassin 120 SE",
    price: 950000,
    brand: "Thermalright",
    stock: 25,
    description: "Tản nhiệt khí Dual Tower hiệu năng cực cao 6 ống đồng",
    specs: {
      socket_support: "LGA1700, AM5, AM4, LGA1200",
      cooling_capacity: "240W",
      cooler_height: "155mm",
      cooling_type: "Air Cooler"
    }
  },
  {
    name: "Deepcool AK620 Digital ARGB",
    price: 1650000,
    brand: "Deepcool",
    stock: 20,
    description: "Tản nhiệt khí tháp đôi màn hình hiển thị nhiệt độ Realtime",
    specs: {
      socket_support: "LGA1700, AM5, AM4",
      cooling_capacity: "260W",
      cooler_height: "162mm",
      cooling_type: "Air Cooler"
    }
  },
  {
    name: "Noctua NH-D15 chromax.black",
    price: 2990000,
    brand: "Noctua",
    stock: 15,
    description: "Vua tản nhiệt khí êm ái hàng đầu thế giới 140mm Dual Fan",
    specs: {
      socket_support: "LGA1700, AM5, AM4, LGA1200",
      cooling_capacity: "280W",
      cooler_height: "165mm",
      cooling_type: "Air Cooler"
    }
  },
  {
    name: "Deepcool LT720 360mm AIO ARGB",
    price: 3250000,
    brand: "Deepcool",
    stock: 18,
    description: "Tản nhiệt nước AIO 360mm Bơm thế hệ 4 thiết kế gương vô cực",
    specs: {
      socket_support: "LGA1700, AM5, AM4",
      cooling_capacity: "300W",
      radiator_size: "360mm",
      cooling_type: "AIO 360mm"
    }
  },
  {
    name: "NZXT Kraken Elite 360 RGB Black",
    price: 7200000,
    brand: "NZXT",
    stock: 10,
    description: "Tản nhiệt nước AIO Màn hình LCD 2.36 inch tùy biến GIF",
    specs: {
      socket_support: "LGA1700, AM5, AM4",
      cooling_capacity: "320W",
      radiator_size: "360mm",
      cooling_type: "AIO 360mm"
    }
  },
  {
    name: "Corsair iCUE H150i Elite Capellix XT",
    price: 5200000,
    brand: "Corsair",
    stock: 12,
    description: "Tản nhiệt nước AIO 360mm Quạt AF120 RGB ELITE mượt mà",
    specs: {
      socket_support: "LGA1700, AM5, AM4",
      cooling_capacity: "300W",
      radiator_size: "360mm",
      cooling_type: "AIO 360mm"
    }
  },
  {
    name: "Cooler Master MasterLiquid 240L Core ARGB",
    price: 1850000,
    brand: "Cooler Master",
    stock: 22,
    description: "Tản nhiệt nước AIO 240mm Bơm buồng đôi nâng cấp",
    specs: {
      socket_support: "LGA1700, AM5, AM4, LGA1200",
      cooling_capacity: "230W",
      radiator_size: "240mm",
      cooling_type: "AIO 240mm"
    }
  },
  {
    name: "Thermalright Aqua Elite 240 V3 ARGB",
    price: 1250000,
    brand: "Thermalright",
    stock: 30,
    description: "Tản nhiệt nước AIO 240mm Quốc Dân P/P vô địch",
    specs: {
      socket_support: "LGA1700, AM5, AM4",
      cooling_capacity: "220W",
      radiator_size: "240mm",
      cooling_type: "AIO 240mm"
    }
  },
  {
    name: "Lian Li Galahad II Trinity Performance 360",
    price: 4500000,
    brand: "Lian Li",
    stock: 14,
    description: "Tản nhiệt nước AIO 360mm Bơm siêu mạnh 4200 RPM",
    specs: {
      socket_support: "LGA1700, AM5, AM4",
      cooling_capacity: "330W",
      radiator_size: "360mm",
      cooling_type: "AIO 360mm"
    }
  },
  {
    name: "ID-COOLING SE-214-XT ARGB",
    price: 450000,
    brand: "ID-COOLING",
    stock: 40,
    description: "Tản nhiệt khí đơn 4 ống đồng ngon bổ rẻ cho i3/i5/Ryzen 5",
    specs: {
      socket_support: "LGA1700, AM5, AM4, LGA1200",
      cooling_capacity: "180W",
      cooler_height: "150mm",
      cooling_type: "Air Cooler"
    }
  }
];

async function seedCooling() {
  const conn = await mysql.createConnection(DB_CONFIG);
  console.log("✅ Connected to DB");

  // 1. Ensure COOLING category exists
  let coolingCatId = 8;
  const [catRows] = await conn.execute("SELECT id FROM categories WHERE UPPER(name) = 'COOLING' LIMIT 1");
  if (catRows.length > 0) {
    coolingCatId = catRows[0].id;
    console.log(`✅ Category COOLING found (id=${coolingCatId})`);
  } else {
    const [res] = await conn.execute("INSERT INTO categories (name) VALUES ('COOLING')");
    coolingCatId = res.insertId;
    console.log(`✅ Created Category COOLING (id=${coolingCatId})`);
  }

  // 2. Insert Products & SKUs & Specs
  for (const prod of COOLING_PRODUCTS) {
    // Check if product exists
    const [existingP] = await conn.execute("SELECT id FROM products WHERE name = ? LIMIT 1", [prod.name]);
    let productId;
    if (existingP.length > 0) {
      productId = existingP[0].id;
      console.log(`  Updating existing product [id=${productId}] ${prod.name}`);
      await conn.execute("UPDATE products SET category_id = ?, price = ? WHERE id = ?", [coolingCatId, prod.price, productId]);
    } else {
      const slug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const [resP] = await conn.execute(
        "INSERT INTO products (name, slug, category_id, price, description) VALUES (?, ?, ?, ?, ?)",
        [prod.name, slug, coolingCatId, prod.price, prod.description]
      );
      productId = resP.insertId;
      console.log(`  Created product [id=${productId}] ${prod.name}`);
    }

    // Check SKU
    const [existingSku] = await conn.execute("SELECT id FROM product_skus WHERE product_id = ? LIMIT 1", [productId]);
    let skuId;
    if (existingSku.length > 0) {
      skuId = existingSku[0].id;
      await conn.execute("UPDATE product_skus SET price = ?, stock = ? WHERE id = ?", [prod.price, prod.stock, skuId]);
    } else {
      const skuCode = `COOL-${productId}`;
      const [resSku] = await conn.execute(
        "INSERT INTO product_skus (product_id, sku, price, stock) VALUES (?, ?, ?, ?)",
        [productId, skuCode, prod.price, prod.stock]
      );
      skuId = resSku.insertId;
    }

    // Upsert Attributes
    for (const [attrName, attrValue] of Object.entries(prod.specs)) {
      // Attribute
      let attrId;
      const [aRows] = await conn.execute("SELECT id FROM attributes WHERE name = ? LIMIT 1", [attrName]);
      if (aRows.length > 0) attrId = aRows[0].id;
      else {
        const [resA] = await conn.execute("INSERT INTO attributes (name) VALUES (?)", [attrName]);
        attrId = resA.insertId;
      }

      // Attribute Value
      let attrValId;
      const [vRows] = await conn.execute("SELECT id FROM attribute_values WHERE attribute_id = ? AND value = ? LIMIT 1", [attrId, attrValue]);
      if (vRows.length > 0) attrValId = vRows[0].id;
      else {
        const [resV] = await conn.execute("INSERT INTO attribute_values (attribute_id, value) VALUES (?, ?)", [attrId, attrValue]);
        attrValId = resV.insertId;
      }

      // SKU Attribute
      const [saRows] = await conn.execute(
        `SELECT sa.id FROM sku_attributes sa
         JOIN attribute_values av ON av.id = sa.attribute_value_id
         WHERE sa.sku_id = ? AND av.attribute_id = ? LIMIT 1`,
        [skuId, attrId]
      );
      if (saRows.length > 0) {
        await conn.execute("UPDATE sku_attributes SET attribute_value_id = ? WHERE id = ?", [attrValId, saRows[0].id]);
      } else {
        await conn.execute("INSERT INTO sku_attributes (sku_id, attribute_value_id) VALUES (?, ?)", [skuId, attrValId]);
      }
    }
  }

  console.log("\n✅ Cooling Seeder completed successfully!");
  await conn.end();
}

seedCooling().catch(console.error);
