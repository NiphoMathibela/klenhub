import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg tracking-[0.1em] text-gray-500">Product not found.</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) return;
    
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        product,
        quantity: 1,
        size: selectedSize
      }
    });

    navigate('/cart');
  };

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  };

  return (
    <motion.div 
      className="min-h-screen pt-32 pb-24"
      initial="initial"
      animate="animate"
      variants={fadeIn}
    >
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Images */}
          <div className="space-y-8">
            <motion.div 
              className="aspect-[3/4] bg-gray-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </motion.div>
            
            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <motion.div 
                className="grid grid-cols-4 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square bg-gray-50 ${
                      currentImageIndex === index ? 'ring-2 ring-black' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Product Info */}
          <motion.div 
            className="lg:py-12 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-4">
              <p className="text-sm tracking-[0.2em] text-gray-500">{product.brand}</p>
              <h1 className="text-3xl tracking-[0.1em] font-light">{product.name}</h1>
              <div className="flex items-center space-x-4">
                {product.salePrice ? (
                  <>
                    <span className="text-xl tracking-[0.1em] text-red-600">
                      R{product.salePrice.toFixed(2)}
                    </span>
                    <span className="text-xl tracking-[0.1em] text-gray-400 line-through">
                      R{product.price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-xl tracking-[0.1em]">
                    R{product.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-4">
              <h3 className="text-sm tracking-[0.1em] uppercase">Select Size</h3>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-sm tracking-[0.1em] transition-colors ${
                      selectedSize === size
                        ? 'bg-black text-white'
                        : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className={`w-full py-4 text-sm tracking-[0.2em] transition-colors ${
                selectedSize
                  ? 'bg-black text-white hover:bg-gray-900'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {selectedSize ? 'ADD TO CART' : 'SELECT SIZE'}
            </button>

            {/* Product Description */}
            <div className="space-y-4 pt-8 border-t border-gray-200">
              <h3 className="text-sm tracking-[0.1em] uppercase">Product Details</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                {product.description}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};