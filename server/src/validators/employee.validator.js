const { z } = require('zod');

const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().optional().default('').transform((val) => (val || '').trim()),
  email: z.string().email('Invalid work email address').trim().toLowerCase(),
  phone: z.string().optional().default(''),
  department: z.string().nullable().optional(),
  designation: z.string().optional().default(''),
  employeeCode: z.string().optional().default(''),
  joiningDate: z.string().or(z.date()).optional(),
  location: z.string().optional().default(''),
  role: z.enum(['SUPER_ADMIN', 'HR', 'EMPLOYEE']).default('EMPLOYEE'),
  monthlyWage: z.coerce.number().min(0, 'Monthly wage cannot be negative').default(0),
  // Private Info
  gender: z.string().optional().default(''),
  dob: z.string().nullable().optional(),
  maritalStatus: z.string().optional().default(''),
  nationality: z.string().optional().default(''),
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
  skills: z.array(z.string()).optional().default([]),
  certifications: z.array(z.string()).optional().default([]),
  hobbies: z.string().optional().default(''),
  about: z.string().optional().default(''),
  jobDescription: z.string().optional().default(''),
  avatarColor: z.string().optional().default('#c98a4b'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional()
});

const updateEmployeeSchema = createEmployeeSchema.partial().omit({ password: true });

const updateSalarySchema = z.object({
  monthlyWage: z.coerce.number().min(0, 'Monthly wage cannot be negative')
});

const updateStatusSchema = z.object({
  status: z.enum(['present', 'absent', 'leave', 'inactive'])
});

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema,
  updateSalarySchema,
  updateStatusSchema
};
