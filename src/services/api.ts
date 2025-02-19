import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', {
        data: error.response.data,
        status: error.response.status,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request error:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
  };
}

// Auth services
export const auth = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 400) {
        throw new Error('Invalid email or password');
      }
      throw error;
    }
  },
  register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', { email, password, name });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 400) {
        throw new Error('Registration failed. Email might already be in use.');
      }
      throw error;
    }
  },
};

// Products services
export const products = {
  getAll: async () => {
    const response = await api.get('/products');
    response.data = response.data.map((product: any) => ({
      ...product,
      price: parseFloat(product.price)
    }));
    return response;
  },
  getById: async (id: number) => {
    const response = await api.get(`/products/${id}`);
    response.data.price = parseFloat(response.data.price);
    return response;
  },
  getByCategory: async (category: string) => {
    const response = await api.get(`/products/category/${category}`);
    response.data = response.data.map((product: any) => ({
      ...product,
      price: parseFloat(product.price)
    }));
    return response;
  },
  search: async (query: string) => {
    const response = await api.get(`/products/search?q=${query}`);
    response.data = response.data.map((product: any) => ({
      ...product,
      price: parseFloat(product.price)
    }));
    return response;
  }
};

// Cart services
export const cart = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },
  addToCart: async (productId: number, quantity: number) => {
    const response = await api.post('/cart', { productId, quantity });
    return response.data;
  },
  updateQuantity: async (productId: number, quantity: number) => {
    const response = await api.put(`/cart/${productId}`, { quantity });
    return response.data;
  },
  removeFromCart: async (productId: number) => {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
  },
};

// Orders services
export const orders = {
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  create: async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
};

// Admin services
export const admin = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  
  // Products
  getProducts: (params?: { 
    page?: number; 
    limit?: number; 
    category?: string;
    status?: string;
    search?: string;
  }) => api.get('/products', { params }),
  
  getProduct: (id: number) => api.get(`/products/${id}`),
  
  createProduct: (productData: any) => {
    const formData = new FormData();
    
    // Add basic product data
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', String(productData.price));
    formData.append('category_id', productData.category_id);
    formData.append('subcategory_id', productData.subcategory_id || '');
    formData.append('status', productData.status);
    
    // Add images
    if (productData.images) {
      productData.images.forEach((file: File) => {
        formData.append('images', file);
      });
    }
    
    // Add sizes
    if (productData.sizes) {
      formData.append('sizes', JSON.stringify(productData.sizes));
    }
    
    return api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  updateProduct: (id: number, productData: any) => {
    const formData = new FormData();
    
    // Add basic product data
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', String(productData.price));
    formData.append('category_id', productData.category_id);
    formData.append('subcategory_id', productData.subcategory_id || '');
    formData.append('status', productData.status);
    
    // Add images
    if (productData.images) {
      productData.images.forEach((file: File) => {
        formData.append('images', file);
      });
    }
    
    // Add sizes
    if (productData.sizes) {
      formData.append('sizes', JSON.stringify(productData.sizes));
    }
    
    return api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  deleteProduct: (id: number) => api.delete(`/products/${id}`),
  
  updateProductStatus: (id: number, status: string) => api.patch(`/products/${id}/status`, { status }),
  
  updateProductStock: (id: number, sizes: { name: string; stock: number }[]) => api.patch(`/products/${id}/stock`, { sizes }),
  
  // Product Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data: { name: string; parent_id?: number }) => api.post('/admin/categories', data),
  updateCategory: (id: number, data: { name: string; parent_id?: number }) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/admin/categories/${id}`),
  
  // Orders
  getOrders: (params?: { 
    page?: number; 
    limit?: number; 
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get('/admin/orders', { params }),
  
  updateOrder: (orderId: number, data: {
    status: string;
    tracking_number?: string;
    notes?: string;
  }) => api.patch(`/admin/orders/${orderId}`, data),
  
  // Customers
  getCustomers: (params?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) => api.get('/admin/customers', { params }),
  
  getCustomerDetails: (id: number) => api.get(`/admin/customers/${id}`),
  
  getCustomerOrders: (id: number, params?: {
    page?: number;
    limit?: number;
  }) => api.get(`/admin/customers/${id}/orders`, { params }),
  
  // Analytics
  getAnalytics: (params: { 
    startDate: string; 
    endDate: string;
    metrics?: string[];
    groupBy?: string;
  }) => api.get('/admin/analytics', { params }),
  
  getSalesReport: (params: {
    startDate: string;
    endDate: string;
    groupBy: 'day' | 'week' | 'month';
  }) => api.get('/admin/analytics/sales', { params }),
  
  getProductPerformance: (params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    sortBy?: string;
  }) => api.get('/admin/analytics/products', { params }),
  
  // Marketing
  getDiscounts: (params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'scheduled' | 'expired';
  }) => api.get('/admin/marketing/discounts', { params }),
  
  createDiscount: (data: {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    start_date: string;
    end_date: string;
    min_purchase?: number;
    max_uses?: number;
    product_ids?: number[];
    category_ids?: number[];
  }) => api.post('/admin/marketing/discounts', data),
  
  updateDiscount: (id: number, data: Partial<{
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    start_date: string;
    end_date: string;
    min_purchase: number;
    max_uses: number;
    product_ids: number[];
    category_ids: number[];
  }>) => api.put(`/admin/marketing/discounts/${id}`, data),
  
  deleteDiscount: (id: number) => api.delete(`/admin/marketing/discounts/${id}`),
  
  // Content
  getPages: () => api.get('/admin/content/pages'),
  createPage: (data: { title: string; content: string; slug: string }) => api.post('/admin/content/pages', data),
  updatePage: (id: number, data: { title: string; content: string; slug: string }) => 
    api.put(`/admin/content/pages/${id}`, data),
  deletePage: (id: number) => api.delete(`/admin/content/pages/${id}`),
  
  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: {
    site_name?: string;
    contact_email?: string;
    currency?: string;
    tax_rate?: number;
    shipping_methods?: any[];
    payment_methods?: any[];
  }) => api.put('/admin/settings', data),
  
  // Users
  getUsers: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) => api.get('/admin/users', { params }),
  
  createUser: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => api.post('/admin/users', data),
  
  updateUser: (id: number, data: Partial<{
    name: string;
    email: string;
    password: string;
    role: string;
  }>) => api.put(`/admin/users/${id}`, data),
  
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`)
};

export default api;
