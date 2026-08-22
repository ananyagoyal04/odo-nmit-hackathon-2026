const { z } = require('zod');

const registerCompanySchema = z
  .object({
    companyName: z.string().min(2, 'Company name must be at least 2 characters').trim(),
    companyEmail: z.string().email('Invalid company email address').trim().toLowerCase(),
    adminName: z.string().min(2, 'Admin name must be at least 2 characters').trim(),
    adminEmail: z.string().email('Invalid admin email address').trim().toLowerCase(),
    phone: z.string().optional().default(''),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
    logo: z.string().optional().default('')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

const loginSchema = z.object({
  identifier: z.string().min(1, 'Login ID or Email is required').trim(),
  password: z.string().min(1, 'Password is required')
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmNewPassword: z.string().min(8, 'Confirm new password must be at least 8 characters')
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ['confirmNewPassword']
  });

module.exports = {
  registerCompanySchema,
  loginSchema,
  changePasswordSchema
};
