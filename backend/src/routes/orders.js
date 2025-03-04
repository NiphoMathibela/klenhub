const express = require('express');
const { check } = require('express-validator');
const { createOrder, getOrders, getOrder, updateOrderStatus, getUserOrders, updateTrackingNumber } = require('../controllers/orders');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Create order - any authenticated user
router.post('/', [
  protect,
  check('items', 'Items are required').isArray(),
  check('items.*.productId', 'Product ID is required').not().isEmpty(),
  check('items.*.quantity', 'Quantity must be a positive number').isInt({ min: 1 }),
  check('items.*.size', 'Size is required').not().isEmpty(),
  check('total', 'Total must be a positive number').isFloat({ min: 0 }),
  // Delivery details validation
  check('recipientName', 'Recipient name is required').not().isEmpty(),
  check('phoneNumber', 'Valid phone number is required').not().isEmpty(),
  check('addressLine1', 'Address line 1 is required').not().isEmpty(),
  check('city', 'City is required').not().isEmpty(),
  check('province', 'Province is required').not().isEmpty(),
  check('postalCode', 'Postal code is required').not().isEmpty()
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

// Update tracking number - admin only
router.patch('/:id/tracking', [
  protect,
  admin,
  check('trackingNumber', 'Tracking number is required').not().isEmpty()
], updateTrackingNumber);

module.exports = router;
