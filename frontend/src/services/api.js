import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0] ||
      error.message ||
      'An unexpected error occurred';

    const isAuthMe = error.config?.url?.endsWith('/auth/me');
    const isUnauthenticated = error.response?.status === 401 || (isAuthMe && error.response?.status === 403);

    if (!isUnauthenticated) {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default api;
