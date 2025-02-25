import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ProductForm } from '../../components/ProductForm';
import { motion } from 'framer-motion';
import { productService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Size {
  size: string;
  quantity: number;
}

interface Image {
  url: string;
  isMain: boolean;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: Size[];
  images: Image[];
}

export const Products = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    fetchProducts();
  }, [isAdmin]);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleCreateProduct = async (productData: Omit<Product, 'id'>) => {
    setIsLoading(true);
    try {
      const response = await productService.createProduct(productData);

      if (!response.ok) throw new Error('Failed to create product');

      await fetchProducts();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async (productData: Omit<Product, 'id'>) => {
    if (!selectedProduct) return;

    setIsLoading(true);
    try {
      const response = await productService.updateProduct(selectedProduct.id, productData);

      if (!response.ok) throw new Error('Failed to update product');

      await fetchProducts();
      setIsFormOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await productService.deleteProduct(id);

      if (!response.ok) throw new Error('Failed to delete product');

      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (!isAdmin) {
    return <div className="p-4">Access denied. Admin only.</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <button
          onClick={() => {
            setSelectedProduct(null);
            setIsFormOpen(true);
          }}
          className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold mb-4">
              {selectedProduct ? 'Edit Product' : 'New Product'}
            </h2>
            <ProductForm
              initialData={selectedProduct || undefined}
              onSubmit={selectedProduct ? handleUpdateProduct : handleCreateProduct}
              isLoading={isLoading}
            />
            <button
              onClick={() => {
                setIsFormOpen(false);
                setSelectedProduct(null);
              }}
              className="mt-4 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sizes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={product.images.find(img => img.isMain)?.url || product.images[0]?.url}
                    alt={product.name}
                    className="h-10 w-10 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ${product.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <span
                        key={size.size}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100"
                      >
                        {size.size}: {size.quantity}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsFormOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
