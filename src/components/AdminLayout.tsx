import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Products', path: '/admin/products', icon: <Package className="h-5 w-5" /> },
  { label: 'Orders', path: '/admin/orders', icon: <ShoppingCart className="h-5 w-5" /> },
  { label: 'Customers', path: '/admin/customers', icon: <Users className="h-5 w-5" /> },
  { label: 'Settings', path: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
];

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const isActiveRoute = (path: string) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between bg-gray-800 p-4">
        <Link to="/" className="text-xl text-white">KLEN_HUB</Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white lg:hidden"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Navigation */}
      <nav className={`flex space-x-4 bg-gray-800 p-4 transition-all duration-300 z-20 ${isSidebarOpen ? 'block' : 'hidden'} lg:flex`}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-2 text-white px-3 py-2 rounded-lg transition-colors
              ${isActiveRoute(item.path) ? 'bg-black' : 'hover:bg-gray-700'}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <div className="min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </main>
    </div>
  );
};
