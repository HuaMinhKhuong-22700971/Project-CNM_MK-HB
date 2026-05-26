const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else if (res.statusCode === 301 || res.statusCode === 302) {
          https.get(res.headers.location, (redirectRes) => {
               redirectRes.pipe(fs.createWriteStream(filepath))
                .on('error', reject)
                .once('close', () => resolve(filepath));
          });
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
};

const newLaptops = [
  {
    name: 'ASUS ROG Zephyrus G14 (2024)',
    slug: 'asus-rog-zephyrus-g14-2024',
    description: 'Gaming laptop with AMD Ryzen 9 and RTX 4070.',
    price: 35000000,
    brandName: 'ASUS',
    sku: 'ASUS-ROG-G14-R9-4070',
    stock: 5,
    imgUrl: 'https://dlcdnwebimgs.asus.com/gain/770FAEDD-2A2B-4A42-BFB7-1BB6F35ADAF8/w717/h525',
    filename: 'asus-rog.png'
  },
  {
    name: 'Acer Nitro 5 Tiger',
    slug: 'acer-nitro-5-tiger',
    description: 'Affordable gaming laptop with Intel i5 and RTX 3050.',
    price: 18500000,
    brandName: 'Acer',
    sku: 'ACER-NITRO5-I5-3050',
    stock: 12,
    imgUrl: 'https://images.acer.com/is/image/acer/nitro-5-an515-58-rgb-kb-black-01',
    filename: 'acer-nitro.png'
  },
  {
    name: 'Lenovo Legion 5 Pro',
    slug: 'lenovo-legion-5-pro',
    description: 'High performance gaming laptop with WQXGA display.',
    price: 32000000,
    brandName: 'Lenovo',
    sku: 'LENOVO-LEGION5-PRO',
    stock: 8,
    imgUrl: 'https://p2-ofp.static.pub/fes/cms/2022/01/20/mnh2ndy5c84d5m002ksd8zstg0ncyg371089.png',
    filename: 'lenovo-legion.png'
  },
  {
    name: 'HP Omen 16',
    slug: 'hp-omen-16',
    description: 'Sleek gaming laptop with premium build and cooling.',
    price: 29500000,
    brandName: 'HP',
    sku: 'HP-OMEN-16-GAMING',
    stock: 6,
    imgUrl: 'https://ssl-product-images.www8-hp.com/digmedialib/prodimg/res/c08477028/70/416x299/65/c08477028.png',
    filename: 'hp-omen.png'
  }
];

async function seedMore() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cnm_ecommerce',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('Connecting to database...');
    
    // 1. Fix Dell Image mapping - check Dell's product ID & SKU
    const [dells] = await connection.execute('SELECT id, name FROM products WHERE name LIKE "%Dell XPS%"');
    if (dells.length > 0) {
      const dellId = dells[0].id;
      await connection.execute(`UPDATE product_skus SET image_url = '/assets/products/dell.png' WHERE product_id = ?`, [dellId]);
      
      const [skusInfo] = await connection.execute('SELECT sku FROM product_skus WHERE product_id = ?', [dellId]);
      if(skusInfo.length > 0) {
        await connection.execute(`UPDATE product_variants SET image_url = '/assets/products/dell.png' WHERE sku = ?`, [skusInfo[0].sku]);
      }
      console.log('Dell XPS image explicitly fixed. ID:', dellId);
    }

    // 2. Fetch category 'LAPTOP'
    const [cats] = await connection.execute('SELECT id FROM categories WHERE name = "LAPTOP"');
    if (cats.length === 0) throw new Error("LAPTOP category not found");
    const categoryId = cats[0].id;

    // 3. Process new laptops
    for (const laptop of newLaptops) {
      // Create Brand if not exists
      let brandId;
      const [brands] = await connection.execute('SELECT id FROM brands WHERE name = ?', [laptop.brandName]);
      if (brands.length > 0) {
        brandId = brands[0].id;
      } else {
        const [insertBrand] = await connection.execute('INSERT INTO brands (name, slug, is_active) VALUES (?, ?, 1)', [laptop.brandName, laptop.brandName.toLowerCase()]);
        brandId = insertBrand.insertId;
      }

      // Download Image
      const assetPath = path.join(__dirname, 'apps/web/public/assets/products', laptop.filename);
      const publicUrl = `/assets/products/${laptop.filename}`;
      try {
        console.log(`Downloading ${laptop.imgUrl}...`);
        await downloadImage(laptop.imgUrl, assetPath);
        console.log(`Saved as ${publicUrl}`);
      } catch (e) {
        console.error(`Failed to download ${laptop.filename}:`, e.message);
        continue; 
      }

      // Check if product already exists
      const [existing] = await connection.execute('SELECT id FROM products WHERE slug = ?', [laptop.slug]);
      if (existing.length > 0) {
        console.log(`Skipping ${laptop.name}, already exists...`);
        continue;
      }

      // Insert Product
      console.log(`Inserting ${laptop.name}...`);
      const [productHeader] = await connection.execute(
        `INSERT INTO products (name, slug, description, price, category_id, brand_id, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [laptop.name, laptop.slug, laptop.description, laptop.price, categoryId, brandId]
      );
      const productId = productHeader.insertId;

      // Insert SKU
      await connection.execute(
        `INSERT INTO product_skus (product_id, sku, price, image_url) VALUES (?, ?, ?, ?)`,
        [productId, laptop.sku, laptop.price, publicUrl]
      );

      // Insert Variant
      await connection.execute(
        `INSERT INTO product_variants (product_id, sku, price, is_active, image_url) VALUES (?, ?, ?, 1, ?)`,
        [productId, laptop.sku, laptop.price, publicUrl]
      );
    }

    console.log('Successfully expanded catalog with more laptops and fixed Dell image!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await connection.end();
  }
}

seedMore();
