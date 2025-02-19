import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, User, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { state } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const categories = [
    { name: 'SALE', path: '/category/sale' },
    { name: 'NEW', path: '/category/new' },
    { name: 'TOPS', path: '/category/tops' },
    { name: 'BOTTOMS', path: '/category/bottoms' },
    { name: 'ACCESSORIES', path: '/category/accessories' },
    { name: 'SHOES', path: '/category/shoes' },
  ];

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

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
            <motion.div whileHover={{ scale: 1.1 }}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 hover:opacity-70 transition-opacity"
              >
                <Search className="h-5 w-5" />
              </button>
            </motion.div>

            {/* User Menu */}
            <div className="relative">
              <motion.div whileHover={{ scale: 1.1 }}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 hover:opacity-70 transition-opacity"
                >
                  <User className="h-5 w-5" />
                </button>
              </motion.div>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm text-gray-600">{user?.email}</p>
                      </div>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <motion.div whileHover={{ scale: 1.1 }}>
              <Link to="/cart" className="p-2 hover:opacity-70 transition-opacity relative">
                <ShoppingBag className="h-5 w-5" />
                {state.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {state.items.length}
                  </span>
                )}
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:block border-b border-gray-200">
          <div className="flex justify-center space-x-12 py-4">
            {categories.map((category) => (
              <Link
                key={category.path}
                to={category.path}
                className="text-sm tracking-[0.2em] hover:opacity-70 transition-opacity"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden border-b border-gray-200"
          >
            <div className="py-4 space-y-2">
              {categories.map((category) => (
                <Link
                  key={category.path}
                  to={category.path}
                  className="block px-6 py-2 text-sm tracking-[0.2em] hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search Overlay */}
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-x-0 top-full bg-white border-b border-gray-200 p-4"
          >
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:opacity-70 transition-opacity"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
