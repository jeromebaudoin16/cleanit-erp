// API Service - connexion au backend CleanIT
const API_URL = import.meta.env.VITE_API_URL || 'https://backend-cleanit-erp.vercel.app';

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
  react: (postId, emoji) => apiCall('POST', '/feed/' + postId + '/react', { emoji }),
  getComments: (postId) => apiCall('GET', '/feed/' + postId + '/comments'),
  addComment: (postId, text) => apiCall('POST', '/feed/' + postId + '/comments', { text }),
};

export const MissionsAPI = {
  getAll: () => apiCall('GET', '/missions'),
  getMy: () => apiCall('GET', '/missions/my'),
  create: (data) => apiCall('POST', '/missions', data),
  update: (id, data) => apiCall('PUT', '/missions/' + id, data),
};
