const express = require('express');
const { getAuditLogs } = require('../controllers/auditLog.controller');
const { authenticate } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/rbac');

const router = express.Router();

router.use(authenticate);

router.get('/', isAdmin, getAuditLogs);

module.exports = router;
