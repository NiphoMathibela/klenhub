import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const mainImage = product.images?.find(img => img.isMain) || product.images?.[0];

  return (
    <Link to={`/product/${product.id}`}>
      <motion.div
        whileHover={{ y: -5 }}
        className="group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300"
      >
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-100">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
            src={mainImage?.imageUrl || '/placeholder-image.svg'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {!mainImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-500 text-sm">No image available</p>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 text-gray-500">{product.category}</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-900">${product.price.toFixed(2)}</p>
            {product.sizes.length > 0 && (
              <p className="text-sm text-gray-500">
                {product.sizes.length} {product.sizes.length === 1 ? 'size' : 'sizes'} available
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};