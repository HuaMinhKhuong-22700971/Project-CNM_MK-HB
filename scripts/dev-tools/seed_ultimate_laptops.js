const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

const downloadFile = async (url, filepath) => {
  console.log(`Downloading ${url}...`);
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const ab = await res.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(ab));
  console.log(`Saved to ${filepath}`);
};

const newLaptops = [
  {
    name: 'Asus ROG G751',
    slug: 'asus-rog-g751-gaming',
    description: 'Classic reliable gaming laptop with excellent cooling and robust performance.',
    price: 35000000,
    brandName: 'ASUS',
    sku: 'ASUS-ROG-G751',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Asus_ROG_G751JT_gaming_laptop.jpg/640px-Asus_ROG_G751JT_gaming_laptop.jpg',
    filename: 'asus-g751-gaming.jpg',
    specs: {
      'CPU': 'Intel Core i7-4710HQ',
      'RAM': '16GB DDR3L',
      'Storage': '1TB HDD + 256GB SSD',
      'GPU': 'NVIDIA GeForce GTX 970M',
      'Screen': '17.3" FHD (1920x1080)'
    }
  },
  {
    name: 'Lenovo ThinkPad X1 Carbon',
    slug: 'lenovo-thinkpad-x1-carbon',
    description: 'Ultra-thin, ultra-light, ultra-tough. For the average business professional.',
    price: 42000000,
    brandName: 'Lenovo',
    sku: 'LENOVO-TP-X1',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/ThinkPad_X1_Carbon_3rd_generation.jpg/640px-ThinkPad_X1_Carbon_3rd_generation.jpg',
    filename: 'lenovo-x1.jpg',
    specs: {
      'CPU': 'Intel Core i7-8550U',
      'RAM': '16GB LPDDR3',
      'Storage': '512GB NVMe SSD',
      'GPU': 'Intel UHD Graphics 620',
      'Screen': '14.0" WQHD (2560x1440)'
    }
  },
  {
    name: 'Dell Alienware 15',
    slug: 'dell-alienware-15',
    description: 'High-end gaming laptop from Dell with iconic design.',
    price: 55000000,
    brandName: 'Dell',
    sku: 'DELL-AW-15',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Alienware_15_gaming_laptop.jpg/640px-Alienware_15_gaming_laptop.jpg',
    filename: 'dell-aw15.jpg',
    specs: {
      'CPU': 'Intel Core i7-8750H',
      'RAM': '32GB DDR4',
      'Storage': '1TB NVMe SSD',
      'GPU': 'NVIDIA GeForce GTX 1070',
      'Screen': '15.6" FHD 120Hz'
    }
  },
  {
    name: 'HP Spectre x360',
    slug: 'hp-spectre-x360',
    description: 'Premium 2-in-1 convertible laptop with a stunning gem-cut design.',
    price: 36000000,
    brandName: 'HP',
    sku: 'HP-SPECTRE-X360',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/HP_Spectre_x360.jpg/640px-HP_Spectre_x360.jpg',
    filename: 'hp-spectre.jpg',
    specs: {
      'CPU': 'Intel Core i7-1065G7',
      'RAM': '16GB LPDDR4x',
      'Storage': '512GB NVMe SSD + 32GB Optane',
      'GPU': 'Intel Iris Plus Graphics',
      'Screen': '13.3" 4K UHD AMOLED Touch'
    }
  },
  {
    name: 'Razer Blade 15',
    slug: 'razer-blade-15',
    description: 'The world\'s smallest 15.6" gaming laptop. Power packed in a CNC aluminum body.',
    price: 65000000,
    brandName: 'Razer',
    sku: 'RAZER-BLADE-15',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Razer_Blade_14.jpg/640px-Razer_Blade_14.jpg',
    filename: 'razer-blade.jpg',
    specs: {
      'CPU': 'Intel Core i7-10875H',
      'RAM': '16GB DDR4-2933',
      'Storage': '1TB NVMe SSD',
      'GPU': 'NVIDIA GeForce RTX 2080 SUPER Max-Q',
      'Screen': '15.6" FHD 300Hz'
    }
  }
];

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    const [cats] = await connection.execute('SELECT id FROM categories WHERE name = "LAPTOP"');
    const categoryId = cats[0].id;

    async function getOrInsertAttribute(name) {
      const [rows] = await connection.execute('SELECT id FROM attributes WHERE name = ?', [name]);
      if (rows.length > 0) return rows[0].id;
      const [ins] = await connection.execute('INSERT INTO attributes (name) VALUES (?)', [name]);
      return ins.insertId;
    }

    async function getOrInsertAttrValue(attrId, value) {
      const [rows] = await connection.execute('SELECT id FROM attribute_values WHERE attribute_id = ? AND value = ?', [attrId, value]);
      if (rows.length > 0) return rows[0].id;
      const [ins] = await connection.execute('INSERT INTO attribute_values (attribute_id, value) VALUES (?, ?)', [attrId, value]);
      return ins.insertId;
    }

    for (const laptop of newLaptops) {
      // 1. Install Brand
      const [brands] = await connection.execute('SELECT id FROM brands WHERE name = ?', [laptop.brandName]);
      let brandId;
      if (brands.length > 0) brandId = brands[0].id;
      else {
        const [insertBrand] = await connection.execute('INSERT INTO brands (name, slug, is_active) VALUES (?, ?, 1)', [laptop.brandName, laptop.slug]);
        brandId = insertBrand.insertId;
      }

      // 2. Download Image
      const assetPath = path.join(__dirname, 'apps/web/public/assets/products', laptop.filename);
      const publicUrl = `/assets/products/${laptop.filename}`;
      try {
        await downloadFile(laptop.imgUrl, assetPath);
      } catch (e) {
        console.error('Download failed for ' + laptop.name + '. Using fallback.');
      }

      // 3. Skip if existing
      const [existing] = await connection.execute('SELECT id FROM products WHERE slug = ?', [laptop.slug]);
      if (existing.length > 0) {
         console.log(`Skipping ${laptop.name}, already seeded.`);
         continue;
      }

      // 4. Insert Product
      const [pHeader] = await connection.execute(
        `INSERT INTO products (name, slug, description, price, category_id, brand_id, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [laptop.name, laptop.slug, laptop.description, laptop.price, categoryId, brandId]
      );
      const pId = pHeader.insertId;

      // 5. Insert SKU & Variant
      const [skuRes] = await connection.execute(
        `INSERT INTO product_skus (product_id, sku, price, image_url) VALUES (?, ?, ?, ?)`, 
        [pId, laptop.sku, laptop.price, publicUrl]
      );
      await connection.execute(
        `INSERT INTO product_variants (product_id, sku, price, is_active, stock_quantity, image_url) VALUES (?, ?, ?, 1, 50, ?)`, 
        [pId, laptop.sku, laptop.price, publicUrl]
      );

      const skuId = skuRes.insertId;

      // 6. Bind Attributes
      for (const [key, val] of Object.entries(laptop.specs)) {
        const attrId = await getOrInsertAttribute(key);
        const attrValId = await getOrInsertAttrValue(attrId, val);
        await connection.execute(`INSERT INTO sku_attributes (sku_id, attribute_value_id) VALUES (?, ?)`, [skuId, attrValId]);
      }

      console.log(`Successfully seeded ${laptop.name} with ${Object.keys(laptop.specs).length} specs!`);
    }

    console.log('Ultimate Seeding Completed!');
  } finally {
    await connection.end();
  }
}

seed();
