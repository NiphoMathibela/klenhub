import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Size {
  size: string;
  quantity: number;
}

interface Image {
  url: string;
  isMain: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: Size[];
  images: Image[];
}

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
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg tracking-[0.1em] text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg tracking-[0.1em] text-gray-500">{error || 'Product not found.'}</p>
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
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg">
              <img
                src={product.images[currentImageIndex].url}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            
            {product.images.length > 1 && (
              <>
                <button
                  onClick={previousImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
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
                    className={`aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg ${
                      currentImageIndex === index ? 'ring-2 ring-black' : ''
                    }`}
                  >
                    <img
                      src={image.url}
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
              <p className="mt-4 text-xl text-gray-900">${product.price.toFixed(2)}</p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-900">Size</h2>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.size}
                    onClick={() => setSelectedSize(size.size)}
                    disabled={size.quantity === 0}
                    className={`
                      py-2 px-4 text-sm font-medium rounded-md
                      ${
                        selectedSize === size.size
                          ? 'bg-black text-white'
                          : size.quantity === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    {size.size}
                    {size.quantity === 0 && ' (Out of Stock)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-900">Description</h2>
              <p className="mt-2 text-gray-600">{product.description}</p>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || selectedSizeStock === 0}
              className={`
                w-full py-3 px-8 flex items-center justify-center text-base font-medium rounded-md
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