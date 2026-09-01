const mysql = require("mysql2/promise");

async function inspect() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1", port: 3306, user: "root", password: "", database: "cnm_ecommerce"
  });

  // Table structures
  const tables = ["attributes", "attribute_values", "sku_attributes"];
  for (const t of tables) {
    const [cols] = await conn.execute("DESCRIBE " + t);
    console.log("\n=== " + t + " ===");
    cols.forEach(c => console.log("  " + c.Field + " (" + c.Type + ") " + (c.Key || "")));
  }

  // Sample existing attributes
  const [attrs] = await conn.execute("SELECT id, name FROM attributes ORDER BY id LIMIT 30");
  console.log("\n=== Existing Attributes ===");
  attrs.forEach(a => console.log("  [" + a.id + "] " + a.name));

  // Sample attribute_values
  const [avs] = await conn.execute("SELECT av.id, a.name as attr, av.value FROM attribute_values av JOIN attributes a ON a.id = av.attribute_id LIMIT 30");
  console.log("\n=== Sample Attribute Values ===");
  avs.forEach(av => console.log("  [" + av.id + "] " + av.attr + " = " + av.value));

  // All products with SKU ids, grouped by category
  const [prods] = await conn.execute([
    "SELECT c.name as cat, p.id as pid, p.name as pname, s.id as sid, s.sku, s.price",
    "FROM products p",
    "JOIN categories c ON c.id = p.category_id",
    "JOIN product_skus s ON s.product_id = p.id",
    "WHERE UPPER(c.name) IN ('CPU','MAINBOARD','RAM','GPU','STORAGE','PSU','CASE','COOLING')",
    "ORDER BY c.name, p.name, s.id"
  ].join(" "));

  console.log("\n=== Products+SKUs by Category ===");
  const cats = {};
  prods.forEach(r => {
    if (!cats[r.cat]) cats[r.cat] = [];
    cats[r.cat].push({ pid: r.pid, name: r.pname, sid: r.sid, price: r.price });
  });
  Object.entries(cats).forEach(([cat, rows]) => {
    console.log("\n  [" + cat + "] (" + rows.length + " SKUs):");
    rows.forEach(r => console.log("    SKU[" + r.sid + "] pid=" + r.pid + " price=" + r.price + " | " + r.name));
  });

  await conn.end();
}

inspect().catch(console.error);
