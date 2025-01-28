import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { products } from '../../data/products';
import { Product } from '../../types';

export const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(
    product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowAddModal(true);
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      // Implement delete functionality
      console.log('Delete product:', productId);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-light tracking-[0.2em]">PRODUCTS</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-black text-white text-sm tracking-[0.1em] hover:bg-gray-900 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          ADD PRODUCT
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="relative">
          <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-b border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-4 px-4 text-sm tracking-[0.1em] font-normal text-gray-500">PRODUCT</th>
                <th className="text-left py-4 px-4 text-sm tracking-[0.1em] font-normal text-gray-500">BRAND</th>
                <th className="text-left py-4 px-4 text-sm tracking-[0.1em] font-normal text-gray-500">CATEGORY</th>
                <th className="text-left py-4 px-4 text-sm tracking-[0.1em] font-normal text-gray-500">PRICE</th>
                <th className="text-left py-4 px-4 text-sm tracking-[0.1em] font-normal text-gray-500">STATUS</th>
                <th className="text-right py-4 px-4 text-sm tracking-[0.1em] font-normal text-gray-500">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-t border-gray-100">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-12 w-12 object-cover"
                      />
                      <span className="text-sm tracking-[0.05em]">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm">{product.brand}</td>
                  <td className="py-4 px-4 text-sm">{product.category}</td>
                  <td className="py-4 px-4 text-sm">
                    {product.salePrice ? (
                      <div>
                        <span className="text-red-600">${product.salePrice}</span>
                        <span className="text-gray-400 line-through ml-2">${product.price}</span>
                      </div>
                    ) : (
                      <span>${product.price}</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {product.onSale ? (
                      <span className="px-2 py-1 text-xs tracking-[0.1em] bg-red-50 text-red-600">
                        ON SALE
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs tracking-[0.1em] bg-green-50 text-green-600">
                        ACTIVE
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl tracking-[0.1em]">
                  {selectedProduct ? 'EDIT PRODUCT' : 'ADD PRODUCT'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedProduct(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm tracking-[0.1em] text-gray-500">NAME</label>
                    <input
                      type="text"
                      defaultValue={selectedProduct?.name}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm tracking-[0.1em] text-gray-500">BRAND</label>
                    <input
                      type="text"
                      defaultValue={selectedProduct?.brand}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm tracking-[0.1em] text-gray-500">PRICE</label>
                    <input
                      type="number"
                      defaultValue={selectedProduct?.price}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm tracking-[0.1em] text-gray-500">SALE PRICE</label>
                    <input
                      type="number"
                      defaultValue={selectedProduct?.salePrice}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm tracking-[0.1em] text-gray-500">CATEGORY</label>
                    <select className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black transition-colors">
                      <option value="spring-summer">Spring/Summer</option>
                      <option value="new-arrivals">New Arrivals</option>
                      <option value="editorial">Editorial</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm tracking-[0.1em] text-gray-500">STATUS</label>
                    <select className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black transition-colors">
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm tracking-[0.1em] text-gray-500">DESCRIPTION</label>
                  <textarea
                    defaultValue={selectedProduct?.description}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div className="pt-4 border-t flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedProduct(null);
                    }}
                    className="px-6 py-2 text-sm tracking-[0.1em] hover:bg-gray-100 transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-black text-white text-sm tracking-[0.1em] hover:bg-gray-900 transition-colors"
                  >
                    {selectedProduct ? 'SAVE CHANGES' : 'ADD PRODUCT'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
