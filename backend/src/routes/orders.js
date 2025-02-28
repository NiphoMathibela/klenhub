const express = require('express');
const { check } = require('express-validator');
const { createOrder, getOrders, getOrder, updateOrderStatus, getUserOrders } = require('../controllers/orders');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Create order - any authenticated user
router.post('/', [
  protect,
  check('items', 'Items are required').isArray(),
  check('items.*.productId', 'Product ID is required').not().isEmpty(),
  check('items.*.quantity', 'Quantity must be a positive number').isInt({ min: 1 }),
  check('items.*.size', 'Size is required').not().isEmpty(),
  check('total', 'Total must be a positive number').isFloat({ min: 0 })
], createOrder);

// Get all orders - admin only
router.get('/admin', protect, admin, getOrders);

// Get user's orders - authenticated user
router.get('/my-orders', protect, getUserOrders);

// Get specific order - admin or order owner
router.get('/:id', protect, getOrder);

// Update order status - admin only
router.patch('/:id/status', [
  protect,
  admin,
  check('status', 'Status is required').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
], updateOrderStatus);

module.exports = router;
