const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    drug: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drug',
      required: [true, 'Please associate a drug'],
      index: true,
    },
    batchNumber: {
      type: String,
      required: [true, 'Please provide batch number'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide quantity'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    unitPrice: {
      type: Number,
      required: [true, 'Please provide unit price'],
      min: 0,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Please associate a supplier'],
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Please associate a warehouse'],
    },
    manufacturingDate: {
      type: Date,
      required: [true, 'Please provide manufacturing date'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please provide expiry date'],
      index: true,
    },
    minimumStockLevel: {
      type: Number,
      default: 50,
    },
    status: {
      type: String,
      enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRING_SOON', 'EXPIRED'],
      default: 'IN_STOCK',
      index: true,
    },
    location: {
      type: String,
      default: 'Aisle A, Shelf 1',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Method to compute status based on business rules
inventorySchema.methods.calculateStatus = function () {
  const now = new Date();
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  if (this.expiryDate && new Date(this.expiryDate) < now) {
    return 'EXPIRED';
  }
  if (this.quantity <= 0) {
    return 'OUT_OF_STOCK';
  }
  if (this.expiryDate && new Date(this.expiryDate) <= ninetyDaysFromNow) {
    return 'EXPIRING_SOON';
  }
  if (this.quantity <= this.minimumStockLevel) {
    return 'LOW_STOCK';
  }
  return 'IN_STOCK';
};

inventorySchema.pre('save', function (next) {
  this.status = this.calculateStatus();
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
