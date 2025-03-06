const { Order } = require('../models/Order');
const paystackService = require('../services/paystack');

/**
 * Initialize a Paystack payment for an order
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    console.log(`Creating payment for order: ${orderId}`);
    
    // Get the order
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.log(`Order found: ${order.id}, Total: ${order.total}, Type: ${typeof order.total}`);
    
    // Check if order belongs to the user
    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this order' });
    }
    
    // Convert order to plain object to ensure proper data handling
    const orderData = order.get({ plain: true });
    console.log(`Order data prepared: ${JSON.stringify(orderData)}`);
    
    // Initialize Paystack transaction
    const payment = await paystackService.initializeTransaction(orderData, req.user);
    console.log(`Payment initialized, redirecting to: ${payment.authorizationUrl}`);
    
    // Update order status
    await order.update({ 
      status: 'pending',
      paymentReference: payment.reference 
    });
    
    res.json({
      success: true,
      redirectUrl: payment.authorizationUrl,
      reference: payment.reference
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Verify Paystack payment
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;
    
    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' });
    }
    
    // Verify payment
    const verification = await paystackService.verifyTransaction(reference);
    
    // Find order by payment reference
    const order = await Order.findOne({ 
      where: { paymentReference: reference }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Update order status based on payment status
    if (verification.status === 'success') {
      await order.update({ status: 'processing' });
    } else {
      await order.update({ status: 'pending' });
    }
    
    res.json({
      success: true,
      order,
      verification
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Handle Paystack webhook
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.handleWebhook = async (req, res) => {
  try {
    // Get signature from headers
    const signature = req.headers['x-paystack-signature'];
    
    // Process webhook event
    const event = await paystackService.handleWebhook(req.body, signature);
    
    if (event.event === 'charge.success') {
      // Get order
      const order = await Order.findOne({
        where: { paymentReference: event.reference }
      });
      
      if (order) {
        // Update order status
        await order.update({ status: 'processing' });
      }
    }
    
    // Respond with 200 (Paystack expects this)
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).send('Server error');
  }
};

/**
 * Handle successful payment return
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.handleSuccess = async (req, res) => {
  try {
    const { reference } = req.query;
    
    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' });
    }
    
    // Get the order
    const order = await Order.findOne({
      where: { paymentReference: reference }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Payment success handling error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
