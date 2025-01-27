import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProductGrid } from '../components/ProductGrid';
import { Hero } from '../components/Hero';
import { products } from '../data/products';
import { SortOption } from '../types';

export const Home = () => {
  const { category } = useParams();
  const [sortOption, setSortOption] = useState<SortOption>('featured');

  // Get featured products (marked as featured in data)
  const featuredProducts = products
    .filter(product => product.featured)
    .slice(0, 4);

  // Get trending products (most expensive products for demo)
  const trendingProducts = [...products]
    .sort((a, b) => b.price - a.price)
    .slice(0, 4);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

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
                className="text-sm tracking-wider hover:opacity-70 transition-opacity"
              >
                VIEW ALL PRODUCTS
              </Link>
            </motion.div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  to={`/product/${product.id}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.onSale && (
                      <div className="absolute top-4 left-4 bg-black text-white px-4 py-1 text-xs tracking-wider">
                        SALE
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-1">
                    <h3 className="text-sm tracking-wider">{product.name}</h3>
                    <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
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
              TRENDING NOW
            </motion.h2>
            <motion.div {...fadeInUp}>
              <Link 
                to="/category/all"
                className="text-sm tracking-wider hover:opacity-70 transition-opacity"
              >
                VIEW ALL PRODUCTS
              </Link>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trendingProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  to={`/product/${product.id}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.onSale && (
                      <div className="absolute top-4 left-4 bg-black text-white px-4 py-1 text-xs tracking-wider">
                        SALE
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-1">
                    <h3 className="text-sm tracking-wider">{product.name}</h3>
                    <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
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
              className="px-4 py-2 bg-transparent border-b border-gray-200 focus:outline-none text-sm tracking-wider"
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