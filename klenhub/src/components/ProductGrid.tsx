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
        return sortedProducts.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
      case 'price-desc':
        return sortedProducts.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || b.price));
      case 'newest':
        return sortedProducts.reverse(); // Assuming newer products are added to the end of the array
      case 'featured':
      default:
        return sortedProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
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