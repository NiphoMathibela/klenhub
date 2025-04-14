import axios from 'axios';

// Determine API URL based on environment
const getApiUrl = () => {
  // Check if we're in production or development
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000/api'; // Local development
  } else {
    // For production, use the full URL with HTTPS to avoid mixed content issues
    return 'https://service.klenhub.co.za/api';
  }
};

const API_URL = getApiUrl();
console.log('Using API URL:', API_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle errors consistently
api.interceptors.response.use(
  (response) => {
    // Check if response is HTML instead of JSON (common SPA routing issue)
    // Skip this check for auth endpoints, order endpoints, product endpoints, and payment endpoints
    // as they might return different content types
    const skipHtmlCheck = response.config.url && (
      response.config.url.includes('/auth/') || 
      response.config.url.includes('/orders') ||
      response.config.url.includes('/payments') ||
      response.config.url.includes('/products') ||
      response.config.url.includes('/admin')
    );
    
    if (!skipHtmlCheck) {
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('text/html') && typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
        console.error('Received HTML instead of JSON. This is likely a routing issue.');
        return Promise.reject(new Error('Received HTML instead of expected JSON response'));
      }
    }
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

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
    try {
      // For direct API access in development, use the full URL
      // This helps avoid CORS and routing issues
      let url = '/auth/login';
      let response;
      
      // Special handling for production environment
      if (window.location.hostname !== 'localhost') {
        // Try to use a direct API call to the backend server
        try {
          response = await axios.post('https://service.klenhub.co.za/api/auth/login', { email, password }, {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (directApiError) {
          console.warn('Direct API call failed, falling back to relative URL:', directApiError);
          // Fall back to relative URL if direct call fails
          response = await api.post(url, { email, password });
        }
      } else {
        response = await api.post(url, { email, password });
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (name: string, email: string, password: string) => {
    try {
      // For direct API access in development, use the full URL
      // This helps avoid CORS and routing issues
      let url = '/auth/register';
      let response;
      
      // Special handling for production environment
      if (window.location.hostname !== 'localhost') {
        // Try to use a direct API call to the backend server
        try {
          response = await axios.post('https://service.klenhub.co.za/api/auth/register', 
            { name, email, password }, 
            { headers: { 'Content-Type': 'application/json' } }
          );
        } catch (directApiError) {
          console.warn('Direct API call failed, falling back to relative URL:', directApiError);
          // Fall back to relative URL if direct call fails
          response = await api.post(url, { name, email, password });
        }
      } else {
        response = await api.post(url, { name, email, password });
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  getCurrentUser: async () => {
    try {
      // For direct API access in development, use the full URL
      let url = '/auth/me';
      let response;
      
      // Special handling for production environment
      if (window.location.hostname !== 'localhost') {
        try {
          response = await axios.get('https://service.klenhub.co.za/api/auth/me', {
            headers: { 
              'Authorization': `Bearer ${localStorage.getItem('token')}` 
            }
          });
        } catch (directApiError) {
          console.warn('Direct API call failed, falling back to relative URL:', directApiError);
          response = await api.get(url);
        }
      } else {
        response = await api.get(url);
      }
      
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },
  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },
  resetPassword: async (token: string, password: string) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },
  resendVerificationEmail: async () => {
    try {
      const response = await api.post('/auth/resend-verification');
      return response.data;
    } catch (error) {
      console.error('Resend verification email error:', error);
      throw error;
    }
  },
  updateProfile: async (userData: { name?: string; email?: string; password?: string }) => {
    try {
      // For direct API access in development, use the full URL
      let url = '/auth/profile';
      let response;
      
      // Special handling for production environment
      if (window.location.hostname !== 'localhost') {
        try {
          response = await axios.put('https://service.klenhub.co.za/api/auth/profile', userData, {
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}` 
            }
          });
        } catch (directApiError) {
          console.warn('Direct API call failed, falling back to relative URL:', directApiError);
          response = await api.put(url, userData);
        }
      } else {
        response = await api.put(url, userData);
      }
      
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
};

// Product API
export const productService = {
  // Get all products
  getProducts: async () => {
    try {
      // For direct API access in production, use the full URL
      let url = '/products';
      let response;
      
      // Special handling for production environment
      if (window.location.hostname !== 'localhost') {
        try {
          response = await axios.get('https://service.klenhub.co.za/api/products', {
            headers: { 
              'Authorization': `Bearer ${localStorage.getItem('token')}` 
            }
          });
        } catch (directApiError) {
          console.warn('Direct API call failed, falling back to relative URL:', directApiError);
          response = await api.get(url);
        }
      } else {
        response = await api.get(url);
      }
      
      return response.data;
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  },
  // Get single product
  getProduct: async (id: string) => {
    try {
      // For direct API access in development, use the full URL
      let url = `/products/${id}`;
      
      // Special handling for production environment
      if (window.location.hostname !== 'localhost') {
        // Try to use a direct API call to the backend server
        try {
          const directApiResponse = await axios.get(`https://service.klenhub.co.za/api/products/${id}`);
          return directApiResponse.data;
        } catch (directApiError) {
          console.warn('Direct API call failed, falling back to relative URL:', directApiError);
          // Fall back to relative URL if direct call fails
        }
      }
      
      const response = await api.get(url);
      // Ensure we return valid data, even if the API returns null or undefined
      return response.data || {};
    } catch (error) {
      console.error(`Get product ${id} error:`, error);
      // Return empty object on error to prevent property access errors
      return {};
    }
  },
  // Get products by category
  getProductsByCategory: async (category: string) => {
    try {
      const response = await api.get(`/products/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Get products by category ${category} error:`, error);
      throw error;
    }
  },
  // Search products
  searchProducts: async (query: string) => {
    try {
      const response = await api.get(`/products/search?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Search products error:', error);
      throw error;
    }
  },
  // Create new product (admin only)
  createProduct: async (productData: any) => {
    try {
      // Clean up the product data before sending to the API
      const cleanedData = {
        ...productData,
        // Handle both URL-based images and file uploads
        images: productData.images.map((image: any) => ({
          url: image.url || image.imageUrl,
          isMain: image.isMain
        }))
      };
      
      const response = await api.post('/products', cleanedData);
      return response.data;
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    }
  },
  // Update product (admin only)
  updateProduct: async (id: string, productData: any) => {
    try {
      // Clean up the product data before sending to the API
      const cleanedData = {
        ...productData,
        // Handle both URL-based images and file uploads
        images: productData.images.map((image: any) => ({
          id: image.id, // Keep the ID for existing images
          url: image.url || image.imageUrl,
          isMain: image.isMain
        }))
      };
      
      // First try with Fetch API using PUT method
      try {
        const token = localStorage.getItem('token');
        const baseUrl = window.location.hostname !== 'localhost' 
          ? 'https://service.klenhub.co.za/api' 
          : API_URL;
        
        const response = await fetch(`${baseUrl}/products/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(cleanedData)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
      } catch (fetchError) {
        console.warn('PUT method failed, trying with PATCH:', fetchError);
        
        // Try with PATCH as fallback
        try {
          const token = localStorage.getItem('token');
          const baseUrl = window.location.hostname !== 'localhost' 
            ? 'https://service.klenhub.co.za/api' 
            : API_URL;
          
          const response = await fetch(`${baseUrl}/products/${id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(cleanedData)
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          return await response.json();
        } catch (patchError) {
          console.warn('PATCH method failed, falling back to axios:', patchError);
          
          // Fall back to axios as last resort
          const response = await api.put(`/products/${id}`, cleanedData);
          return response.data;
        }
      }
    } catch (error) {
      console.error(`Update product ${id} error:`, error);
      throw error;
    }
  },
  // Delete product (admin only)
  deleteProduct: async (id: string) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete product ${id} error:`, error);
      throw error;
    }
  },
  // Upload product images
  uploadProductImages: async (files: File[]) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });
      
      const response = await api.post('/products/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Upload product images error:', error);
      throw error;
    }
  }
};

// Search API
export const searchService = {
  // Search products
  searchProducts: async (query: string) => {
    try {
      const response = await api.get(`/products/search?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }
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
    try {
      // Get the authentication token
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Authentication token not found');
        throw new Error('You must be logged in to create an order');
      }
      
      // For direct API access in development, use the full URL
      // This helps avoid CORS and routing issues
      let url = '/orders';
      let response;
      
      // Special handling for production environment
      if (window.location.hostname !== 'localhost') {
        // Try to use a direct API call to the backend server with Fetch API first
        try {
          const fetchResponse = await fetch('https://service.klenhub.co.za/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
          });
          
          if (!fetchResponse.ok) {
            throw new Error(`HTTP error! Status: ${fetchResponse.status}`);
          }
          
          response = { data: await fetchResponse.json() };
        } catch (fetchError) {
          console.warn('Fetch API call failed, trying axios:', fetchError);
          
          // Try with axios as fallback
          try {
            response = await axios.post('https://service.klenhub.co.za/api/orders', orderData, {
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
              }
            });
          } catch (directApiError) {
            console.warn('Direct API call failed, falling back to relative URL:', directApiError);
            // Fall back to relative URL if direct call fails
            response = await api.post(url, orderData);
          }
        }
      } else {
        response = await api.post(url, orderData);
      }
      
      return response.data;
    } catch (error) {
      console.error('Create order error:', error);
      throw new Error('Failed to create order');
    }
  },
  
  // Get all orders (admin only)
  getOrders: async () => {
    try {
      // For direct API access in production, use the full URL
      let url = '/orders/admin';
      let response;
      
      // Special handling for production environment
      if (window.location.hostname !== 'localhost') {
        try {
          // Use the correct admin orders endpoint
          response = await axios.get('https://service.klenhub.co.za/api/orders/admin', {
            headers: { 
              'Authorization': `Bearer ${localStorage.getItem('token')}` 
            }
          });
        } catch (directApiError) {
          console.warn('Direct API call failed, falling back to relative URL:', directApiError);
          
          // Fall back to relative URL if direct call fails
          try {
            response = await api.get(url);
          } catch (relativeUrlError) {
            console.warn('Relative URL failed, trying user orders as fallback:', relativeUrlError);
            
            // As a last resort, try to get user orders
            response = await api.get('/orders/my-orders');
          }
        }
      } else {
        try {
          response = await api.get(url);
        } catch (error) {
          console.warn('Local API call failed, trying user orders as fallback:', error);
          response = await api.get('/orders/my-orders');
        }
      }
      
      // Ensure we always return an array, even if the API returns null or undefined
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Get orders error:', error);
      // Return empty array on error to prevent filter errors
      return [];
    }
  },
  
  // Get user's orders
  getUserOrders: async () => {
    try {
      // For direct API access in development, use the full URL
      let url = '/orders/my-orders';
      let response;
      
      // Special handling for production environment
      if (window.location.hostname !== 'localhost') {
        try {
          response = await axios.get('https://service.klenhub.co.za/api/orders/my-orders', {
            headers: { 
              'Authorization': `Bearer ${localStorage.getItem('token')}` 
            }
          });
        } catch (directApiError) {
          console.warn('Direct API call failed, falling back to relative URL:', directApiError);
          response = await api.get(url);
        }
      } else {
        response = await api.get(url);
      }
      
      // Ensure we always return an array, even if the API returns null or undefined
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Get user orders error:', error);
      // Return empty array on error to prevent filter errors
      return [];
    }
  },
  
  // Get specific order
  getOrder: async (id: string) => {
    try {
      // For direct API access in development, use the full URL
      let url = `/orders/${id}`;
      let response;
      
      // Special handling for production environment
      if (window.location.hostname !== 'localhost') {
        try {
          response = await axios.get(`https://service.klenhub.co.za/api/orders/${id}`, {
            headers: { 
              'Authorization': `Bearer ${localStorage.getItem('token')}` 
            }
          });
        } catch (directApiError) {
          console.warn('Direct API call failed, falling back to relative URL:', directApiError);
          response = await api.get(url);
        }
      } else {
        response = await api.get(url);
      }
      
      // Ensure we return valid data, even if the API returns null or undefined
      return response.data || {};
    } catch (error) {
      console.error(`Get order ${id} error:`, error);
      // Return empty object on error to prevent property access errors
      return {};
    }
  },
  
  // Update order status (admin only)
  updateOrderStatus: async (id: string, status: string) => {
    try {
      let response;
      
      // In production, use the API directly
      if (window.location.hostname !== 'localhost') {
        try {
          // For the live API, use a direct fetch call with PATCH method
          const token = localStorage.getItem('token');
          const fetchResponse = await fetch(`https://service.klenhub.co.za/api/orders/${id}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
          });
          
          if (!fetchResponse.ok) {
            throw new Error(`HTTP error! Status: ${fetchResponse.status}`);
          }
          
          response = { data: await fetchResponse.json() };
        } catch (fetchError) {
          console.warn('Fetch API call failed, trying axios with PUT:', fetchError);
          
          try {
            // Try PUT method as a fallback
            response = await axios({
              method: 'put',
              url: `https://service.klenhub.co.za/api/orders/${id}/status`,
              data: { status },
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
              }
            });
          } catch (putError) {
            console.warn('PUT method failed, trying with relative URL:', putError);
            
            // Fall back to the relative URL with the api instance
            response = await api.patch(`/orders/${id}/status`, { status });
          }
        }
      } else {
        // In development, use the relative URL
        response = await api.patch(`/orders/${id}/status`, { status });
      }
      
      return response.data;
    } catch (error) {
      console.error(`Update order ${id} status error:`, error);
      throw error;
    }
  },
  
  // Update tracking number (admin only)
  updateTrackingNumber: async (id: string, trackingNumber: string) => {
    try {
      const response = await api.patch(`/orders/${id}/tracking`, { trackingNumber });
      return response.data;
    } catch (error) {
      console.error(`Update order ${id} tracking number error:`, error);
      throw error;
    }
  }
};

// Admin Services
export const adminService = {
  // Get all orders (admin only)
  getAllOrders: async () => {
    try {
      // For direct API access in production, use the full URL
      let url = '/admin/orders';
      let response;
      
      // Special handling for production environment
      if (window.location.hostname !== 'localhost') {
        try {
          response = await axios.get('https://service.klenhub.co.za/api/admin/orders', {
            headers: { 
              'Authorization': `Bearer ${localStorage.getItem('token')}` 
            }
          });
        } catch (directApiError) {
          console.warn('Direct API call failed, falling back to relative URL:', directApiError);
          response = await api.get(url);
        }
      } else {
        response = await api.get(url);
      }
      
      return response.data;
    } catch (error) {
      console.error('Get all orders error:', error);
      throw error;
    }
  },
  
  // Update order status (admin only)
  updateOrderStatus: async (id: string, status: string) => {
    try {
      // For direct API access in development, use the full URL
      let url = `/admin/orders/${id}/status`;
      let response;
      
      // Special handling for production environment
      if (window.location.hostname !== 'localhost') {
        try {
          response = await axios.put(`https://service.klenhub.co.za/api/admin/orders/${id}/status`, 
            { status }, 
            {
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
              }
            }
          );
        } catch (directApiError) {
          console.warn('Direct API call failed, falling back to relative URL:', directApiError);
          response = await api.put(url, { status });
        }
      } else {
        response = await api.put(url, { status });
      }
      
      return response.data;
    } catch (error) {
      console.error(`Update order ${id} status error:`, error);
      throw error;
    }
  },
  
  // Get dashboard stats (admin only)
  getDashboardStats: async () => {
    try {
      // For direct API access in development, use the full URL
      let url = '/admin/stats';
      let response;
      
      // Special handling for production environment
      if (window.location.hostname !== 'localhost') {
        try {
          response = await axios.get('https://service.klenhub.co.za/api/admin/stats', {
            headers: { 
              'Authorization': `Bearer ${localStorage.getItem('token')}` 
            }
          });
        } catch (directApiError) {
          console.warn('Direct API call failed, falling back to relative URL:', directApiError);
          response = await api.get(url);
        }
      } else {
        response = await api.get(url);
      }
      
      return response.data;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },
  
  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      // For direct API access in development, use the full URL
      let url = '/admin/users';
      let response;
      
      // Special handling for production environment
      if (window.location.hostname !== 'localhost') {
        try {
          response = await axios.get('https://service.klenhub.co.za/api/admin/users', {
            headers: { 
              'Authorization': `Bearer ${localStorage.getItem('token')}` 
            }
          });
        } catch (directApiError) {
          console.warn('Direct API call failed, falling back to relative URL:', directApiError);
          response = await api.get(url);
        }
      } else {
        response = await api.get(url);
      }
      
      return response.data;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }
};

// YOCO Payment Services
export const paymentService = {
  // Create a YOCO payment for an order
  createPayment: async (orderId: string) => {
    try {
      // For direct API access in development, use the full URL
      let url = `/payments/create`;
      let response;
      
      // Special handling for production environment
      if (window.location.hostname !== 'localhost') {
        // Try to use a direct API call to the backend server
        try {
          response = await axios.post(`https://service.klenhub.co.za/api/payments/create`, { orderId }, {
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}` 
            }
          });
        } catch (directApiError) {
          console.warn('Direct API call failed, falling back to relative URL:', directApiError);
          // Fall back to relative URL if direct call fails
          response = await api.post(url, { orderId });
        }
      } else {
        response = await api.post(url, { orderId });
      }
      
      return response.data;
    } catch (error) {
      console.error(`Create payment for order ${orderId} error:`, error);
      throw error;
    }
  },
  
  /**
   * Verify YOCO payment after checkout
   * @param reference Payment reference
   * @returns Payment verification result
   */
  verifyPayment: async (reference: string) => {
    try {
      // For direct API access in development, use the full URL
      let url = `/payments/verify?reference=${reference}`;
      let response;
      
      // Special handling for production environment
      if (window.location.hostname !== 'localhost') {
        try {
          response = await axios.get(`https://service.klenhub.co.za/api/payments/verify?reference=${reference}`, {
            headers: { 
              'Authorization': `Bearer ${localStorage.getItem('token')}` 
            }
          });
        } catch (directApiError) {
          console.warn('Direct API call failed, falling back to relative URL:', directApiError);
          response = await api.get(url);
        }
      } else {
        response = await api.get(url);
      }
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Payment verification failed:', error);
      return {
        success: false,
        error: 'Payment verification failed'
      };
    }
  },
  
  /**
   * Get YOCO payment status
   * @param reference Payment reference
   * @returns Payment status
   */
  getPaymentStatus: async (reference: string) => {
    try {
      // For direct API access in development, use the full URL
      let url = `/payments/status?reference=${reference}`;
      let response;
      
      // Special handling for production environment
      if (window.location.hostname !== 'localhost') {
        try {
          response = await axios.get(`https://service.klenhub.co.za/api/payments/status?reference=${reference}`, {
            headers: { 
              'Authorization': `Bearer ${localStorage.getItem('token')}` 
            }
          });
        } catch (directApiError) {
          console.warn('Direct API call failed, falling back to relative URL:', directApiError);
          response = await api.get(url);
        }
      } else {
        response = await api.get(url);
      }
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Failed to get payment status:', error);
      return {
        success: false,
        error: 'Failed to get payment status'
      };
    }
  },
  
  /**
   * Handle YOCO payment callback
   * @param reference Payment reference
   * @returns Callback handling result
   */
  handlePaymentCallback: async (reference: string) => {
    try {
      // For direct API access in development, use the full URL
      let url = `/payments/success?reference=${reference}`;
      let response;
      
      // Special handling for production environment
      if (window.location.hostname !== 'localhost') {
        try {
          response = await axios.get(`https://service.klenhub.co.za/api/payments/success?reference=${reference}`, {
            headers: { 
              'Authorization': `Bearer ${localStorage.getItem('token')}` 
            }
          });
        } catch (directApiError) {
          console.warn('Direct API call failed, falling back to relative URL:', directApiError);
          response = await api.get(url);
        }
      } else {
        response = await api.get(url);
      }
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Failed to handle payment callback:', error);
      return {
        success: false,
        error: 'Failed to handle payment callback'
      };
    }
  }
};
