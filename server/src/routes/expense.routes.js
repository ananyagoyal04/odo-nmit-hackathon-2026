const express = require('express');
const {
  getExpenses,
  createExpense,
  reviewExpense
} = require('../controllers/expense.controller');
const { authenticate } = require('../middlewares/auth');
const { isAdminOrHR } = require('../middlewares/rbac');

const router = express.Router();

router.use(authenticate);

router.get('/', getExpenses);
router.post('/', createExpense);
router.patch('/:id/action', isAdminOrHR, reviewExpense);

module.exports = router;
