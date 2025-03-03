import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export const PaymentCancel = () => {
  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  };
  
  return (
    <motion.div 
      className="min-h-screen pt-32 pb-24"
      initial="initial"
      animate="animate"
      variants={fadeIn}
    >
      <div className="max-w-[800px] mx-auto px-6">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-6">
            <X className="w-12 h-12 text-red-600" />
          </div>
          
          <h1 className="text-3xl tracking-[0.2em] font-light">PAYMENT CANCELLED</h1>
          <p className="text-gray-500 tracking-[0.1em]">
            Your payment has been cancelled. No charges have been made.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
            <Link 
              to="/cart"
              className="px-12 py-4 bg-black text-white text-sm tracking-[0.2em] hover:bg-gray-900 transition-colors"
            >
              RETURN TO CART
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
