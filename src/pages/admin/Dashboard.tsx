import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown, DollarSign, ShoppingBag, Users, Package } from 'lucide-react';

const data = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 2000 },
  { name: 'Apr', sales: 2780 },
  { name: 'May', sales: 1890 },
  { name: 'Jun', sales: 2390 },
];

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-lg shadow-sm"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500 tracking-[0.1em]">{title}</p>
        <h3 className="text-2xl font-light mt-2 tracking-[0.05em]">{value}</h3>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
    </div>
    <div className="mt-4 flex items-center">
      {change >= 0 ? (
        <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
      ) : (
        <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
      )}
      <span className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {Math.abs(change)}%
      </span>
      <span className="text-sm text-gray-500 ml-2">vs last month</span>
    </div>
  </motion.div>
);

export const Dashboard = () => {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-light tracking-[0.2em]">DASHBOARD</h1>
        <button className="px-4 py-2 bg-black text-white text-sm tracking-[0.1em] hover:bg-gray-900 transition-colors">
          DOWNLOAD REPORT
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="TOTAL REVENUE"
          value="$45,231"
          change={12}
          icon={<DollarSign className="h-6 w-6 text-blue-500" />}
        />
        <StatCard
          title="TOTAL ORDERS"
          value="356"
          change={-2}
          icon={<ShoppingBag className="h-6 w-6 text-purple-500" />}
        />
        <StatCard
          title="TOTAL CUSTOMERS"
          value="2,345"
          change={8}
          icon={<Users className="h-6 w-6 text-green-500" />}
        />
        <StatCard
          title="TOTAL PRODUCTS"
          value="145"
          change={5}
          icon={<Package className="h-6 w-6 text-orange-500" />}
        />
      </div>

      {/* Sales Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-light tracking-[0.1em] mb-6">SALES OVERVIEW</h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#000" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-light tracking-[0.1em] mb-6">RECENT ORDERS</h2>
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
              {[1, 2, 3, 4, 5].map((_, index) => (
                <tr key={index} className="border-b last:border-b-0">
                  <td className="py-4 px-4 text-sm">#ORDER-{1234 + index}</td>
                  <td className="py-4 px-4 text-sm">John Doe</td>
                  <td className="py-4 px-4 text-sm">2 items</td>
                  <td className="py-4 px-4 text-sm">$299.00</td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 text-xs tracking-[0.1em] bg-green-50 text-green-600">
                      COMPLETED
                    </span>
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
