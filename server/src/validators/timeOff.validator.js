const { z } = require('zod');

const requestTimeOffSchema = z.object({
  type: z.enum(['Paid Time Off', 'Sick Time Off']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  reason: z.string().optional().default('')
}).refine((data) => data.startDate <= data.endDate, {
  message: 'End date must be on or after start date',
  path: ['endDate']
});

const approveRejectTimeOffSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().optional().default('')
});

module.exports = {
  requestTimeOffSchema,
  approveRejectTimeOffSchema
};
