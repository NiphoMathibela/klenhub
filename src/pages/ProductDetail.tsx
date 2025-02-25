import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { Product } from '../types';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get<Product>(`http://localhost:3000/api/products/${id}`);
        setProduct(response.data);
        setError(null);
        
        // Select the first available size by default
        const firstAvailableSize = response.data.sizes.find(size => size.quantity > 0);
        if (firstAvailableSize) {
          setSelectedSize(firstAvailableSize.size);
        }
      } catch (err) {
        setError('Failed to load product. Please try again later.');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-50 p-8 rounded-lg">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600">{error || 'Product not found.'}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Return to Home
          </button>
        </div>
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const selectedSizeStock = product.sizes.find(s => s.size === selectedSize)?.quantity || 0;
  const mainImage = product.images[currentImageIndex];

  return (
    <motion.div 
      className="min-h-screen pt-32 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100"
              >
                <img
                  src={mainImage.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
              </motion.div>
            </AnimatePresence>
            
            {product.images.length > 1 && (
              <>
                <button
                  onClick={previousImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`
                      aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg 
                      transition-all duration-200
                      ${currentImageIndex === index 
                        ? 'ring-2 ring-black ring-offset-2' 
                        : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
                      }
                    `}
                  >
                    <img
                      src={image.imageUrl}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {product.name}
              </h1>
              <p className="mt-2 text-sm text-gray-500">{product.category}</p>
              <p className="mt-4 text-2xl font-semibold text-gray-900">${product.price.toFixed(2)}</p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-900">Select Size</h2>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.size}
                    onClick={() => setSelectedSize(size.size)}
                    disabled={size.quantity === 0}
                    className={`
                      py-2 px-4 text-sm font-medium rounded-md transition-all duration-200
                      ${
                        selectedSize === size.size
                          ? 'bg-black text-white ring-2 ring-black ring-offset-2'
                          : size.quantity === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    {size.size}
                    {size.quantity === 0 && ' (Out of Stock)'}
                  </button>
                ))}
              </div>
              {selectedSize && selectedSizeStock > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  {selectedSizeStock} {selectedSizeStock === 1 ? 'item' : 'items'} in stock
                </p>
              )}
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-900">Description</h2>
              <p className="mt-2 text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || selectedSizeStock === 0}
              className={`
                w-full py-3 px-8 flex items-center justify-center text-base font-medium rounded-md
                transition-all duration-200
                ${
                  !selectedSize || selectedSizeStock === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-900'
                }
              `}
            >
              {!selectedSize
                ? 'Select a Size'
                : selectedSizeStock === 0
                ? 'Out of Stock'
                : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};