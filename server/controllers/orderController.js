const Order = require('../models/Order');
const Shipment = require('../models/Shipment');
const Alert = require('../models/Alert');
const Supplier = require('../models/Supplier');

// @desc    Get orders (scoped to role)
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 10 } = req.query;

    const query = {};

    // Role-based scoping:
    // If supplier, only their supplier orders
    if (req.user.role === 'SUPPLIER') {
      const mySupplier = await Supplier.findOne({ email: req.user.email });
      if (mySupplier) {
        query.supplier = mySupplier._id;
      }
    } else if (req.user.role === 'PHARMACY_MANAGER') {
      // Pharmacy manager sees their pharmacy's orders
      query.customer = req.user._id;
    }

    if (status && status !== 'ALL') {
      query.orderStatus = status;
    }

    if (paymentStatus && paymentStatus !== 'ALL') {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      query.orderId = { $regex: search, $options: 'i' };
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * pageSize;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('supplier', 'companyName contactPerson email phone')
      .populate('customer', 'name email organization')
      .populate('items.drug', 'name genericName category dosageForm')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    res.json({
      success: true,
      orders,
      page: pageNumber,
      pages: Math.ceil(total / pageSize) || 1,
      total,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching orders',
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('supplier')
      .populate('customer', 'name email organization phone')
      .populate('items.drug');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Associated shipment if any
    const shipment = await Shipment.findOne({ order: order._id });

    res.json({
      success: true,
      order,
      shipment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching order details',
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      supplier,
      items,
      expectedDelivery,
      shippingAddress,
      notes,
    } = req.body;

    if (!supplier || !items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Please provide supplier and at least one order item',
      });
    }

    // Calculate totals
    let totalAmount = 0;
    let totalQuantity = 0;

    const processedItems = items.map((item) => {
      const subtotal = Number(item.quantity) * Number(item.unitPrice);
      totalAmount += subtotal;
      totalQuantity += Number(item.quantity);
      return {
        drug: item.drug,
        drugName: item.drugName,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        subtotal,
      };
    });

    // Auto-generate order ID
    const count = await Order.countDocuments();
    const orderId = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const order = await Order.create({
      orderId,
      supplier,
      customer: req.user._id,
      items: processedItems,
      totalQuantity,
      totalAmount,
      expectedDelivery: expectedDelivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      shippingAddress: shippingAddress || 'Main Central Hospital Pharmacy',
      notes: notes || '',
      orderStatus: 'PENDING',
      paymentStatus: 'PENDING',
    });

    // Create notification alert for pending order
    await Alert.create({
      title: 'New Order Placed',
      message: `Order #${order.orderId} for $${order.totalAmount.toLocaleString()} has been placed by ${req.user.name}.`,
      type: 'PENDING_ORDER',
      severity: 'INFO',
      relatedItem: { modelName: 'Order', itemId: order._id },
    });

    const populated = await Order.findById(order._id)
      .populate('supplier')
      .populate('customer', 'name email');

    res.status(201).json({
      success: true,
      order: populated,
      message: 'Order placed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating order',
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const { orderStatus, paymentStatus, expectedDelivery, notes } = req.body;

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (expectedDelivery) order.expectedDelivery = expectedDelivery;
    if (notes) order.notes = notes;

    await order.save();

    // If order confirmed and no shipment exists, optionally link or notify
    const updated = await Order.findById(order._id)
      .populate('supplier')
      .populate('customer', 'name email');

    res.json({
      success: true,
      order: updated,
      message: 'Order updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating order',
    });
  }
};

// @desc    Delete/Cancel order
// @route   DELETE /api/orders/:id
// @access  Private
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // If already shipped, don't hard delete, mark cancelled
    if (['SHIPPED', 'DELIVERED'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete order in ${order.orderStatus} status.`,
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Order cancelled and deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting order',
    });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
