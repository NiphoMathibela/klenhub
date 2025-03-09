import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Package, Truck, Calendar, CreditCard } from 'lucide-react';
import { orderService, paymentService } from '../services/api';
import './PaymentSuccess.css';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  imageUrl?: string;
}

interface OrderDetails {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  deliveryInstructions?: string;
  paymentReference?: string;
  trackingNumber?: string;
}

export const PaymentSuccess = () => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Get reference from URL query params (Paystack reference)
        const params = new URLSearchParams(location.search);
        const reference = params.get('reference');
        
        if (!reference) {
          setError('Payment reference not found');
          setLoading(false);
          return;
        }
        
        console.log(`PaymentSuccess: Processing reference: ${reference}`);
        
        // For Paystack, the reference might be in the format "order_<orderId>_<timestamp>"
        // Extract the order ID if it's in this format
        let orderId = reference;
        if (reference.startsWith('order_')) {
          const parts = reference.split('_');
          if (parts.length >= 2) {
            orderId = parts[1];
            console.log(`PaymentSuccess: Extracted orderId from reference: ${orderId}`);
          }
        }
        
        // Check if the reference is a UUID (likely an order ID)
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidPattern.test(reference)) {
          console.log(`PaymentSuccess: Reference appears to be a UUID, using as orderId: ${reference}`);
          orderId = reference;
        }
        
        // Try to verify the payment first
        try {
          console.log(`PaymentSuccess: Attempting to verify payment with reference: ${reference}`);
          const result = await paymentService.getPaymentStatus(reference);
          
          if (result.success) {
            // If verification succeeded, use the order from the result
            console.log(`PaymentSuccess: Payment verification successful, fetching order: ${result.order.id}`);
            const orderData = await orderService.getOrder(result.order.id);
            setOrderDetails(orderData);
            setLoading(false);
            return;
          }
        } catch (verifyError) {
          console.log('Payment verification failed, trying direct order fetch:', verifyError);
          // If verification fails, we'll try to fetch the order directly
        }
        
        // If payment verification failed or not available, try to fetch the order directly
        try {
          console.log(`PaymentSuccess: Fetching order directly with ID: ${orderId}`);
          const orderData = await orderService.getOrder(orderId);
          
          if (orderData) {
            console.log(`PaymentSuccess: Successfully fetched order: ${orderData.id}`);
            setOrderDetails(orderData);
          } else {
            console.error(`PaymentSuccess: Order not found with ID: ${orderId}`);
            setError('Order not found');
          }
        } catch (orderError) {
          console.error('Error fetching order:', orderError);
          setError('Failed to load order details');
        }
      } catch (err) {
        console.error('Error in payment success flow:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [location]);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-24">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          <div className="text-center space-y-4 sm:space-y-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl tracking-[0.2em] font-light">PAYMENT ERROR</h1>
            <p className="text-sm sm:text-base text-gray-500 tracking-[0.1em]">{error}</p>
            <Link 
              to="/"
              className="inline-block mt-6 sm:mt-8 px-8 sm:px-12 py-3 sm:py-4 bg-black text-white text-xs sm:text-sm tracking-[0.2em] hover:bg-gray-900 transition-colors"
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
      className="min-h-screen pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-24"
      initial="initial"
      animate="animate"
      variants={fadeIn}
    >
      <div className="max-w-[800px] mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-green-100 mb-4 sm:mb-6">
            <Check className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-green-600" />
          </div>
          
          <h1 className="text-xl sm:text-2xl md:text-3xl tracking-[0.2em] font-light">PAYMENT SUCCESSFUL</h1>
          <p className="text-sm sm:text-base text-gray-500 tracking-[0.1em]">
            Thank you for your purchase! Your order has been confirmed.
          </p>
          
          {orderDetails ? (
            <motion.div 
              className="mt-8 sm:mt-12 bg-gray-50 p-4 sm:p-6 md:p-8 text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-base sm:text-lg tracking-[0.1em] mb-4 sm:mb-6 flex items-center">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                ORDER DETAILS
              </h2>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <span className="text-gray-500">Order Number:</span>
                  <span className="break-all">{orderDetails.id}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <span className="text-gray-500">Date:</span>
                  <span>{formatDate(orderDetails.createdAt)}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className="capitalize">{orderDetails.status}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <span className="text-gray-500">Payment Reference:</span>
                  <span className="break-all">{orderDetails.paymentReference}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <span className="text-gray-500">Total:</span>
                  <span>R{typeof orderDetails.total === 'number' ? orderDetails.total.toFixed(2) : parseFloat(orderDetails.total).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-6 sm:mt-8 border-t border-gray-200 pt-4 sm:pt-6">
                <h3 className="text-sm sm:text-md tracking-[0.1em] mb-3 sm:mb-4 flex items-center">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  SHIPPING DETAILS
                </h3>
                
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <p><span className="font-medium">{orderDetails.recipientName}</span></p>
                  <p>{orderDetails.addressLine1}</p>
                  {orderDetails.addressLine2 && <p>{orderDetails.addressLine2}</p>}
                  <p>{orderDetails.city}, {orderDetails.province}, {orderDetails.postalCode}</p>
                  <p>Phone: {orderDetails.phoneNumber}</p>
                  {orderDetails.deliveryInstructions && (
                    <p className="mt-2 italic text-xs sm:text-sm">
                      Note: {orderDetails.deliveryInstructions}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 sm:mt-8 border-t border-gray-200 pt-4 sm:pt-6">
                <h3 className="text-sm sm:text-md tracking-[0.1em] mb-3 sm:mb-4">ORDER ITEMS</h3>
                
                {orderDetails.items && orderDetails.items.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {orderDetails.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 sm:space-x-4 py-2 sm:py-3 border-b border-gray-100">
                        {item.imageUrl && (
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 flex-shrink-0">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex-grow">
                          <h4 className="text-xs sm:text-sm font-medium">{item.name}</h4>
                          <div className="text-xs text-gray-500 mt-1">
                            <span>Size: {item.size}</span>
                            <span className="mx-2">·</span>
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                        
                        <div className="text-xs sm:text-sm">
                          R{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500">No items in this order.</p>
                )}
                
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium">Total</span>
                    <span className="text-xs sm:text-sm font-medium">R{orderDetails.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white p-4 sm:p-6 md:p-8 shadow-md rounded-lg text-center">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">No Order Details Found</h2>
              <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">Please try again or contact support.</p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-8 sm:mt-12">
            <Link 
              to="/orders"
              className="px-8 sm:px-12 py-3 sm:py-4 bg-black text-white text-xs sm:text-sm tracking-[0.2em] hover:bg-gray-900 transition-colors"
            >
              VIEW ALL ORDERS
            </Link>
            <Link 
              to="/"
              className="px-8 sm:px-12 py-3 sm:py-4 border border-black text-black text-xs sm:text-sm tracking-[0.2em] hover:bg-gray-100 transition-colors mt-3 sm:mt-0"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
