const Shipment = require('../models/Shipment');
const Order = require('../models/Order');
const Alert = require('../models/Alert');

// @desc    Get all shipments with search and status filter
// @route   GET /api/shipments
// @access  Private
const getShipments = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { shipmentId: { $regex: search, $options: 'i' } },
        { trackingNumber: { $regex: search, $options: 'i' } },
        { carrier: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * pageSize;

    const total = await Shipment.countDocuments(query);
    const shipments = await Shipment.find(query)
      .populate({
        path: 'order',
        populate: [
          { path: 'supplier', select: 'companyName contactPerson' },
          { path: 'customer', select: 'name organization' },
        ],
      })
      .populate('originWarehouse', 'name code location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    res.json({
      success: true,
      shipments,
      page: pageNumber,
      pages: Math.ceil(total / pageSize) || 1,
      total,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching shipments',
    });
  }
};

// @desc    Get single shipment by ID or tracking number
// @route   GET /api/shipments/:id
// @access  Private
const getShipmentById = async (req, res) => {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);

    const query = isObjectId
      ? { _id: req.params.id }
      : {
          $or: [
            { trackingNumber: req.params.id },
            { shipmentId: req.params.id },
          ],
        };

    const shipment = await Shipment.findOne(query)
      .populate({
        path: 'order',
        populate: [
          { path: 'supplier' },
          { path: 'customer' },
          { path: 'items.drug' },
        ],
      })
      .populate('originWarehouse');

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found',
      });
    }

    res.json({
      success: true,
      shipment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching shipment details',
    });
  }
};

// @desc    Create new shipment for an order
// @route   POST /api/shipments
// @access  Private (ADMIN, WAREHOUSE_MANAGER, SUPPLIER)
const createShipment = async (req, res) => {
  try {
    const {
      order,
      carrier,
      originWarehouse,
      destination,
      estimatedDelivery,
      temperatureReading,
    } = req.body;

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Please associate an order with this shipment',
      });
    }

    const orderDoc = await Order.findById(order);
    if (!orderDoc) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const count = await Shipment.countDocuments();
    const shipmentId = `SHP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const trackingNumber = `TRK-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const initialTimeline = [
      {
        status: 'ORDER_PLACED',
        timestamp: new Date(),
        location: 'Order Dispatch Center',
        note: `Shipment created for Order #${orderDoc.orderId}`,
      },
    ];

    const shipment = await Shipment.create({
      shipmentId,
      order,
      trackingNumber,
      carrier: carrier || 'PharmaTransit Direct',
      originWarehouse: originWarehouse || null,
      destination: destination || orderDoc.shippingAddress || 'Central Hospital Pharmacy',
      currentLocation: 'Origin Warehouse Facility',
      temperatureReading: temperatureReading || '3.8°C (Optimal)',
      status: 'ORDER_PLACED',
      estimatedDelivery: estimatedDelivery || new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      timeline: initialTimeline,
    });

    // Update order status
    orderDoc.orderStatus = 'PROCESSING';
    await orderDoc.save();

    const populated = await Shipment.findById(shipment._id)
      .populate('order')
      .populate('originWarehouse');

    res.status(201).json({
      success: true,
      shipment: populated,
      message: 'Shipment created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating shipment',
    });
  }
};

// @desc    Update shipment status & advance progress
// @route   PUT /api/shipments/:id
// @access  Private (ADMIN, WAREHOUSE_MANAGER, SUPPLIER)
const updateShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found',
      });
    }

    const { status, currentLocation, temperatureReading, locationNote } = req.body;

    if (status && status !== shipment.status) {
      shipment.status = status;
      shipment.timeline.push({
        status,
        timestamp: new Date(),
        location: currentLocation || shipment.currentLocation,
        note: locationNote || `Shipment advanced to ${status}`,
      });

      if (status === 'DELIVERED') {
        shipment.actualDelivery = new Date();

        // Also mark order as DELIVERED
        await Order.findByIdAndUpdate(shipment.order, {
          orderStatus: 'DELIVERED',
          paymentStatus: 'PAID',
        });
      } else if (status === 'SHIPPED') {
        await Order.findByIdAndUpdate(shipment.order, {
          orderStatus: 'SHIPPED',
        });
      }
    }

    if (currentLocation) shipment.currentLocation = currentLocation;
    if (temperatureReading) shipment.temperatureReading = temperatureReading;

    await shipment.save();

    const populated = await Shipment.findById(shipment._id)
      .populate({
        path: 'order',
        populate: [{ path: 'supplier' }, { path: 'customer' }],
      })
      .populate('originWarehouse');

    res.json({
      success: true,
      shipment: populated,
      message: 'Shipment updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating shipment',
    });
  }
};

module.exports = {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipment,
};
