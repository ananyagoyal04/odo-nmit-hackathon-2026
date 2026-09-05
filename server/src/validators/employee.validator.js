const { z } = require('zod');

const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  name: z.string().optional(),
  lastName: z.string().optional().default('').transform((val) => (val || '').trim()),
  email: z.string().email('Invalid work email address').trim().toLowerCase(),
  phone: z.string().optional().default(''),
  department: z.string().nullable().optional(),
  departmentId: z.string().nullable().optional(),
  designation: z.string().optional().default('Software Engineer'),
  employeeCode: z.string().optional().default(''),
  joiningDate: z.string().or(z.date()).optional().default(() => new Date().toISOString().split('T')[0]),
  location: z.string().optional().default('Headquarters'),
  role: z.enum(['SUPER_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']).optional().default('EMPLOYEE'),
  monthlyWage: z.coerce.number().min(0, 'Monthly wage cannot be negative').optional().default(75000),
  // Private Info
  gender: z.string().optional().default(''),
  dob: z.string().nullable().optional(),
  maritalStatus: z.string().optional().default(''),
  nationality: z.string().optional().default('Indian'),
  address: z.string().optional().default(''),
  personalEmail: z
    .string()
    .email('Invalid personal email')
    .or(z.literal(''))
    .optional()
    .default(''),
  // Bank details
  bankName: z.string().optional().default(''),
  accountNumber: z.string().optional().default(''),
  ifsc: z.string().optional().default(''),
  pan: z.string().optional().default(''),
  uan: z.string().optional().default(''),
  // Resume Info
  skills: z.union([z.array(z.string()), z.string()]).optional().default([]).transform((val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  }),
  certifications: z.union([z.array(z.string()), z.string()]).optional().default([]).transform((val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  }),
  hobbies: z.string().optional().default(''),
  about: z.string().optional().default(''),
  jobDescription: z.string().optional().default(''),
  avatarColor: z.string().optional().default('#c98a4b'),
  password: z.string().optional().default('Password@123')
});

const updateEmployeeSchema = createEmployeeSchema.partial().omit({ password: true });

const updateSalarySchema = z.object({
  monthlyWage: z.coerce.number().min(0, 'Monthly wage cannot be negative')
});

const updateStatusSchema = z.object({
  status: z.enum(['present', 'absent', 'leave', 'inactive', 'half_day'])
});

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema,
  updateSalarySchema,
  updateStatusSchema
};
