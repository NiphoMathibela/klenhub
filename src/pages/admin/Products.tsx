import React, { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit, Trash2, X, Upload, Loader2, ArrowUp, ArrowDown, Filter, MoreVertical, Check } from 'lucide-react';
import { Product, ProductImage, ProductSize } from '../../types';
import { admin } from '../../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  subcategory: string;
  status: 'active' | 'draft' | 'archived';
  images: File[];
  sizes: { name: string; stock: number }[];
}

const CATEGORIES = [
  { label: 'Spring/Summer', value: 'spring-summer' },
  { label: 'New Arrivals', value: 'new-arrivals' },
  { label: 'Editorial', value: 'editorial' }
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    category: CATEGORIES[0].value,
    subcategory: '',
    status: 'active',
    images: [],
    sizes: SIZES.map(size => ({ name: size, stock: 0 }))
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priceRange: { min: '', max: '' }
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Load products
  useEffect(() => {
    fetchProducts();
  }, []);

  // Initialize form data when editing
  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price,
        category: selectedProduct.category,
        subcategory: selectedProduct.subcategory,
        status: selectedProduct.status as 'active' | 'draft' | 'archived',
        images: [],
        sizes: selectedProduct.sizes.map(size => ({
          name: size.name,
          stock: size.stock
        }))
      });
    }
  }, [selectedProduct]);

  // Enhanced fetchProducts with sorting and filtering
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await admin.getProducts({
        page: 1,
        limit: 50,
        category: filters.category,
        status: filters.status,
        search: searchTerm,
      });
      
      let filteredProducts = response.data;
      
      // Apply price filter
      if (filters.priceRange.min || filters.priceRange.max) {
        filteredProducts = filteredProducts.filter(product => {
          const price = product.salePrice || product.price;
          const min = filters.priceRange.min ? parseFloat(filters.priceRange.min) : 0;
          const max = filters.priceRange.max ? parseFloat(filters.priceRange.max) : Infinity;
          return price >= min && price <= max;
        });
      }

      // Apply sorting
      filteredProducts.sort((a, b) => {
        let aValue = a[sortField as keyof Product];
        let bValue = b[sortField as keyof Product];
        
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      setProducts(filteredProducts);
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Batch operations
  const handleBatchOperation = async (operation: 'delete' | 'status', value?: string) => {
    if (!selectedProducts.length) return;
    
    try {
      setLoading(true);
      
      if (operation === 'delete') {
        await Promise.all(selectedProducts.map(id => admin.deleteProduct(id)));
      } else if (operation === 'status' && value) {
        await Promise.all(selectedProducts.map(id => admin.updateProductStatus(id, value)));
      }
      
      setSelectedProducts([]);
      await fetchProducts();
    } catch (err) {
      setError('Failed to perform batch operation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle product selection
  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Toggle sort order
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Get category and subcategory IDs
      const categoryData = await admin.getCategories();
      const category = categoryData.data.find((cat: any) => cat.name === formData.category);
      
      if (!category) {
        throw new Error('Invalid category selected');
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category_id: category.id,
        subcategory_id: null, // We'll implement subcategories later
        status: formData.status,
        images: formData.images,
        sizes: formData.sizes.map(size => ({
          size_id: size.name, // Assuming size.name is the size_id for now
          stock: size.stock
        }))
      };

      if (selectedProduct) {
        await admin.updateProduct(selectedProduct.id, productData);
      } else {
        await admin.createProduct(productData);
      }

      await fetchProducts();
      setShowAddModal(false);
      setSelectedProduct(null);
      resetForm();
    } catch (error: any) {
      console.error('Error saving product:', error);
      setError(error.response?.data?.error || 'Failed to save product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setLoading(true);
      await admin.deleteProduct(productId);
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: CATEGORIES[0].value,
      subcategory: '',
      status: 'active',
      images: [],
      sizes: SIZES.map(size => ({ name: size, stock: 0 }))
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        images: [...Array.from(e.target.files!)]
      }));
    }
  };

  const handleSizeChange = (size: string, stock: number) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map(s => 
        s.name === size ? { ...s, stock } : s
      )
    }));
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

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Batch Operations */}
      {selectedProducts.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {selectedProducts.length} products selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBatchOperation('status', 'active')}
              className="btn-secondary text-sm"
            >
              Set Active
            </button>
            <button
              onClick={() => handleBatchOperation('status', 'archived')}
              className="btn-secondary text-sm"
            >
              Archive
            </button>
            <button
              onClick={() => handleBatchOperation('delete')}
              className="btn-danger text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProducts(products.map(p => p.id));
                    } else {
                      setSelectedProducts([]);
                    }
                  }}
                  className="rounded border-gray-300"
                />
              </th>
              <th
                onClick={() => handleSort('name')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  Product Name
                  {sortField === 'name' && (
                    sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('price')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  Price
                  {sortField === 'price' && (
                    sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="h-10 w-10 rounded-md object-cover mr-3"
                      />
                    )}
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    ${product.price.toFixed(2)}
                    {product.salePrice && (
                      <span className="ml-2 text-red-600 line-through">
                        ${product.salePrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.status === 'active' ? 'bg-green-100 text-green-800' :
                    product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.sizes.reduce((total, size) => total + size.stock, 0)} units
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowAddModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleBatchOperation('delete')}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
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
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm tracking-[0.1em] text-gray-500">NAME</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm tracking-[0.1em] text-gray-500">PRICE</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black transition-colors"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm tracking-[0.1em] text-gray-500">CATEGORY</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black transition-colors"
                        required
                      >
                        {CATEGORIES.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm tracking-[0.1em] text-gray-500">STATUS</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'draft' | 'archived' })}
                        className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black transition-colors"
                        required
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm tracking-[0.1em] text-gray-500">DESCRIPTION</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm tracking-[0.1em] text-gray-500">IMAGES</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center cursor-pointer"
                      >
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">
                          Click to upload images
                        </span>
                      </label>
                    </div>
                    {formData.images.length > 0 && (
                      <div className="text-sm text-gray-500">
                        {formData.images.length} images selected
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm tracking-[0.1em] text-gray-500">SIZES & STOCK</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                      {formData.sizes.map((size, index) => (
                        <div key={size.name} className="space-y-1">
                          <label className="text-xs text-gray-500">{size.name}</label>
                          <input
                            type="number"
                            value={size.stock}
                            onChange={(e) => handleSizeChange(size.name, Number(e.target.value))}
                            className="w-full px-2 py-1 text-sm border border-gray-200 focus:outline-none focus:border-black transition-colors"
                            min="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="pt-4 border-t flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setSelectedProduct(null);
                        resetForm();
                      }}
                      className="px-6 py-2 text-sm tracking-[0.1em] hover:bg-gray-100 transition-colors"
                      disabled={submitting}
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-black text-white text-sm tracking-[0.1em] hover:bg-gray-900 transition-colors flex items-center"
                      disabled={submitting}
                    >
                      {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {selectedProduct ? 'SAVE CHANGES' : 'ADD PRODUCT'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
