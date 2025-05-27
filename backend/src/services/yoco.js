const axios = require('axios');
const crypto = require('crypto'); // Added for webhook verification
require('dotenv').config();

// Determine if running in production
const isProduction = process.env.NODE_ENV === 'production';

// YOCO configuration - Use environment variables for sensitive keys
const yocoPublicKey = isProduction ? process.env.YOCO_LIVE_PUBLIC_KEY : process.env.YOCO_TEST_PUBLIC_KEY;
const yocoSecretKey = isProduction ? process.env.YOCO_LIVE_SECRET_KEY : process.env.YOCO_TEST_SECRET_KEY;

const config = {
  publicKey: yocoPublicKey,
  secretKey: yocoSecretKey,
  baseUrl: 'https://payments.yoco.com/api', // Per official Yoco documentation
  checkoutUrl: 'https://online.yoco.com/v1', // Correct URL for payment verification based on Yoco docs
  callbackUrl: isProduction ? 'https://klenhub.co.za/payment/verify' : 'http://localhost:3000/payment/verify', // Environment-dependent callback
  environment: process.env.NODE_ENV || 'development', // Default to development if not specified
  minAmount: 200 // Minimum amount in cents (R2) as per Yoco documentation
};

// Log configuration but hide sensitive data
console.log('YOCO Configuration Initialized:', {
  publicKey: config.publicKey ? (config.publicKey.startsWith('pk_live') ? 'pk_live_******' : 'pk_test_******') : 'NOT SET',
  secretKey: config.secretKey ? (config.secretKey.startsWith('sk_live') ? 'sk_live_******' : 'sk_test_******') : 'NOT SET',
  environment: config.environment,
  callbackUrl: config.callbackUrl
});

if (!config.publicKey || !config.secretKey) {
  console.error('CRITICAL: YOCO Public or Secret Key is missing. Please check your .env file.');
  // Optionally, throw an error to prevent the application from running without keys in production
  if (isProduction) {
    throw new Error('YOCO API keys are not configured for production.');
  }
}

/**
 * Initialize a YOCO payment (Prepares data for frontend Yoco Pop-Up SDK)
 * This function itself does NOT make a call to Yoco to start a transaction.
 * It prepares the necessary parameters for the Yoco Pop-Up SDK to be used on the frontend.
 * @param {Object} order - Order data
 * @param {string} order.id - Order ID
 * @param {number} order.total - Order total amount (in main currency unit, e.g., Rands)
 * @param {Object} user - User data
 * @param {string} user.email - User email
 * @param {string} user.name - User name
 * @returns {Promise<Object>} Object containing parameters for Yoco SDK or an error object.
 */
const initializePayment = async (order, user) => {
  try {
    console.log('YOCO initializePayment (SDK Prep) called with:', {
      orderId: order.id,
      total: order.total,
      userEmail: user.email,
      environment: config.environment
    });

    if (!order || !order.id || (order.total === undefined || order.total === null) || !user || !user.email) {
      console.error('Invalid input for initializePayment:', { order, user });
      return {
        success: false,
        error: 'InvalidInput',
        message: 'Invalid order or user data provided for payment initialization.'
      };
    }

    let amountInCents;
    try {
      amountInCents = Math.round(parseFloat(order.total) * 100);
      if (isNaN(amountInCents)) {
        throw new Error(`Invalid order total: ${order.total}`);
      }
      if (amountInCents < config.minAmount) {
        console.warn(`Order total ${amountInCents} cents is below Yoco minimum ${config.minAmount} cents. Payment might fail.`);
      }
    } catch (parseError) {
      console.error('Error parsing order total:', parseError);
      return {
        success: false,
        error: 'ParsingError',
        message: `Failed to parse order total: ${order.total}`
      };
    }

    const paymentReference = `order_${order.id}_${Date.now()}`;
    // The successUrl is where Yoco redirects after their popup if successful (BEFORE backend verification of the token)
    // It's often the same page or a generic processing page.
    // The actual verification happens when the frontend sends the Yoco token (result.id) to our backend.
    const successUrlForYocoRedirect = `${config.callbackUrl}?yoco_ref=${encodeURIComponent(paymentReference)}&order_id=${order.id}`;
    const cancelUrl = isProduction ? 'https://klenhub.co.za/cart' : 'http://localhost:3000/cart';

    // This payload is what the Yoco Pop-Up SDK on the frontend will use.
    const payloadForSdk = {
      publicKey: config.publicKey, // Public key for the SDK
      amountInCents: amountInCents,
      currency: 'ZAR',
      name: `KlenHub Order ${order.id}`,
      description: `Order #${order.id}`,
      callback: null, // The frontend will handle the callback from Yoco SDK
      metadata: {
        order_id: order.id,
        klenhub_reference: paymentReference, // Our internal reference
        customer_name: user.name || "Customer",
        customer_email: user.email,
        environment: config.environment
      },
      // successUrl: successUrlForYocoRedirect, // Yoco SDK might use this or a JS callback
      // cancelUrl: cancelUrl,
      // failureUrl: cancelUrl,
    };

    console.log('YOCO SDK Preparation Payload:', { ...payloadForSdk, publicKey: '******' });

    return {
      success: true,
      message: "Payment parameters prepared for Yoco SDK. Frontend should initialize Yoco Pop-Up.",
      sdkParameters: payloadForSdk
    };

  } catch (error) {
    console.error('YOCO initializePayment (SDK Prep) error:', error.message, error.stack);
    return {
        success: false,
        error: 'SDKPrepError',
        message: error.message || 'Failed to prepare Yoco payment parameters.'
    };
  }
};

/**
 * Create a charge using YOCO (after frontend Yoco SDK provides a payment token).
 * This is the crucial step where the backend finalizes the payment with Yoco.
 * @param {string} yocoToken - The one-time token (result.id) from Yoco SDK callback.
 * @param {number} amountInCents - Amount in cents (must match what was shown to user).
 * @param {string} orderId - Your internal order ID for tracking.
 * @param {Object} [metadata={}] - Additional metadata (e.g., customer info, order details from your system).
 * @returns {Promise<Object>} Charge response from Yoco or an error object.
 */
const createCharge = async (yocoToken, amountInCents, orderId, metadata = {}) => {
  try {
    console.log('YOCO createCharge called with:', { yocoToken: yocoToken ? '******' : 'NOT SET', amountInCents, orderId });

    if (!yocoToken || !amountInCents || !orderId) {
        console.error('Missing required parameters for createCharge:', { yocoToken: !!yocoToken, amountInCents, orderId });
        return {
            success: false,
            error: 'MissingParameters',
            message: 'Yoco token, amount, and orderId are required to create a charge.'
        };
    }
    if (amountInCents < config.minAmount) {
        // This check should ideally happen before Yoco SDK is even shown
        console.warn(`Charge amount ${amountInCents} cents is below Yoco minimum ${config.minAmount} cents.`);
    }

    const payload = {
      token: yocoToken,
      amount: amountInCents, // Yoco API expects 'amount' here, not 'amountInCents'
      currency: 'ZAR',
      metadata: {
        ...metadata, // Include any metadata passed from order/frontend
        order_id: orderId,
        klenhub_charge_timestamp: new Date().toISOString(),
        environment: config.environment
      }
    };

    console.log('YOCO Backend Charge Payload:', { ...payload, token: '******' });

    const response = await axios.post(`${config.baseUrl}/charges`, payload, {
      headers: {
        'Authorization': `Bearer ${config.secretKey}`, // Use Secret Key for charges API
        'Content-Type': 'application/json'
      },
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Process all 2xx, 3xx, 4xx responses
      }
    });

    console.log('YOCO Charge API Response Status:', response.status);
    console.log('YOCO Charge API Response Data:', response.data);

    if (response.status >= 200 && response.status < 300) {
        // Even with 2xx, check Yoco's internal status
        if (response.data.status === 'successful') {
            return {
                success: true,
                charge: response.data, // Contains charge_id, status, amount, etc.
                message: 'Payment successful and charge created.'
            };
        } else {
            // Charge created but not successful (e.g., 'failed', 'pending_verification')
            console.warn('YOCO charge created but status is not successful:', response.data.status, response.data);
            return {
                success: false,
                error: 'ChargeNotSuccessful',
                message: response.data.displayMessage || `Payment status: ${response.data.status}`,
                charge: response.data // Return the charge object for further inspection
            };
        }
    } else {
        // Handle 4xx errors (e.g., invalid token, card declined by bank)
        const errorMessage = response.data?.displayMessage || response.data?.message || response.data?.error?.message || 'Yoco charge API request failed.';
        console.error('YOCO charge API error:', errorMessage, response.data);
        return {
            success: false,
            error: 'ChargeApiError',
            message: errorMessage,
            details: response.data,
            statusCode: response.status
        };
    }
  } catch (error) {
    // System-level errors (network, etc.)
    console.error('YOCO createCharge system error:', error.response ? error.response.data : error.message, error.stack);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create Yoco charge due to a system error.';
    return {
        success: false,
        error: 'SystemError',
        message: errorMessage,
        details: error.response?.data || null
    };
  }
};


/**
 * Verify a YOCO payment by fetching charge details using Yoco's Get Charge API.
 * This is useful for reconciliation or if a webhook is missed.
 * @param {string} chargeId - Yoco Charge ID (obtained from createCharge response or webhook).
 * @returns {Promise<Object>} Verification response containing charge details or an error object.
 */
const verifyPaymentByChargeId = async (chargeId) => {
  try {
    console.log(`YOCO verifyPaymentByChargeId called for chargeId: ${chargeId}`);
    if (!chargeId) {
      console.error('Charge ID is required for verification.');
      return {
        success: false,
        error: 'MissingParameter',
        message: 'Charge ID is required for verification.'
      };
    }

    const response = await axios.get(`${config.baseUrl}/charges/${chargeId}`, {
      headers: {
        'Authorization': `Bearer ${config.secretKey}`, // Use Secret Key
        'Accept': 'application/json'
      },
      validateStatus: (status) => status < 500, // Process 2xx, 3xx, 4xx
    });

    console.log('YOCO Get Charge API Response Status:', response.status);
    console.log('YOCO Get Charge API Response Data:', response.data);

    if (response.status !== 200) {
      const errorMsg = response.data?.message || `Failed to fetch charge details from Yoco API (Status: ${response.status})`;
      console.error(errorMsg, response.data);
      return {
        success: false,
        error: 'ApiError',
        message: errorMsg,
        details: response.data,
        statusCode: response.status
      };
    }

    const chargeData = response.data;
    return {
      success: true,
      status: chargeData.status, // e.g., 'successful', 'failed', 'pending_verification'
      message: `Charge status: ${chargeData.status}`,
      charge: chargeData // Full charge object from Yoco
    };

  } catch (error) {
    console.error('YOCO verifyPaymentByChargeId system error:', error.message, error.stack);
    return {
      success: false,
      error: 'SystemError',
      message: error.message,
      reference: chargeId
    };
  }
};

/**
 * Handle YOCO webhook events.
 * IMPORTANT: Ensure your Express route provides the RAW request body for signature verification.
 * Example: app.use('/api/payments/yoco-webhook', express.raw({ type: 'application/json' }), handleYocoWebhookRoute);
 * @param {Buffer|string} rawBody - Raw request body (MUST be raw, not pre-parsed JSON).
 * @param {string} signatureHeader - Webhook signature from 'X-Yoco-Signature' header.
 * @returns {Promise<Object>} Processed webhook data or an error object.
 */
const handleWebhook = async (rawBody, signatureHeader) => {
  try {
    console.log('YOCO handleWebhook called.');

    if (!rawBody) {
        console.error('YOCO Webhook Error: Raw body is missing. Ensure body-parser is configured correctly for this route.');
        return { success: false, error: 'MissingRawBody', message: 'Raw body is required for webhook verification.' };
    }
    if (!signatureHeader) {
        console.error('YOCO Webhook Error: X-Yoco-Signature header is missing.');
        return { success: false, error: 'MissingSignature', message: 'Webhook signature is missing.' };
    }
    if (!config.secretKey) {
        console.error('YOCO Webhook Error: Yoco Secret Key is not configured. Cannot verify webhook.');
        return { success: false, error: 'MissingSecretKey', message: 'Yoco secret key not configured.' };
    }

    const hmac = crypto.createHmac('sha256', config.secretKey);
    const computedSignature = hmac.update(rawBody).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(computedSignature, 'hex'), Buffer.from(signatureHeader, 'hex'))) {
      console.error('YOCO Webhook Error: Invalid signature.', { received: signatureHeader, computed: computedSignature });
      return {
        success: false,
        error: 'InvalidSignature',
        message: 'Webhook signature verification failed.'
      };
    }
    console.log('YOCO Webhook: Signature verified successfully.');

    let eventData;
    try {
        // rawBody might be a Buffer, convert to string before parsing
        eventData = JSON.parse(rawBody.toString('utf8'));
    } catch (e) {
        console.error('YOCO Webhook Error: Failed to parse webhook payload JSON:', e.message);
        return { success: false, error: 'InvalidJsonPayload', message: 'Invalid JSON payload in webhook.' };
    }

    const eventType = eventData.event_type || eventData.event; // Yoco uses 'event_type'
    const dataObject = eventData.data || eventData.payload; // Yoco uses 'data'

    if (!eventType || !dataObject || typeof dataObject !== 'object') {
        console.error('YOCO Webhook Error: Missing event_type or data in payload, or data is not an object.', eventData);
        return { success: false, error: 'MalformedPayload', message: 'Malformed webhook payload.' };
    }

    const chargeId = dataObject.id; // This is usually the charge ID
    console.log(`YOCO Webhook: Received event type: ${eventType}`, { chargeId: chargeId, status: dataObject.status });

    // Primary event to listen for is 'charge.succeeded'
    // Yoco might send other events like 'charge.created', 'charge.failed', etc.
    if (eventType === 'charge.succeeded' || (eventType.startsWith('charge.') && dataObject.status === 'successful')) {
      const orderId = dataObject.metadata?.order_id;

      if (!orderId) {
        console.warn(`YOCO Webhook (charge.succeeded): Order ID not found in metadata for charge ${chargeId}.`, dataObject.metadata);
        // Still acknowledge the webhook as valid, but note the missing order_id
        return {
          success: true, // Signature was valid
          acknowledged: true,
          event: eventType,
          type: 'payment_success_missing_order_id',
          message: 'Payment successful, but Order ID missing in webhook metadata.',
          chargeId: chargeId,
          rawEventData: dataObject
        };
      }

      console.log(`YOCO Webhook: Payment successful for order ${orderId}, charge ${chargeId}.`);
      return {
        success: true,
        acknowledged: true,
        event: eventType,
        type: 'payment_success',
        reference: dataObject.metadata?.klenhub_reference || chargeId,
        orderId: orderId,
        chargeId: chargeId,
        status: dataObject.status, // Should be 'successful'
        amount: dataObject.amount ? dataObject.amount / 100 : undefined,
        currency: dataObject.currency,
        paidAt: dataObject.created_at || dataObject.updated_at || new Date().toISOString(),
        rawEventData: dataObject
      };
    } else if (eventType.startsWith('charge.') && dataObject.status === 'failed') {
        const orderId = dataObject.metadata?.order_id;
        console.warn(`YOCO Webhook: Payment failed for order ${orderId || 'Unknown'}, charge ${chargeId}. Reason: ${dataObject.failure_reason || dataObject.display_message || 'N/A'}`);
        return {
            success: true, // Signature was valid
            acknowledged: true,
            event: eventType,
            type: 'payment_failure',
            orderId: orderId,
            chargeId: chargeId,
            status: 'failed',
            message: dataObject.failure_reason || dataObject.display_message || 'Payment failed at gateway.',
            rawEventData: dataObject
        };
    }

    console.log(`YOCO Webhook: Event type ${eventType} (status: ${dataObject.status}) received but not specifically handled for business logic. Acknowledging.`);
    return {
        success: true, // Signature was valid
        acknowledged: true,
        event: eventType,
        type: 'unhandled_event_acknowledged',
        chargeId: chargeId,
        data: dataObject
    };

  } catch (error) {
    console.error('YOCO webhook processing system error:', error.message, error.stack);
    // Do not rethrow; return a structured error so the caller can send a 500 if needed
    // but acknowledge receipt to Yoco with a 200 if signature was valid before error.
    return {
        success: false, // Indicates a processing error post-signature check (if applicable)
        acknowledged: false, // If signature check failed, this would be false too.
        error: 'WebhookProcessingSystemError',
        message: error.message
    };
  }
};

module.exports = {
  initializePayment,
  createCharge,
  verifyPaymentByChargeId,
  handleWebhook,
  yocoConfig: config // Expose config if needed by other parts of the backend
};
