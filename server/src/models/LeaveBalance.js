const mongoose = require('mongoose');

const leaveBucketSchema = new mongoose.Schema(
  {
    total: {
      type: Number,
      default: 24,
      min: 0
    },
    used: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { _id: false }
);

const sickBucketSchema = new mongoose.Schema(
  {
    total: {
      type: Number,
      default: 10,
      min: 0
    },
    used: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { _id: false }
);

const leaveBalanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID is required'],
      unique: true,
      index: true
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true
    },
    pto: {
      type: leaveBucketSchema,
      default: () => ({ total: 24, used: 0 })
    },
    sick: {
      type: sickBucketSchema,
      default: () => ({ total: 10, used: 0 })
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual remaining balances
leaveBalanceSchema.virtual('ptoRemaining').get(function () {
  const total = this.pto?.total ?? 24;
  const used = this.pto?.used ?? 0;
  return Math.max(0, total - used);
});

leaveBalanceSchema.virtual('sickRemaining').get(function () {
  const total = this.sick?.total ?? 10;
  const used = this.sick?.used ?? 0;
  return Math.max(0, total - used);
});

const LeaveBalance = mongoose.model('LeaveBalance', leaveBalanceSchema);

module.exports = LeaveBalance;
