import axios from 'axios';
import { secureStoreService } from './secureStoreService';

const API_BASE_URL = 'http://10.0.2.2:5000/api';
let cachedToken = null;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    if (!cachedToken) {
      cachedToken = await secureStoreService.getItemAsync('authToken');
    }
    if (cachedToken) {
      config.headers.Authorization = `Bearer ${cachedToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const message = error.response?.data?.message || error.message || 'Network error';
    console.error('API Error:', message);
    if (error.response?.status === 401) {
      await secureStoreService.deleteItemAsync('authToken');
      cachedToken = null;
    }
    return Promise.reject({ message, status: error.response?.status });
  }
);

// API functions
export const issAPI = {
  getPosition: () => api.get('/iss/position'),
  getDetailedPosition: (lat, lng) =>
    api.get(`/iss/position/detailed?lat=${lat}&lng=${lng}&seconds=10`),
  getAstronauts: () => api.get('/iss/astronauts'),
  getTLE: () => api.get('/iss/tle'),
};

export const satelliteAPI = {
  getAbove: (lat, lng, radius = 70, category = 0) =>
    api.get(`/satellites/above?lat=${lat}&lng=${lng}&radius=${radius}&category=${category}`),
  getPosition: (noradId, lat = 0, lng = 0) =>
    api.get(`/satellites/position/${noradId}?lat=${lat}&lng=${lng}`),
  getCategories: () => api.get('/satellites/categories'),
  getPopular: () => api.get('/satellites/popular'),
};

export const alertAPI = {
  getPasses: (lat, lng, days = 10) =>
    api.get(`/alerts/passes?lat=${lat}&lng=${lng}&days=${days}`),
  subscribe: (lat, lng) =>
    api.post('/alerts/subscribe', { lat, lng }),
  getMyAlerts: () => api.get('/alerts/my'),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),
};

export const aiAPI = {
  chat: (message, options = {}) =>
    api.post('/ai/chat', {
      message,
      sessionId: options.sessionId,
      userLocation: options.userLocation,
      currentScreen: options.currentScreen,
      userTimezone: options.userTimezone,
      includeContext: options.includeContext !== false,
    }),
  getHistory: () => api.get('/ai/history'),
  getSuggestions: () => api.get('/ai/suggestions'),
  checkHealth: () => api.get('/ai/health'),
};

export const mediaAPI = {
  getAPOD: () => api.get('/media/apod'),
  getEPIC: () => api.get('/media/epic'),
  search: (query, type = 'image') =>
    api.get(`/media/search?q=${query}&type=${type}`),
  getISSStream: () => api.get('/media/iss-stream'),
  getMars: (rover = 'curiosity', sol = 1000) =>
    api.get(`/media/mars?rover=${rover}&sol=${sol}`),
};

export const authAPI = {
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  loginGoogle: (idToken, location) =>
    api.post('/auth/login-google', { idToken, location }),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (settings) => api.put('/settings', settings),
  reset: () => api.post('/settings/reset'),
};

export default api;
