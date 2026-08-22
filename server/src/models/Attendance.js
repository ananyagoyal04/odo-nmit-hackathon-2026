const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
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
    date: {
      type: String, // YYYY-MM-DD format
      required: [true, 'Date (YYYY-MM-DD) is required'],
      index: true
    },
    checkIn: {
      type: Date,
      default: null
    },
    checkOut: {
      type: Date,
      default: null
    },
    totalWorkHours: {
      type: Number,
      default: 0
    },
    idleHours: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'leave'],
      default: 'present'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Unique compound index: prevent duplicate check-ins on same day per employee
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
