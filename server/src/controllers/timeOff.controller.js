const db = require('../db/queries');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

function normalizeLeaveType(type) {
  if (!type) return 'pto';
  const clean = String(type).toLowerCase().trim();
  if (clean.includes('sick') || clean === 'medical') return 'sick';
  if (clean.includes('paid') || clean.includes('pto') || clean.includes('vacation') || clean.includes('annual') || clean.includes('casual')) return 'pto';
  return 'pto';
}

/**
 * GET /api/time-off/balances or /api/timeoff/balances
 */
const getMyBalances = asyncHandler(async (req, res) => {
  const employeeId = req.query.employeeId || req.user._id;

  if (employeeId !== String(req.user._id) && !['SUPER_ADMIN', 'HR'].includes(req.user.role)) {
    throw ApiError.forbidden('You do not have permission to view this balance.');
  }

  const balance = await db.getLeaveBalance(employeeId, req.companyId);

  res.status(200).json({
    success: true,
    balance,
    balances: balance,
    ptoRemaining: (balance.pto?.total || 24) - (balance.pto?.used || 0),
    sickRemaining: (balance.sick?.total || 10) - (balance.sick?.used || 0)
  });
});

/**
 * POST /api/time-off/request or /api/timeoff
 */
const requestTimeOff = asyncHandler(async (req, res) => {
  const rawType = req.body.leaveType || req.body.type || 'Paid Time Off';
  const { startDate, endDate, days, reason = '' } = req.body;

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < start) {
    throw ApiError.badRequest('End date cannot be earlier than start date.');
  }

  const calculatedDays = Number(days) || Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);

  const normalizedKey = normalizeLeaveType(rawType);
  const balance = await db.getLeaveBalance(req.user._id, req.companyId);
  const typeBalance = balance[normalizedKey] || { total: 24, used: 0 };

  const remaining = typeBalance.total - typeBalance.used;
  if (calculatedDays > remaining) {
    throw ApiError.badRequest(
      `Insufficient ${rawType} balance. Requested: ${calculatedDays} days, Remaining: ${remaining} days.`
    );
  }

  const timeOff = await db.createTimeOff({
    companyId: req.companyId,
    employeeId: req.user._id,
    leaveType: rawType,
    startDate,
    endDate,
    days: calculatedDays,
    reason: String(reason).trim() || 'Personal time-off request'
  });

  await db.createAuditLog({
    companyId: req.companyId,
    actorId: req.user._id,
    action: 'TIMEOFF_REQUEST',
    targetType: 'TimeOff',
    targetId: timeOff?.id || '',
    metadata: { leaveType: rawType, days: calculatedDays },
    ip: req.ip || '127.0.0.1'
  });

  res.status(201).json({
    success: true,
    message: 'Time-off request submitted successfully.',
    timeOff
  });
});

/**
 * GET /api/time-off/me or /api/timeoff/me
 */
const getMyTimeOff = asyncHandler(async (req, res) => {
  const requests = await db.getTimeOffs(req.companyId, { employeeId: req.user._id });
  const balance = await db.getLeaveBalance(req.user._id, req.companyId);

  res.status(200).json({
    success: true,
    balance,
    balances: balance,
    ptoRemaining: (balance.pto?.total || 24) - (balance.pto?.used || 0),
    sickRemaining: (balance.sick?.total || 10) - (balance.sick?.used || 0),
    requests
  });
});

/**
 * GET /api/time-off or /api/timeoff
 */
const getCompanyTimeOff = asyncHandler(async (req, res) => {
  const { status, employeeId } = req.query;
  const requests = await db.getTimeOffs(req.companyId, { status, employeeId });

  res.status(200).json({
    success: true,
    total: requests.length,
    requests
  });
});

/**
 * PATCH /api/time-off/:id/approve or PUT /api/time-off/requests/:id/approve
 */
const approveTimeOff = asyncHandler(async (req, res) => {
  const { query } = require('../config/mysql');
  await query(
    `UPDATE time_offs SET status = 'approved', approved_by = ?, approved_at = NOW() WHERE id = ? AND company_id = ?`,
    [req.user._id, req.params.id, req.companyId]
  );

  const rows = await query(`SELECT * FROM time_offs WHERE id = ? LIMIT 1`, [req.params.id]);
  if (rows && rows.length > 0) {
    const t = rows[0];
    const normalizedKey = normalizeLeaveType(t.leave_type);
    await db.updateLeaveBalance(t.employee_id, req.companyId, normalizedKey, t.days);
    await db.updateUser(t.employee_id, req.companyId, { status: 'leave' });
  }

  res.status(200).json({
    success: true,
    message: 'Time-off request approved and leave balance deducted.'
  });
});

/**
 * PATCH /api/time-off/:id/reject or PUT /api/time-off/requests/:id/reject
 */
const rejectTimeOff = asyncHandler(async (req, res) => {
  const { rejectionReason, reason } = req.body;
  const { query } = require('../config/mysql');

  await query(
    `UPDATE time_offs SET status = 'rejected', approved_by = ?, rejection_reason = ?, approved_at = NOW() WHERE id = ? AND company_id = ?`,
    [req.user._id, rejectionReason || reason || '', req.params.id, req.companyId]
  );

  res.status(200).json({
    success: true,
    message: 'Time-off request rejected.'
  });
});

module.exports = {
  getMyBalances,
  getMyTimeOff,
  getCompanyTimeOff,
  getTimeOffRequests: getCompanyTimeOff,
  requestTimeOff,
  approveTimeOff,
  rejectTimeOff
};
