const crypto = require('crypto');
const querystring = require('querystring');
const axios = require('axios');

// PayFast configuration
const config = {
  merchantId: process.env.PAYFAST_MERCHANT_ID || '10037456',
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || 'x0g1buvlee044',
  passPhrase: process.env.PAYFAST_PASSPHRASE || 'testingthegateway',
  testMode: process.env.NODE_ENV !== 'production',
  returnUrl: process.env.PAYFAST_RETURN_URL || 'https://klenhub.co.za/payment/success',
  cancelUrl: process.env.PAYFAST_CANCEL_URL || 'https://klenhub.co.za/payment/cancel',
  notifyUrl: process.env.PAYFAST_NOTIFY_URL || 'https://service.klenhub.co.za/api/payments/notify',
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
  
  // Format user name properly
  const nameParts = user.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  
  // Create payment data object with required fields
  const data = {
    // Merchant details
    merchant_id: config.merchantId,
    merchant_key: config.merchantKey,
    
    // Transaction details
    m_payment_id: String(order.id),
    amount: amount,
    item_name: `Order #${order.id}`,
    
    // User details
    email_address: user.email,
    name_first: firstName,
    name_last: lastName,
    
    // URLs
    return_url: config.returnUrl,
    cancel_url: config.cancelUrl,
    notify_url: config.notifyUrl,
  };
  
  // Add optional fields
  if (user.email) {
    data.email_confirmation = '1';
    data.confirmation_address = user.email;
  }
  
  // Add test mode if enabled
  if (config.testMode) {
    data.test_payment = '1';
  }
  
  return data;
};

/**
 * Generate signature for PayFast payment
 * @param {Object} data - Payment data
 * @returns {string} MD5 signature
 */
const generateSignature = (data) => {
  // Create a copy of the data without the signature field
  const signatureData = { ...data };
  delete signatureData.signature;
  
  // Sort the keys alphabetically
  const keys = Object.keys(signatureData).sort();
  
  // Build the signature string
  let signatureString = '';
  keys.forEach(key => {
    if (signatureData[key] !== '') {
      signatureString += `${key}=${encodeURIComponent(signatureData[key])}&`;
    }
  });
  
  // Remove the trailing & and add the passphrase if it exists
  signatureString = signatureString.slice(0, -1);
  if (config.passPhrase) {
    signatureString += `&passphrase=${encodeURIComponent(config.passPhrase)}`;
  }
  
  console.log('Signature string:', signatureString);
  
  // Generate MD5 hash
  const signature = crypto.createHash('md5').update(signatureString).digest('hex');
  
  return signature;
};

/**
 * Create a PayFast payment for an order
 * @param {Object} order - Order data
 * @param {Object} user - User data
 * @returns {Object} Payment data with signature and redirect URL
 */
const createPayment = (order, user) => {
  const paymentData = generatePaymentData(order, user);
  
  console.log('Payment data before signature:', JSON.stringify(paymentData, null, 2));
  
  const signature = generateSignature(paymentData);
  console.log('Generated signature:', signature);
  
  // Add signature to payment data
  paymentData.signature = signature;
  
  // Build the query string manually to ensure proper encoding
  let queryString = '';
  Object.keys(paymentData).forEach(key => {
    if (paymentData[key] !== '') {
      queryString += `${key}=${encodeURIComponent(paymentData[key])}&`;
    }
  });
  
  // Remove the trailing &
  queryString = queryString.slice(0, -1);
  
  console.log('Final redirect URL:', `${config.apiUrl}?${queryString}`);
  
  return {
    paymentData,
    redirectUrl: `${config.apiUrl}?${queryString}`
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
