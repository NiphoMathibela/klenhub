import React, { useState } from 'react';
import { initializePayment, verifyPayment } from '../utils/paystack';

/**
 * Paystack Checkout Component
 * @param {Object} props - Component props
 * @param {Object} props.order - Order data
 * @param {Object} props.user - User data
 * @param {Function} props.onSuccess - Callback for successful payment
 * @param {Function} props.onError - Callback for payment error
 * @returns {JSX.Element} Payment button component
 */
const PaystackCheckout = ({ order, user, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Initialize payment on backend
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: order.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize payment');
      }

      const data = await response.json();
      
      // 2. Redirect to Paystack checkout
      window.location.href = data.redirectUrl;
      
      /* 
      // Alternative: Use the Paystack popup (client-side only)
      initializePayment({
        email: user.email,
        amount: order.total * 100, // Convert to kobo/cents
        reference: data.reference,
        onSuccess: async (response) => {
          // Verify on backend
          const verification = await verifyPayment(response.reference);
          if (verification.success) {
            onSuccess(verification);
          } else {
            onError(new Error('Payment verification failed'));
          }
        },
        onClose: () => {
          setLoading(false);
        },
        metadata: {
          order_id: order.id,
        },
      });
      */
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message);
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paystack-checkout">
      {error && <div className="error-message">{error}</div>}
      <button
        className="paystack-button"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Pay with Paystack'}
      </button>
    </div>
  );
};

export default PaystackCheckout;
