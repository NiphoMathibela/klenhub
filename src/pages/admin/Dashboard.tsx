import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown, DollarSign, ShoppingBag, Users, Package } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config';
import { formatCurrency } from '../../utils/formatters';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  isLoading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, isLoading }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-4 md:p-6 rounded-lg shadow-sm"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500 tracking-[0.1em]">{title}</p>
        {isLoading ? (
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-2"></div>
        ) : (
          <h3 className="text-xl md:text-2xl font-light mt-2 tracking-[0.05em]">{value}</h3>
        )}
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
    </div>
    <div className="mt-4 flex items-center">
      {isLoading ? (
        <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
      ) : "" }
    </div>
  </motion.div>
);

interface DashboardStats {
  revenue: { total: number; change: number };
  orders: { total: number; change: number };
  customers: { total: number; change: number };
  products: { total: number; change: number };
}

interface SalesData {
  name: string;
  sales: number;
}

interface RecentOrder {
  id: string;
  recipientName: string;
  items: number;
  total: number;
  status: string;
  createdAt: string;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch dashboard statistics
        const statsResponse = await axios.get(`${API_URL}/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setStats(statsResponse.data);
        
        // Fetch sales data for chart
        const salesResponse = await axios.get(`${API_URL}/dashboard/sales`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setSalesData(salesResponse.data);
        
        // Fetch recent orders
        const ordersResponse = await axios.get(`${API_URL}/dashboard/recent-orders`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setRecentOrders(ordersResponse.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-600';
      case 'processing': return 'bg-blue-50 text-blue-600';
      case 'shipped': return 'bg-purple-50 text-purple-600';
      case 'delivered': return 'bg-green-50 text-green-600';
      case 'cancelled': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-light tracking-[0.2em]">DASHBOARD</h1>
        {/* <button className="px-4 py-2 bg-black text-white text-sm tracking-[0.1em] hover:bg-gray-900 transition-colors">
          DOWNLOAD REPORT
        </button> */}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="TOTAL REVENUE"
          value={stats ? formatCurrency(stats.revenue.total) : 'R0.00'}
          change={stats?.revenue.change || 0}
          icon={<DollarSign className="h-6 w-6 text-blue-500" />}
          isLoading={isLoading}
        />
        <StatCard
          title="TOTAL ORDERS"
          value={stats ? stats.orders.total.toString() : '0'}
          change={stats?.orders.change || 0}
          icon={<ShoppingBag className="h-6 w-6 text-purple-500" />}
          isLoading={isLoading}
        />
        <StatCard
          title="TOTAL CUSTOMERS"
          value={stats ? stats.customers.total.toString() : '0'}
          change={stats?.customers.change || 0}
          icon={<Users className="h-6 w-6 text-green-500" />}
          isLoading={isLoading}
        />
        <StatCard
          title="TOTAL PRODUCTS"
          value={stats ? stats.products.total.toString() : '0'}
          change={stats?.products.change || 0}
          icon={<Package className="h-6 w-6 text-orange-500" />}
          isLoading={isLoading}
        />
      </div>

      {/* Sales Chart */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-light tracking-[0.1em] mb-6">SALES OVERVIEW</h2>
        {isLoading ? (
          <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded"></div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="sales" fill="#000" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-light tracking-[0.1em] mb-6">RECENT ORDERS</h2>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((_, index) => (
              <div key={index} className="h-16 bg-gray-100 animate-pulse rounded"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 text-sm tracking-[0.1em] font-normal text-gray-500">ORDER ID</th>
                  <th className="text-left py-4 px-4 text-sm tracking-[0.1em] font-normal text-gray-500">CUSTOMER</th>
                  <th className="text-left py-4 px-4 text-sm tracking-[0.1em] font-normal text-gray-500">PRODUCTS</th>
                  <th className="text-left py-4 px-4 text-sm tracking-[0.1em] font-normal text-gray-500">TOTAL</th>
                  <th className="text-left py-4 px-4 text-sm tracking-[0.1em] font-normal text-gray-500">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 px-4 text-center text-gray-500">No orders found</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-b-0">
                      <td className="py-4 px-4 text-sm">{order.id.substring(0, 8)}...</td>
                      <td className="py-4 px-4 text-sm">{order.recipientName}</td>
                      <td className="py-4 px-4 text-sm">{order.items} items</td>
                      <td className="py-4 px-4 text-sm">{formatCurrency(order.total)}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 text-xs tracking-[0.1em] ${getStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
