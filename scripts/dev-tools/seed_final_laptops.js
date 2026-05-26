const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

const downloadFile = async (url, filepath) => {
  console.log(`Downloading ${url}...`);
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const ab = await res.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(ab));
  console.log(`Saved to ${filepath}`);
};

const newLaptops = [
  {
    name: 'ASUS ROG Gaming G751',
    slug: 'asus-rog-g751',
    description: 'Classic reliable gaming laptop with excellent cooling.',
    price: 35000000,
    brandName: 'ASUS',
    sku: 'ASUS-ROG-G751',
    stock: 5,
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Asus_ROG_G751JT_gaming_laptop.jpg/640px-Asus_ROG_G751JT_gaming_laptop.jpg',
    filename: 'asus-g751.jpg'
  },
  {
    name: 'Acer Aspire One Classic',
    slug: 'acer-aspire-one',
    description: 'Compact and affordable netbook for daily tasks.',
    price: 18500000,
    brandName: 'Acer',
    sku: 'ACER-ASPIRE-ONE',
    stock: 12,
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Acer_Aspire_One.jpg/640px-Acer_Aspire_One.jpg',
    filename: 'acer-aspire.jpg'
  },
  {
    name: 'Lenovo Essential G500s',
    slug: 'lenovo-g500s',
    description: 'Versatile and thin desktop replacement laptop.',
    price: 32000000,
    brandName: 'Lenovo',
    sku: 'LENOVO-G500S',
    stock: 8,
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Lenovo_G500s_laptop.JPG/640px-Lenovo_G500s_laptop.JPG',
    filename: 'lenovo-g500s.jpg'
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
    // 1. Fix Dell XPS 15 variant image permanently
    await connection.execute(`UPDATE product_variants SET image_url = '/assets/products/dell.png' WHERE product_id = 102`);
    console.log('Fixed Dell XPS variant image.');

    // 2. Wipe bad laptops (ones we just inserted)
    const [badRows] = await connection.execute('SELECT id FROM products WHERE slug IN ("asus-rog-zephyrus-g14-2024", "acer-nitro-5-tiger", "lenovo-legion-5-pro", "hp-omen-16")');
    if (badRows.length > 0) {
      const badIds = badRows.map(r => r.id).join(',');
      await connection.execute(`DELETE FROM product_skus WHERE product_id IN (${badIds})`);
      await connection.execute(`DELETE FROM product_variants WHERE product_id IN (${badIds})`);
      await connection.execute(`DELETE FROM products WHERE id IN (${badIds})`);
      console.log('Wiped bad seeded laptops.');
    }

    // 3. Get category ID
    const [cats] = await connection.execute('SELECT id FROM categories WHERE name = "LAPTOP"');
    const categoryId = cats[0].id;

    // 4. Seed new reliable laptops
    for (const laptop of newLaptops) {
      const [brands] = await connection.execute('SELECT id FROM brands WHERE name = ?', [laptop.brandName]);
      let brandId;
      if (brands.length > 0) brandId = brands[0].id;
      else {
        const [insertBrand] = await connection.execute('INSERT INTO brands (name, slug, is_active) VALUES (?, ?, 1)', [laptop.brandName, laptop.brandName.toLowerCase()]);
        brandId = insertBrand.insertId;
      }

      const assetPath = path.join(__dirname, 'apps/web/public/assets/products', laptop.filename);
      const publicUrl = `/assets/products/${laptop.filename}`;
      
      try {
        await downloadFile(laptop.imgUrl, assetPath);
      } catch (e) {
        console.error('Download failed for ' + laptop.name, e);
        continue;
      }

      const [existing] = await connection.execute('SELECT id FROM products WHERE slug = ?', [laptop.slug]);
      if (existing.length === 0) {
        const [pHeader] = await connection.execute(
          `INSERT INTO products (name, slug, description, price, category_id, brand_id, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)`,
          [laptop.name, laptop.slug, laptop.description, laptop.price, categoryId, brandId]
        );
        const pId = pHeader.insertId;
        await connection.execute(`INSERT INTO product_skus (product_id, sku, price, image_url) VALUES (?, ?, ?, ?)`, [pId, laptop.sku, laptop.price, publicUrl]);
        await connection.execute(`INSERT INTO product_variants (product_id, sku, price, is_active, image_url) VALUES (?, ?, ?, 1, ?)`, [pId, laptop.sku, laptop.price, publicUrl]);
        console.log(`Seeded ${laptop.name} successfully.`);
      }
    }

    console.log('Done!');
  } finally {
    await connection.end();
  }
}

seed();
