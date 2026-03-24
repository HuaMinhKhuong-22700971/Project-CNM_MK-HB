const { query } = require("../../config/database");
const { createError } = require("../../utils/service-helpers");
const { buildActiveCondition, getTableColumns, pickColumn } = require("../../utils/schema-helpers");

let schemaCache = null;

function mapBrand(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logoUrl
  };
}

async function getSchemaConfig() {
  if (schemaCache) {
    return schemaCache;
  }

  const columns = await getTableColumns("brands");

  if (columns.length === 0) {
    schemaCache = null;
    return null;
  }

  const config = {
    table: "brands",
    id: pickColumn(columns, ["id"]),
    name: pickColumn(columns, ["name"]),
    slug: pickColumn(columns, ["slug"], null),
    logo: pickColumn(columns, ["logo_url", "logo", "image_url"], null),
    sortOrder: pickColumn(columns, ["sort_order", "display_order"], null),
    activeCondition: buildActiveCondition("b", columns)
  };

  if (!config.id || !config.name) {
    throw createError("Brands table does not have the required columns", 500);
  }

  schemaCache = config;
  return config;
}

async function getAllBrands() {
  const config = await getSchemaConfig();

  if (!config) {
    return [];
  }

  const orderParts = [config.sortOrder ? `b.${config.sortOrder} ASC` : null, `b.${config.name} ASC`].filter(Boolean);

  const rows = await query(
    `
      SELECT
        b.${config.id} AS id,
        b.${config.name} AS name,
        ${config.slug ? `b.${config.slug}` : "NULL"} AS slug,
        ${config.logo ? `b.${config.logo}` : "NULL"} AS logoUrl
      FROM ${config.table} b
      WHERE ${config.activeCondition}
      ORDER BY ${orderParts.join(", ")}
    `
  );

  return rows.map(mapBrand);
}

module.exports = {
  getAllBrands
};
