const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide warehouse name'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Please provide warehouse code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    location: {
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: 'USA' },
      zipCode: { type: String, default: '' },
    },
    capacity: {
      type: Number,
      default: 50000, // units/sqft
    },
    currentUtilization: {
      type: Number,
      default: 0,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    managerName: {
      type: String,
      default: 'Warehouse Lead',
    },
    contactNumber: {
      type: String,
      default: '',
    },
    temperatureControlled: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Warehouse', warehouseSchema);
