const { query } = require("../config/database");
const { getTableColumns } = require("../utils/schema-helpers");

let auditLogTableAvailable = null;

async function hasAuditLogTable() {
  if (auditLogTableAvailable !== null) {
    return auditLogTableAvailable;
  }

  const columns = await getTableColumns("audit_logs").catch(() => []);
  auditLogTableAvailable = columns.length > 0;
  return auditLogTableAvailable;
}

async function recordAuditLog(entry = {}) {
  try {
    const available = await hasAuditLogTable();
    if (!available) {
      return null;
    }

    await query(
      `
        INSERT INTO audit_logs (
          actor_user_id,
          actor_role,
          action,
          entity_type,
          entity_id,
          description,
          metadata_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        entry.actorUserId || null,
        entry.actorRole || null,
        String(entry.action || "UNKNOWN_ACTION"),
        String(entry.entityType || "UNKNOWN_ENTITY"),
        entry.entityId === undefined || entry.entityId === null ? null : String(entry.entityId),
        entry.description ? String(entry.description) : null,
        entry.metadata ? JSON.stringify(entry.metadata) : null
      ]
    );
  } catch (_error) {
    return null;
  }

  return true;
}

async function getRecentAuditLogs(limit = 20) {
  const available = await hasAuditLogTable();
  if (!available) {
    return [];
  }

  const safeLimit = Math.max(1, Math.min(Number(limit || 20), 100));
  const rows = await query(
    `
      SELECT
        id,
        actor_user_id AS actorUserId,
        actor_role AS actorRole,
        action,
        entity_type AS entityType,
        entity_id AS entityId,
        description,
        metadata_json AS metadataJson,
        created_at AS createdAt
      FROM audit_logs
      ORDER BY created_at DESC, id DESC
      LIMIT ?
    `,
    [safeLimit]
  );

  return rows.map((row) => ({
    ...row,
    metadata: row.metadataJson ? JSON.parse(row.metadataJson) : null
  }));
}

module.exports = {
  recordAuditLog,
  getRecentAuditLogs
};
