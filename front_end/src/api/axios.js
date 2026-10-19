import axios from 'axios';

// Local: gọi /api qua proxy của Vite. Production: VITE_API_URL là domain của back_end (đặt lúc build)
const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL || ''}/api` });

// Tự động gắn token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
