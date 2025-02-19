import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  ChevronDown,
  Boxes,
  Tags,
  BarChart2,
  MessageSquare,
  Image,
  FileText,
  Mail,
  AlertTriangle,
  Megaphone,
  LineChart,
  Palette
} from 'lucide-react';

interface MenuItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  submenu?: {
    label: string;
    path: string;
  }[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/admin',
    icon: <LayoutDashboard className="h-5 w-5" />
  },
  {
    label: 'Products',
    icon: <Package className="h-5 w-5" />,
    submenu: [
      { label: 'All Products', path: '/admin/products' },
      { label: 'Add Product', path: '/admin/products/new' },
      { label: 'Categories', path: '/admin/products/categories' },
      { label: 'Inventory', path: '/admin/products/inventory' }
    ]
  },
  {
    label: 'Orders',
    icon: <ShoppingCart className="h-5 w-5" />,
    submenu: [
      { label: 'All Orders', path: '/admin/orders' },
      { label: 'Pending', path: '/admin/orders/pending' },
      { label: 'Processing', path: '/admin/orders/processing' },
      { label: 'Shipped', path: '/admin/orders/shipped' },
      { label: 'Delivered', path: '/admin/orders/delivered' },
      { label: 'Cancelled', path: '/admin/orders/cancelled' }
    ]
  },
  {
    label: 'Customers',
    icon: <Users className="h-5 w-5" />,
    submenu: [
      { label: 'All Customers', path: '/admin/customers' },
      { label: 'Reviews', path: '/admin/customers/reviews' },
      { label: 'Messages', path: '/admin/customers/messages' }
    ]
  },
  {
    label: 'Marketing',
    icon: <Megaphone className="h-5 w-5" />,
    submenu: [
      { label: 'Overview', path: '/admin/marketing' },
      { label: 'Discounts', path: '/admin/marketing/discounts' },
      { label: 'Promotions', path: '/admin/marketing/promotions' },
      { label: 'Email', path: '/admin/marketing/email' }
    ]
  },
  {
    label: 'Content',
    icon: <Palette className="h-5 w-5" />,
    submenu: [
      { label: 'Overview', path: '/admin/content' },
      { label: 'Pages', path: '/admin/content/pages' },
      { label: 'Blog', path: '/admin/content/blog' },
      { label: 'Media', path: '/admin/content/media' }
    ]
  },
  {
    label: 'Analytics',
    icon: <LineChart className="h-5 w-5" />,
    submenu: [
      { label: 'Overview', path: '/admin/analytics' },
      { label: 'Sales', path: '/admin/analytics/sales' },
      { label: 'Traffic', path: '/admin/analytics/traffic' }
    ]
  },
  {
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    submenu: [
      { label: 'General', path: '/admin/settings/general' },
      { label: 'Users', path: '/admin/settings/users' }
    ]
  }
];

interface AdminMenuProps {
  isCollapsed?: boolean;
}

export const AdminMenu: React.FC<AdminMenuProps> = ({ isCollapsed = false }) => {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const location = useLocation();

  const toggleMenu = (label: string) => {
    setOpenMenus(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/admin';
  };

  return (
    <nav className="h-full overflow-y-auto">
      <ul className="py-2 px-2">
        {menuItems.map((item) => (
          <li key={item.label} className="mb-1">
            {item.path ? (
              <Link
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                  ${isActive(item.path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {item.icon}
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            ) : (
              <div className="mb-1">
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                    ${isActive(item.submenu?.[0].path || '')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <div className="flex items-center">
                    {item.icon}
                    {!isCollapsed && <span className="ml-3">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.submenu && (
                    <ChevronDown
                      className={`h-4 w-4 transform transition-transform duration-200 ${
                        openMenus.includes(item.label) ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>
                <AnimatePresence>
                  {!isCollapsed && item.submenu && openMenus.includes(item.label) && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-1 ml-4 space-y-1"
                    >
                      {item.submenu.map((subItem) => (
                        <li key={subItem.path}>
                          <Link
                            to={subItem.path}
                            className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                              ${location.pathname === subItem.path
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-100'
                              }`}
                          >
                            {subItem.label}
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};
