const express = require('express');
const {
  requestTimeOff,
  getMyTimeOff,
  getCompanyTimeOff,
  approveTimeOff,
  rejectTimeOff
} = require('../controllers/timeOff.controller');
const { authenticate } = require('../middlewares/auth');
const { isAdminOrHR } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const {
  requestTimeOffSchema,
  approveRejectTimeOffSchema
} = require('../validators/timeOff.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(requestTimeOffSchema), requestTimeOff);
router.get('/me', getMyTimeOff);
router.get('/', isAdminOrHR, getCompanyTimeOff);
router.patch('/:id/approve', isAdminOrHR, approveTimeOff);
router.patch('/:id/reject', isAdminOrHR, validate(approveRejectTimeOffSchema), rejectTimeOff);

module.exports = router;
