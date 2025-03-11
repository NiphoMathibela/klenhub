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
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6 }}
          src={mainImage?.imageUrl || '/placeholder-image.jpg'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {!mainImage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500 text-sm">No image available</p>
          </div>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500">{product.category}</p>
        <p className="text-sm font-medium text-gray-900">
          R{product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
};