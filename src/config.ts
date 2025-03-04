/**
 * Application configuration
 */

// API URL - using environment variable with fallback
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Image placeholder URL
export const PLACEHOLDER_IMAGE_URL = '/placeholder-image.jpg';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user'
};

// Order status options
export const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
];

// Product categories
export const PRODUCT_CATEGORIES = [
  'Shirts',
  'Pants',
  'Dresses',
  'Jackets',
  'Accessories',
  'Shoes'
];
