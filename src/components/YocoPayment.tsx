import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface YocoPaymentProps {
  amount: number;
  orderId: string;
  reference: string;
  publicKey: string;
}

declare global {
  interface Window {
    YocoSDK: any;
  }
}

const YocoPayment: React.FC<YocoPaymentProps> = ({ amount, orderId, reference, publicKey }) => {
  const navigate = useNavigate();
  const yocoContainerRef = useRef<HTMLDivElement>(null);
  const sdkLoaded = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load the Yoco SDK
    const loadYocoSDK = () => {
      setIsLoading(true);
      setError(null);
      
      if (window.YocoSDK || sdkLoaded.current) {
        initializeYoco();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js';
      script.async = true;
      script.onload = () => {
        sdkLoaded.current = true;
        initializeYoco();
      };
      script.onerror = () => {
        setError('Failed to load YOCO payment SDK. Please try again later.');
        setIsLoading(false);
      };
      document.body.appendChild(script);
    };

    // Initialize the Yoco inline form
    const initializeYoco = () => {
      if (!window.YocoSDK || !yocoContainerRef.current) return;

      try {
        // Convert amount to cents as required by Yoco
        const amountInCents = Math.round(amount * 100);

        // Initialize the SDK with v1
        const yoco = new window.YocoSDK({
          publicKey: publicKey
        });
        
        // Create the inline payment form using v1 API
        yoco.showInlineForm({
          amountInCents: amountInCents,
          currency: 'ZAR',
          name: 'KlenHub Order',
          description: `Order #${orderId}`,
          metadata: {
            order_id: orderId,
            reference: reference
          },
          callback_url: `${window.location.origin}/payment/verify?reference=${encodeURIComponent(orderId)}`,
          cancel_url: `${window.location.origin}/cart`,
          container: yocoContainerRef.current,
          onSuccess: (result: any) => {
            console.log('Payment successful', result);
            navigate(`/payment/verify?reference=${encodeURIComponent(orderId)}`);
          },
          onCancel: () => {
            console.log('Payment cancelled');
            navigate('/cart');
          },
          onError: (error: any) => {
            console.error('Payment error', error);
            setError('Payment failed. Please try again.');
            setIsLoading(false);
          }
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing Yoco:', error);
      }
    };

    loadYocoSDK();

    // Cleanup
    return () => {
      // Any cleanup needed for Yoco SDK
    };
  }, [amount, orderId, reference, publicKey, navigate]);

  return (
    <div className="yoco-payment-container">
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
      
      <div 
        id="yoco-payment-form"
        ref={yocoContainerRef} 
        className="yoco-payment-form border border-gray-300 p-4 rounded-md min-h-[300px]"
      >
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YocoPayment;
