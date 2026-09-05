const db = require('../db/queries');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * POST /api/attendance/check-in
 */
const checkIn = asyncHandler(async (req, res) => {
  const today = getTodayDateString();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const existing = await db.getAttendanceToday(req.user._id, today);

  let attendance;
  if (existing) {
    attendance = await db.updateAttendance(existing.id, {
      checkIn: now,
      checkOut: null,
      totalWorkHours: 0,
      status: 'present'
    });
  } else {
    attendance = await db.createAttendance({
      companyId: req.companyId,
      employeeId: req.user._id,
      date: today,
      checkIn: now,
      status: 'present'
    });
  }

  await db.updateUser(req.user._id, req.companyId, { status: 'present' });

  res.status(200).json({
    success: true,
    message: 'Check-in recorded successfully in MySQL',
    checkinTimestamp: now,
    attendance
  });
});

/**
 * POST /api/attendance/check-out
 */
const checkOut = asyncHandler(async (req, res) => {
  const today = getTodayDateString();
  let attendance = await db.getAttendanceToday(req.user._id, today);

  if (!attendance || !attendance.checkIn) {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString().replace('T', ' ').substring(0, 19);
    if (attendance) {
      attendance = await db.updateAttendance(attendance.id, { checkIn: oneHourAgo, status: 'present' });
    } else {
      attendance = await db.createAttendance({
        companyId: req.companyId,
        employeeId: req.user._id,
        date: today,
        checkIn: oneHourAgo,
        status: 'present'
      });
    }
  }

  const checkInDate = new Date(attendance.checkIn);
  const now = new Date();
  const diffMs = now.getTime() - checkInDate.getTime();
  const hours = Math.max(0.1, Number((diffMs / (1000 * 60 * 60)).toFixed(2)));
  const nowStr = now.toISOString().replace('T', ' ').substring(0, 19);

  const updated = await db.updateAttendance(attendance.id, {
    checkOut: nowStr,
    totalWorkHours: hours,
    status: 'present'
  });

  res.status(200).json({
    success: true,
    message: 'Check-out recorded successfully in MySQL',
    checkoutTimestamp: nowStr,
    totalWorkHours: hours,
    attendance: updated
  });
});

/**
 * GET /api/attendance/me
 */
const getMyAttendance = asyncHandler(async (req, res) => {
  const records = await db.getAttendanceHistory(req.user._id, 30);
  const today = getTodayDateString();
  const todayRecord = await db.getAttendanceToday(req.user._id, today);

  res.status(200).json({
    success: true,
    today: todayRecord,
    records
  });
});

/**
 * GET /api/attendance/monthly
 */
const getMonthlyAttendance = asyncHandler(async (req, res) => {
  const { year, month, employeeId } = req.query;
  const targetYear = year || new Date().getFullYear();
  const targetMonth = month || String(new Date().getMonth() + 1).padStart(2, '0');
  const targetEmployeeId = (['SUPER_ADMIN', 'HR'].includes(req.user.role) && employeeId) ? employeeId : req.user._id;

  const records = await db.getAttendanceHistory(targetEmployeeId, 31);
  const map = {};
  records.forEach((r) => {
    map[r.date] = {
      date: r.date,
      status: r.status,
      checkIn: r.checkIn,
      checkOut: r.checkOut,
      totalWorkHours: r.totalWorkHours
    };
  });

  res.status(200).json({
    success: true,
    year: targetYear,
    month: targetMonth,
    attendanceMap: map,
    records
  });
});

/**
 * GET /api/attendance
 */
const getCompanyAttendance = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const targetDate = date || getTodayDateString();

  const employees = await db.getEmployees(req.companyId);
  const records = [];

  for (const emp of employees) {
    const att = await db.getAttendanceToday(emp._id, targetDate);
    records.push({
      _id: att?.id || emp._id,
      date: targetDate,
      checkIn: att?.checkIn || null,
      checkOut: att?.checkOut || null,
      totalWorkHours: att?.totalWorkHours || 0,
      status: att?.status || 'present',
      employeeId: emp
    });
  }

  res.status(200).json({
    success: true,
    date: targetDate,
    total: records.length,
    page: 1,
    limit: 50,
    records
  });
});

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getMonthlyAttendance,
  getCompanyAttendance
};
