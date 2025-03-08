import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await orderService.getOrder(id);
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleBackToOrders = () => {
    navigate('/orders');
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

  if (error || !order) {
    return (
      <div className="min-h-screen pt-32 pb-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <div className="bg-red-50 p-6 rounded-md text-center">
            <h1 className="text-2xl tracking-[0.2em] font-light mb-4 text-red-700">ORDER NOT FOUND</h1>
            <p className="text-red-600 mb-6">{error || "We couldn't find the order you're looking for."}</p>
            <button
              onClick={handleBackToOrders}
              className="px-6 py-3 bg-black text-white tracking-[0.1em] hover:bg-gray-900 transition-colors"
            >
              BACK TO ORDERS
            </button>
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
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleBackToOrders}
            className="flex items-center text-gray-600 hover:text-black transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            BACK TO ORDERS
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          {/* Order Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="space-y-2 mb-4 md:mb-0">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl tracking-[0.1em] font-light">Order #{order.id?.substring(0, 8) || 'Unknown'}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status || 'pending')}`}>
                    {(order.status?.charAt(0).toUpperCase() + order.status?.slice(1)) || 'Pending'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Placed on {order.createdAt ? formatDate(order.createdAt) : 'Unknown date'}
                </p>
              </div>
              <div className="text-lg font-medium">
                Total: R{parseFloat(order.total?.toString() || '0').toFixed(2)}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg tracking-[0.1em] font-medium mb-6">ITEMS</h2>
            <div className="space-y-6">
              {order.OrderItems.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="h-32 w-24 bg-gray-50 flex-shrink-0">
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
                  <div className="flex-grow">
                    <Link 
                      to={`/product/${item.Product?.id || '#'}`}
                      className="text-base tracking-[0.05em] hover:text-gray-600 transition-colors"
                    >
                      {item.Product?.name || 'Product'}
                    </Link>
                    <div className="text-sm text-gray-500 mt-2 space-y-1">
                      <p>Size: {item.size}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: R{parseFloat(item.price?.toString() || '0').toFixed(2)}</p>
                      <p>Subtotal: R{(parseFloat(item.price?.toString() || '0') * (item.quantity || 1)).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Delivery Details */}
            <div>
              <h2 className="text-lg tracking-[0.1em] font-medium mb-4">DELIVERY DETAILS</h2>
              <div className="space-y-3 text-sm">
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
            
            {/* Order Summary */}
            <div>
              <h2 className="text-lg tracking-[0.1em] font-medium mb-4">ORDER SUMMARY</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R{(parseFloat(order.total?.toString() || '0') - (order.total && order.total > 800 ? 0 : 60)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{order.total && order.total > 800 ? 'FREE' : 'R60.00'}</span>
                </div>
                <div className="flex justify-between font-medium pt-3 border-t border-gray-200 mt-3">
                  <span>Total</span>
                  <span>R{parseFloat(order.total?.toString() || '0').toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          {order.status !== 'pending' && order.status !== 'cancelled' && (
            <div className="p-6 border-t border-gray-200">
              <h2 className="text-lg tracking-[0.1em] font-medium mb-4">TRACKING INFORMATION</h2>
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
        </div>
      </div>
    </motion.div>
  );
};

export default OrderDetails;
