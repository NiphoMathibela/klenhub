const crypto = require('crypto');
const querystring = require('querystring');
const axios = require('axios');

// PayFast configuration
const config = {
  merchantId: process.env.PAYFAST_MERCHANT_ID || '',
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || '',
  passPhrase: process.env.PAYFAST_PASSPHRASE || '',
  testMode: process.env.NODE_ENV !== 'production',
  returnUrl: process.env.PAYFAST_RETURN_URL || 'http://localhost:5173/payment/success',
  cancelUrl: process.env.PAYFAST_CANCEL_URL || 'http://localhost:5173/payment/cancel',
  notifyUrl: process.env.PAYFAST_NOTIFY_URL || 'http://localhost:3000/api/payments/notify',
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://www.payfast.co.za/eng/process' 
    : 'https://sandbox.payfast.co.za/eng/process'
};

/**
 * Generate PayFast payment data
 * @param {Object} order - Order data
 * @param {string} order.id - Order ID
 * @param {number} order.total - Order total amount
 * @param {Object} user - User data
 * @param {string} user.email - User email
 * @param {string} user.name - User name
 * @returns {Object} PayFast payment data
 */
const generatePaymentData = (order, user) => {
  // Validate input
  if (!order || !order.id || !order.total) {
    throw new Error('Invalid order data');
  }
  
  if (!user || !user.email || !user.name) {
    throw new Error('Invalid user data');
  }

  // Ensure total is a valid number
  let amount;
  try {
    amount = parseFloat(order.total).toFixed(2);
    if (isNaN(amount)) throw new Error('Invalid order total');
  } catch (error) {
    throw new Error(`Invalid order total: ${order.total}`);
  }
  
  // Create payment data object
  const data = {
    // Merchant details
    merchant_id: config.merchantId,
    merchant_key: config.merchantKey,
    
    // Transaction details
    m_payment_id: order.id,
    amount: amount,
    item_name: `Order #${order.id}`,
    
    // User details
    email_address: user.email,
    name_first: user.name.split(' ')[0],
    name_last: user.name.split(' ').slice(1).join(' ') || '',
    
    // URLs
    return_url: config.returnUrl,
    cancel_url: config.cancelUrl,
    notify_url: config.notifyUrl,
    
    // Optional settings
    email_confirmation: 1,
    confirmation_address: user.email
  };

  // Add test mode if enabled
  if (config.testMode) {
    data.test_payment = 1;
  }

  return data;
};

/**
 * Generate signature for PayFast payment
 * @param {Object} data - Payment data
 * @returns {string} MD5 signature
 */
const generateSignature = (data) => {
  // Create a string of key=value pairs sorted alphabetically
  const sortedData = {};
  Object.keys(data).sort().forEach(key => {
    sortedData[key] = data[key];
  });

  const dataString = querystring.stringify(sortedData);
  
  // Add passphrase if it exists
  const signatureString = config.passPhrase 
    ? `${dataString}&passphrase=${encodeURIComponent(config.passPhrase)}`
    : dataString;
  
  // Generate MD5 hash
  return crypto.createHash('md5').update(signatureString).digest('hex');
};

/**
 * Create a PayFast payment for an order
 * @param {Object} order - Order data
 * @param {Object} user - User data
 * @returns {Object} Payment data with signature and redirect URL
 */
const createPayment = (order, user) => {
  const paymentData = generatePaymentData(order, user);
  const signature = generateSignature(paymentData);
  
  // Add signature to payment data
  paymentData.signature = signature;
  
  return {
    paymentData,
    redirectUrl: `${config.apiUrl}?${querystring.stringify(paymentData)}`
  };
};

/**
 * Verify PayFast ITN (Instant Transaction Notification)
 * @param {Object} payload - ITN payload
 * @param {Object} headers - Request headers
 * @returns {boolean} Whether the ITN is valid
 */
const verifyItn = async (payload, headers) => {
  try {
    // Step 1: Check if the IP is from PayFast
    const validIps = [
      '197.97.145.144', '197.97.145.145', '197.97.145.146', '197.97.145.147',
      '41.74.179.192', '41.74.179.193', '41.74.179.194', '41.74.179.195'
    ];
    
    const clientIp = headers['x-forwarded-for'] || headers['x-real-ip'];
    if (!validIps.includes(clientIp) && !config.testMode) {
      console.error(`Invalid IP: ${clientIp}`);
      return false;
    }

    // Step 2: Verify data hasn't been tampered with
    const receivedSignature = payload.signature;
    delete payload.signature;
    
    const calculatedSignature = generateSignature(payload);
    if (receivedSignature !== calculatedSignature) {
      console.error('Invalid signature');
      return false;
    }

    // Step 3: Verify with PayFast
    const verifyUrl = 'https://api.payfast.co.za/ping';
    const response = await axios.post(verifyUrl, payload);
    
    if (response.status !== 200) {
      console.error('PayFast verification failed');
      return false;
    }

    return true;
  } catch (error) {
    console.error('ITN verification error:', error);
    return false;
  }
};

module.exports = {
  createPayment,
  verifyItn
};
