const express = require('express');
const router = express.Router();
const {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} = require('../controllers/warehouseController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getWarehouses)
  .post(protect, authorize('ADMIN'), createWarehouse);

router
  .route('/:id')
  .get(protect, getWarehouseById)
  .put(protect, authorize('ADMIN', 'WAREHOUSE_MANAGER'), updateWarehouse)
  .delete(protect, authorize('ADMIN'), deleteWarehouse);

module.exports = router;
