import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { orderService } from '../services/api';

export const PaymentSuccess = () => {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const location = useLocation();
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Get order ID from URL query params
        const params = new URLSearchParams(location.search);
        const m_payment_id = params.get('m_payment_id');
        
        if (!m_payment_id) {
          setError('Order information not found');
          setLoading(false);
          return;
        }
        
        setOrderId(m_payment_id);
        
        // Fetch order details
        const order = await orderService.getOrder(m_payment_id);
        setOrderDetails(order);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [location]);
  
  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen pt-32 pb-24">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="text-center space-y-6">
            <h1 className="text-3xl tracking-[0.2em] font-light">PAYMENT ERROR</h1>
            <p className="text-gray-500 tracking-[0.1em]">{error}</p>
            <Link 
              to="/"
              className="inline-block mt-8 px-12 py-4 bg-black text-white text-sm tracking-[0.2em] hover:bg-gray-900 transition-colors"
            >
              RETURN TO HOME
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="min-h-screen pt-32 pb-24"
      initial="initial"
      animate="animate"
      variants={fadeIn}
    >
      <div className="max-w-[800px] mx-auto px-6">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl tracking-[0.2em] font-light">PAYMENT SUCCESSFUL</h1>
          <p className="text-gray-500 tracking-[0.1em]">
            Thank you for your purchase! Your order has been confirmed.
          </p>
          
          {orderDetails && (
            <div className="mt-12 bg-gray-50 p-8 text-left">
              <h2 className="text-lg tracking-[0.1em] mb-6">ORDER DETAILS</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <span className="text-gray-500">Order Number:</span>
                  <span>{orderDetails.id}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <span className="text-gray-500">Date:</span>
                  <span>{new Date(orderDetails.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className="capitalize">{orderDetails.status}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <span className="text-gray-500">Total:</span>
                  <span>R{orderDetails.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
            <Link 
              to="/orders"
              className="px-12 py-4 bg-black text-white text-sm tracking-[0.2em] hover:bg-gray-900 transition-colors"
            >
              VIEW ORDERS
            </Link>
            
            <Link 
              to="/"
              className="px-12 py-4 border border-black text-sm tracking-[0.2em] hover:bg-gray-100 transition-colors"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
