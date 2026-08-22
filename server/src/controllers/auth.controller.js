const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db/queries');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { deriveCompanyCode } = require('../utils/loginIdGenerator');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const { isValidRealEmail, sendLoginAlertEmail } = require('../services/emailService');

const signToken = (user) => {
  const userId = typeof user === 'object' ? user._id || user.id : user;
  const email = typeof user === 'object' ? user.email : '';
  const role = typeof user === 'object' ? user.role : '';
  return jwt.sign({ sub: userId, id: userId, email, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * POST /api/auth/register
 */
const registerCompany = asyncHandler(async (req, res) => {
  const { companyName, companyEmail, adminName, adminEmail, phone, password, logo } = req.body;

  if (!isValidRealEmail(companyEmail) || !isValidRealEmail(adminEmail)) {
    throw ApiError.badRequest('Please provide a valid, real email address (e.g. name@gmail.com, name@company.com).');
  }

  const existingCompany = await db.findCompanyByEmail(companyEmail);
  if (existingCompany) {
    throw ApiError.conflict('A company with this email already exists.');
  }

  let companyCode = deriveCompanyCode(companyName);
  let duplicateCode = await db.findCompanyByCode(companyCode);
  let suffix = 1;
  while (duplicateCode) {
    companyCode = `${deriveCompanyCode(companyName)}${suffix}`;
    duplicateCode = await db.findCompanyByCode(companyCode);
    suffix++;
  }

  const company = await db.createCompany({
    name: companyName,
    email: companyEmail,
    companyCode,
    logo: logo || ''
  });

  const nameParts = adminName.trim().split(/\s+/);
  const firstName = nameParts[0] || 'Admin';
  const lastName = nameParts.slice(1).join(' ') || '';

  const yearDigits = new Date().getFullYear().toString().slice(-2);
  const loginId = await db.generateAtomicLoginId(company.companyCode, yearDigits);

  const passwordHash = await bcrypt.hash(password, 10);

  const adminUser = await db.createUser({
    companyId: company._id,
    loginId,
    firstName,
    lastName,
    email: adminEmail.toLowerCase().trim(),
    passwordHash,
    phone: phone || '',
    role: 'SUPER_ADMIN',
    designation: 'Managing Director & CEO',
    joiningDate: new Date(),
    status: 'present',
    monthlyWage: 200000,
    avatarColor: '#DC586D'
  });

  await db.createAuditLog({
    companyId: company._id,
    actorId: adminUser._id,
    action: 'COMPANY_REGISTER',
    targetType: 'Company',
    targetId: company._id,
    metadata: { companyName: company.name, adminEmail: adminUser.email },
    ip: req.ip || req.socket?.remoteAddress || '127.0.0.1'
  });

  const token = signToken(adminUser);

  // Dispatch welcome email
  sendLoginAlertEmail({
    toEmail: adminUser.email,
    userName: adminUser.fullName || adminUser.firstName,
    role: adminUser.role,
    loginTime: new Date(),
    ip: req.ip || '127.0.0.1',
    loginId: adminUser.loginId
  }).catch(() => {});

  res.status(201).json({
    success: true,
    message: 'Company and administrator registered successfully in MySQL',
    token,
    user: adminUser,
    company
  });
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    throw ApiError.badRequest('Identifier (Login ID / Email) and password are required.');
  }

  const cleanIdentifier = String(identifier).trim();
  const user = await db.findUserByLoginOrEmail(cleanIdentifier);
  const clientIp = req.ip || req.socket?.remoteAddress || '127.0.0.1';

  if (!user) {
    throw ApiError.unauthorized('Invalid credentials. User record not found for: ' + cleanIdentifier);
  }

  const isMatch = await bcrypt.compare(String(password).trim(), user.passwordHash);

  if (!isMatch) {
    await db.createAuditLog({
      companyId: user.companyId,
      actorId: user._id,
      action: 'LOGIN_FAILURE',
      targetType: 'User',
      targetId: user._id,
      metadata: { identifier: cleanIdentifier, reason: 'Invalid password' },
      ip: clientIp
    });
    throw ApiError.unauthorized('Invalid credentials. Incorrect password.');
  }

  if (!user.isActive) {
    throw ApiError.unauthorized('Your account has been deactivated. Please contact your administrator.');
  }

  const company = await db.findCompanyById(user.companyId);
  const leaveBalance = await db.getLeaveBalance(user._id, user.companyId);

  await db.createAuditLog({
    companyId: user.companyId,
    actorId: user._id,
    action: 'LOGIN_SUCCESS',
    targetType: 'User',
    targetId: user._id,
    metadata: { identifier: cleanIdentifier, role: user.role },
    ip: clientIp
  });

  // Real-time security email notification to user's real email
  if (user.email) {
    sendLoginAlertEmail({
      toEmail: user.email,
      userName: user.fullName || user.firstName,
      role: user.role,
      loginTime: new Date(),
      ip: clientIp,
      loginId: user.loginId
    }).catch((e) => console.warn('Email dispatch notice:', e.message));
  }

  const token = signToken(user);

  res.status(200).json({
    success: true,
    message: 'Login successful. Security alert dispatched to your email.',
    emailAlertSent: true,
    token,
    user,
    company,
    leaveBalance
  });
});

/**
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await db.findUserById(req.user._id);
  const company = await db.findCompanyById(req.companyId);
  const leaveBalance = await db.getLeaveBalance(req.user._id, req.companyId);

  res.status(200).json({
    success: true,
    user,
    company,
    leaveBalance
  });
});

/**
 * POST /api/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await db.findUserById(req.user._id);
  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw ApiError.badRequest('Incorrect current password.');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.updateUser(user._id, user.companyId, { passwordHash });

  await db.createAuditLog({
    companyId: req.companyId,
    actorId: req.user._id,
    action: 'PASSWORD_CHANGE',
    targetType: 'User',
    targetId: req.user._id,
    metadata: { userId: req.user._id },
    ip: req.ip || req.socket?.remoteAddress || '127.0.0.1'
  });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully.'
  });
});

module.exports = {
  registerCompany,
  login,
  getMe,
  changePassword
};
