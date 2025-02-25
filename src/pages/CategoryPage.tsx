import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProductGrid } from '../components/ProductGrid';
import { SortOption } from '../types';
import { productService } from '../services/api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: Array<{
    size: string;
    quantity: number;
  }>;
  images: Array<{
    url: string;
    isMain: boolean;
  }>;
  subCategory: string;
}

export const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        let data;
        
        if (category === 'all') {
          data = await productService.getProducts();
        } else {
          data = await productService.getProductsByCategory(category || '');
        }
        
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 lg:px-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 lg:px-12 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Get unique subcategories from products
  const subCategories = ['all', ...new Set(products.filter(p => p.subCategory).map(p => p.subCategory))];
  
  const filteredProducts = selectedSubCategory === 'all'
    ? products
    : products.filter(p => p.subCategory === selectedSubCategory);

  return (
    <motion.div 
      className="min-h-screen pt-32 pb-24 px-6 lg:px-12"
      initial="initial"
      animate="animate"
      variants={fadeIn}
    >
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-16 space-y-8">
          <motion.h1 
            className="text-4xl font-light tracking-[0.2em]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {category?.toUpperCase().replace('-', ' ')}
          </motion.h1>

          {/* Filters */}
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Sub-categories */}
            <div className="flex flex-wrap gap-4">
              {subCategories.map((sub, index) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubCategory(sub)}
                  className={`text-sm tracking-[0.1em] px-4 py-2 transition-colors ${
                    selectedSubCategory === sub
                      ? 'bg-black text-white'
                      : 'bg-transparent text-gray-600 hover:text-black'
                  }`}
                >
                  {sub.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Sort options */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="px-4 py-2 bg-transparent text-sm tracking-[0.1em] border-b border-gray-200 focus:outline-none focus:border-black transition-colors cursor-pointer"
            >
              <option value="featured">FEATURED</option>
              <option value="newest">NEWEST</option>
              <option value="price-asc">PRICE: LOW TO HIGH</option>
              <option value="price-desc">PRICE: HIGH TO LOW</option>
            </select>
          </motion.div>
        </div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ProductGrid products={filteredProducts} sortOption={sortOption} />
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-32">
              <p className="text-lg tracking-[0.1em] text-gray-500">
                No products found in this category.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
