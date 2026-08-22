const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Company email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    companyCode: {
      type: String,
      required: [true, 'Company code is required'],
      uppercase: true,
      trim: true
    },
    logo: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
