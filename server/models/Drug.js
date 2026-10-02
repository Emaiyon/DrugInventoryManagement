const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide drug name'],
      trim: true,
      index: true,
    },
    genericName: {
      type: String,
      required: [true, 'Please provide generic name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide category'],
      trim: true,
      index: true,
    },
    manufacturer: {
      type: String,
      required: [true, 'Please provide manufacturer'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    dosageForm: {
      type: String,
      default: 'Tablet', // Tablet, Capsule, Liquid, Injection, Inhaler, Topical, etc.
    },
    strength: {
      type: String,
      default: '500mg',
    },
    price: {
      type: Number,
      required: [true, 'Please provide unit price'],
      min: 0,
    },
    prescriptionRequired: {
      type: Boolean,
      default: true,
    },
    storageConditions: {
      type: String,
      default: 'Store at 15-25°C in dry place',
    },
    batchNumber: {
      type: String,
      default: '',
    },
    manufacturingDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'DISCONTINUED', 'RECALLED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Drug', drugSchema);
