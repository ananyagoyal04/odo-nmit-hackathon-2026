const express = require('express');
const {
  getGoals,
  createGoal,
  updateGoalProgress
} = require('../controllers/goal.controller');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', getGoals);
router.post('/', createGoal);
router.patch('/:id/progress', updateGoalProgress);

module.exports = router;
