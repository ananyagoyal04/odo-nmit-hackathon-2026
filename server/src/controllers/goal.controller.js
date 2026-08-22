const db = require('../db/queries');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/goals
 */
const getGoals = asyncHandler(async (req, res) => {
  const { quarter } = req.query;
  const isManagement = ['SUPER_ADMIN', 'HR'].includes(req.user.role);

  const goals = await db.getGoals(req.companyId, {
    quarter,
    employeeId: !isManagement ? req.user._id : undefined
  });

  res.status(200).json({
    success: true,
    total: goals.length,
    goals
  });
});

/**
 * POST /api/goals
 */
const createGoal = asyncHandler(async (req, res) => {
  const { title, description, quarter = 'Q3 2026', category = 'Engineering', dueDate } = req.body;
  if (!title) {
    throw ApiError.badRequest('Goal title is required.');
  }

  const goal = await db.createGoal({
    companyId: req.companyId,
    employeeId: req.user._id,
    title,
    description,
    quarter,
    category,
    dueDate
  });

  res.status(201).json({
    success: true,
    message: 'Goal created successfully in MySQL',
    goal
  });
});

/**
 * PUT /api/goals/:id
 */
const updateGoal = asyncHandler(async (req, res) => {
  const { progress, status } = req.body;

  const goal = await db.updateGoal(req.params.id, req.companyId, {
    progress: Math.min(100, Math.max(0, Number(progress) || 0)),
    status: status || (Number(progress) >= 100 ? 'completed' : 'on_track')
  });

  res.status(200).json({
    success: true,
    message: 'Goal progress updated in MySQL',
    goal
  });
});

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  updateGoalProgress: updateGoal
};
