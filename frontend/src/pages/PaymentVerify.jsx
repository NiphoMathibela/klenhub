import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPayment } from '../utils/paystack';

/**
 * Payment Verification Page
 * This page handles the verification of payment after redirect from Paystack
 */
const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);

  const reference = searchParams.get('reference');

  useEffect(() => {
    const verify = async () => {
      if (!reference) {
        setStatus('error');
        setError('No payment reference found');
        return;
      }

      try {
        setStatus('verifying');
        
        // Verify the payment
        const result = await verifyPayment(reference);
        
        if (result.success) {
          setStatus('success');
          setOrderDetails(result.order);
        } else {
          setStatus('error');
          setError('Payment verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setError(error.message || 'An error occurred during payment verification');
      }
    };

    verify();
  }, [reference]);

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrder = () => {
    if (orderDetails) {
      navigate(`/orders/${orderDetails.id}`);
    }
  };

  return (
    <div className="payment-verify-container">
      <h1>Payment Verification</h1>
      
      {status === 'verifying' && (
        <div className="verifying-payment">
          <div className="spinner"></div>
          <p>Verifying your payment...</p>
        </div>
      )}
      
      {status === 'success' && (
        <div className="payment-success">
          <div className="success-icon">✓</div>
          <h2>Payment Successful!</h2>
          <p>Thank you for your purchase. Your order is being processed.</p>
          
          {orderDetails && (
            <div className="order-summary">
              <h3>Order Summary</h3>
              <p><strong>Order ID:</strong> {orderDetails.id}</p>
              <p><strong>Amount:</strong> {orderDetails.total}</p>
              <p><strong>Status:</strong> {orderDetails.status}</p>
            </div>
          )}
          
          <div className="action-buttons">
            <button onClick={handleViewOrder} className="view-order-btn">
              View Order
            </button>
            <button onClick={handleContinueShopping} className="continue-shopping-btn">
              Continue Shopping
            </button>
          </div>
        </div>
      )}
      
      {status === 'error' && (
        <div className="payment-error">
          <div className="error-icon">✗</div>
          <h2>Payment Verification Failed</h2>
          <p>{error || 'There was an issue verifying your payment.'}</p>
          <p>If you believe this is an error, please contact our support team.</p>
          
          <div className="action-buttons">
            <button onClick={handleContinueShopping} className="continue-shopping-btn">
              Return to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerify;
