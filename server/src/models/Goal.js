const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    quarter: {
      type: String,
      enum: ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'],
      default: 'Q3 2026'
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    category: {
      type: String,
      enum: ['Engineering', 'Product & Design', 'Sales & Growth', 'Leadership', 'Personal Development'],
      default: 'Engineering'
    },
    status: {
      type: String,
      enum: ['on_track', 'behind', 'completed', 'at_risk'],
      default: 'on_track'
    },
    dueDate: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', goalSchema);
