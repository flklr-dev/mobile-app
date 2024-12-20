import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://mobile-app-2-s9az.onrender.com',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
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
      // Clear localStorage
      localStorage.clear();

      // Show toast message
      toast.error('Session expired. Please login again.', {
        position: "top-center",
        autoClose: 3000
      });

      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
    return Promise.reject(error);
  }
);

export default api;