const path = require('path');
// Mock the environment to point to the correct DB
process.env.DB_NAME = 'cnm_ecommerce';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';

// Fix path to be relative to this file (scratch/debug_filter.js)
const productsService = require('../services/api/src/modules/products/products.service');

async function test() {
  try {
    // Test with category_id 1 (CPU)
    console.log('--- Testing category_id: 1 ---');
    const result = await productsService.getProducts({ category_id: 1 });
    console.log('Total Items found:', result.pagination.totalItems);
    result.items.forEach(item => {
        console.log(`- ${item.product_name} (Cat ID: ${item.category_id})`);
    });

    // Test with category_id 7 (CASE)
    console.log('\n--- Testing category_id: 7 ---');
    const result2 = await productsService.getProducts({ category_id: 7 });
    console.log('Total Items found:', result2.pagination.totalItems);
    result2.items.forEach(item => {
        console.log(`- ${item.product_name} (Cat ID: ${item.category_id})`);
    });

  } catch (err) {
    console.error('Error during test:', err);
  }
  process.exit();
}

test();
