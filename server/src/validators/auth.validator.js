const { z } = require('zod');

const registerCompanySchema = z
  .object({
    companyName: z.string().min(2, 'Company name must be at least 2 characters').trim(),
    name: z.string().optional(),
    companyEmail: z.string().email('Invalid company email address').optional(),
    email: z.string().email('Invalid email address').optional(),
    companyCode: z.string().optional(),
    adminName: z.string().optional(),
    adminEmail: z.string().email('Invalid admin email address').optional(),
    phone: z.string().optional().default(''),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().optional(),
    logo: z.string().optional().default('')
  })
  .transform((data) => {
    const effectiveEmail = data.adminEmail || data.companyEmail || data.email;
    const effectiveCompanyName = data.companyName || data.name || 'Organization';
    const effectiveAdminName = data.adminName || (effectiveEmail ? effectiveEmail.split('@')[0] : 'Admin');
    const effectivePassword = data.password;
    const effectiveConfirmPassword = data.confirmPassword || effectivePassword;

    return {
      companyName: effectiveCompanyName,
      companyEmail: data.companyEmail || effectiveEmail,
      companyCode: data.companyCode || effectiveCompanyName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'CO',
      adminName: effectiveAdminName,
      adminEmail: effectiveEmail,
      phone: data.phone || '',
      password: effectivePassword,
      confirmPassword: effectiveConfirmPassword,
      logo: data.logo || ''
    };
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
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmNewPassword: z.string().optional()
  })
  .transform((data) => ({
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
    confirmNewPassword: data.confirmNewPassword || data.newPassword
  }))
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ['confirmNewPassword']
  });

module.exports = {
  registerCompanySchema,
  loginSchema,
  changePasswordSchema
};
