import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService, paymentService } from '../services/api';

export const Cart = () => {
  const { state, dispatch } = useCart();
  const { isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    dispatch({ 
      type: 'UPDATE_QUANTITY', 
      payload: { 
        productId, 
        size, 
        quantity: Math.max(1, quantity) 
      } 
    });
  };

  const removeFromCart = (productId: string, size: string) => {
    dispatch({ 
      type: 'REMOVE_FROM_CART', 
      payload: { 
        productId, 
        size 
      } 
    });
  };

  const subtotal = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const shipping = subtotal > 800 ? 0 : 60;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setError('Please log in to checkout');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // 1. Create the order
      const orderData = {
        items: state.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          size: item.size
        })),
        total
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

  if (state.items.length === 0) {
    return (
      <motion.div 
        className="min-h-screen pt-32 pb-24"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="text-center space-y-6">
            <h1 className="text-3xl tracking-[0.2em] font-light">YOUR CART</h1>
            <p className="text-gray-500 tracking-[0.1em]">Your cart is currently empty.</p>
            <Link 
              to="/category/all"
              className="inline-block mt-8 px-12 py-4 bg-black text-white text-sm tracking-[0.2em] hover:bg-gray-900 transition-colors"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen pt-32 pb-24"
      initial="initial"
      animate="animate"
      variants={fadeIn}
    >
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
        <h1 className="text-3xl tracking-[0.2em] font-light mb-16">YOUR CART</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-8">
            {state.items.map((item) => (
              <motion.div
                key={`${item.product.id}-${item.size}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-[120px,1fr] sm:grid-cols-[180px,1fr] gap-8 pb-8 border-b border-gray-200"
              >
                {/* Product Image */}
                <Link to={`/product/${item.product.id}`} className="aspect-[3/4] bg-gray-50">
                  <img
                    src={item.product.images.find(img => img.isMain)?.url || item.product.images[0]?.url}
                    alt={item.product.name}
                    className="w-full h-full object-cover object-center"
                  />
                </Link>

                {/* Product Details */}
                <div className="flex flex-col justify-between py-2">
                  <div className="space-y-1">
                    <Link 
                      to={`/product/${item.product.id}`}
                      className="block text-sm tracking-[0.1em] hover:text-gray-600 transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs tracking-[0.1em] text-gray-500">Size: {item.size}</p>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                        className="p-1 hover:text-gray-600 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm tracking-[0.1em]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                        className="p-1 hover:text-gray-600 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-6">
                      <p className="text-sm tracking-[0.1em]">
                        R{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.size)}
                        className="p-1 text-gray-400 hover:text-black transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-gray-50 p-8 space-y-6">
              <h2 className="text-lg tracking-[0.1em]">ORDER SUMMARY</h2>
              
              <div className="space-y-4 text-sm">
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
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between tracking-[0.1em] font-medium">
                    <span>Total</span>
                    <span>R{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm tracking-[0.05em]">
                  {error}
                </div>
              )}

              {!isAuthenticated ? (
                <div className="space-y-4">
                  <Link 
                    to="/login?redirect=/cart"
                    className="block w-full py-4 bg-black text-white text-center text-sm tracking-[0.2em] hover:bg-gray-900 transition-colors"
                  >
                    LOGIN TO CHECKOUT
                  </Link>
                  <p className="text-xs text-gray-500 tracking-[0.05em] text-center">
                    You need to be logged in to checkout
                  </p>
                </div>
              ) : (
                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className={`w-full py-4 text-white text-sm tracking-[0.2em] transition-colors ${
                    isProcessing 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-black hover:bg-gray-900'
                  }`}
                >
                  {isProcessing ? 'PROCESSING...' : 'PROCEED TO CHECKOUT'}
                </button>
              )}

              <Link 
                to="/category/all"
                className="block text-center text-sm tracking-[0.1em] text-gray-600 hover:text-black transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};