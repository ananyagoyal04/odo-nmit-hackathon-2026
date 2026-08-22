const db = require('../db/queries');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/time-off/balances
 */
const getMyBalances = asyncHandler(async (req, res) => {
  const employeeId = req.query.employeeId || req.user._id;

  if (employeeId !== String(req.user._id) && !['SUPER_ADMIN', 'HR'].includes(req.user.role)) {
    throw ApiError.forbidden('You do not have permission to view this balance.');
  }

  const balance = await db.getLeaveBalance(employeeId, req.companyId);

  res.status(200).json({
    success: true,
    balances: balance
  });
});

/**
 * POST /api/time-off/request
 */
const requestTimeOff = asyncHandler(async (req, res) => {
  const { leaveType, startDate, endDate, days, reason } = req.body;

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < start) {
    throw ApiError.badRequest('End date cannot be earlier than start date.');
  }

  const calculatedDays = Number(days) || Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  if (calculatedDays <= 0) {
    throw ApiError.badRequest('Leave duration must be at least 1 day.');
  }

  const balance = await db.getLeaveBalance(req.user._id, req.companyId);
  const typeBalance = balance[leaveType];

  if (typeBalance) {
    const remaining = typeBalance.total - typeBalance.used;
    if (calculatedDays > remaining) {
      throw ApiError.badRequest(
        `Insufficient ${leaveType.toUpperCase()} leave balance. Requested: ${calculatedDays} days, Remaining: ${remaining} days.`
      );
    }
  }

  const timeOff = await db.createTimeOff({
    companyId: req.companyId,
    employeeId: req.user._id,
    leaveType,
    startDate,
    endDate,
    days: calculatedDays,
    reason: reason.trim()
  });

  await db.createAuditLog({
    companyId: req.companyId,
    actorId: req.user._id,
    action: 'TIMEOFF_REQUEST',
    targetType: 'TimeOff',
    targetId: timeOff.id,
    metadata: { leaveType, days: calculatedDays },
    ip: req.ip || '127.0.0.1'
  });

  res.status(201).json({
    success: true,
    message: 'Time-off request submitted successfully in MySQL.',
    timeOff
  });
});

/**
 * GET /api/time-off/me
 */
const getMyTimeOff = asyncHandler(async (req, res) => {
  const requests = await db.getTimeOffs(req.companyId, { employeeId: req.user._id });
  const balance = await db.getLeaveBalance(req.user._id, req.companyId);

  res.status(200).json({
    success: true,
    balances: balance,
    requests
  });
});

/**
 * GET /api/time-off
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
 * PUT /api/time-off/requests/:id/approve
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
    await db.updateLeaveBalance(t.employee_id, req.companyId, t.leave_type, t.days);
    await db.updateUser(t.employee_id, req.companyId, { status: 'leave' });
  }

  res.status(200).json({
    success: true,
    message: 'Time-off request approved and balance deducted.'
  });
});

/**
 * PUT /api/time-off/requests/:id/reject
 */
const rejectTimeOff = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;
  const { query } = require('../config/mysql');

  await query(
    `UPDATE time_offs SET status = 'rejected', approved_by = ?, rejection_reason = ?, approved_at = NOW() WHERE id = ? AND company_id = ?`,
    [req.user._id, rejectionReason || '', req.params.id, req.companyId]
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
