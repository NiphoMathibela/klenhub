import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, User, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { state } = useCart();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const categories = [
    { name: 'ALL', path: '/category/all' },
    { name: 'SALE', path: '/category/sale' },
    { name: 'NEW', path: '/category/new' },
    { name: 'TOPS', path: '/category/tops' },
    { name: 'BOTTOMS', path: '/category/bottoms' },
    { name: 'ACCESSORIES', path: '/category/accessories' },
    { name: 'SHOES', path: '/category/shoes' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return; // Don't search if query is empty
    }
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      // Updated to use the correct endpoint and HTTP method
      const response = await fetch(`/api/products/search?query=${encodeURIComponent(searchQuery.trim())}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Search failed:', response.status, errorData);
        throw new Error(`Search failed: ${response.status} ${errorData.error || ''}`);
      }
      
      const data = await response.json();
      console.log('Search results:', data);
      setSearchResults(data);
      
      if (data.length === 0) {
        console.log('No products found matching the search criteria');
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
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
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {isAdmin && (
                    <Link to="/admin/dashboard" className="hover:text-gray-600">
                      <User className="w-6 h-6" />
                    </Link>
                  )}
                  {!isAdmin && (
                    <Link to="/orders" className="hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                        <rect width="16" height="20" x="4" y="2" rx="2" />
                        <path d="M8 6h8" />
                        <path d="M8 10h8" />
                        <path d="M8 14h4" />
                      </svg>
                    </Link>
                  )}
                  <button onClick={handleLogout} className="hover:text-gray-600">
                    <LogOut className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="p-2 relative hover:text-gray-600 transition-colors">
                  <User className="h-4 w-4" />
                </Link>
              )}
            </motion.div>
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
          <div className='flex justify-end'>
            <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search products..."
              className="w-full px-4 py-3 bg-gray-50 focus:outline-none transition-all duration-300 focus:bg-gray-100 focus:ring-1 focus:ring-black"
              autoFocus
            />
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 py-2 px-4 bg-black text-white transition ${
                isSearching ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-900'
              }`}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 max-h-96 overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-50 p-4 cursor-pointer"
                    onClick={() => {
                      navigate(`/product/${product.id}`);
                      setIsSearchOpen(false);
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                  >
                    <div className="aspect-square w-full overflow-hidden mb-2">
                      <img
                        src={product.images[0]?.imageUrl || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-gray-600">${product.price}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            searchQuery.trim() !== '' && !isSearching && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-6 text-center bg-gray-50"
              >
                <p className="text-gray-600">No products found matching "{searchQuery}"</p>
                <p className="text-sm mt-2">Try a different search term or browse our categories</p>
              </motion.div>
            )
          )}
        </motion.div>
      </div>
    </motion.nav>
  );
};
