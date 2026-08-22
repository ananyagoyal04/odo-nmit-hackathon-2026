const express = require('express');
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getMonthlyAttendance,
  getCompanyAttendance
} = require('../controllers/attendance.controller');
const { authenticate } = require('../middlewares/auth');
const { isAdminOrHR } = require('../middlewares/rbac');

const router = express.Router();

router.use(authenticate);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/me', getMyAttendance);
router.get('/monthly', getMonthlyAttendance);
router.get('/', isAdminOrHR, getCompanyAttendance);

module.exports = router;
