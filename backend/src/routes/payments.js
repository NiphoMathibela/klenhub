const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const paymentsController = require('../controllers/payments');
const { protect } = require('../middleware/auth');

// Create a payment for an order
router.post(
  '/create',
  protect,
  [
    body('orderId').notEmpty().withMessage('Order ID is required')
  ],
  paymentsController.createPayment
);

// Handle PayFast ITN (Instant Transaction Notification)
router.post('/notify', paymentsController.handleNotification);

// Handle successful payment return
router.get('/success', protect, paymentsController.handleSuccess);

// Handle cancelled payment
router.get('/cancel', protect, paymentsController.handleCancel);

module.exports = router;
