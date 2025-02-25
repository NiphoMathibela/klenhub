import React from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { Product, SortOption } from '../types';

interface ProductGridProps {
  products: Product[];
  sortOption: SortOption;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, sortOption }) => {
  const sortProducts = (products: Product[], option: SortOption) => {
    const validProducts = products.filter(product => product.images && product.images.length > 0);
    const sortedProducts = [...validProducts];
    
    switch (option) {
      case 'price-asc':
        return sortedProducts.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sortedProducts.sort((a, b) => b.price - a.price);
      case 'newest':
        return sortedProducts.reverse(); // Assuming newer products are added to the end of the array
      case 'featured':
      default:
        return sortedProducts;
    }
  };

  const sortedProducts = sortProducts(products, sortOption);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (sortedProducts.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">No products found</h3>
          <p className="mt-2 text-sm text-gray-500">
            There are no products available in this category yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8"
    >
      {sortedProducts.map((product) => (
        <motion.div key={product.id} variants={item}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
};