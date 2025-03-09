import React from 'react';
import { Truck, Clock, Globe, AlertTriangle } from 'lucide-react';

const ShippingInfo: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-light tracking-[0.2em] mt-28 mb-4">SHIPPING INFORMATION</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          At KlenHub, we strive to deliver your orders as quickly and efficiently as possible. 
          Below you'll find all the information you need about our shipping policies and delivery times.
        </p>
      </div>

      <div className="bg-white p-8 shadow-sm rounded-lg mb-8">
        <h2 className="text-xl font-medium mb-6 flex items-center">
          <Truck className="h-6 w-6 mr-2" />
          Delivery Options
        </h2>
        
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium mb-3">Standard Delivery</h3>
            <p className="text-gray-600 mb-4">
              Our standard delivery option is available for all orders within South Africa. 
              Orders are typically processed within 1-2 business days and delivered within 3-5 business days.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">Cost:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4 mt-2">
                <li>Free for orders over R1000</li>
                <li>R75 for orders under R1000</li>
              </ul>
            </div>
          </div>
          
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium mb-3">Express Delivery</h3>
            <p className="text-gray-600 mb-4">
              Need your order sooner? Our express delivery option ensures your order is 
              processed within 24 hours and delivered within 1-2 business days.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">Cost:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4 mt-2">
                <li>R150 flat rate for all orders</li>
              </ul>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">International Shipping</h3>
            <p className="text-gray-600 mb-4">
              We ship to select countries in Africa. International orders are processed within 
              2-3 business days and delivered within 7-14 business days, depending on the destination.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">Cost:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4 mt-2">
                <li>Neighboring countries (Botswana, Namibia, Lesotho, Swaziland): R250</li>
                <li>Other African countries: R450</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 shadow-sm rounded-lg mb-8">
        <h2 className="text-xl font-medium mb-6 flex items-center">
          <Clock className="h-6 w-6 mr-2" />
          Delivery Times
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Standard Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Express Delivery
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Major Cities (JHB, CPT, DBN)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  3-5 business days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  1-2 business days
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Other Urban Areas
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  5-7 business days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  2-3 business days
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Rural Areas
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  7-10 business days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  3-5 business days
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Neighboring Countries
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  7-10 business days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Not available
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Other African Countries
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  10-14 business days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Not available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-8 shadow-sm rounded-lg mb-8">
        <h2 className="text-xl font-medium mb-6 flex items-center">
          <Globe className="h-6 w-6 mr-2" />
          Shipping Policies
        </h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Order Tracking</h3>
            <p className="text-gray-600">
              Once your order has been shipped, you will receive a confirmation email with a tracking number. 
              You can use this number to track your order on our website or through the courier's website.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Shipping Delays</h3>
            <p className="text-gray-600">
              While we strive to deliver all orders within the estimated timeframes, delays may occur due to 
              unforeseen circumstances such as weather conditions, public holidays, or courier service disruptions. 
              We will notify you of any significant delays affecting your order.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Customs and Import Duties</h3>
            <p className="text-gray-600">
              For international orders, customers are responsible for any customs fees, import duties, or taxes 
              that may be imposed by their country's customs authorities. These charges are not included in the 
              shipping cost and will be collected by the delivery service upon delivery.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 p-8 rounded-lg border border-yellow-200">
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1 mr-4 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-medium mb-3 text-yellow-800">COVID-19 Notice</h2>
            <p className="text-yellow-700">
              Due to the ongoing COVID-19 pandemic, there may be additional delays in shipping and delivery times. 
              We are working closely with our courier partners to minimize these delays and ensure your orders 
              are delivered as quickly as possible. We appreciate your patience and understanding during this time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;
