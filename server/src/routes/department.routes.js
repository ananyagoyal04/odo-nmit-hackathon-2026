const express = require('express');
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/department.controller');
const { authenticate } = require('../middlewares/auth');
const { isAdminOrHR } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const {
  createDepartmentSchema,
  updateDepartmentSchema
} = require('../validators/department.validator');

const router = express.Router();

router.use(authenticate);

router.get('/', getDepartments);
router.post('/', isAdminOrHR, validate(createDepartmentSchema), createDepartment);
router.patch('/:id', isAdminOrHR, validate(updateDepartmentSchema), updateDepartment);
router.delete('/:id', isAdminOrHR, deleteDepartment);

module.exports = router;
