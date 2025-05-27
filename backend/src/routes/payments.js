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

// --- YOCO Payment Routes ---

// Initialize a Yoco payment (prepare SDK parameters for frontend)
router.post(
  '/yoco/initialize',
  protect,
  [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    // Add other necessary validations for user data if needed
  ],
  paymentsController.initializeYocoPayment
);

// Create a Yoco charge (after frontend gets token from Yoco SDK)
router.post(
  '/yoco/charge',
  protect,
  [
    body('yocoToken').notEmpty().withMessage('Yoco token is required'),
    body('amountInCents').isInt({ gt: 0 }).withMessage('Amount in cents must be a positive integer'),
    body('orderId').notEmpty().withMessage('Order ID is required'),
  ],
  paymentsController.createYocoCharge
);

// Handle Yoco webhook
// IMPORTANT: This route needs the raw body for signature verification.
// The main server setup (e.g., app.js or index.js) should apply express.raw middleware BEFORE this route is hit for this specific path.
// Example in app.js: app.use('/api/payments/yoco/webhook', express.raw({ type: 'application/json' }));
router.post('/yoco/webhook', paymentsController.handleYocoWebhook);

module.exports = router;
