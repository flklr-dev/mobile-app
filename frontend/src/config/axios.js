import axios from 'axios';

const baseURL = import.meta.env.VITE_ENV === 'production' 
  ? import.meta.env.VITE_PROD_BASE_URL 
  : import.meta.env.VITE_DEV_BASE_URL;

const api = axios.create({
  baseURL,
  withCredentials: true
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 