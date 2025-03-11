import { useState, useEffect } from 'react';
import { Search, Eye, Download, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/api';
import { toast } from 'react-hot-toast';

interface Order {
  id: string;
  customer: string;
  email: string;
  items: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  recipientName: string;
  userId: string;
  createdAt: string;
  OrderItems: Array<{
    id: string;
    quantity: number;
    ProductId: string;
  }>;
}

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'delivered':
      return 'bg-green-50 text-green-600';
    case 'processing':
      return 'bg-blue-50 text-blue-600';
    case 'pending':
      return 'bg-yellow-50 text-yellow-600';
    case 'shipped':
      return 'bg-purple-50 text-purple-600';
    case 'cancelled':
      return 'bg-red-50 text-red-600';
    default:
      return 'bg-gray-50 text-gray-600';
  }
};

export const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Order['status'] | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Fetch orders from the API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrders();
      // Ensure orders is always an array
      setOrders(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
      // Initialize with empty array on error
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle order status update
  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      setUpdatingOrderId(orderId);
      await orderService.updateOrderStatus(orderId, newStatus);
      
      // Update the order in the local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      toast.success(`Order status updated to ${newStatus.toUpperCase()}`);
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Export orders to CSV
  const exportOrders = () => {
    // Create CSV content
    const headers = ['Order ID', 'Customer', 'Email', 'Items', 'Total', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(order => [
        order.id,
        order.recipientName,
        order.email || 'N/A',
        Array.isArray(order.OrderItems) ? order.OrderItems.length : 0,
        order.total,
        order.status,
        formatDate(order.createdAt)
      ].join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.recipientName && order.recipientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.email && order.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <h1 className="text-2xl font-light tracking-[0.2em]">ORDERS</h1>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-gray-100 text-gray-800 text-sm tracking-[0.1em] hover:bg-gray-200 transition-colors flex items-center justify-center sm:justify-start"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            REFRESH
          </button>
          <button
            onClick={exportOrders}
            className="px-4 py-2 bg-black text-white text-sm tracking-[0.1em] hover:bg-gray-900 transition-colors flex items-center justify-center sm:justify-start"
          >
            <Download className="h-4 w-4 mr-2" />
            EXPORT ORDERS
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm || selectedStatus !== 'all' 
              ? 'No orders match your filters. Try adjusting your search criteria.'
              : 'No orders found. New orders will appear here.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-4 px-3 sm:px-4 text-xs tracking-[0.1em] font-normal text-gray-500">ORDER ID</th>
                  <th className="text-left py-4 px-3 sm:px-4 text-xs tracking-[0.1em] font-normal text-gray-500">CUSTOMER</th>
                  <th className="hidden sm:table-cell text-left py-4 px-3 sm:px-4 text-xs tracking-[0.1em] font-normal text-gray-500">ITEMS</th>
                  <th className="text-left py-4 px-3 sm:px-4 text-xs tracking-[0.1em] font-normal text-gray-500">TOTAL</th>
                  <th className="text-left py-4 px-3 sm:px-4 text-xs tracking-[0.1em] font-normal text-gray-500">STATUS</th>
                  <th className="hidden md:table-cell text-left py-4 px-3 sm:px-4 text-xs tracking-[0.1em] font-normal text-gray-500">DATE</th>
                  <th className="text-right py-4 px-3 sm:px-4 text-xs tracking-[0.1em] font-normal text-gray-500">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t border-gray-100">
                    <td className="py-4 px-3 sm:px-4 text-xs sm:text-sm truncate max-w-[60px] sm:max-w-none">
                      {order.id}
                    </td>
                    <td className="py-4 px-3 sm:px-4">
                      <div className="space-y-1">
                        <div className="text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">{order.recipientName}</div>
                        <div className="text-xs text-gray-500 hidden sm:block">{order.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell py-4 px-3 sm:px-4 text-xs sm:text-sm">
                      {Array.isArray(order.OrderItems) ? `${order.OrderItems.length} items` : '0 items'}
                    </td>
                    <td className="py-4 px-3 sm:px-4 text-xs sm:text-sm">R{Number(order.total).toFixed(2)}</td>
                    <td className="py-4 px-3 sm:px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs tracking-[0.1em] rounded ${getStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                        {updatingOrderId === order.id && (
                          <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-gray-700"></span>
                        )}
                      </div>
                    </td>
                    <td className="hidden md:table-cell py-4 px-3 sm:px-4 text-xs sm:text-sm">{formatDate(order.createdAt)}</td>
                    <td className="py-4 px-3 sm:px-4">
                      <div className="flex justify-end space-x-2">
                        <div className="relative group">
                          <button
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <span className="text-xs text-gray-700">Update</span>
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 hidden group-hover:block">
                            <div className="py-1">
                              {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                <button
                                  key={status}
                                  onClick={() => handleStatusUpdate(order.id, status as Order['status'])}
                                  disabled={order.status === status || updatingOrderId === order.id}
                                  className={`w-full text-left px-4 py-2 text-xs sm:text-sm ${
                                    order.status === status 
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                      : 'hover:bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
