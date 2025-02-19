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
    const sortedProducts = [...products];
    switch (option) {
      case 'price-asc':
        return sortedProducts.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sortedProducts.sort((a, b) => b.price - a.price);
      case 'newest':
        return sortedProducts.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'featured':
      default:
        return sortedProducts.sort((a, b) => b.stock - a.stock); // Sort by stock as a proxy for featured
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

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16"
    >
      {sortedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </motion.div>
  );
};