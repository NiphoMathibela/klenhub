import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

interface YocoCheckoutProps {
  orderId: string;
  amount: number;
}

declare global {
  interface Window {
    YocoSDK: any;
  }
}

const YocoCheckout: React.FC<YocoCheckoutProps> = ({ orderId, amount }) => {
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Initialize payment with backend to get SDK parameters
      const authToken = localStorage.getItem('token'); // Use 'token' as per AuthContext and api.ts
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      } else {
        console.error('Authentication token not found. User might not be logged in.');
        setError('You must be logged in to proceed with the payment. Please log in and try again.');
        setIsProcessing(false);
        return;
      }

      const initResponse = await fetch('https://service.klenhub.co.za/api/payments/yoco/initialize', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ orderId }),
      });

      const initData = await initResponse.json();

      if (!initResponse.ok || !initData.success) {
        setError(initData.message || 'Failed to initialize Yoco payment details.');
        setIsProcessing(false);
        return;
      }

      const { publicKey, ...otherSdkParams } = initData.sdkParameters; // Assuming backend sends publicKey and potentially other params

      if (!publicKey) {
        setError('Failed to retrieve Yoco public key from server.');
        setIsProcessing(false);
        return;
      }

      // Step 2: Initialize the Yoco SDK with parameters from backend
      const yoco = new window.YocoSDK({
        publicKey: publicKey,
        ...otherSdkParams // Spread any other params Yoco SDK might need from backend
      });

      const amountInCents = Math.round(amount * 100);

      // Step 3: Show the Yoco popup form
      yoco.showPopup({
        amountInCents: amountInCents,
        currency: 'ZAR',
        name: 'KlenHub Order',
        description: `Order #${orderId}`,
        metadata: { // Optional: pass any metadata you need back from Yoco or for your records
          orderId: orderId,
          // checkoutId: yourCheckoutId, // If you use a checkout process identifier
        },
        callback: async (result: any) => {
          if (result.error) {
            setError(result.error.message);
            setIsProcessing(false);
            return;
          }

          // Step 4: Payment token received, send to backend to create charge
          try {
            const chargeAuthToken = localStorage.getItem('token'); // Use 'token' as per AuthContext and api.ts
            const chargeHeaders: HeadersInit = {
              'Content-Type': 'application/json',
            };

            if (chargeAuthToken) {
              chargeHeaders['Authorization'] = `Bearer ${chargeAuthToken}`;
            } else {
              // This case should ideally not be reached if init succeeded with auth
              console.error('Authentication token not found for charge creation.');
              setError('Authentication error during charge creation. Please try again or contact support.');
              setIsProcessing(false);
              return;
            }

            const chargeResponse = await fetch('https://service.klenhub.co.za/api/payments/yoco/charge', {
              method: 'POST',
              headers: chargeHeaders,
              body: JSON.stringify({
                yocoToken: result.id, // Changed from 'token' to 'yocoToken'
                orderId: orderId,
                amountInCents: amountInCents, // Send amountInCents for backend verification
                // metadata: { orderId: orderId }, // Optionally pass metadata again if needed by charge endpoint
              }),
            });

            const chargeData = await chargeResponse.json();

            if (!chargeResponse.ok || !chargeData.success) {
              setError(chargeData.message || chargeData.error || 'Payment charge failed on server.');
              setIsProcessing(false);
              return;
            }

            console.log('Payment successful and charged:', chargeData);
            dispatch({ type: 'CLEAR_CART' });
            navigate(`/payment/verify?reference=${orderId}&status=success&provider=yoco&charge_id=${chargeData.charge?.id || orderId}`);

          } catch (verifyError: any) {
            console.error('Error creating Yoco charge:', verifyError);
            setError('Payment token received, but charge creation failed. Please contact support. ' + (verifyError.message || ''));
            setIsProcessing(false);
          }
        },
      });
    } catch (err: any) {
      console.error('Yoco Payment error:', err);
      setError('Failed to process payment. Please try again. ' + (err.message || ''));
      setIsProcessing(false);
    }
    // setIsProcessing(false); // Yoco popup handles its own lifecycle, only set to false on error/completion in callback
  }

  // Load the Yoco SDK when the component mounts
  React.useEffect(() => {
    const loadYocoSDK = () => {
      const script = document.createElement('script');
      script.src = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js';
      script.async = true;
      script.onload = () => {
        console.log('Yoco SDK loaded');
      };
      script.onerror = () => {
        setError('Failed to load payment SDK. Please try again later.');
      };
      document.body.appendChild(script);
    };
    
    loadYocoSDK();
    
    // Cleanup function
    return () => {
      const script = document.querySelector('script[src="https://js.yoco.com/sdk/v1/yoco-sdk-web.js"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  return (
    <div className="yoco-checkout-container">
      <div className="mb-6">
        <h2 className="text-xl tracking-[0.15em] font-light mb-4">PAYMENT DETAILS</h2>
        <p className="text-gray-600 mb-2">Amount: R{amount.toFixed(2)}</p>
        <p className="text-gray-600 mb-6">Order ID: {orderId}</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-6 rounded-md">
          {error}
        </div>
      )}
      
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className={`w-full py-3 sm:py-4 text-white text-xs sm:text-sm tracking-[0.2em] transition-colors ${
          isProcessing 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-black hover:bg-gray-900'
        }`}
      >
        {isProcessing ? 'PROCESSING...' : 'PAY NOW'}
      </button>
    </div>
  );
};

export default YocoCheckout;
