const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getSupplierDashboard,
  getWarehouseDashboard,
  getPharmacyDashboard,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/admin', protect, authorize('ADMIN'), getAdminDashboard);
router.get('/supplier', protect, authorize('ADMIN', 'SUPPLIER'), getSupplierDashboard);
router.get('/warehouse', protect, authorize('ADMIN', 'WAREHOUSE_MANAGER'), getWarehouseDashboard);
router.get('/pharmacy', protect, authorize('ADMIN', 'PHARMACY_MANAGER'), getPharmacyDashboard);

module.exports = router;
