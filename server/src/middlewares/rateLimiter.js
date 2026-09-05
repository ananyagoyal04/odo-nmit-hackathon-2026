const rateLimit = require('express-rate-limit');

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased for concurrent automated test runs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many attempts. Please try again later.'
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  }
});

module.exports = {
  authRateLimiter
};
