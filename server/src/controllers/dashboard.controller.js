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

  const totalEmployees = employees.length;
  const presentCount = employees.filter((e) => e.status === 'present').length;
  const leaveCount = employees.filter((e) => e.status === 'leave').length;
  const totalPayroll = employees.reduce((sum, e) => sum + (e.salary?.monthlyWage || 0), 0);

  res.status(200).json({
    success: true,
    stats: {
      totalEmployees,
      presentToday: presentCount,
      onLeave: leaveCount,
      totalDepartments: departments.length,
      monthlyPayrollTotal: totalPayroll,
      recentAnnouncements: announcements.slice(0, 3),
      recentGoals: goals.slice(0, 4)
    }
  });
});

module.exports = {
  getDashboardStats
};
