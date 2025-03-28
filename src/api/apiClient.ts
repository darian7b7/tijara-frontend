// src/api/apiClient.ts

import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/config";

console.log('Creating API client with base URL:', API_BASE_URL);

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Important for CORS with credentials
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const url = `${config.baseURL || ''}${config.url || ''}`;
    console.log('Making request to:', url);
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      url: response.config?.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });
    
    const errorResponse = {
      success: false,
      error: error.response?.data?.message || error.message || "An error occurred",
      data: null,
      status: error.response?.status || 500,
    };
    return Promise.reject(errorResponse);
  },
);

export default apiClient;
