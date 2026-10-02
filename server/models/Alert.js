const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'LOW_STOCK',
        'OUT_OF_STOCK',
        'EXPIRING_SOON',
        'EXPIRED',
        'DELAYED_SHIPMENT',
        'PENDING_ORDER',
        'SYSTEM',
      ],
      default: 'SYSTEM',
      index: true,
    },
    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'CRITICAL'],
      default: 'WARNING',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedItem: {
      modelName: {
        type: String,
        enum: ['Drug', 'Inventory', 'Order', 'Shipment', 'Supplier', 'Warehouse', null],
      },
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Alert', alertSchema);
