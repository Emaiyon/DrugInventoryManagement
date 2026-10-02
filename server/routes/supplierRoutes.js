const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getSuppliers)
  .post(protect, authorize('ADMIN'), createSupplier);

router
  .route('/:id')
  .get(protect, getSupplierById)
  .put(protect, authorize('ADMIN', 'SUPPLIER'), updateSupplier)
  .delete(protect, authorize('ADMIN'), deleteSupplier);

module.exports = router;
