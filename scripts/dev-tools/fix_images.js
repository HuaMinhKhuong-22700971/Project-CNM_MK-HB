const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'services/api/.env') });

async function fixImages() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cnm_ecommerce',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('Connecting to database...');
    
    const updates = [
      {
        sku: 'MACBOOK-AIR-M3-13-8G-256G',
        url: 'https://images.clothes.com.vn/api/images/macbook-air-m3.jpg?w=800' // Using a placeholder or stable URL
      },
      {
        sku: 'DELL-XPS-15-9530-I7-32G',
        url: 'https://images.clothes.com.vn/api/images/dell-xps.jpg?w=800'
      },
      {
        sku: 'INTEL-CORE-I5-14400F',
        url: 'https://ark.intel.com/content/dam/www/public/us/en/images/product-logos/intel-core-i5-logo-vertical-blue-background.png'
      },
      {
        sku: 'AMD-RYZEN-5-7600',
        url: 'https://www.amd.com/system/files/2022-12/1792694-ryzen-5-7600-product-fr-angle.png'
      }
    ];

    // Better strategy: Use reliable cloud storage or just some very stable direct URLs
    const macbookUrl = 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/macbook-air-midnight-select-202403?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1707425930960';
    const dellUrl = 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/black/laptop-xps-15-9530-t-black-gallery-1.psd?fmt=png-alpha&wid=600';
    const cpuUrl = 'https://www.intel.com/content/dam/www/central-libraries/us/en/images/i5-14400f-boxed-front-view.png';

    await connection.execute("UPDATE product_skus SET image_url = '/assets/products/macbook.png' WHERE sku LIKE '%MACBOOK-AIR-M3%'");
    await connection.execute("UPDATE product_skus SET image_url = '/assets/products/dell.png' WHERE sku LIKE '%DELL-XPS-15%'");
    await connection.execute("UPDATE product_skus SET image_url = '/assets/products/i5.png' WHERE sku LIKE '%I5-14400F%' OR sku LIKE '%I5-12400%'");
    await connection.execute("UPDATE product_skus SET image_url = '/assets/products/rtx4060.png' WHERE sku LIKE '%RTX-4060%'");
    
    await connection.execute("UPDATE product_variants SET image_url = '/assets/products/macbook.png' WHERE sku LIKE '%MACBOOK-AIR-M3%'");
    await connection.execute("UPDATE product_variants SET image_url = '/assets/products/dell.png' WHERE sku LIKE '%DELL-XPS-15%'");
    await connection.execute("UPDATE product_variants SET image_url = '/assets/products/i5.png' WHERE sku LIKE '%I5-14400F%' OR sku LIKE '%I5-12400%'");
    await connection.execute("UPDATE product_variants SET image_url = '/assets/products/rtx4060.png' WHERE sku LIKE '%RTX-4060%'");

    console.log('Images fixed successfully!');
  } catch (err) {
    console.error('Failed to fix images:', err);
  } finally {
    await connection.end();
  }
}

fixImages();
