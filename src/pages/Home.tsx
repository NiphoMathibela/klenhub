import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProductGrid } from '../components/ProductGrid';
import { Hero } from '../components/Hero';
import { SortOption, Product } from '../types';
import { productsService } from '../services/products';

export const Home = () => {
  const { category } = useParams();
  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch featured products
        const featured = await productsService.getFeatured();
        setFeaturedProducts(featured.slice(0, 4));

        // Fetch all products and sort by price for trending
        const allProducts = await productsService.getAll();
        const trending = [...allProducts]
          .sort((a, b) => b.price - a.price)
          .slice(0, 4);
        setTrendingProducts(trending);
        setProducts(allProducts);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 tracking-[0.1em]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-black text-white text-sm tracking-[0.2em] hover:bg-gray-900 transition-colors"
          >
            RETRY
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative">
        <Hero />
      </section>

      {/* Featured Products Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="mb-12 flex justify-between items-baseline"
          >
            <motion.h2 
              {...fadeInUp}
              className="text-3xl font-light tracking-[0.2em]"
            >
              FEATURED
            </motion.h2>
            <motion.div {...fadeInUp}>
              <Link 
                to="/category/all"
                className="text-sm tracking-[0.1em] text-gray-600 hover:text-black transition-colors"
              >
                VIEW ALL
              </Link>
            </motion.div>
          </motion.div>

          <ProductGrid products={featuredProducts} />
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="py-20 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="mb-12 flex justify-between items-baseline"
          >
            <motion.h2 
              {...fadeInUp}
              className="text-3xl font-light tracking-[0.2em]"
            >
              TRENDING
            </motion.h2>
            <motion.div {...fadeInUp}>
              <Link 
                to="/category/all"
                className="text-sm tracking-[0.1em] text-gray-600 hover:text-black transition-colors"
              >
                VIEW ALL
              </Link>
            </motion.div>
          </motion.div>

          <ProductGrid products={trendingProducts} />
        </div>
      </section>

      {/* Category Products - shown when a category is selected */}
      {category && category !== 'all' && (
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-24">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-3xl font-light tracking-[0.2em]">
              {category.toUpperCase().replace('-', ' ')}
            </h1>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="px-4 py-2 bg-transparent border-b border-gray-200 focus:outline-none text-sm tracking-[0.2em]"
            >
              <option value="featured">FEATURED</option>
              <option value="price-asc">PRICE: LOW TO HIGH</option>
              <option value="price-desc">PRICE: HIGH TO LOW</option>
              <option value="newest">NEWEST</option>
            </select>
          </div>
          <ProductGrid 
            products={category === 'all' ? products : products.filter(p => p.category === category)} 
            sortOption={sortOption} 
          />
        </div>
      )}
    </div>
  );
};

export default Home;