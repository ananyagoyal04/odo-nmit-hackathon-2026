const ApiError = require('../utils/apiError');

/**
 * Role-Based Access Control Middleware.
 * Strictly verifies user role server-side.
 * @param  {...string} roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access forbidden. Requires one of the following roles: [${roles.join(', ')}]. Current role: ${req.user.role}`
        )
      );
    }

    next();
  };
};

const isAdmin = requireRole('SUPER_ADMIN');
const isAdminOrHR = requireRole('SUPER_ADMIN', 'HR');

module.exports = {
  requireRole,
  isAdmin,
  isAdminOrHR
};
