import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

export const Footer = () => {
  return (
    <footer className="bg-gray-100 py-10">
      <div className="max-w-[1800px] mx-auto px-6">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <Link to="/category/sale" className="text-gray-600 hover:text-gray-900">SALE</Link>
            <Link to="/category/new" className="text-gray-600 hover:text-gray-900">NEW</Link>
            <Link to="/category/tops" className="text-gray-600 hover:text-gray-900">TOPS</Link>
            <Link to="/category/bottoms" className="text-gray-600 hover:text-gray-900">BOTTOMS</Link>
            <Link to="/category/accessories" className="text-gray-600 hover:text-gray-900">ACCESSORIES</Link>
            <Link to="/category/shoes" className="text-gray-600 hover:text-gray-900">SHOES</Link>
          </div>
          <div className="flex space-x-4">
            <Instagram className="h-6 w-6 text-gray-600 hover:text-gray-900" />
            <Facebook className="h-6 w-6 text-gray-600 hover:text-gray-900" />
            <Twitter className="h-6 w-6 text-gray-600 hover:text-gray-900" />
          </div>
        </div>
        <div className="mt-6 text-center text-gray-600">
          &copy; {new Date().getFullYear()} KLEN_HUB. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
