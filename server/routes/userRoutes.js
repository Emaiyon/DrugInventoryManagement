const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, authorize('ADMIN'), getUsers)
  .post(protect, authorize('ADMIN'), createUser);

router
  .route('/:id')
  .get(protect, authorize('ADMIN'), getUserById)
  .put(protect, authorize('ADMIN'), updateUser)
  .delete(protect, authorize('ADMIN'), deleteUser);

module.exports = router;
