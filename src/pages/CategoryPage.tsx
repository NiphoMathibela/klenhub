import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProductGrid } from '../components/ProductGrid';
import { products } from '../data/products';
import { SortOption } from '../types';

export const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');

    const categoryProducts = category === 'all' || category === 'new' || category === 'tops' || category === 'bottoms' || category === 'accessories' || category === 'shoes'

    ? products 
    : products.filter(product => product.category === category);

  const subCategories = ['all', 'new', 'tops', 'bottoms', 'accessories', 'shoes', ...new Set(categoryProducts.map(p => p.subCategory))];
  
  const filteredProducts = selectedSubCategory === 'all'
    ? categoryProducts
    : categoryProducts.filter(p => p.subCategory === selectedSubCategory);

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  };

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
