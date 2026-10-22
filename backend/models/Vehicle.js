const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Vehicle type is required'],
      enum: {
        values: ['Hatchback', 'Sedan', 'SUV'],
        message: '{VALUE} is not a valid vehicle type (must be Hatchback, Sedan, or SUV)'
      }
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: [0, 'Price per day cannot be negative']
    },
    available: {
      type: Boolean,
      default: true
    },
    seats: {
      type: Number,
      default: 5
    },
    fuelType: {
      type: String,
      default: 'Petrol'
    },
    transmission: {
      type: String,
      default: 'Automatic'
    },
    imageUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
