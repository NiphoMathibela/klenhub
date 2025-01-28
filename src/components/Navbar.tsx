import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { state } = useCart();

  const categories = [
    { name: 'SPRING/SUMMER 2024', path: '/category/spring-summer' },
    { name: 'NEW ARRIVALS', path: '/category/new-arrivals' },
    { name: 'COLLECTIONS', path: '/category/collections' },
    { name: 'EDITORIAL', path: '/category/editorial' },
  ];

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed w-full bg-white z-50"
    >
      <div className="max-w-[1800px] mx-auto">
        {/* Top Bar - Search and Cart */}
        <div className="flex justify-between items-center h-12 px-6 lg:px-12 border-b border-gray-200">
          <div className="flex-1">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:opacity-70 transition-opacity"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Center Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 top-3">
            <motion.h1 
              className="text-2xl tracking-[0.3em] font-light"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              KLEN_HUB
            </motion.h1>
          </Link>

          <div className="flex-1 flex justify-end items-center space-x-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:text-gray-600 transition-colors"
            >
              <Search className="h-4 w-4" />
            </motion.button>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link to="/cart" className="p-2 relative hover:text-gray-600 transition-colors">
                <ShoppingBag className="h-4 w-4" />
                {state.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {state.items.length}
                  </span>
                )}
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Categories Navigation */}
        <div className="hidden lg:block border-b border-gray-200">
          <div className="flex justify-center items-center space-x-12 py-6 px-6 lg:px-12">
            {categories.map((category) => (
              <motion.div
                key={category.path}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to={category.path}
                  className="text-sm tracking-wider hover:text-gray-600 transition-colors relative group"
                >
                  {category.name}
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: isMenuOpen ? 1 : 0, height: isMenuOpen ? 'auto' : 0 }}
          className="lg:hidden overflow-hidden bg-white border-t"
        >
          <div className="px-6 py-8 space-y-6">
            {categories.map((category) => (
              <motion.div
                key={category.path}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to={category.path}
                  className="block text-sm tracking-wider"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: isSearchOpen ? 1 : 0,
            y: isSearchOpen ? 0 : -20,
            display: isSearchOpen ? 'block' : 'none'
          }}
          transition={{ duration: 0.2 }}
          className="absolute left-0 right-0 bg-white border-t p-6"
        >
          <input
            type="text"
            placeholder="Search products..."
            className="w-full px-4 py-3 bg-gray-50 focus:outline-none transition-all duration-300 focus:bg-gray-100"
            autoFocus
          />
        </motion.div>
      </div>
    </motion.nav>
  );
};
