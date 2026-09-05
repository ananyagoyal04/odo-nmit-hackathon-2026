const db = require('../db/queries');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/dashboard/stats
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const employees = await db.getEmployees(req.companyId);
  const departments = await db.getDepartments(req.companyId);
  const announcements = await db.getAnnouncements(req.companyId);
  const goals = await db.getGoals(req.companyId);
  const timeOffs = await db.getTimeOffs(req.companyId);

  const totalEmployees = employees.length;
  const presentCount = employees.filter((e) => e.status === 'present').length;
  const leaveCount = employees.filter((e) => e.status === 'leave').length;
  const absentCount = Math.max(0, totalEmployees - presentCount - leaveCount);
  const attendanceRate = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 100;
  const totalPayroll = employees.reduce((sum, e) => sum + (e.salary?.monthlyWage || 0), 0);
  const pendingLeaves = timeOffs.filter((t) => t.status === 'pending').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const userTodayAttendance = await db.getAttendanceToday(req.user._id, todayStr);
  const userRecentAttendance = await db.getAttendanceHistory(req.user._id, 7);
  const userLeaveBalance = await db.getLeaveBalance(req.user._id, req.companyId);

  const deptBreakdown = departments.map((d) => ({
    _id: d.id,
    id: d.id,
    name: d.name,
    count: d.employeeCount || 0
  }));

  const stats = {
    // Admin / General metrics
    headcount: totalEmployees,
    totalEmployees,
    presentToday: presentCount,
    onLeave: leaveCount,
    totalDepartments: departments.length,
    monthlyPayrollTotal: totalPayroll,
    pendingTimeOffCount: pendingLeaves,
    attendanceToday: {
      present: presentCount,
      onLeave: leaveCount,
      absent: absentCount,
      rate: attendanceRate
    },
    departmentBreakdown: deptBreakdown,
    recentAnnouncements: announcements.slice(0, 4),
    recentGoals: goals.slice(0, 4),

    // Employee specific metrics
    isCheckedIn: Boolean(userTodayAttendance && userTodayAttendance.checkIn),
    isCheckedOut: Boolean(userTodayAttendance && userTodayAttendance.checkOut),
    checkInTime: userTodayAttendance?.checkIn || null,
    totalWorkHoursToday: userTodayAttendance?.totalWorkHours || 0,
    leaveBalance: {
      ...userLeaveBalance,
      ptoRemaining: (userLeaveBalance.pto?.total || 24) - (userLeaveBalance.pto?.used || 0),
      sickRemaining: (userLeaveBalance.sick?.total || 10) - (userLeaveBalance.sick?.used || 0)
    },
    recentAttendance: userRecentAttendance
  };

  res.status(200).json({
    success: true,
    stats,
    ...stats
  });
});

module.exports = {
  getDashboardStats
};
