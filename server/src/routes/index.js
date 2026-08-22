const express = require('express');
const authRoutes = require('./auth.routes');
const employeeRoutes = require('./employee.routes');
const salaryRoutes = require('./salary.routes');
const attendanceRoutes = require('./attendance.routes');
const timeOffRoutes = require('./timeOff.routes');
const departmentRoutes = require('./department.routes');
const dashboardRoutes = require('./dashboard.routes');
const auditLogRoutes = require('./auditLog.routes');
const announcementRoutes = require('./announcement.routes');
const expenseRoutes = require('./expense.routes');
const goalRoutes = require('./goal.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/employees', salaryRoutes); // /api/employees/:id/salary
router.use('/attendance', attendanceRoutes);
router.use('/timeoff', timeOffRoutes);
router.use('/departments', departmentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/announcements', announcementRoutes);
router.use('/expenses', expenseRoutes);
router.use('/goals', goalRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Odoo HR Management API'
  });
});

module.exports = router;
