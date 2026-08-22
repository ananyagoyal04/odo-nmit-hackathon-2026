const { z } = require('zod');

const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters').trim(),
  description: z.string().optional().default(''),
  manager: z.string().nullable().optional()
});

const updateDepartmentSchema = createDepartmentSchema.partial();

module.exports = {
  createDepartmentSchema,
  updateDepartmentSchema
};
