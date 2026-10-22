const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    licenseNumber: {
      type: String,
      required: [true, 'Driving license number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    role: {
      type: String,
      enum: {
        values: ['Customer', 'Fleet Manager', 'Admin'],
        message: '{VALUE} is not a valid role (must be Customer, Fleet Manager, or Admin)'
      },
      default: 'Customer'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Customer', customerSchema);
