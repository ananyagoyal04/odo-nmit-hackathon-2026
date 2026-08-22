const jwt = require('jsonwebtoken');
const db = require('../db/queries');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { JWT_SECRET } = require('../config/env');

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication required. Missing or malformed token.');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw ApiError.unauthorized('Authentication required. Bearer token is empty.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Session expired. Please log in again.');
    }
    throw ApiError.unauthorized('Invalid authentication token.');
  }

  const userId = decoded.sub || decoded.id;
  let user = null;
  if (userId) {
    user = await db.findUserById(userId);
  }
  if (!user && (decoded.email || decoded.loginId)) {
    user = await db.findUserByLoginOrEmail(decoded.email || decoded.loginId);
  }

  if (!user) {
    throw ApiError.unauthorized('User session not found.');
  }

  if (!user.isActive) {
    throw ApiError.unauthorized('Your account has been deactivated. Please contact your administrator.');
  }

  req.user = user;
  req.companyId = user.companyId;
  next();
});

module.exports = {
  authenticate
};
