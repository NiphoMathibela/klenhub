import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token: string, password: string) => {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  },
  resendVerificationEmail: async () => {
    const response = await api.post('/auth/resend-verification');
    return response.data;
  }
};

// Product API
export const productService = {
  // Get all products
  getProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  // Get single product
  getProduct: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  // Get products by category
  getProductsByCategory: async (category: string) => {
    const response = await api.get(`/products/category/${category}`);
    return response.data;
  },
  // Create new product (admin only)
  createProduct: async (productData: any) => {
    // Process images - convert File objects to URLs or keep existing URLs
    const processedData = {
      ...productData,
      images: await Promise.all(
        productData.images.map(async (image: any) => {
          // If the image already has a URL and no file, use it directly
          if (image.url && !image.file) {
            return {
              url: image.url,
              isMain: image.isMain
            };
          }
          
          // If it has a file, we need to handle it
          if (image.file) {
            // For now, we're just passing the data URL
            // In a real app, you would upload to a server or cloud storage
            return {
              url: image.url, // This is already a data URL from FileReader
              isMain: image.isMain
            };
          }
          
          return image;
        })
      )
    };
    
    const response = await api.post('/products', processedData);
    return response.data;
  },
  // Update product (admin only)
  updateProduct: async (id: string, productData: any) => {
    // Process images - convert File objects to URLs or keep existing URLs
    const processedData = {
      ...productData,
      images: await Promise.all(
        productData.images.map(async (image: any) => {
          // If the image already has a URL and no file, use it directly
          if (image.url && !image.file) {
            return {
              url: image.url,
              isMain: image.isMain
            };
          }
          
          // If it has a file, we need to handle it
          if (image.file) {
            // For now, we're just passing the data URL
            // In a real app, you would upload to a server or cloud storage
            return {
              url: image.url, // This is already a data URL from FileReader
              isMain: image.isMain
            };
          }
          
          return image;
        })
      )
    };
    
    const response = await api.put(`/products/${id}`, processedData);
    return response.data;
  },
  // Delete product (admin only)
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

// Search API
export const searchService = {
  // Search products
  searchProducts: async (query: string) => {
    try {
      const response = await axios.get(`${API_URL}/products/search`, {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },
};

// Order Services
export const orderService = {
  createOrder: async (orderData: {
    items: Array<{ productId: string; quantity: number; size: string }>;
    total: number;
  }) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  // Get all orders (admin only)
  getOrders: async () => {
    const response = await api.get('/orders/admin');
    return response.data;
  },
  
  // Get user's orders
  getUserOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },
  
  // Get specific order
  getOrder: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  // Update order status (admin only)
  updateOrderStatus: async (id: string, status: string) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  }
};
