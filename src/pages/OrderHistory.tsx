import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderService } from '../services/api';

type OrderItem = {
  id: string;
  quantity: number;
  size: string;
  price: number;
  Product: {
    id: number;
    name: string;
    images: Array<{
      id: number;
      imageUrl: string;
      isMain: boolean;
    }>;
  };
};

type Order = {
  id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  createdAt: string;
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  deliveryInstructions?: string;
  trackingNumber?: string;
  OrderItems: OrderItem[];
};

export const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getUserOrders();
        // Ensure we're setting an array even if the API returns null or undefined
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders. Please try again later.');
        // Set orders to empty array on error to prevent rendering issues
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleOrderDetails = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
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
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <h1 className="text-3xl tracking-[0.2em] font-light mb-16">ORDER HISTORY</h1>

        {error && (
          <div className="bg-red-50 p-4 mb-8 text-red-700 rounded">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center space-y-6">
            <p className="text-gray-500 tracking-[0.1em]">You haven't placed any orders yet.</p>
            <Link 
              to="/category/all"
              className="inline-block mt-8 px-12 py-4 bg-black text-white text-sm tracking-[0.2em] hover:bg-gray-900 transition-colors"
            >
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200">
                <div 
                  className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer"
                  onClick={() => toggleOrderDetails(order.id)}
                >
                  <div className="space-y-2 mb-4 md:mb-0">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg tracking-[0.1em]">Order #{order.id.substring(0, 8)}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <p className="text-lg font-medium">
                      R{parseFloat(order.total.toString()).toFixed(2)}
                    </p>
                    <div className="transform transition-transform duration-200">
                      <svg 
                        className={`h-5 w-5 ${expandedOrder === order.id ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {expandedOrder === order.id && (
                  <div className="border-t border-gray-200 p-6 space-y-8">
                    {/* Order Items */}
                    <div>
                      <h4 className="text-sm tracking-[0.1em] font-medium mb-4">ITEMS</h4>
                      <div className="space-y-4">
                        {order.OrderItems.map((item) => (
                          <div key={item.id} className="flex items-center space-x-4">
                            <div className="h-20 w-16 bg-gray-50 flex-shrink-0">
                              <img
                                src={
                                  item.Product?.images?.length 
                                    ? (item.Product.images.find(img => img.isMain)?.imageUrl || item.Product.images[0]?.imageUrl)
                                    : '/placeholder-image.jpg'
                                }
                                alt={item.Product?.name || 'Product'}
                                className="h-full w-full object-cover object-center"
                              />
                            </div>
                            <div>
                              <Link 
                                to={`/product/${item.Product?.id || '#'}`}
                                className="text-sm tracking-[0.05em] hover:text-gray-600 transition-colors"
                              >
                                {item.Product?.name || 'Product'}
                              </Link>
                              <div className="text-xs text-gray-500 mt-1">
                                <span>Size: {item.size}</span>
                                <span className="mx-2">·</span>
                                <span>Qty: {item.quantity}</span>
                                <span className="mx-2">·</span>
                                <span>R{parseFloat(item.price?.toString() || '0').toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Delivery Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-sm tracking-[0.1em] font-medium mb-4">DELIVERY DETAILS</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Recipient:</span> {order.recipientName}</p>
                          <p><span className="font-medium">Phone:</span> {order.phoneNumber}</p>
                          <p><span className="font-medium">Address:</span> {order.addressLine1}</p>
                          {order.addressLine2 && <p>{order.addressLine2}</p>}
                          <p>{order.city}, {order.province}, {order.postalCode}</p>
                          {order.deliveryInstructions && (
                            <p className="mt-2">
                              <span className="font-medium">Instructions:</span> {order.deliveryInstructions}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm tracking-[0.1em] font-medium mb-4">ORDER SUMMARY</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>R{(parseFloat(order.total.toString()) - (order.total > 800 ? 0 : 60)).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>{order.total > 800 ? 'FREE' : 'R60.00'}</span>
                          </div>
                          <div className="flex justify-between font-medium pt-2 border-t border-gray-200 mt-2">
                            <span>Total</span>
                            <span>R{parseFloat(order.total.toString()).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Tracking Information */}
                    {order.status !== 'pending' && order.status !== 'cancelled' && (
                      <div>
                        <h4 className="text-sm tracking-[0.1em] font-medium mb-4">TRACKING INFORMATION</h4>
                        {order.trackingNumber ? (
                          <div className="text-sm">
                            <p><span className="font-medium">Tracking Number:</span> {order.trackingNumber}</p>
                            <p className="mt-2">
                              You can track your package using the tracking number above on the courier's website.
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Tracking information will be available once your order has been shipped.
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* View Details Button */}
                    <div className="flex justify-center pt-4">
                      <Link 
                        to={`/order/${order.id}`}
                        className="px-6 py-3 bg-black text-white tracking-[0.1em] hover:bg-gray-900 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        VIEW FULL DETAILS
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OrderHistory;
