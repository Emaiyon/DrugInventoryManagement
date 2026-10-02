const Drug = require('../models/Drug');
const Inventory = require('../models/Inventory');
const Supplier = require('../models/Supplier');
const Order = require('../models/Order');
const Shipment = require('../models/Shipment');
const Warehouse = require('../models/Warehouse');
const Alert = require('../models/Alert');

// @desc    Admin Dashboard Analytics & Metrics
// @route   GET /api/dashboard/admin
// @access  Private (ADMIN)
const getAdminDashboard = async (req, res) => {
  try {
    const now = new Date();
    const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    // 1. Metric Cards
    const totalDrugs = await Drug.countDocuments();
    const totalSuppliers = await Supplier.countDocuments({ status: 'ACTIVE' });
    const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ['PENDING', 'CONFIRMED', 'PROCESSING'] } });
    const shipmentsInTransit = await Shipment.countDocuments({ status: { $in: ['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] } });

    // Inventory aggregates
    const inventoryStats = await Inventory.aggregate([
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
        },
      },
    ]);

    const totalInventoryUnits = inventoryStats.length ? inventoryStats[0].totalQuantity : 0;
    const inventoryValue = inventoryStats.length ? inventoryStats[0].totalValue : 0;

    const lowStockCount = await Inventory.countDocuments({ status: 'LOW_STOCK' });
    const outOfStockCount = await Inventory.countDocuments({ status: 'OUT_OF_STOCK' });
    const expiringSoonCount = await Inventory.countDocuments({
      expiryDate: { $gte: now, $lte: ninetyDays },
    });
    const expiredCount = await Inventory.countDocuments({
      expiryDate: { $lt: now },
    });

    // 2. Charts Data
    // A. Drug Categories Breakdown
    const drugCategories = await Drug.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
      { $sort: { value: -1 } },
      { $limit: 6 },
    ]);

    // B. Shipment Status breakdown
    const shipmentStatuses = await Shipment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: '$count', _id: 0 } },
    ]);

    // C. Monthly Orders (last 6 months)
    const monthlyOrders = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' },
          },
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 },
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $cond: [{ $lt: ['$_id.month', 10] }, { $concat: ['0', { $toString: '$_id.month' }] }, { $toString: '$_id.month' }] },
            ],
          },
          orders: '$orderCount',
          revenue: '$totalRevenue',
          _id: 0,
        },
      },
    ]);

    // D. Inventory by Warehouse
    const inventoryByWarehouse = await Inventory.aggregate([
      {
        $group: {
          _id: '$warehouse',
          totalUnits: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
        },
      },
      {
        $lookup: {
          from: 'warehouses',
          localField: '_id',
          foreignField: '_id',
          as: 'wh',
        },
      },
      { $unwind: { path: '$wh', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          warehouseName: { $ifNull: ['$wh.name', 'Central Hub'] },
          units: '$totalUnits',
          value: '$totalValue',
          _id: 0,
        },
      },
      { $limit: 6 },
    ]);

    // E. Low Stock items for table/trend
    const lowStockItems = await Inventory.find({
      $or: [{ status: 'LOW_STOCK' }, { status: 'OUT_OF_STOCK' }],
    })
      .populate('drug', 'name genericName category')
      .populate('warehouse', 'name code')
      .limit(6);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('supplier', 'companyName')
      .populate('customer', 'name organization')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent shipments
    const recentShipments = await Shipment.find()
      .populate('originWarehouse', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Unread / recent alerts
    const recentAlerts = await Alert.find({ isRead: false })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      cards: {
        totalDrugs,
        totalInventory: totalInventoryUnits,
        inventoryValue: Math.round(inventoryValue),
        lowStock: lowStockCount + outOfStockCount,
        expiringSoon: expiringSoonCount,
        expired: expiredCount,
        activeSuppliers: totalSuppliers,
        pendingOrders,
        shipmentsInTransit,
      },
      charts: {
        drugCategories,
        shipmentStatuses,
        monthlyOrders,
        inventoryOverview: inventoryByWarehouse,
      },
      recentOrders,
      recentShipments,
      recentAlerts,
      lowStockItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating admin dashboard',
    });
  }
};

// @desc    Supplier Dashboard
// @route   GET /api/dashboard/supplier
// @access  Private (SUPPLIER, ADMIN)
const getSupplierDashboard = async (req, res) => {
  try {
    const supplierDoc = await Supplier.findOne({ email: req.user.email });
    const supplierId = supplierDoc ? supplierDoc._id : null;

    const query = supplierId ? { supplier: supplierId } : {};

    const totalOrders = await Order.countDocuments(query);
    const pendingOrders = await Order.countDocuments({ ...query, orderStatus: 'PENDING' });
    const shippedOrders = await Order.countDocuments({ ...query, orderStatus: 'SHIPPED' });

    const revenueResult = await Order.aggregate([
      { $match: { ...query, paymentStatus: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult.length ? revenueResult[0].total : 0;

    const recentOrders = await Order.find(query)
      .populate('customer', 'name organization')
      .sort({ createdAt: -1 })
      .limit(6);

    const products = supplierDoc
      ? await Drug.find({ _id: { $in: supplierDoc.products } })
      : await Drug.find().limit(6);

    res.json({
      success: true,
      supplier: supplierDoc,
      cards: {
        totalOrders,
        pendingOrders,
        shippedOrders,
        totalRevenue,
        productCount: products.length,
      },
      recentOrders,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating supplier dashboard',
    });
  }
};

// @desc    Warehouse Dashboard
// @route   GET /api/dashboard/warehouse
// @access  Private (WAREHOUSE_MANAGER, ADMIN)
const getWarehouseDashboard = async (req, res) => {
  try {
    const totalWarehouses = await Warehouse.countDocuments({ status: 'ACTIVE' });
    const totalBatches = await Inventory.countDocuments();
    const lowStockAlerts = await Inventory.countDocuments({ status: { $in: ['LOW_STOCK', 'OUT_OF_STOCK'] } });
    const activeShipments = await Shipment.countDocuments({ status: { $in: ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'IN_TRANSIT'] } });

    const warehouses = await Warehouse.find({ status: 'ACTIVE' });
    const recentBatches = await Inventory.find()
      .populate('drug', 'name genericName category')
      .populate('warehouse', 'name code')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      cards: {
        totalWarehouses,
        totalBatches,
        lowStockAlerts,
        activeShipments,
      },
      warehouses,
      recentBatches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating warehouse dashboard',
    });
  }
};

// @desc    Pharmacy Dashboard
// @route   GET /api/dashboard/pharmacy
// @access  Private (PHARMACY_MANAGER, ADMIN)
const getPharmacyDashboard = async (req, res) => {
  try {
    const myOrders = await Order.countDocuments({ customer: req.user._id });
    const pendingOrders = await Order.countDocuments({
      customer: req.user._id,
      orderStatus: { $in: ['PENDING', 'CONFIRMED', 'PROCESSING'] },
    });
    const incomingShipments = await Shipment.countDocuments({
      status: { $in: ['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] },
    });

    const now = new Date();
    const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const expiringSoon = await Inventory.countDocuments({
      expiryDate: { $gte: now, $lte: ninetyDays },
    });

    const recentOrders = await Order.find({ customer: req.user._id })
      .populate('supplier', 'companyName')
      .sort({ createdAt: -1 })
      .limit(5);

    const availableDrugs = await Drug.find({ status: 'ACTIVE' }).limit(8);

    res.json({
      success: true,
      cards: {
        totalOrders: myOrders,
        pendingOrders,
        incomingShipments,
        expiringSoon,
      },
      recentOrders,
      availableDrugs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating pharmacy dashboard',
    });
  }
};

module.exports = {
  getAdminDashboard,
  getSupplierDashboard,
  getWarehouseDashboard,
  getPharmacyDashboard,
};
