import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService, paymentService } from '../services/api';

type DeliveryFormData = {
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
  postalCode: string;
  deliveryInstructions: string;
};

export const Checkout = () => {
  const { state } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<DeliveryFormData>({
    recipientName: user?.name || '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: '',
    deliveryInstructions: '',
  });

  useEffect(() => {
    // Redirect to cart if cart is empty
    if (state.items.length === 0) {
      navigate('/cart');
    }
    
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
  }, [state.items.length, isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const subtotal = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const shipping = subtotal > 800 ? 0 : 60;
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsProcessing(true);
      setError(null);

      // 1. Create the order with delivery details
      const orderData = {
        items: state.items.map(item => ({
          productId: String(item.product.id), // Convert to string to match expected type
          quantity: item.quantity,
          size: item.size
        })),
        total,
        ...formData
      };

      const order = await orderService.createOrder(orderData);

      // 2. Create PayFast payment
      const payment = await paymentService.createPayment(order.id);

      // 3. Redirect to PayFast
      window.location.href = payment.redirectUrl;
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to process checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  };

  return (
    <motion.div 
      className="min-h-screen pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-24"
      initial="initial"
      animate="animate"
      variants={fadeIn}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
        <h1 className="text-2xl sm:text-3xl tracking-[0.2em] font-light mb-8 sm:mb-16">CHECKOUT</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Delivery Form */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl tracking-[0.15em] font-light">DELIVERY DETAILS</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1 sm:space-y-2">
                    <label htmlFor="recipientName" className="block text-xs sm:text-sm tracking-[0.1em] text-gray-600">
                      Full Name*
                    </label>
                    <input
                      type="text"
                      id="recipientName"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleChange}
                      required
                      className="w-full p-2 sm:p-3 border border-gray-300 focus:border-black focus:outline-none text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <label htmlFor="phoneNumber" className="block text-xs sm:text-sm tracking-[0.1em] text-gray-600">
                      Phone Number*
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className="w-full p-2 sm:p-3 border border-gray-300 focus:border-black focus:outline-none text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-1 sm:space-y-2">
                  <label htmlFor="addressLine1" className="block text-xs sm:text-sm tracking-[0.1em] text-gray-600">
                    Address Line 1*
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    required
                    className="w-full p-2 sm:p-3 border border-gray-300 focus:border-black focus:outline-none text-sm"
                    placeholder="Street address, P.O. box"
                  />
                </div>
                
                <div className="space-y-1 sm:space-y-2">
                  <label htmlFor="addressLine2" className="block text-xs sm:text-sm tracking-[0.1em] text-gray-600">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    className="w-full p-2 sm:p-3 border border-gray-300 focus:border-black focus:outline-none text-sm"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-1 sm:space-y-2">
                    <label htmlFor="city" className="block text-xs sm:text-sm tracking-[0.1em] text-gray-600">
                      City*
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full p-2 sm:p-3 border border-gray-300 focus:border-black focus:outline-none text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <label htmlFor="province" className="block text-xs sm:text-sm tracking-[0.1em] text-gray-600">
                      Province*
                    </label>
                    <select
                      id="province"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      required
                      className="w-full p-2 sm:p-3 border border-gray-300 focus:border-black focus:outline-none text-sm"
                    >
                      <option value="">Select Province</option>
                      <option value="Eastern Cape">Eastern Cape</option>
                      <option value="Free State">Free State</option>
                      <option value="Gauteng">Gauteng</option>
                      <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                      <option value="Limpopo">Limpopo</option>
                      <option value="Mpumalanga">Mpumalanga</option>
                      <option value="North West">North West</option>
                      <option value="Northern Cape">Northern Cape</option>
                      <option value="Western Cape">Western Cape</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <label htmlFor="postalCode" className="block text-xs sm:text-sm tracking-[0.1em] text-gray-600">
                      Postal Code*
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                      className="w-full p-2 sm:p-3 border border-gray-300 focus:border-black focus:outline-none text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-1 sm:space-y-2">
                  <label htmlFor="deliveryInstructions" className="block text-xs sm:text-sm tracking-[0.1em] text-gray-600">
                    Delivery Instructions
                  </label>
                  <textarea
                    id="deliveryInstructions"
                    name="deliveryInstructions"
                    value={formData.deliveryInstructions}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-2 sm:p-3 border border-gray-300 focus:border-black focus:outline-none text-sm"
                    placeholder="Special instructions for delivery"
                  />
                </div>
              </div>
              
              {error && (
                <div className="text-red-500 text-xs sm:text-sm tracking-[0.05em]">
                  {error}
                </div>
              )}
              
              <button 
                type="submit"
                disabled={isProcessing}
                className={`w-full py-3 sm:py-4 text-white text-xs sm:text-sm tracking-[0.2em] transition-colors ${
                  isProcessing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-black hover:bg-gray-900'
                }`}
              >
                {isProcessing ? 'PROCESSING...' : 'PROCEED TO PAYMENT'}
              </button>
            </form>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-gray-50 p-6 sm:p-8 space-y-4 sm:space-y-6">
              <h2 className="text-base sm:text-lg tracking-[0.1em]">ORDER SUMMARY</h2>
              
              <div className="space-y-3 sm:space-y-4">
                {state.items.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} className="flex justify-between text-xs sm:text-sm">
                    <div>
                      <span>{item.product.name}</span>
                      <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      <span className="block text-xs text-gray-500">Size: {item.size}</span>
                    </div>
                    <span>R{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm pt-3 sm:pt-4 border-t border-gray-200">
                <div className="flex justify-between tracking-[0.1em]">
                  <span>Subtotal</span>
                  <span>R{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between tracking-[0.1em]">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `R${shipping.toFixed(2)}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-500 tracking-[0.05em]">
                    Free shipping on orders over R800
                  </p>
                )}
                <div className="pt-3 sm:pt-4 border-t border-gray-200">
                  <div className="flex justify-between tracking-[0.1em] font-medium">
                    <span>Total</span>
                    <span>R{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;
