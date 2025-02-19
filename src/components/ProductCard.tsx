import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  console.log('Product price type:', typeof product.price);
  const primaryImage = product.images.find(img => img.is_primary)?.image_url || 
                      product.images[0]?.image_url ||
                      '/placeholder.jpg';

  const price = typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A';

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
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover object-center"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
          />
          {product.status === 'sale' && (
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
          <p className="text-xs tracking-[0.1em] text-gray-500">{product.category}</p>
          <h3 className="text-sm tracking-[0.05em] group-hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm tracking-[0.05em]">
            R{price}
          </p>
          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-xs text-red-600">Only {product.stock} left!</p>
          )}
          {product.stock === 0 && (
            <p className="text-xs text-red-600">Out of stock</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};