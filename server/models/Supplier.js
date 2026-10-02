const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Please provide company name'],
      trim: true,
      index: true,
    },
    contactPerson: {
      type: String,
      required: [true, 'Please provide contact person name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide supplier email'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
    },
    address: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: 'United States',
    },
    licenseNumber: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drug',
      },
    ],
    paymentTerms: {
      type: String,
      default: 'Net 30 Days',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Supplier', supplierSchema);
