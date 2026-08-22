const express = require('express');
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/', getDashboardStats);

module.exports = router;
