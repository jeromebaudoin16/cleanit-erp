import axios from 'axios';

const BASE = 'http://localhost:3000';

export const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear(); sessionStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null'); }
  catch { return null; }
};
export const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');
export const doLogout = () => { localStorage.clear(); sessionStorage.clear(); window.location.href = '/login'; };
