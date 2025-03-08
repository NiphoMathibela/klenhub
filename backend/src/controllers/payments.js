const { Order, OrderItem } = require('../models/Order');
const Product = require('../models/Product');
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
    
    console.log(`Payment verification request received for reference: ${reference}`);
    
    // Extract the orderId if the reference is in the format order_<orderId>_<timestamp>
    let orderId = reference;
    if (reference.startsWith('order_')) {
      const parts = reference.split('_');
      if (parts.length >= 2) {
        orderId = parts[1];
        console.log(`Extracted orderId from reference: ${orderId}`);
      }
    }
    
    // Find order by orderId first
    let order = await Order.findByPk(orderId, {
      include: [{ 
        model: OrderItem,
        include: [Product]
      }]
    });
    
    if (order) {
      console.log(`Order found directly by ID: ${orderId}`);
    } else {
      // If not found by ID, try by payment reference
      order = await Order.findOne({ 
        where: { paymentReference: reference },
        include: [{ 
          model: OrderItem,
          include: [Product]
        }]
      });
      console.log(`Order lookup by payment reference: ${reference}, Found: ${!!order}`);
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Process the order items to include product details
    if (order.OrderItems && order.OrderItems.length > 0) {
      // Transform OrderItems to match the expected interface in the frontend
      order.items = order.OrderItems.map(item => {
        return {
          id: item.id,
          productId: item.productId,
          name: item.Product ? item.Product.name : 'Unknown Product',
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          imageUrl: item.Product ? item.Product.imageUrl : null
        };
      });
    } else {
      // Set default empty items array if no items exist
      order.items = [];
    }
    
    // Try to verify with Paystack
    let verification = {
      success: false,
      status: 'pending',
      orderId: order.id
    };
    
    try {
      // Attempt to verify, but don't let errors block the process
      verification = await paystackService.verifyTransaction(reference);
      console.log(`Paystack verification result:`, verification);
      
      // Update order status based on payment status
      if (verification.status === 'success') {
        await order.update({ status: 'processing' });
        console.log(`Order ${order.id} updated to status: processing`);
      }
    } catch (verifyError) {
      // Log the verification error but continue processing
      console.error('Paystack verification error, continuing with order processing:', verifyError.message);
    }
    
    // Always return the order, even if verification fails
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
