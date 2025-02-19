import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Cart = () => {
  const { state, updateQuantity: updateCartQuantity, removeFromCart: removeCartItem } = useCart();

  const handleUpdateQuantity = async (productId: string, size: string, quantity: number) => {
    try {
      if (quantity > 0) {
        await updateCartQuantity(productId, size, quantity);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveFromCart = async (productId: string, size: string) => {
    try {
      await removeCartItem(productId, size);
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const subtotal = state.items.reduce(
    (sum, item) => sum + (item.product.salePrice || item.product.price) * item.quantity,
    0
  );

  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + shipping;

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  };

  if (state.loading) {
    return (
      <motion.div 
        className="min-h-screen pt-32 pb-24 flex items-center justify-center"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-500 tracking-[0.1em]">Loading your cart...</p>
        </div>
      </motion.div>
    );
  }

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
        <h1 className="text-3xl tracking-[0.2em] font-light text-center mb-12">YOUR CART</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            {state.items.map((item) => (
              <div key={`${item.product.id}-${item.size}`} className="flex gap-8 py-8 border-b">
                <div className="w-24 h-32 bg-gray-100">
                  <img 
                    src={item.product.images[0]} 
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{item.product.name}</h3>
                      <p className="text-gray-500 mt-1">Size: {item.size}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(item.product.id, item.size)}
                      className="text-gray-400 hover:text-black transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, item.size, item.quantity - 1)}
                        className="text-gray-400 hover:text-black transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={20} />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, item.size, item.quantity + 1)}
                        className="text-gray-400 hover:text-black transition-colors"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <p className="font-medium">
                      ${((item.product.salePrice || item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="lg:col-span-4">
            <div className="bg-gray-50 p-8">
              <h2 className="text-xl font-medium mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Add ${(200 - subtotal).toFixed(2)} more to get free shipping
                    </p>
                  )}
                </div>
              </div>
              
              <Link
                to="/checkout"
                className="block w-full text-center bg-black text-white py-4 mt-8 text-sm tracking-[0.2em] hover:bg-gray-900 transition-colors"
              >
                PROCEED TO CHECKOUT
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Cart;