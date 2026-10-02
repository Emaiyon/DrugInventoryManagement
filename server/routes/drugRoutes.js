const express = require('express');
const router = express.Router();
const {
  getDrugs,
  getDrugById,
  createDrug,
  updateDrug,
  deleteDrug,
} = require('../controllers/drugController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getDrugs)
  .post(protect, authorize('ADMIN', 'SUPPLIER'), createDrug);

router
  .route('/:id')
  .get(protect, getDrugById)
  .put(protect, authorize('ADMIN', 'SUPPLIER'), updateDrug)
  .delete(protect, authorize('ADMIN'), deleteDrug);

module.exports = router;
