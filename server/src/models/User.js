const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const bankInfoSchema = new mongoose.Schema(
  {
    bankName: { type: String, default: '', trim: true },
    accountNumber: { type: String, default: '', trim: true },
    ifsc: { type: String, default: '', trim: true },
    pan: { type: String, default: '', trim: true },
    uan: { type: String, default: '', trim: true }
  },
  { _id: false }
);

const salarySchema = new mongoose.Schema(
  {
    monthlyWage: { type: Number, default: 0, min: [0, 'Monthly wage cannot be negative'] }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true
    },
    loginId: {
      type: String,
      required: [true, 'Login ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      default: '',
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'HR', 'EMPLOYEE'],
      default: 'EMPLOYEE',
      index: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true
    },
    designation: {
      type: String,
      default: '',
      trim: true
    },
    employeeCode: {
      type: String,
      default: '',
      trim: true
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    location: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'leave', 'inactive'],
      default: 'present'
    },
    // Private Information
    gender: {
      type: String,
      default: '',
      trim: true
    },
    dob: {
      type: Date,
      default: null
    },
    maritalStatus: {
      type: String,
      default: '',
      trim: true
    },
    nationality: {
      type: String,
      default: '',
      trim: true
    },
    address: {
      type: String,
      default: '',
      trim: true
    },
    personalEmail: {
      type: String,
      default: '',
      lowercase: true,
      trim: true
    },
    bankInfo: {
      type: bankInfoSchema,
      default: () => ({})
    },
    // Resume Tab Information
    about: {
      type: String,
      default: '',
      trim: true
    },
    jobDescription: {
      type: String,
      default: '',
      trim: true
    },
    hobbies: {
      type: String,
      default: '',
      trim: true
    },
    skills: {
      type: [String],
      default: []
    },
    certifications: {
      type: [String],
      default: []
    },
    salary: {
      type: salarySchema,
      default: () => ({ monthlyWage: 0 })
    },
    avatarColor: {
      type: String,
      default: '#DC586D'
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound Unique Index: email must be unique per company
userSchema.index({ companyId: 1, email: 1 }, { unique: true });

// Virtual fullName
userSchema.virtual('fullName').get(function () {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Compare password instance method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
