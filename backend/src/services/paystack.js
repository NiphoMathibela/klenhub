const axios = require('axios');

// Paystack configuration
const config = {
  publicKey: process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_bd30029577544b48776ebb77fc4e9a356c630e50',
  secretKey: process.env.PAYSTACK_SECRET_KEY || '', // You'll need to set this in your .env file
  baseUrl: 'https://api.paystack.co',
  callbackUrl: process.env.PAYSTACK_CALLBACK_URL || 'http://localhost:5173/payment/verify',
};

/**
 * Initialize a Paystack transaction
 * @param {Object} order - Order data
 * @param {string} order.id - Order ID
 * @param {number} order.total - Order total amount
 * @param {Object} user - User data
 * @param {string} user.email - User email
 * @param {string} user.name - User name
 * @returns {Promise<Object>} Paystack initialization response
 */
const initializeTransaction = async (order, user) => {
  try {
    // Validate input
    if (!order || !order.id || !order.total) {
      throw new Error('Invalid order data');
    }
    
    if (!user || !user.email) {
      throw new Error('Invalid user data');
    }

    // Ensure total is in kobo/cents (Paystack expects amount in smallest currency unit)
    const amount = Math.round(parseFloat(order.total) * 100);
    if (isNaN(amount)) {
      throw new Error(`Invalid order total: ${order.total}`);
    }
    
    // Create transaction payload
    const payload = {
      amount,
      email: user.email,
      reference: `order_${order.id}_${Date.now()}`,
      callback_url: `${config.callbackUrl}?reference=${order.id}`,
      metadata: {
        order_id: order.id,
        custom_fields: [
          {
            display_name: "Order ID",
            variable_name: "order_id",
            value: order.id
          },
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: user.name || "Customer"
          }
        ]
      }
    };

    console.log('Initializing Paystack transaction:', payload);
    
    // Initialize transaction
    const response = await axios.post(`${config.baseUrl}/transaction/initialize`, payload, {
      headers: {
        Authorization: `Bearer ${config.secretKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Paystack initialization response:', response.data);
    
    if (!response.data.status) {
      throw new Error(`Paystack error: ${response.data.message}`);
    }

    return {
      success: true,
      reference: payload.reference,
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
    };
  } catch (error) {
    console.error('Paystack initialization error:', error);
    throw error;
  }
};

/**
 * Verify a Paystack transaction
 * @param {string} reference - Transaction reference
 * @returns {Promise<Object>} Verification response
 */
const verifyTransaction = async (reference) => {
  try {
    console.log(`Verifying Paystack transaction: ${reference}`);
    
    // Check if the reference is in the format order_<uuid>_<timestamp>
    // If not, try to find the order with this reference as the orderId
    let paystackReference = reference;
    
    // If it's a UUID, it might be the orderId part of the reference
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(reference)) {
      // This is likely just the order ID, not the full Paystack reference
      console.log(`Reference appears to be a UUID: ${reference}. Checking for full reference in database.`);
      
      // Try to find the order with this ID to get the full payment reference
      const { Order } = require('../models/Order');
      const order = await Order.findByPk(reference);
      
      if (order && order.paymentReference) {
        paystackReference = order.paymentReference;
        console.log(`Found order with payment reference: ${paystackReference}`);
      } else {
        // If we can't find the order or it doesn't have a payment reference,
        // we'll try with the original reference and let Paystack handle the error
        console.log(`Could not find order with ID: ${reference} or it has no payment reference`);
      }
    } else if (reference.startsWith('order_')) {
      // This is already in the correct format
      paystackReference = reference;
    } else if (reference.includes('_')) {
      // This might be a partial reference, try to extract parts
      const parts = reference.split('_');
      if (parts.length >= 2 && uuidPattern.test(parts[1])) {
        // This looks like it contains a UUID as the second part
        paystackReference = reference;
      }
    }
    
    console.log(`Using Paystack reference for verification: ${paystackReference}`);
    
    const response = await axios.get(`${config.baseUrl}/transaction/verify/${encodeURIComponent(paystackReference)}`, {
      headers: {
        Authorization: `Bearer ${config.secretKey}`
      }
    });

    console.log('Paystack verification response:', response.data);
    
    if (!response.data.status) {
      throw new Error(`Paystack verification error: ${response.data.message}`);
    }

    const { data } = response.data;
    
    return {
      success: true,
      status: data.status,
      amount: data.amount / 100, // Convert back to main currency unit
      reference: data.reference,
      orderId: data.metadata?.order_id,
      paidAt: data.paid_at,
      channel: data.channel,
      currency: data.currency,
    };
  } catch (error) {
    console.error('Paystack verification error:', error);
    throw error;
  }
};

/**
 * Handle Paystack webhook events
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
    
    console.log(`Received Paystack webhook: ${event}`);
    
    if (event === 'charge.success') {
      // Extract order ID from metadata
      const orderId = data.metadata?.order_id;
      
      if (!orderId) {
        throw new Error('Order ID not found in webhook payload');
      }
      
      return {
        success: true,
        event,
        reference: data.reference,
        orderId,
        status: data.status,
        amount: data.amount / 100,
        paidAt: data.paid_at,
      };
    }
    
    return { success: true, event, data };
  } catch (error) {
    console.error('Paystack webhook error:', error);
    throw error;
  }
};

module.exports = {
  initializeTransaction,
  verifyTransaction,
  handleWebhook,
  config
};
