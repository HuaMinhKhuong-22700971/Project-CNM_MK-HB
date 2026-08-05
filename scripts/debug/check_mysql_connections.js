const mysql = require("mysql2/promise");

async function main() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1", port: 3306, user: "root", password: "", database: "cnm_ecommerce", connectTimeout: 5000
  });

  const [cols] = await conn.execute("DESCRIBE products");
  console.log("\n=== products table columns ===");
  cols.forEach(c => console.log(`  ${c.Field} (${c.Type}) ${c.Null === "YES" ? "nullable" : "required"}`));

  const [skuCols] = await conn.execute("DESCRIBE product_skus");
  console.log("\n=== product_skus table columns ===");
  skuCols.forEach(c => console.log(`  ${c.Field} (${c.Type})`));

  const [prods] = await conn.execute(
    `SELECT p.id, p.name, p.price, c.name as category, b.name as brand 
     FROM products p 
     LEFT JOIN categories c ON c.id = p.category_id 
     LEFT JOIN brands b ON b.id = p.brand_id 
     LIMIT 10`
  );
  console.log(`\n=== Sample products (${prods.length}) ===`);
  prods.forEach(p => console.log(`  [${p.id}] ${p.name} | ${p.category} | ${p.brand} | ${p.price}`));

  const [skus] = await conn.execute(
    "SELECT id, product_id, sku, price, stock, image_url FROM product_skus LIMIT 5"
  );
  console.log(`\n=== Sample SKUs ===`);
  skus.forEach(s => console.log(`  SKU[${s.id}] prod=${s.product_id} sku=${s.sku} img=${s.image_url}`));

  const [users] = await conn.execute("SELECT id, email, name FROM users LIMIT 5");
  console.log(`\n=== Users (${users.length}) ===`);
  users.forEach(u => console.log(`  [${u.id}] ${u.email} - ${u.name}`));

  const [cats] = await conn.execute("SELECT id, name FROM categories ORDER BY id");
  console.log(`\n=== Categories (${cats.length}) ===`);
  cats.forEach(c => console.log(`  [${c.id}] ${c.name}`));

  await conn.end();
}

main().catch(console.error);
