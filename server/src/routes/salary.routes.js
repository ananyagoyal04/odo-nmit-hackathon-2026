const express = require('express');
const { getEmployeeSalary, updateEmployeeSalary } = require('../controllers/salary.controller');
const { authenticate } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const { updateSalarySchema } = require('../validators/employee.validator');

const router = express.Router();

router.use(authenticate);

router.get('/:id/salary', getEmployeeSalary);
router.patch('/:id/salary', isAdmin, validate(updateSalarySchema), updateEmployeeSalary);

module.exports = router;
