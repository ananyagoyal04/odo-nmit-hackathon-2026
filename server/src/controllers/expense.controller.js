const db = require('../db/queries');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/expenses
 */
const getExpenses = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const isManagement = ['SUPER_ADMIN', 'HR'].includes(req.user.role);

  const expenses = await db.getExpenses(req.companyId, {
    status,
    employeeId: !isManagement ? req.user._id : undefined
  });

  res.status(200).json({
    success: true,
    total: expenses.length,
    expenses
  });
});

/**
 * POST /api/expenses
 */
const createExpense = asyncHandler(async (req, res) => {
  const { title, category = 'Other', amount, expenseDate, description, receiptUrl } = req.body;
  if (!title || !amount) {
    throw ApiError.badRequest('Title and amount are required.');
  }

  const expense = await db.createExpense({
    companyId: req.companyId,
    employeeId: req.user._id,
    title,
    category,
    amount: Number(amount),
    expenseDate: expenseDate || new Date().toISOString().split('T')[0],
    description: description || '',
    receiptUrl: receiptUrl || ''
  });

  res.status(201).json({
    success: true,
    message: 'Expense claim submitted successfully in MySQL',
    expense
  });
});

/**
 * PATCH /api/expenses/:id/action or PUT /api/expenses/:id/review
 */
const reviewExpense = asyncHandler(async (req, res) => {
  let targetStatus = req.body.status || req.body.action;

  if (targetStatus === 'approve') targetStatus = 'approved';
  if (targetStatus === 'reject') targetStatus = 'rejected';

  if (!['approved', 'rejected'].includes(targetStatus)) {
    throw ApiError.badRequest('Status or action must be approved or rejected.');
  }

  const updated = await db.reviewExpense(req.params.id, req.companyId, {
    status: targetStatus,
    approvedBy: req.user._id,
    rejectionReason: req.body.rejectionReason || ''
  });

  res.status(200).json({
    success: true,
    message: `Expense claim has been ${targetStatus}.`,
    expense: updated
  });
});

module.exports = {
  getExpenses,
  createExpense,
  reviewExpense
};
