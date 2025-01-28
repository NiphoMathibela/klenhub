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
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-sm transition-all duration-300 z-20
          ${isSidebarOpen ? 'w-64' : 'w-16'} 
          md:w-64 lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6">
            <Link to="/" className={`text-xl tracking-[0.2em] font-light ${!isSidebarOpen && 'lg:hidden'}`}>
              KLEN_HUB
            </Link>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors
                  ${isActiveRoute(item.path)
                    ? 'bg-black text-white'
                    : 'hover:bg-gray-100'
                  }`}
              >
                {item.icon}
                <span className={`text-sm tracking-[0.1em] ${!isSidebarOpen && 'hidden'}`}>
                  {item.label.toUpperCase()}
                </span>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4">
            <button className="w-full flex items-center space-x-4 px-4 py-3 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <LogOut className="h-5 w-5" />
              <span className={`text-sm tracking-[0.1em] ${!isSidebarOpen && 'hidden'}`}>
                LOGOUT
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Mobile Header */}
        <header className="bg-white h-16 flex items-center justify-between px-6 lg:hidden">
          <Link to="/" className="text-xl tracking-[0.2em] font-light">
            KLEN_HUB
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Page Content */}
        <div className="min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
