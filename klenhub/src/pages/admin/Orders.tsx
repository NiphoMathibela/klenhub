import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Download } from 'lucide-react';

interface Order {
  id: string;
  customer: string;
  email: string;
  items: number;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
}

const sampleOrders: Order[] = [
  {
    id: '#ORDER-1234',
    customer: 'John Doe',
    email: 'john@example.com',
    items: 2,
    total: 299.00,
    status: 'completed',
    date: '2025-01-27'
  },
  {
    id: '#ORDER-1235',
    customer: 'Jane Smith',
    email: 'jane@example.com',
    items: 1,
    total: 149.00,
    status: 'processing',
    date: '2025-01-26'
  },
  {
    id: '#ORDER-1236',
    customer: 'Mike Johnson',
    email: 'mike@example.com',
    items: 3,
    total: 499.00,
    status: 'pending',
    date: '2025-01-26'
  }
];

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-50 text-green-600';
    case 'processing':
      return 'bg-blue-50 text-blue-600';
    case 'pending':
      return 'bg-yellow-50 text-yellow-600';
    case 'cancelled':
      return 'bg-red-50 text-red-600';
    default:
      return 'bg-gray-50 text-gray-600';
  }
};

export const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Order['status'] | 'all'>('all');

  const filteredOrders = sampleOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-light tracking-[0.2em]">ORDERS</h1>
        <button
          onClick={() => {/* Implement export functionality */}}
          className="px-4 py-2 bg-black text-white text-sm tracking-[0.1em] hover:bg-gray-900 transition-colors flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          EXPORT ORDERS
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors text-sm"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as Order['status'] | 'all')}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-4 px-4 text-sm tracking-[0.1em] font-normal text-gray-500">ORDER ID</th>
                <th className="text-left py-4 px-4 text-sm tracking-[0.1em] font-normal text-gray-500">CUSTOMER</th>
                <th className="text-left py-4 px-4 text-sm tracking-[0.1em] font-normal text-gray-500">ITEMS</th>
                <th className="text-left py-4 px-4 text-sm tracking-[0.1em] font-normal text-gray-500">TOTAL</th>
                <th className="text-left py-4 px-4 text-sm tracking-[0.1em] font-normal text-gray-500">STATUS</th>
                <th className="text-left py-4 px-4 text-sm tracking-[0.1em] font-normal text-gray-500">DATE</th>
                <th className="text-right py-4 px-4 text-sm tracking-[0.1em] font-normal text-gray-500">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-t border-gray-100">
                  <td className="py-4 px-4 text-sm">{order.id}</td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="text-sm">{order.customer}</div>
                      <div className="text-xs text-gray-500">{order.email}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm">{order.items} items</td>
                  <td className="py-4 px-4 text-sm">${order.total.toFixed(2)}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs tracking-[0.1em] rounded ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm">{order.date}</td>
                  <td className="py-4 px-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => {/* Implement view order details */}}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
