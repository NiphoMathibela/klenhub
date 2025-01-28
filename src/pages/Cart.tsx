import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Cart = () => {
  const { state, dispatch } = useCart();

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
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
                    src={item.product.images[0]}
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
                    <p className="text-xs tracking-[0.1em] text-gray-500">{item.product.brand}</p>
                    <p className="text-xs tracking-[0.1em] text-gray-500">Size: {item.size}</p>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                        className="p-1 hover:text-gray-600 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm tracking-[0.1em]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 hover:text-gray-600 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        {item.product.salePrice ? (
                          <>
                            <p className="text-sm tracking-[0.1em] text-red-600">
                              <Ri:art></Ri:art>{(item.product.salePrice * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-xs tracking-[0.1em] text-gray-400 line-through">
                              R{(item.product.price * item.quantity).toFixed(2)}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm tracking-[0.1em]">
                            R{(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
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
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
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

              <button className="w-full py-4 bg-black text-white text-sm tracking-[0.2em] hover:bg-gray-900 transition-colors">
                PROCEED TO CHECKOUT
              </button>

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