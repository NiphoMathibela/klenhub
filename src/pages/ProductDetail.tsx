import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product as ProductType } from '../types';

interface ProductImage {
  id: string;
  imageUrl: string;
  isMain: boolean;
}

// Local interface to match the API response
interface ProductResponse {
  id: string;
  name: string;
  price: number;
  description: string;
  sizes: string[];
  images: ProductImage[];
  category: string;
}

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const { dispatch } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get<ProductResponse>(`http://api.klenhub.co.za/api/products/${id}`);
        setProduct(response.data);
        
        // Set main image
        const mainImg = response.data.images.find(img => img.isMain);
        setMainImage(mainImg ? mainImg.imageUrl : response.data.images[0]?.imageUrl || null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  const addToCart = () => {
    if (!product) return;
    
    if (!selectedSize) {
      setError('Please select a size');
      return;
    }
    
    // Convert the product to match the expected ProductType format
    const productForCart: ProductType = {
      id: Number(product.id),
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images.map(img => ({
        id: Number(img.id),
        imageUrl: img.imageUrl,
        isMain: img.isMain
      })),
      sizes: product.sizes.map((size, index) => ({
        id: index,
        size: size,
        quantity: 10 // Default quantity, adjust as needed
      }))
    };
    
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        product: productForCart,
        size: selectedSize,
        quantity: 1
      }
    });
    
    setError(null);
  };

  const handleImageClick = (imageUrl: string) => {
    setMainImage(imageUrl);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-24 flex justify-center items-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-24 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-24 flex flex-col justify-center items-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-light text-gray-800">
            {error || 'Product not found'}
          </h2>
          <Link 
            to="/category/all" 
            className="inline-flex items-center text-sm sm:text-base text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="mb-6 sm:mb-8">
          <Link 
            to="/category/all" 
            className="inline-flex items-center text-xs sm:text-sm text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Back to products
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-4 sm:space-y-6">
            {/* Main Image */}
            <div className="aspect-[3/4] bg-gray-50">
              {mainImage && (
                <img 
                  src={mainImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
            
            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4">
                {product.images.map((image, index) => (
                  <button 
                    key={image.id || index}
                    onClick={() => handleImageClick(image.imageUrl)}
                    className={`aspect-square bg-gray-50 ${
                      mainImage === image.imageUrl ? 'ring-2 ring-black' : ''
                    }`}
                  >
                    <img 
                      src={image.imageUrl} 
                      alt={`${product.name} - View ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-light mb-2 sm:mb-3">{product.name}</h1>
              <p className="text-base sm:text-lg md:text-xl font-medium">R{product.price.toFixed(2)}</p>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-sm sm:text-base font-medium">Description</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-sm sm:text-base font-medium">Size</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size)}
                    className={`min-w-[40px] sm:min-w-[50px] h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm border ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {error && (
                <p className="text-red-500 text-xs sm:text-sm">{error}</p>
              )}
            </div>
            
            <button
              onClick={addToCart}
              className="w-full py-3 sm:py-4 bg-black text-white flex items-center justify-center text-xs sm:text-sm tracking-[0.2em] hover:bg-gray-900 transition-colors"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              ADD TO CART
            </button>
            
            <div className="space-y-2 sm:space-y-3 pt-4 sm:pt-6 border-t border-gray-200">
              <div className="flex text-xs sm:text-sm">
                <span className="w-24 sm:w-32 text-gray-600">Category:</span>
                <span>{product.category}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};