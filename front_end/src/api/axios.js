import axios from 'axios';

// Local: gọi /api qua proxy của Vite. Production: VITE_API_URL là domain của back_end (đặt lúc build)
// trim + bỏ "/" cuối để giá trị dán vào Railway có dư khoảng trắng/xuống dòng vẫn đúng
const API_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const api = axios.create({ baseURL: `${API_URL}/api` });

// Tự động gắn token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
