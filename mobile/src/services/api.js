import axios from 'axios';

// Base API URL - update this for production
const API_BASE_URL = 'http://10.0.2.2:5000/api'; // Android emulator
// const API_BASE_URL = 'http://localhost:5000/api'; // iOS simulator

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Token will be set dynamically after login
    // const token = getToken();
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Network error';
    console.error('API Error:', message);
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
  chat: (message, sessionId, userLocation) =>
    api.post('/ai/chat', { message, sessionId, userLocation }),
  getHistory: () => api.get('/ai/history'),
  getSuggestions: () => api.get('/ai/suggestions'),
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
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export default api;
