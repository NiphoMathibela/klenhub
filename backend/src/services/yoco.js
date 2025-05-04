const axios = require('axios');

// YOCO configuration
const config = {
  publicKey:'pk_live_17962915yW69nnw35fa4',
  secretKey: 'sk_live_a19c2630J1qmJJQdadd411bac51c', // You'll need to set this in your .env file
  baseUrl: 'https://payments.yoco.com/api',
  callbackUrl: 'https://klenhub.co.za/payment/verify', // Always use the production domain
};

/**
 * Initialize a YOCO payment
 * @param {Object} order - Order data
 * @param {string} order.id - Order ID
 * @param {number} order.total - Order total amount
 * @param {Object} user - User data
 * @param {string} user.email - User email
 * @param {string} user.name - User name
 * @returns {Promise<Object>} YOCO initialization response
 */
const initializePayment = async (order, user) => {
  try {
    // Validate input
    if (!order || !order.id || !order.total) {
      throw new Error('Invalid order data');
    }
    
    if (!user || !user.email) {
      throw new Error('Invalid user data');
    }

    // Ensure total is in cents (YOCO expects amount in cents)
    const amount = Math.round(parseFloat(order.total) * 100);
    if (isNaN(amount)) {
      throw new Error(`Invalid order total: ${order.total}`);
    }
    
    // Create payment payload
    const reference = `order_${order.id}_${Date.now()}`;
    
    // Create checkout object according to YOCO API docs
    const payload = {
      amount: amount, // YOCO API expects amount in cents
      currency: 'ZAR',
      successUrl: `https://klenhub.co.za/payment/verify?reference=${encodeURIComponent(order.id)}`,
      cancelUrl: 'https://klenhub.co.za/cart',
      metadata: {
        order_id: order.id,
        customer_name: user.name || "Customer",
        customer_email: user.email
      }
    };

    console.log('Initializing YOCO payment:', payload);
    
    console.log('Sending YOCO payment request with payload:', JSON.stringify(payload));
    
    // Initialize payment using YOCO Checkout API
    const response = await axios.post('https://payments.yoco.com/api/checkouts', payload, {
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('YOCO initialization response:', response.data);
    
    console.log('YOCO API response:', JSON.stringify(response.data));
    
    if (!response.data.id) {
      throw new Error(`YOCO error: Failed to initialize payment`);
    }

    return {
      success: true,
      reference: reference,
      authorizationUrl: response.data.redirectUrl,
      paymentId: response.data.id,
    };
  } catch (error) {
    console.error('YOCO initialization error:', error);
    throw error;
  }
};

/**
 * Verify a YOCO payment
 * @param {string} reference - Payment reference
 * @returns {Promise<Object>} Verification response
 */
const verifyPayment = async (reference) => {
  try {
    console.log(`Verifying YOCO payment: ${reference}`);
    
    // Check if the reference is in the format order_<uuid>_<timestamp>
    // If not, try to find the order with this reference as the orderId
    let paymentId = reference;
    
    // If it's a UUID, it might be the orderId part of the reference
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(reference)) {
      // This is likely just the order ID, not the full YOCO reference
      console.log(`Reference appears to be a UUID: ${reference}. Checking for payment ID in database.`);
      
      // Try to find the order with this ID to get the payment ID
      const { Order } = require('../models/Order');
      const order = await Order.findByPk(reference);
      
      if (order && order.paymentReference) {
        // Extract payment ID from the reference if needed
        const parts = order.paymentReference.split('_');
        if (parts.length >= 3) {
          paymentId = parts[2]; // Assuming the format is order_<orderId>_<paymentId>
        } else {
          paymentId = order.paymentReference;
        }
        console.log(`Found order with payment ID: ${paymentId}`);
      } else {
        // If we can't find the order or it doesn't have a payment reference,
        // we'll try with the original reference
        console.log(`Could not find order with ID: ${reference} or it has no payment reference`);
      }
    }
    
    console.log(`Using YOCO payment ID for verification: ${paymentId}`);
    
    // Get payment details using YOCO API
    const response = await axios.get(`https://payments.yoco.com/api/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${config.secretKey}`
      }
    });

    console.log('YOCO verification response:', response.data);
    
    if (!response.data.id) {
      throw new Error(`YOCO verification error: Payment not found`);
    }

    const data = response.data;
    
    return {
      success: true,
      status: data.status === 'successful' ? 'success' : data.status,
      amount: data.amount / 100, // Convert back to main currency unit
      reference: reference,
      orderId: data.metadata?.order_id,
      paidAt: data.created_at,
      channel: data.source?.type || 'card',
      currency: data.currency,
    };
  } catch (error) {
    console.error('YOCO verification error:', error);
    throw error;
  }
};

/**
 * Handle YOCO webhook events
 * @param {Object} payload - Webhook payload
 * @param {string} signature - Webhook signature from header
 * @returns {Promise<Object>} Processed webhook data
 */
const handleWebhook = async (payload, signature) => {
  try {
    // Verify webhook signature if necessary
    // This is a simplified version - in production, verify the signature
    
    const event = payload.event;
    const data = payload.data;
    
    console.log(`Received YOCO webhook: ${event}`);
    
    if (event === 'payment.succeeded') {
      // Extract order ID from metadata
      const orderId = data.metadata?.order_id;
      
      if (!orderId) {
        throw new Error('Order ID not found in webhook payload');
      }
      
      return {
        success: true,
        event,
        reference: data.id,
        orderId,
        status: 'success',
        amount: data.amount / 100,
        paidAt: data.created_at,
      };
    }
    
    return { success: true, event, data };
  } catch (error) {
    console.error('YOCO webhook error:', error);
    throw error;
  }
};
