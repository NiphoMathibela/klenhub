import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
          <motion.img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover object-center"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
          />
          {product.onSale && (
            <div className="absolute top-4 left-4 bg-black text-white px-4 py-1">
              <span className="text-xs tracking-[0.2em]">SALE</span>
            </div>
          )}
          <motion.div 
            className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          />
        </div>
        <div className="mt-4 space-y-1">
          <p className="text-xs tracking-[0.1em] text-gray-500">{product.brand}</p>
          <h3 className="text-sm tracking-[0.05em] group-hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center space-x-2">
            {product.salePrice ? (
              <>
                <span className="text-sm tracking-[0.05em] text-red-600">
                  R{product.salePrice.toFixed(2)}
                </span>
                <span className="text-sm tracking-[0.05em] text-gray-400 line-through">
                  R{product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm tracking-[0.05em]">
                R{product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};