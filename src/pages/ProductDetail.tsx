import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product as ProductType } from '../types';
import { productService } from '../services/api';

interface ProductImage {
  id: string | number;
  imageUrl: string;
  isMain: boolean;
}

// Local interface to match the API response
interface ProductResponse {
  id: string | number;
  name: string;
  price: number;
  description: string;
  sizes: string[] | Array<{ id: number; size: string; quantity: number }>;
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
        
        // Use the productService instead of direct axios call
        // This ensures consistent URL handling across the app
        const productData = await productService.getProduct(id || '');
        console.log('API Response:', productData);
        
        // Validate the response data
        if (!productData || typeof productData !== 'object') {
          console.error('Invalid product data received:', productData);
          throw new Error('Invalid product data received');
        }
        
        setProduct(productData);
        
        // Ensure images array exists before trying to find the main image
        if (productData.images && Array.isArray(productData.images) && productData.images.length > 0) {
          // Set main image
          const mainImg = productData.images.find((img: ProductImage) => img && img.isMain);
          setMainImage(mainImg ? mainImg.imageUrl : productData.images[0]?.imageUrl || null);
        } else {
          console.warn('Product has no images or images is not an array:', productData);
          setMainImage(null);
        }
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
    
    try {
      // Convert the product to match the expected ProductType format
      const productForCart: ProductType = {
        id: typeof product.id === 'string' ? parseInt(product.id, 10) : Number(product.id) || 0,
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        category: product.category || '',
        images: (product.images && Array.isArray(product.images)) 
          ? product.images
              .filter(img => img && img.imageUrl) // Filter out any undefined or invalid images
              .map(img => ({
                id: typeof img.id === 'string' ? parseInt(img.id, 10) : Number(img.id) || 0,
                imageUrl: img.imageUrl || '',
                isMain: Boolean(img.isMain)
              }))
          : [], // Provide empty array as fallback if images is undefined
        sizes: (product.sizes && Array.isArray(product.sizes))
          ? (typeof product.sizes[0] === 'string'
              ? (product.sizes as string[]).map((size, index) => ({
                  id: index,
                  size: size || '',
                  quantity: 10 // Default quantity
                }))
              : (product.sizes as Array<{ id: number; size: string; quantity: number }>)
                  .filter(s => s && s.size) // Filter out any undefined or invalid sizes
                  .map(s => ({
                    id: s.id || 0,
                    size: s.size || '',
                    quantity: s.quantity || 10
                  })))
          : [] // Provide empty array as fallback if sizes is undefined
      };
      
      console.log('Product for cart:', productForCart);
      
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          product: productForCart,
          size: selectedSize,
          quantity: 1
        }
      });
      
      setError(null);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add product to cart. Please try again.');
    }
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

  // Ensure sizes is an array of strings for rendering
  const productSizes = (product.sizes && Array.isArray(product.sizes))
    ? (typeof product.sizes[0] === 'string'
        ? product.sizes as string[]
        : (product.sizes as Array<{ id: number; size: string; quantity: number }>)
            .filter(s => s && s.size) // Filter out any undefined or invalid sizes
            .map(s => s.size))
    : [];

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
              {mainImage ? (
                <img 
                  src={mainImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {product.images && Array.isArray(product.images) && product.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4">
                {product.images.map((image, index) => (
                  image && image.imageUrl ? (
                    <button 
                      key={`${image.id || index}`}
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
                  ) : null
                ))}
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-light mb-2 sm:mb-3">{product.name}</h1>
              <p className="text-base sm:text-lg md:text-xl font-medium">
                R{(product.price || 0).toFixed(2)}
              </p>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-sm sm:text-base font-medium">Description</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {product.description || 'No description available'}
              </p>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-sm sm:text-base font-medium">Size</h3>
              {productSizes.length > 0 ? (
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {productSizes.map((size) => (
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
              ) : (
                <p className="text-xs sm:text-sm text-gray-600">No sizes available</p>
              )}
              {error && (
                <p className="text-red-500 text-xs sm:text-sm">{error}</p>
              )}
            </div>
            
            <button
              onClick={addToCart}
              disabled={productSizes.length === 0}
              className={`w-full py-3 sm:py-4 ${
                productSizes.length > 0 
                  ? 'bg-black text-white hover:bg-gray-900' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } flex items-center justify-center text-xs sm:text-sm tracking-[0.2em] transition-colors`}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              ADD TO CART
            </button>
            
            <div className="space-y-2 sm:space-y-3 pt-4 sm:pt-6 border-t border-gray-200">
              <div className="flex text-xs sm:text-sm">
                <span className="w-24 sm:w-32 text-gray-600">Category:</span>
                <span>{product.category || 'Uncategorized'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};