/**
 * Paystack utility functions for the frontend
 */

// Paystack configuration
const config = {
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_bd30029577544b48776ebb77fc4e9a356c630e50',
};

/**
 * Initialize Paystack popup payment
 * @param {Object} options - Payment options
 * @param {string} options.email - Customer email
 * @param {number} options.amount - Amount in the smallest currency unit (e.g., kobo/cents)
 * @param {string} options.reference - Unique reference
 * @param {Function} options.onClose - Function to call when payment is closed
 * @param {Function} options.onSuccess - Function to call when payment is successful
 * @returns {void}
 */
export const initializePayment = (options) => {
  // Ensure Paystack script is loaded
  if (!window.PaystackPop) {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);
    
    script.onload = () => {
      // Initialize payment when script is loaded
      processPayment(options);
    };
  } else {
    // Paystack already loaded, initialize payment
    processPayment(options);
  }
};

/**
 * Process the payment with Paystack
 * @param {Object} options - Payment options
 */
const processPayment = (options) => {
  const handler = window.PaystackPop.setup({
    key: config.publicKey,
    email: options.email,
    amount: options.amount, // In smallest currency unit (kobo, cents)
    ref: options.reference,
    currency: options.currency || 'ZAR',
    callback: (response) => {
      if (options.onSuccess) {
        options.onSuccess(response);
      }
    },
    onClose: () => {
      if (options.onClose) {
        options.onClose();
      }
    },
    metadata: options.metadata || {},
  });
  
  handler.openIframe();
};

/**
 * Verify a Paystack payment on the frontend
 * @param {string} reference - Payment reference
 * @returns {Promise<Object>} Verification result
 */
export const verifyPayment = async (reference) => {
  try {
    const response = await fetch(`/api/payments/verify?reference=${reference}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Payment verification failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};
