import axios from 'axios';

const baseURL = import.meta.env.VITE_ENV === 'production'
  ? import.meta.env.VITE_PROD_BASE_URL
  : import.meta.env.VITE_DEV_BASE_URL;

console.log('API Base URL:', baseURL);

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.clear(); // Clear all storage
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 