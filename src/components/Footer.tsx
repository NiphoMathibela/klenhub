import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

export const Footer = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-20">
          {/* Brand */}
          <motion.div {...fadeInUp} className="space-y-6">
            <h3 className="text-2xl tracking-[0.3em] font-light">KLEN_HUB</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Curating the finest in contemporary fashion. Where luxury meets minimalism.
            </p>
          </motion.div>

          {/* Collections */}
          <motion.div {...fadeInUp} className="space-y-6">
            <h4 className="text-sm tracking-[0.2em] uppercase">Collections</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/category/spring-summer" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Spring/Summer 2024
                </Link>
              </li>
              <li>
                <Link to="/category/new-arrivals" className="text-sm text-gray-500 hover:text-black transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/category/editorial" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Editorial
                </Link>
              </li>
              <li>
                <Link to="/category/all" className="text-sm text-gray-500 hover:text-black transition-colors">
                  View All
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Customer Care */}
          <motion.div {...fadeInUp} className="space-y-6">
            <h4 className="text-sm tracking-[0.2em] uppercase">Customer Care</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/shipping" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-500 hover:text-black transition-colors">
                  Contact Us
                </Link>
              </li>




            </ul>
          </motion.div>

          {/* Connect */}
          <motion.div {...fadeInUp} className="space-y-8">
            <div className="space-y-6">
              <h4 className="text-sm tracking-[0.2em] uppercase">Connect</h4>
              <div className="flex space-x-6">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-black transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-black transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-black transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm tracking-[0.2em] uppercase">Newsletter</h4>
              <form className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-gray-50 focus:outline-none focus:bg-gray-100 transition-colors text-sm"
                />
                <button 
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-black transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-xs text-gray-500">
              2024 KLEN_HUB. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-xs text-gray-500 hover:text-black transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-xs text-gray-500 hover:text-black transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
