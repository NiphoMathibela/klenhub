const { Order } = require('../models/Order');
const payfastService = require('../services/payfast');

/**
 * Create a PayFast payment for an order
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
    
    // Create PayFast payment
    const payment = payfastService.createPayment(orderData, req.user);
    console.log(`Payment created, redirecting to: ${payment.redirectUrl}`);
    
    // Update order status
    await order.update({ status: 'processing' });
    
    res.json({
      success: true,
      redirectUrl: payment.redirectUrl,
      paymentData: payment.paymentData
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Handle PayFast ITN (Instant Transaction Notification)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.handleNotification = async (req, res) => {
  try {
    const payload = req.body;
    
    // Verify ITN
    const isValid = await payfastService.verifyItn(payload, req.headers);
    if (!isValid) {
      return res.status(400).send('Invalid ITN');
    }
    
    // Get order ID from m_payment_id
    const orderId = payload.m_payment_id;
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return res.status(404).send('Order not found');
    }
    
    // Update order status based on payment status
    const paymentStatus = payload.payment_status;
    let orderStatus;
    
    switch (paymentStatus) {
      case 'COMPLETE':
        orderStatus = 'processing';
        break;
      case 'FAILED':
        orderStatus = 'cancelled';
        break;
      case 'PENDING':
        orderStatus = 'pending';
        break;
      default:
        orderStatus = 'pending';
    }
    
    await order.update({ status: orderStatus });
    
    // Respond with OK (PayFast expects a 200 response)
    res.status(200).send('OK');
  } catch (error) {
    console.error('ITN handling error:', error);
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
    const { m_payment_id } = req.query;
    
    // Get the order
    const order = await Order.findByPk(m_payment_id);
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

/**
 * Handle cancelled payment
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.handleCancel = async (req, res) => {
  try {
    const { m_payment_id } = req.query;
    
    // Get the order
    const order = await Order.findByPk(m_payment_id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Update order status to cancelled
    await order.update({ status: 'cancelled' });
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Payment cancel handling error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
