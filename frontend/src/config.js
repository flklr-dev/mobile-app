const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000' 
  : 'http://192.168.1.118:5000';

export const IMAGE_BASE_URL = isDevelopment 
  ? 'http://localhost:5000' 
  : 'http://192.168.1.118:5000'; 