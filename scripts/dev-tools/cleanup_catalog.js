const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

async function cleanup() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cnm_ecommerce',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('Connecting to database...');
    
    // 1. Identify and remove duplicate products based on name
    const [products] = await connection.execute('SELECT id, name FROM products WHERE name LIKE "%MacBook%" OR name LIKE "%Dell XPS%"');
    const nameMap = {};
    const toDeleteIds = [];

    products.forEach(p => {
      if (nameMap[p.name]) {
        toDeleteIds.push(p.id);
      } else {
        nameMap[p.name] = p.id;
      }
    });

    if (toDeleteIds.length > 0) {
      console.log('Deleting duplicate product IDs:', toDeleteIds);
      // Delete child records first
      await connection.execute(`DELETE FROM product_skus WHERE product_id IN (${toDeleteIds.join(',')})`);
      await connection.execute(`DELETE FROM product_variants WHERE product_id IN (${toDeleteIds.join(',')})`);
      await connection.execute(`DELETE FROM products WHERE id IN (${toDeleteIds.join(',')})`);
    }

    // 2. Fix image URLs for ALL MacBook and Dell products surgically
    await connection.execute("UPDATE product_skus SET image_url = '/assets/products/macbook.png' WHERE sku LIKE '%MACBOOK%' OR sku LIKE '%SKU-101%'");
    await connection.execute("UPDATE product_skus SET image_url = '/assets/products/dell.png' WHERE sku LIKE '%DELL%' OR sku LIKE '%SKU-102%'");
    await connection.execute("UPDATE product_variants SET image_url = '/assets/products/macbook.png' WHERE sku LIKE '%MACBOOK%' OR sku LIKE '%SKU-101%'");
    await connection.execute("UPDATE product_variants SET image_url = '/assets/products/dell.png' WHERE sku LIKE '%DELL%' OR sku LIKE '%SKU-102%'");

    // 3. Deduplicate Categories
    const [categories] = await connection.execute('SELECT id, name FROM categories');
    const catMap = {};
    const catToDelete = [];
    const catKeepMap = {}; // name -> keptId

    categories.forEach(c => {
      const upperName = c.name.toUpperCase();
      if (catMap[upperName]) {
        catToDelete.push(c.id);
      } else {
        catMap[upperName] = c.id;
        catKeepMap[upperName] = c.id;
      }
    });

    if (catToDelete.length > 0) {
      console.log('Deleting duplicate category IDs:', catToDelete);
      // Re-map products to the kept category ID
      for (const [name, keptId] of Object.entries(catKeepMap)) {
        await connection.execute('UPDATE products SET category_id = ? WHERE category_id IN (SELECT id FROM (SELECT id FROM categories WHERE UPPER(name) = ?) as t) AND category_id != ?', [keptId, name, keptId]);
      }
      await connection.execute(`DELETE FROM categories WHERE id IN (${catToDelete.join(',')})`);
    }

    // 4. Deduplicate Brands
    const [brands] = await connection.execute('SELECT id, name FROM brands');
    const brandMap = {};
    const brandToDelete = [];
    const brandKeepMap = {};

    brands.forEach(b => {
      const upperName = b.name.toUpperCase();
      if (brandMap[upperName]) {
        brandToDelete.push(b.id);
      } else {
        brandMap[upperName] = b.id;
        brandKeepMap[upperName] = b.id;
      }
    });

    if (brandToDelete.length > 0) {
      console.log('Deleting duplicate brand IDs:', brandToDelete);
      for (const [name, keptId] of Object.entries(brandKeepMap)) {
        await connection.execute('UPDATE products SET brand_id = ? WHERE brand_id IN (SELECT id FROM (SELECT id FROM brands WHERE UPPER(name) = ?) as t) AND brand_id != ?', [keptId, name, keptId]);
      }
      await connection.execute(`DELETE FROM brands WHERE id IN (${brandToDelete.join(',')})`);
    }

    // Processors and GPUs
    await connection.execute("UPDATE product_skus SET image_url = '/assets/products/i5.png' WHERE sku LIKE '%I5-14400F%' OR sku LIKE '%I5-12400%'");
    await connection.execute("UPDATE product_variants SET image_url = '/assets/products/i5.png' WHERE sku LIKE '%I5-14400F%' OR sku LIKE '%I5-12400%'");
    await connection.execute("UPDATE product_skus SET image_url = '/assets/products/rtx4060.png' WHERE sku LIKE '%RTX-4060%'");
    await connection.execute("UPDATE product_variants SET image_url = '/assets/products/rtx4060.png' WHERE sku LIKE '%RTX-4060%'");

    console.log('Ultimate cleanup and image fix complete!');
  } catch (err) {
    console.error('Cleanup failed:', err);
  } finally {
    await connection.end();
  }
}

cleanup();
