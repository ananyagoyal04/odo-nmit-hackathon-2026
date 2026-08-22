const express = require('express');
const { registerCompany, login, getMe, changePassword } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');
const { authRateLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const {
  registerCompanySchema,
  loginSchema,
  changePasswordSchema
} = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', authRateLimiter, validate(registerCompanySchema), registerCompany);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);

module.exports = router;
