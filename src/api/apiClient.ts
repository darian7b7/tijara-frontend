// 📁 src/api/apiClient.ts
import axios, { InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/config';

console.log('Creating API client with base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('Making request to:', (config.baseURL || '') + (config.url || ''));
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config ? {
        baseURL: error.config.baseURL,
        url: error.config.url,
        method: error.config.method,
      } : undefined,
    });
    return Promise.reject(error);
  }
);

export default apiClient;
