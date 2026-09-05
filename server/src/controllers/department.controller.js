const db = require('../db/queries');
const { query } = require('../config/mysql');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/departments
 */
const getDepartments = asyncHandler(async (req, res) => {
  const departments = await db.getDepartments(req.companyId);
  res.status(200).json({
    success: true,
    total: departments.length,
    departments
  });
});

/**
 * POST /api/departments
 */
const createDepartment = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const managerId = req.body.managerId || req.body.manager || null;

  if (!name || !name.trim()) {
    throw ApiError.badRequest('Department name is required.');
  }

  const department = await db.createDepartment({
    companyId: req.companyId,
    name,
    description: description || '',
    managerId: managerId || null
  });

  res.status(201).json({
    success: true,
    message: 'Department created successfully in MySQL',
    department
  });
});

/**
 * PATCH /api/departments/:id
 */
const updateDepartment = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const managerId = req.body.managerId !== undefined ? req.body.managerId : req.body.manager;

  const updates = [];
  const params = [];

  if (name) { updates.push('name = ?'); params.push(name.trim()); }
  if (description !== undefined) { updates.push('description = ?'); params.push(description.trim()); }
  if (managerId !== undefined) { updates.push('manager_id = ?'); params.push(managerId || null); }

  if (updates.length > 0) {
    params.push(req.params.id);
    params.push(req.companyId);
    await query(`UPDATE departments SET ${updates.join(', ')} WHERE id = ? AND company_id = ?`, params);
  }

  const list = await db.getDepartments(req.companyId);
  const department = list.find((d) => d.id === req.params.id);

  res.status(200).json({
    success: true,
    message: 'Department updated successfully.',
    department
  });
});

/**
 * DELETE /api/departments/:id
 */
const deleteDepartment = asyncHandler(async (req, res) => {
  await query(`DELETE FROM departments WHERE id = ? AND company_id = ?`, [req.params.id, req.companyId]);

  res.status(200).json({
    success: true,
    message: 'Department removed successfully.'
  });
});

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
