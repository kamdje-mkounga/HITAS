import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://hitas.onrender.com/api',
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token && token !== 'null' && token !== 'undefined') {
      config.headers['x-auth-token'] = token;
      if (!config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const getProfile = async () => {
  const response = await API.get('/profile/me');
  return response.data;
};

export const getPosts = async () => {
  const response = await API.get('/posts');
  return response.data;
};

export const getProjects = async () => {
  const response = await API.get('/project');
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await API.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async ({ token, password }) => {
  const response = await API.post('/auth/reset-password', { token, password });
  return response.data;
};

export const reviewUserRegistration = async (userId, { decision, rejectionReason }) => {
  const response = await API.put(`/admin/review-user/${userId}`, {
    decision,
    rejectionReason,
  });
  return response.data;
};

export default API;