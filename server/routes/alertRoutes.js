const express = require('express');
const router = express.Router();
const {
  getAlerts,
  markAlertRead,
  markAllAlertsRead,
  deleteAlert,
} = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAlerts);
router.put('/read-all', protect, markAllAlertsRead);
router.put('/:id/read', protect, markAlertRead);
router.delete('/:id', protect, authorize('ADMIN'), deleteAlert);

module.exports = router;
