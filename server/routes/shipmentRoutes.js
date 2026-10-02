const express = require('express');
const router = express.Router();
const {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipment,
} = require('../controllers/shipmentController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getShipments)
  .post(protect, authorize('ADMIN', 'WAREHOUSE_MANAGER', 'SUPPLIER'), createShipment);

router
  .route('/:id')
  .get(protect, getShipmentById)
  .put(protect, authorize('ADMIN', 'WAREHOUSE_MANAGER', 'SUPPLIER'), updateShipment);

module.exports = router;
