const db = require('../db/queries');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { calculateSalaryBreakdown } = require('../utils/salaryCalculator');

/**
 * GET /api/salary/structure/:employeeId
 */
const getSalaryStructure = asyncHandler(async (req, res) => {
  const employeeId = req.params.employeeId || req.user._id;

  if (employeeId !== String(req.user._id) && !['SUPER_ADMIN', 'HR'].includes(req.user.role)) {
    throw ApiError.forbidden('You do not have permission to view this salary structure.');
  }

  const employee = await db.findUserById(employeeId);
  if (!employee || employee.companyId !== req.companyId) {
    throw ApiError.notFound('Employee not found.');
  }

  const monthlyWage = employee.salary?.monthlyWage || 0;
  const breakdown = calculateSalaryBreakdown(monthlyWage);

  res.status(200).json({
    success: true,
    employeeId: employee._id,
    monthlyWage,
    breakdown
  });
});

/**
 * PUT /api/salary/structure/:employeeId
 */
const updateSalaryStructure = asyncHandler(async (req, res) => {
  const { monthlyWage } = req.body;
  const wage = Number(monthlyWage);

  if (isNaN(wage) || wage < 0) {
    throw ApiError.badRequest('Monthly wage must be a non-negative number.');
  }

  const employee = await db.findUserById(req.params.employeeId);
  if (!employee || employee.companyId !== req.companyId) {
    throw ApiError.notFound('Employee not found.');
  }

  await db.updateUser(employee._id, req.companyId, { monthlyWage: wage });
  const breakdown = calculateSalaryBreakdown(wage);

  await db.createAuditLog({
    companyId: req.companyId,
    actorId: req.user._id,
    action: 'SALARY_UPDATE',
    targetType: 'User',
    targetId: employee._id,
    metadata: { monthlyWage: wage },
    ip: req.ip || '127.0.0.1'
  });

  res.status(200).json({
    success: true,
    message: 'Salary updated successfully in MySQL',
    monthlyWage: wage,
    breakdown
  });
});

/**
 * GET /api/salary/all
 */
const getAllSalaries = asyncHandler(async (req, res) => {
  const employees = await db.getEmployees(req.companyId);

  const salaries = employees.map((emp) => {
    const monthlyWage = emp.salary?.monthlyWage || 0;
    return {
      employee: emp,
      monthlyWage,
      breakdown: calculateSalaryBreakdown(monthlyWage)
    };
  });

  res.status(200).json({
    success: true,
    salaries
  });
});

module.exports = {
  getSalaryStructure,
  getEmployeeSalary: getSalaryStructure,
  updateSalaryStructure,
  updateEmployeeSalary: updateSalaryStructure,
  getAllSalaries
};
