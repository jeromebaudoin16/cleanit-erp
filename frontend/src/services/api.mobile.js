// API Service - connexion au backend CleanIT
const API_URL = import.meta.env.VITE_API_URL || 'https://cleanit-erp.onrender.com';

const getToken = () => localStorage.getItem('cit_token');

const apiCall = async (method, endpoint, body = null) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_URL + endpoint, {
    method, headers,
    body: body ? JSON.stringify(body) : null,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erreur serveur');
  }
  return res.json();
};

export const AuthAPI = {
  login: (email, password) => apiCall('POST', '/auth/login', { email, password }),
  register: (data) => apiCall('POST', '/auth/register', data),
  me: () => apiCall('GET', '/auth/me'),
};

export const FeedAPI = {
  getPosts: () => apiCall('GET', '/feed'),
  createPost: (data) => apiCall('POST', '/feed', data),
};

export const MissionsAPI = {
  getAll: () => apiCall('GET', '/missions'),
  getMy: (userId) => apiCall('GET', '/missions/user/' + userId),
};
