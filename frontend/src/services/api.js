import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your computer's IP address for testing on physical device
// For emulator, use localhost or 10.0.2.2 (Android)
const API_URL = 'http://192.168.1.9:3000./api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Product APIs
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories/list'),
};

// Cart APIs
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity = 1) => 
    api.post('/cart/add', { product_id: productId, quantity }),
  updateCart: (cartItemId, quantity) => 
    api.put(`/cart/update/${cartItemId}`, { quantity }),
  removeFromCart: (cartItemId) => api.delete(`/cart/remove/${cartItemId}`),
  clearCart: () => api.delete('/cart/clear'),
};

// Order APIs
export const orderAPI = {
  getOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  createOrder: (orderData) => api.post('/orders/create', orderData),
};

// Profile APIs
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (profileData) => api.put('/profile/update', profileData),
};

export default api;

