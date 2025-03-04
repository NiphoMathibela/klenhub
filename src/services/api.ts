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
  // Search products
  searchProducts: async (query: string) => {
    const response = await api.get(`/products/search?q=${query}`);
    return response.data;
  },
  // Create new product (admin only)
  createProduct: async (productData: any) => {
    // Clean up the product data before sending to the API
    const cleanedData = {
      ...productData,
      // Remove file objects from images
      images: productData.images.map((image: any) => ({
        url: image.url,
        isMain: image.isMain
      }))
    };
    
    const response = await api.post('/products', cleanedData);
    return response.data;
  },
  // Update product (admin only)
  updateProduct: async (id: string, productData: any) => {
    // Clean up the product data before sending to the API
    const cleanedData = {
      ...productData,
      // Remove file objects from images
      images: productData.images.map((image: any) => ({
        id: image.id, // Keep the ID for existing images
        url: image.url,
        isMain: image.isMain
      }))
    };
    
    const response = await api.put(`/products/${id}`, cleanedData);
    return response.data;
  },
  // Delete product (admin only)
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  // Upload product images
  uploadProductImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await api.post('/products/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
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
    recipientName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    province: string;
    postalCode: string;
    deliveryInstructions?: string;
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
  },

  // Update tracking number (admin only)
  updateTrackingNumber: async (id: string, trackingNumber: string) => {
    const response = await api.patch(`/orders/${id}/tracking`, { trackingNumber });
    return response.data;
  }
};

// Payment Services
export const paymentService = {
  // Create a PayFast payment for an order
  createPayment: async (orderId: string) => {
    const response = await api.post('/payments/create', { orderId });
    return response.data;
  },
  
  // Get payment status
  getPaymentStatus: async (orderId: string) => {
    const response = await api.get(`/payments/status/${orderId}`);
    return response.data;
  }
};
