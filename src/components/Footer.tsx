import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone, Clock, ShieldCheck, Truck, RefreshCcw, HeadphonesIcon } from 'lucide-react';


export const Footer = () => {
  const currentYear = new Date().getFullYear();

const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription logic here
    const email = (e.currentTarget as HTMLFormElement).email.value;
    console.log(`Subscribed with email: ${email}`);
};


  return (
    <footer className="bg-gray-100 pt-8 pb-4">
      <div className="max-w-[1800px] mx-auto px-6">
        {/* Service Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-gray-200">
          <div className="flex flex-col items-center text-center">
            <Truck className="h-8 w-8 mb-3 text-gray-800" />
            <h5 className="font-semibold mb-1 text-gray-800">Free Shipping</h5>
            <p className="text-sm text-gray-600">On orders over R1000</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <RefreshCcw className="h-8 w-8 mb-3 text-gray-800" />
            <h5 className="font-semibold mb-1 text-gray-800">Easy Returns</h5>
            <p className="text-sm text-gray-600">30-day return policy</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <ShieldCheck className="h-8 w-8 mb-3 text-gray-800" />
            <h5 className="font-semibold mb-1 text-gray-800">Secure Shopping</h5>
            <p className="text-sm text-gray-600">100% Protected</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <HeadphonesIcon className="h-8 w-8 mb-3 text-gray-800" />
            <h5 className="font-semibold mb-1 text-gray-800">24/7 Support</h5>
            <p className="text-sm text-gray-600">Dedicated support</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-12 border-b border-gray-200">

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-lg mb-6 text-gray-800">Customer Service</h4>
            <ul className="space-y-3">
              <li><Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping" className="text-gray-600 hover:text-gray-900 transition-colors">Shipping Information</Link></li>
              <li><Link to="/returns-exchanges" className="text-gray-600 hover:text-gray-900 transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/size-guide" className="text-gray-600 hover:text-gray-900 transition-colors">Size Guide</Link></li>
              <li><Link to="/faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold text-lg mb-6 text-gray-800">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-600 mt-1" />
                <span className="text-gray-600">259 Main Street, Maboneng, Johannesburg, 2094</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-600" />
                <span className="text-gray-600">061 108 6069</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-600" />
                <span className="text-gray-600">support@klenhub.co.za</span>
              </li>
              <li className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-600" />
                <span className="text-gray-600">Mon-Fri: 9AM - 6PM</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-lg mb-6 text-gray-800">Stay Updated</h4>
            <p className="text-gray-800 mb-4">Subscribe to our newsletter for exclusive offers and updates</p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-2 border border-black focus:outline-none focus:ring focus:ring-black"
              />
                <button type="submit" className="w-full bg-black hover:bg-gray-900 border text-white p-2 hover:bg-none">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Social Links */}
                <div className="flex space-x-4 text-white">

              <a href="https://instagram.com/klenhub" target="_blank" rel="noopener noreferrer" 
                className="text-gray-600 hover:text-gray-900 transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="https://facebook.com/klenhub" target="_blank" rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="https://twitter.com/klenhub" target="_blank" rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
            </div>

          </div>

          {/* Copyright */}
                <div className="mt-8 pt-8 border-t border-gray-600">

            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-gray-600">
              <p className="text-gray-800">&copy; {currentYear} KLEN_HUB. All rights reserved.</p>
              <div className="flex space-x-6">
                <Link to="/privacy-policy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
