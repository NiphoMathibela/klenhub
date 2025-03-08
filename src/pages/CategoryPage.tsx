import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProductGrid } from '../components/ProductGrid';
import { SortOption, Product } from '../types';
import { productService } from '../services/api';

export const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  // Get URL parameters
  useEffect(() => {
    // Get page from URL or default to 1
    const pageParam = searchParams.get('page');
    if (pageParam) {
      setCurrentPage(parseInt(pageParam, 10));
    } else {
      setCurrentPage(1);
    }
    
    // Get sort option from URL or default to 'featured'
    const sortParam = searchParams.get('sort');
    if (sortParam && ['featured', 'newest', 'price-asc', 'price-desc'].includes(sortParam)) {
      setSortOption(sortParam as SortOption);
    }
    
    // Get subcategory from URL or default to 'all'
    const subCategoryParam = searchParams.get('subcategory');
    if (subCategoryParam) {
      setSelectedSubCategory(subCategoryParam);
    } else {
      setSelectedSubCategory('all');
    }
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        let data;
        
        if (category === 'all') {
          data = await productService.getProducts();
        } else {
          data = await productService.getProductsByCategory(category || '');
        }
        
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  // Get unique subcategories from products
  const subCategories = useMemo(() => {
    return ['all', ...new Set(products.filter(p => p.category).map(p => p.category))];
  }, [products]);
  
  // Filter products by subcategory
  const filteredProducts = useMemo(() => {
    return selectedSubCategory === 'all'
      ? products
      : products.filter(p => p.category === selectedSubCategory);
  }, [products, selectedSubCategory]);
    
  // Calculate pagination
  const { currentProducts, totalPages } = useMemo(() => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    return { currentProducts, totalPages };
  }, [filteredProducts, currentPage, productsPerPage]);
  
  // Update URL when page, sort, or subcategory changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    } else {
      params.delete('page');
    }
    
    if (sortOption !== 'featured') {
      params.set('sort', sortOption);
    } else {
      params.delete('sort');
    }
    
    if (selectedSubCategory !== 'all') {
      params.set('subcategory', selectedSubCategory);
    } else {
      params.delete('subcategory');
    }
    
    setSearchParams(params);
  }, [currentPage, sortOption, selectedSubCategory, setSearchParams, searchParams]);
  
  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 lg:px-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 lg:px-12 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen pt-32 pb-24 px-6 lg:px-12"
      initial="initial"
      animate="animate"
      variants={fadeIn}
    >
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-16 space-y-8">
          <motion.h1 
            className="text-4xl font-light tracking-[0.2em]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {category?.toUpperCase().replace('-', ' ')}
          </motion.h1>

          {/* Filters */}
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Sub-categories */}
            <div className="flex flex-wrap gap-4">
              {subCategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => {
                    setSelectedSubCategory(sub);
                    setCurrentPage(1); // Reset to page 1 when changing subcategory
                  }}
                  className={`text-sm tracking-[0.1em] px-4 py-2 transition-colors ${
                    selectedSubCategory === sub
                      ? 'bg-black text-white'
                      : 'bg-transparent text-gray-600 hover:text-black'
                  }`}
                >
                  {sub.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Sort options */}
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value as SortOption);
                setCurrentPage(1); // Reset to page 1 when changing sort
              }}
              className="px-4 py-2 bg-transparent text-sm tracking-[0.1em] border-b border-gray-200 focus:outline-none focus:border-black transition-colors cursor-pointer"
            >
              <option value="featured">FEATURED</option>
              <option value="newest">NEWEST</option>
              <option value="price-asc">PRICE: LOW TO HIGH</option>
              <option value="price-desc">PRICE: HIGH TO LOW</option>
            </select>
          </motion.div>
        </div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ProductGrid products={currentProducts} sortOption={sortOption} />
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-32">
              <p className="text-lg tracking-[0.1em] text-gray-500">
                No products found in this category.
              </p>
            </div>
          )}
          
          {/* Pagination */}
          {filteredProducts.length > 0 && totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="flex items-center space-x-2">
                {/* Previous page button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 border ${
                    currentPage === 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {/* Page numbers */}
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // Show limited page numbers with ellipsis for better UX
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-4 py-2 ${
                          currentPage === pageNumber
                            ? 'bg-black text-white'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    (pageNumber === 2 && currentPage > 3) ||
                    (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return <span key={pageNumber} className="px-2">...</span>;
                  }
                  return null;
                })}
                
                {/* Next page button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 border ${
                    currentPage === totalPages
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
