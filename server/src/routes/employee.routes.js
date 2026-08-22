const express = require('express');
const {
  getEmployees,
  exportEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateStatus,
  deleteEmployee
} = require('../controllers/employee.controller');
const { authenticate } = require('../middlewares/auth');
const { isAdminOrHR } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const {
  createEmployeeSchema,
  updateEmployeeSchema,
  updateStatusSchema
} = require('../validators/employee.validator');

const router = express.Router();

router.use(authenticate);

router.get('/export', exportEmployees);
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', isAdminOrHR, validate(createEmployeeSchema), createEmployee);
router.patch('/:id', validate(updateEmployeeSchema), updateEmployee);
router.patch('/:id/status', validate(updateStatusSchema), updateStatus);
router.delete('/:id', isAdminOrHR, deleteEmployee);

module.exports = router;
