const mongoose = require('mongoose');

const shipmentTimelineSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: String,
    default: '',
  },
  note: {
    type: String,
    default: '',
  },
});

const shipmentSchema = new mongoose.Schema(
  {
    shipmentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    carrier: {
      type: String,
      default: 'PharmaExpress Logistics',
    },
    originWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
    },
    destination: {
      type: String,
      default: 'Central Regional Hospital Pharmacy',
    },
    currentLocation: {
      type: String,
      default: 'In Transit',
    },
    temperatureReading: {
      type: String,
      default: '4.2°C (Optimal)',
    },
    status: {
      type: String,
      enum: ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'],
      default: 'ORDER_PLACED',
      index: true,
    },
    estimatedDelivery: {
      type: Date,
    },
    actualDelivery: {
      type: Date,
    },
    timeline: [shipmentTimelineSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Shipment', shipmentSchema);
