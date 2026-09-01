const mysql = require("mysql2/promise");

async function checkCooling() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1", port: 3306, user: "root", password: "", database: "cnm_ecommerce"
  });

  const [cats] = await conn.execute("SELECT id, name FROM categories");
  console.log("Categories in DB:", cats);

  const [prods] = await conn.execute([
    "SELECT p.id, p.name, c.name as cat",
    "FROM products p",
    "JOIN categories c ON c.id = p.category_id",
    "WHERE UPPER(c.name) LIKE '%COOL%'",
    "   OR UPPER(p.name) LIKE '%COOLER%'",
    "   OR UPPER(p.name) LIKE '%AIO%'",
    "   OR UPPER(p.name) LIKE '%DEEPCOOL%'",
    "   OR UPPER(p.name) LIKE '%LIAN LI%'",
    "   OR UPPER(p.name) LIKE '%THERMALRIGHT%'"
  ].join(" "));

  console.log("\nCooling-related products found:", prods.length);
  prods.forEach(p => console.log(`  [id=${p.id}] [cat=${p.cat}] ${p.name}`));

  await conn.end();
}

checkCooling().catch(console.error);
