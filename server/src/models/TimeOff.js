const mongoose = require('mongoose');

const timeOffSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID is required'],
      index: true
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true
    },
    type: {
      type: String,
      enum: ['Paid Time Off', 'Sick Time Off'],
      required: [true, 'Time off type is required']
    },
    startDate: {
      type: String, // YYYY-MM-DD
      required: [true, 'Start date is required']
    },
    endDate: {
      type: String, // YYYY-MM-DD
      required: [true, 'End date is required']
    },
    reason: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const TimeOff = mongoose.model('TimeOff', timeOffSchema);

module.exports = TimeOff;
