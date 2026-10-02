const express = require('express');
const router = express.Router();
const {
  getInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  adjustStock,
  deleteInventory,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getInventory)
  .post(protect, authorize('ADMIN', 'WAREHOUSE_MANAGER'), createInventory);

router.post('/:id/adjust', protect, authorize('ADMIN', 'WAREHOUSE_MANAGER', 'PHARMACY_MANAGER'), adjustStock);

router
  .route('/:id')
  .get(protect, getInventoryById)
  .put(protect, authorize('ADMIN', 'WAREHOUSE_MANAGER'), updateInventory)
  .delete(protect, authorize('ADMIN'), deleteInventory);

module.exports = router;
