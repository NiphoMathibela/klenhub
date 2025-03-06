const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const paymentsController = require('../controllers/payments');
const { protect } = require('../middleware/auth');

// Initialize a Paystack payment for an order
router.post(
  '/create',
  protect,
  [
    body('orderId').notEmpty().withMessage('Order ID is required')
  ],
  paymentsController.createPayment
);

// Verify Paystack payment
router.get('/verify', protect, paymentsController.verifyPayment);

// Handle Paystack webhook
router.post('/webhook', paymentsController.handleWebhook);

// Handle successful payment return
router.get('/success', protect, paymentsController.handleSuccess);

module.exports = router;
