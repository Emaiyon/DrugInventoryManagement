const Alert = require('../models/Alert');
const Inventory = require('../models/Inventory');
const Shipment = require('../models/Shipment');

// Helper to auto-generate alerts from current state
const syncSystemAlerts = async () => {
  try {
    const now = new Date();
    const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    // 1. Expired batches
    const expiredBatches = await Inventory.find({
      expiryDate: { $lt: now },
    }).populate('drug', 'name').limit(10);

    for (const batch of expiredBatches) {
      const exists = await Alert.findOne({
        type: 'EXPIRED',
        'relatedItem.itemId': batch._id,
      });
      if (!exists) {
        await Alert.create({
          title: 'Batch Expired',
          message: `Batch ${batch.batchNumber} of ${batch.drug?.name || 'Drug'} expired on ${new Date(batch.expiryDate).toLocaleDateString()}. Immediate quarantine required.`,
          type: 'EXPIRED',
          severity: 'CRITICAL',
          relatedItem: { modelName: 'Inventory', itemId: batch._id },
        });
      }
    }

    // 2. Expiring soon
    const expiringBatches = await Inventory.find({
      expiryDate: { $gte: now, $lte: ninetyDays },
    }).populate('drug', 'name').limit(10);

    for (const batch of expiringBatches) {
      const exists = await Alert.findOne({
        type: 'EXPIRING_SOON',
        'relatedItem.itemId': batch._id,
      });
      if (!exists) {
        await Alert.create({
          title: 'Expiring Soon Warning',
          message: `Batch ${batch.batchNumber} of ${batch.drug?.name || 'Drug'} will expire within 90 days.`,
          type: 'EXPIRING_SOON',
          severity: 'WARNING',
          relatedItem: { modelName: 'Inventory', itemId: batch._id },
        });
      }
    }

    // 3. Out of stock
    const outOfStockBatches = await Inventory.find({
      quantity: { $lte: 0 },
    }).populate('drug', 'name').limit(10);

    for (const batch of outOfStockBatches) {
      const exists = await Alert.findOne({
        type: 'OUT_OF_STOCK',
        'relatedItem.itemId': batch._id,
      });
      if (!exists) {
        await Alert.create({
          title: 'Stock Depleted',
          message: `Batch ${batch.batchNumber} of ${batch.drug?.name || 'Drug'} is completely out of stock.`,
          type: 'OUT_OF_STOCK',
          severity: 'CRITICAL',
          relatedItem: { modelName: 'Inventory', itemId: batch._id },
        });
      }
    }
  } catch (err) {
    console.error('[Alert Sync Error]', err.message);
  }
};

// @desc    Get alerts
// @route   GET /api/alerts
// @access  Private
const getAlerts = async (req, res) => {
  try {
    // Optionally trigger sync on fetch
    await syncSystemAlerts();

    const { status, type, severity, limit = 20 } = req.query;
    const query = {};

    if (status === 'unread') {
      query.isRead = false;
    } else if (status === 'read') {
      query.isRead = true;
    }

    if (type && type !== 'ALL') {
      query.type = type;
    }

    if (severity && severity !== 'ALL') {
      query.severity = severity;
    }

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    const unreadCount = await Alert.countDocuments({ isRead: false });

    res.json({
      success: true,
      alerts,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching alerts',
    });
  }
};

// @desc    Mark single alert as read
// @route   PUT /api/alerts/:id/read
// @access  Private
const markAlertRead = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    alert.isRead = true;
    await alert.save();

    res.json({
      success: true,
      alert,
      message: 'Alert marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating alert',
    });
  }
};

// @desc    Mark all alerts as read
// @route   PUT /api/alerts/read-all
// @access  Private
const markAllAlertsRead = async (req, res) => {
  try {
    await Alert.updateMany({ isRead: false }, { $set: { isRead: true } });

    res.json({
      success: true,
      message: 'All alerts marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating alerts',
    });
  }
};

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private (ADMIN)
const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    await Alert.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting alert',
    });
  }
};

module.exports = {
  getAlerts,
  markAlertRead,
  markAllAlertsRead,
  deleteAlert,
};
