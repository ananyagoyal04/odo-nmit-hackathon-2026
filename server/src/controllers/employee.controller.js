const bcrypt = require('bcryptjs');
const db = require('../db/queries');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const AVATAR_COLORS = [
  '#c98a4b', '#b37438', '#dca163', '#8b5a2b',
  '#a67c52', '#9c6644', '#7f4f24', '#b08968', '#FB9590', '#DC586D'
];

/**
 * GET /api/employees
 */
const getEmployees = asyncHandler(async (req, res) => {
  const { search, department, role, status } = req.query;

  const employees = await db.getEmployees(req.companyId, {
    search,
    department,
    role,
    status
  });

  res.status(200).json({
    success: true,
    total: employees.length,
    page: 1,
    totalPages: 1,
    employees
  });
});

/**
 * GET /api/employees/:id
 */
const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await db.findUserById(req.params.id);
  if (!employee || employee.companyId !== req.companyId) {
    throw ApiError.notFound('Employee record not found.');
  }

  const leaveBalance = await db.getLeaveBalance(employee._id, req.companyId);

  res.status(200).json({
    success: true,
    employee,
    leaveBalance
  });
});

/**
 * POST /api/employees
 */
const createEmployee = asyncHandler(async (req, res) => {
  const company = await db.findCompanyById(req.companyId);
  if (!company) {
    throw ApiError.notFound('Company not found.');
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    role = 'EMPLOYEE',
    department,
    designation,
    employeeCode,
    joiningDate,
    location,
    gender,
    dob,
    maritalStatus,
    nationality,
    address,
    personalEmail,
    bankInfo,
    about,
    jobDescription,
    hobbies,
    skills,
    certifications,
    monthlyWage = 0,
    password
  } = req.body;

  const existingEmail = await db.findUserByLoginOrEmail(email);
  if (existingEmail) {
    throw ApiError.conflict('An employee with this work email already exists.');
  }

  const yearDigits = joiningDate
    ? new Date(joiningDate).getFullYear().toString().slice(-2)
    : new Date().getFullYear().toString().slice(-2);

  const loginId = await db.generateAtomicLoginId(company.companyCode, yearDigits);
  const plainPassword = password && password.trim() ? password.trim() : 'Password@123';
  const passwordHash = await bcrypt.hash(plainPassword, 10);
  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  const employee = await db.createUser({
    companyId: req.companyId,
    loginId,
    firstName: firstName.trim(),
    lastName: (lastName || '').trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    phone: phone || '',
    role,
    departmentId: department || null,
    designation: designation || '',
    employeeCode: employeeCode || '',
    joiningDate: joiningDate || new Date(),
    location: location || 'Gandhinagar, Gujarat',
    status: 'present',
    gender: gender || '',
    dob: dob || null,
    maritalStatus: maritalStatus || '',
    nationality: nationality || 'Indian',
    address: address || '',
    personalEmail: personalEmail || '',
    bankInfo: bankInfo || {},
    about: about || '',
    jobDescription: jobDescription || '',
    hobbies: hobbies || '',
    skills: skills || [],
    certifications: certifications || [],
    monthlyWage: Number(monthlyWage) || 0,
    avatarColor,
    avatarUrl: req.body.avatarUrl || ''
  });

  await db.getLeaveBalance(employee._id, req.companyId);

  await db.createAuditLog({
    companyId: req.companyId,
    actorId: req.user._id,
    action: 'EMPLOYEE_CREATE',
    targetType: 'User',
    targetId: employee._id,
    metadata: { loginId, email: employee.email, role },
    ip: req.ip || '127.0.0.1'
  });

  res.status(201).json({
    success: true,
    message: 'Employee created successfully in MySQL',
    employee,
    credentials: {
      loginId,
      email: employee.email,
      temporaryPassword: plainPassword
    }
  });
});

/**
 * PUT /api/employees/:id
 */
const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await db.findUserById(req.params.id);
  if (!employee || employee.companyId !== req.companyId) {
    throw ApiError.notFound('Employee record not found.');
  }

  const isSelf = String(req.user._id) === String(employee._id);
  const isAdminOrHR = ['SUPER_ADMIN', 'HR'].includes(req.user.role);

  if (!isSelf && !isAdminOrHR) {
    throw ApiError.forbidden('You do not have permission to update this employee.');
  }

  const updateData = { ...req.body };

  if (!isAdminOrHR) {
    delete updateData.role;
    delete updateData.department;
    delete updateData.departmentId;
    delete updateData.salary;
    delete updateData.monthlyWage;
    delete updateData.isActive;
    delete updateData.employeeCode;
  }

  if (updateData.password && updateData.password.trim()) {
    updateData.passwordHash = await bcrypt.hash(updateData.password.trim(), 10);
    delete updateData.password;
  }

  const updatedEmployee = await db.updateUser(employee._id, req.companyId, updateData);

  await db.createAuditLog({
    companyId: req.companyId,
    actorId: req.user._id,
    action: 'EMPLOYEE_UPDATE',
    targetType: 'User',
    targetId: employee._id,
    metadata: { updatedFields: Object.keys(updateData) },
    ip: req.ip || '127.0.0.1'
  });

  res.status(200).json({
    success: true,
    message: 'Employee updated successfully in MySQL',
    employee: updatedEmployee
  });
});

/**
 * DELETE /api/employees/:id
 */
const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await db.findUserById(req.params.id);
  if (!employee || employee.companyId !== req.companyId) {
    throw ApiError.notFound('Employee record not found.');
  }

  if (String(req.user._id) === String(employee._id)) {
    throw ApiError.badRequest('You cannot deactivate your own account.');
  }

  await db.updateUser(employee._id, req.companyId, { isActive: false, status: 'inactive' });

  await db.createAuditLog({
    companyId: req.companyId,
    actorId: req.user._id,
    action: 'EMPLOYEE_DEACTIVATE',
    targetType: 'User',
    targetId: employee._id,
    metadata: { loginId: employee.loginId },
    ip: req.ip || '127.0.0.1'
  });

  res.status(200).json({
    success: true,
    message: 'Employee account deactivated successfully.'
  });
});

/**
 * GET /api/employees/export/csv
 */
const exportEmployeesCSV = asyncHandler(async (req, res) => {
  const employees = await db.getEmployees(req.companyId);

  const headers = [
    'Login ID', 'First Name', 'Last Name', 'Email', 'Phone',
    'Role', 'Department', 'Designation', 'Joining Date',
    'Location', 'Status', 'Monthly Wage', 'Pan', 'Bank Account'
  ];

  const rows = employees.map((emp) => [
    `"${emp.loginId || ''}"`,
    `"${emp.firstName || ''}"`,
    `"${emp.lastName || ''}"`,
    `"${emp.email || ''}"`,
    `"${emp.phone || ''}"`,
    `"${emp.role || ''}"`,
    `"${emp.department?.name || ''}"`,
    `"${emp.designation || ''}"`,
    `"${emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : ''}"`,
    `"${emp.location || ''}"`,
    `"${emp.status || ''}"`,
    `"${emp.salary?.monthlyWage || 0}"`,
    `"${emp.bankInfo?.pan || ''}"`,
    `"${emp.bankInfo?.accountNumber || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="employees_${new Date().toISOString().split('T')[0]}.csv"`);
  res.status(200).send(csvContent);
});

/**
 * PATCH /api/employees/:id/status
 */
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const updated = await db.updateUser(req.params.id, req.companyId, { status });

  res.status(200).json({
    success: true,
    message: `Employee status updated to ${status}`,
    employee: updated
  });
});

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateStatus,
  deleteEmployee,
  exportEmployees: exportEmployeesCSV,
  exportEmployeesCSV
};
