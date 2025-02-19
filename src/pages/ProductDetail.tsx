import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { productsService } from '../services/products';
import { Product } from '../types';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const productData = await productsService.getById(id);
        setProduct(productData);
      } catch (err) {
        setError('Failed to load product. Please try again later.');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!selectedSize || !product) return;
    
    try {
      await addToCart(product, selectedSize);
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-500 tracking-[0.1em]">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 tracking-[0.1em]">{error || 'Product not found.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-black text-white text-sm tracking-[0.2em] hover:bg-gray-900 transition-colors"
          >
            GO BACK
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen pt-32 pb-24"
      initial="initial"
      animate="animate"
      variants={fadeIn}
    >
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-gray-100">
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-[3/4] bg-gray-100 ${
                    currentImageIndex === index ? 'ring-2 ring-black' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl tracking-[0.2em] font-light">{product.name}</h1>
              <p className="mt-2 text-gray-500 tracking-[0.1em]">{product.brand}</p>
            </div>

            <div>
              <div className="flex items-baseline gap-4">
                {product.salePrice ? (
                  <>
                    <p className="text-xl tracking-[0.1em] text-red-600">
                      ${product.salePrice.toFixed(2)}
                    </p>
                    <p className="text-gray-400 line-through tracking-[0.1em]">
                      ${product.price.toFixed(2)}
                    </p>
                  </>
                ) : (
                  <p className="text-xl tracking-[0.1em]">
                    ${product.price.toFixed(2)}
                  </p>
                )}
              </div>
              {product.salePrice && (
                <p className="mt-2 text-sm text-red-600 tracking-[0.1em]">
                  Save ${(product.price - product.salePrice).toFixed(2)}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-4 text-sm tracking-[0.1em]">SIZE</label>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 border ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-black'
                    } text-sm tracking-[0.1em] transition-colors`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p className="mt-2 text-sm text-red-600 tracking-[0.1em]">
                  Please select a size
                </p>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className={`w-full py-4 text-sm tracking-[0.2em] transition-colors ${
                selectedSize
                  ? 'bg-black text-white hover:bg-gray-900'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              ADD TO CART
            </button>

            <div className="space-y-6 pt-8 border-t">
              <div>
                <h3 className="text-sm tracking-[0.1em] mb-2">DESCRIPTION</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div>
                <h3 className="text-sm tracking-[0.1em] mb-2">FEATURES</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetail;