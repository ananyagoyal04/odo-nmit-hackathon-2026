const { query } = require('../config/mysql');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/audit-logs
 */
const getAuditLogs = asyncHandler(async (req, res) => {
  const sql = `
    SELECT a.*, u.first_name, u.last_name, u.email, u.role
    FROM audit_logs a
    LEFT JOIN users u ON a.actor_id = u.id
    WHERE a.company_id = ?
    ORDER BY a.created_at DESC
    LIMIT 50
  `;
  const rows = await query(sql, [req.companyId]);

  const logs = (rows || []).map((r) => ({
    _id: r.id,
    id: r.id,
    action: r.action,
    targetType: r.target_type,
    targetId: r.target_id,
    metadata: typeof r.metadata === 'string' && r.metadata.startsWith('{') ? JSON.parse(r.metadata) : {},
    ip: r.ip,
    actorId: r.actor_id ? {
      _id: r.actor_id,
      fullName: `${r.first_name} ${r.last_name || ''}`.trim(),
      email: r.email,
      role: r.role
    } : null,
    createdAt: r.created_at
  }));

  res.status(200).json({
    success: true,
    total: logs.length,
    logs
  });
});

module.exports = {
  getAuditLogs
};
