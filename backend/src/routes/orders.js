const express = require('express');
const { check } = require('express-validator');
const { createOrder, getOrders, getOrder, updateOrderStatus } = require('../controllers/orders');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', [
  protect,
  check('items', 'Items are required').isArray(),
  check('items.*.productId', 'Product ID is required').not().isEmpty(),
  check('items.*.quantity', 'Quantity must be a positive number').isInt({ min: 1 }),
  check('items.*.size', 'Size is required').not().isEmpty(),
  check('total', 'Total must be a positive number').isFloat({ min: 0 })
], createOrder);

router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);

router.patch('/:id/status', [
  protect,
  authorize('admin'),
  check('status', 'Status is required').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
], updateOrderStatus);

module.exports = router;
